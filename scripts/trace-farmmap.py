#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从甲方农场地图（doc-phase2/_input/map.png）描出图上每一个封闭格子，生成
src/views/djs-plant/farmmap/map/regions.generated.ts。

做法：米色底 + 白缝之外的像素当作"地"，4-连通取封闭块，按原图均值色归到甲方
调色板上，再按颜色和填充率判定这块是地块还是装饰（建筑 / 道路 / 河道）。
轮廓走 approxPolyDP 简化，坐标系直接用原图像素，SVG viewBox 同尺寸。

🔴 region key 一次生成后永不重编号 —— 库里的绑定按 key 找地块。重跑本脚本
只允许调形状，不允许让已有 key 指向别的格子。所以排序键取几何位置（行带 +
列），不取组件 id：cv2 的组件 id 会随参数微调而整体漂移，位置不会。

用法：python3 scripts/trace-farmmap.py
"""
import json
import os
import subprocess

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(['git', 'rev-parse', '--show-toplevel'], cwd=HERE,
                      capture_output=True, text=True).stdout.strip()
MAP = os.path.join(REPO, '../../../doc-phase2/_input/map.png')
OUT = os.path.join(REPO, 'src/views/djs-plant/farmmap/map/regions.generated.ts')

MIN_AREA = 60          # 小于这个的是水彩毛边，不是格子
EPSILON = 2.0          # 轮廓简化容差(px)：再大就开始啃掉真实的斜边

# 甲方图的调色板。取自各大组件的均值色，最近邻归类。
# 注意这里没有"深蓝"：图上那列看着发蓝的窄条，真实像素是 rgb(223,223,234) 的**冷灰**，
# 跟建筑的**暖灰** rgb(199,192,188) 靠色差分不开，只能靠冷暖分 —— 见 classify()。
PALETTE = {
    'field-light': (203, 213, 143),   # 浅绿大田
    'field-dark': (140, 193, 140),    # 深绿
    'house-blue': (176, 209, 233),    # 浅蓝（大棚 / 水面，两者同色，分不开）
    'strip-purple': (196, 175, 214),
    'yellow': (228, 214, 110),
    'orange': (232, 163, 105),
    'red': (226, 138, 130),
    'road': (238, 230, 214),          # 米 = 道路
}
GRAY_SAT = 22          # 均值色饱和度低于此 = 灰系，再按冷暖分建筑/条田
THIN_FILL = 0.30       # 填充率低于此 = 细长蜿蜒物（河道 / 沟渠），不是地块


def build_masks(img):
    """把图分成 米色图外 / 白缝 / 地 三类。"""
    a = img.astype(np.int16)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    mx, mn = a.max(2), a.min(2)
    cream = (np.abs(r - 253) < 14) & (np.abs(g - 243) < 16) & (np.abs(b - 231) < 18)
    white = (mx > 232) & (mx - mn < 14)
    return (~cream & ~white).astype(np.uint8)


def classify(mean_rgb, fill):
    """判定一个格子是可挂的地块，还是只画不点的装饰。

    灰系分两支是这里唯一的坑：暖灰（B <= R）是建筑，冷灰（B > R）是图上那些
    发蓝的窄条田。两者亮度几乎一样，只有色温分得开 —— 按最近邻色距会把 14 条
    地块误判成建筑，直接从可挂清单里消失。
    """
    rgb = np.array(mean_rgb, float)
    if rgb.max() - rgb.min() < GRAY_SAT:
        if rgb[2] > rgb[0] + 4:
            return 'strip-pale', 'plot'
        return 'building', 'decor'

    names = list(PALETTE)
    ref = np.array([PALETTE[k] for k in names], float)
    pal = names[int(((rgb - ref) ** 2).sum(1).argmin())]
    if pal == 'road':
        return pal, 'decor'
    if fill < THIN_FILL:
        # 细长蜿蜒 = 河道 / 沟渠。浅蓝那条纵贯全图的就是这么捞出来的
        return 'water', 'decor'
    return pal, 'plot'


def sort_key(cy, cx, band=48):
    """行带内按 x 排。带高取 48px —— 比最窄的条田高、比行间距小，
    保证同一横排的格子落进同一带，不会因为 1px 抖动串行。"""
    return (int(cy // band), int(cx))


def main():
    img = cv2.imread(MAP)[:, :, ::-1]
    h, w, _ = img.shape
    mask = build_masks(img)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(mask, 4)

    items = []
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if area < MIN_AREA:
            continue
        x, y, bw, bh = (int(stats[i, k]) for k in (cv2.CC_STAT_LEFT, cv2.CC_STAT_TOP,
                                                   cv2.CC_STAT_WIDTH, cv2.CC_STAT_HEIGHT))
        m = (lab == i)
        fill = area / float(bw * bh)
        pal, kind = classify(img[m].mean(0), fill)

        cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnt = max(cnts, key=cv2.contourArea)
        poly = cv2.approxPolyDP(cnt, EPSILON, True).reshape(-1, 2)
        if len(poly) < 3:
            continue
        cy, cx = cent[i][1], cent[i][0]
        items.append(dict(sk=sort_key(cy, cx), kind=kind, pal=pal, area=area,
                          box=[x, y, bw, bh], pts=poly.tolist()))

    items.sort(key=lambda d: d['sk'])
    plots = [d for d in items if d['kind'] == 'plot']
    decor = [d for d in items if d['kind'] == 'decor']
    for idx, d in enumerate(plots, 1):
        d['key'] = f'R-{idx:03d}'

    def pts_ts(pts):
        return '[' + ','.join(f'[{x},{y}]' for x, y in pts) + ']'

    lines = [
        '/**',
        ' * 🤖 本文件由 scripts/trace-farmmap.py 从甲方地图 doc-phase2/_input/map.png 生成，不要手改。',
        ' * 改形状 = 调脚本参数重跑；改绑定 = 在页面上点，绑定在库里不在这。',
        ' *',
        ' * 🔴 REGION_KEY 永不重编号 —— t_plant_farm_map_region.region_key 按它找地块。',
        ' * 重跑脚本只允许让同一个 key 的形状变准，不允许让它指向另一个格子。',
        ' *',
        ' * 坐标系 = 原图像素，与 VIEW_BOX 同尺寸；SVG viewBox 保证分辨率无关。',
        ' */',
        '',
        f'export const VIEW_BOX = {{ width: {w}, height: {h} }} as const;',
        '',
        "export type RegionPalette = " + ' | '.join(f"'{k}'" for k in list(PALETTE) + ['water', 'building', 'strip-pale']) + ';',
        '',
        'export interface MapRegion {',
        '  /** 稳定业务码，永不重编号 */',
        '  key: string;',
        '  /** 原图上这块的色系。只用于「按原图配色」模式，不是业务数据 */',
        '  palette: RegionPalette;',
        '  /** 外接框 [x, y, w, h]，用于判断标签放不放得下 */',
        '  box: [number, number, number, number];',
        '  points: Array<[number, number]>;',
        '}',
        '',
        '/** 图上可点、可挂地块的格子 */',
        'export const MAP_REGIONS: MapRegion[] = [',
    ]
    for d in plots:
        lines.append(f"  {{ key: '{d['key']}', palette: '{d['pal']}', "
                     f"box: [{d['box'][0]},{d['box'][1]},{d['box'][2]},{d['box'][3]}], "
                     f"points: {pts_ts(d['pts'])} }},")
    lines += [
        '];',
        '',
        '/** 装饰层：建筑 / 道路 / 河道。只画不点，pointer-events 全关 */',
        'export const MAP_DECOR: Array<{ palette: RegionPalette; points: Array<[number, number]> }> = [',
    ]
    for d in decor:
        lines.append(f"  {{ palette: '{d['pal']}', points: {pts_ts(d['pts'])} }},")
    lines += ['];', '']

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write('\n'.join(lines))

    import collections
    print(f'地图 {w}x{h}')
    print(f'可挂格子 {len(plots)}  装饰 {len(decor)}')
    print('按色系:', dict(collections.Counter(d['pal'] for d in plots)))
    print('装饰:', dict(collections.Counter(d['pal'] for d in decor)))
    print(f'顶点总数 {sum(len(d["pts"]) for d in items)}')
    print(f'-> {OUT}')


if __name__ == '__main__':
    main()
