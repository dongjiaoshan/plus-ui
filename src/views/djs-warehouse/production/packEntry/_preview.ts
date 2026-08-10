/**
 * 【临时·一体秤验收专用】生产管理各页的前端模拟数据。
 *
 * ⚠️ 秤上验收通过后**整个文件删除**，并按文件末尾「清理清单」删掉各页的调用（共 4 处）。
 * 这里不打任何接口、不写任何库，纯前端造数，只为在没有当日业务数据时把版式看全。
 *
 * 两道闸（`isPreviewMode()`），缺一不生效：
 * ① 环境：本地 dev **或** `-staging` 域名（要在真秤硬件上看）。生产域名不带 `-staging`
 *    （CLAUDE.md §5.1），所以生产上永远走不到，工人不可能看到这批假数据。
 * ② URL 带 `?preview=1`；不带就是真实数据，本地/staging 都照常验真实行为。
 */

/** 是否处于模拟数据预览态。故意用普通函数不用 computed —— `location.search` 不是响应式依赖，
 *  computed 会把首次结果永久缓存，配合 keep-alive 后在已打开的页面上补 `?preview=1` 永远不生效。 */
export function isPreviewMode(): boolean {
  const envOk = import.meta.env.DEV || /-staging\./i.test(window.location.hostname);
  return envOk && new URLSearchParams(window.location.search).get('preview') === '1';
}

/** 真实产品图（staging OSS `djs/product_image/`，公开可读）。带 resize 参数：
 *  原图 1.2-3.6MB 的 1024×768 PNG 直接塞进 76px 缩略图要好几秒才画出来，resize 后 ~35KB。
 *  ⚠️ 路径含**上传日期目录**，各图不同 —— 不能只存文件名去拼一个统一日期（我第一版这么干，
 *  蔬菜/鸡蛋/礼盒的图全 404 走了灰色占位）。 */
const IMG = (path: string): string =>
  `https://djs-staging.oss-cn-hangzhou.aliyuncs.com/djs/product_image/${path}?x-oss-process=image/resize,w_160/quality,q_80`;

const IMG_PORK_BELLY = IMG('2026/06/26/49233a6b4c9841f9a5d598c696600994'); // 五花肉
const IMG_RIBS = IMG('2026/06/26/7c3c6c9628894bdc8c6201e9fe20bdc3'); // 排骨
const IMG_LEAN = IMG('2026/06/26/1eeaea975ae743ff8bf1761e1ee541ef'); // 精瘦肉
const IMG_FAT = IMG('2026/06/26/3a5004b726ec4b20aa11e850fac0ac93'); // 肥瘦肉
const IMG_TROTTER = IMG('2026/06/26/88343d3bed124aaeb6710e24816eef9f'); // 猪蹄
const IMG_OFFAL = IMG('2026/06/26/feb5909606d548629641e7da7b5fb23f'); // 猪头（内脏类占位）
const IMG_HALF = IMG('2026/06/26/b94a00b0daf44defaace3007f265a6b0'); // 猪只（半只）
const IMG_VEG_LEAF = IMG('2026/07/23/a5a919c4a09f4e148fd83c65be136681'); // 木耳菜（叶菜类）
const IMG_VEG_STEM = IMG('2026/06/21/fe739723644f41b8ab1a5e41ef8e7dc0'); // 空心菜（茎菜/瓜果类）
const IMG_VEG_ROOT = IMG('2026/06/25/7663f47a187d400a946b06b245afca1b'); // 山药（根茎/干货类）
const IMG_EGG = IMG('2026/06/27/793d135507c84c4182c32b65747754a1'); // 鸡蛋
const IMG_GIFT = IMG('2026/06/27/ab9605ddc44d4740b9cb5a3600d5c87d'); // 鸡蛋礼盒

/** 雪花 id 必须字符串拼：数值超 `Number.MAX_SAFE_INTEGER`，相加会把不同 id 算成同一个。 */
const pid = (n: number): string => '90000000000000' + String(1000 + n);
const mid = (n: number): string => '80000000000000' + String(100 + n);

interface PreviewProduct {
  name: string;
  /** 归到哪个原材料（决定卡片被哪条来源"点亮"，也决定同料多规格共享库存池） */
  material: number;
  img: string;
  unit?: string;
}

const PORK: PreviewProduct[] = [
  ['黑毛猪五花肉250g/份', 0, IMG_PORK_BELLY],
  ['黑毛猪五花肉500g/份', 0, IMG_PORK_BELLY],
  ['黑毛猪前腿肉250g/份', 1, IMG_HALF],
  ['黑毛猪前腿肉500g/份', 1, IMG_HALF],
  ['黑毛猪前腿肉1000g/份', 1, IMG_HALF],
  ['黑毛猪后腿肉250g/份', 2, IMG_HALF],
  ['黑毛猪后腿肉500g/份', 2, IMG_HALF],
  ['黑毛猪后腿肉1000g/份', 2, IMG_HALF],
  ['黑毛猪精肋排骨250g/份', 3, IMG_RIBS],
  ['黑毛猪精肋排骨500g/份', 3, IMG_RIBS],
  ['黑毛猪精肋排骨1000g/份', 3, IMG_RIBS],
  ['黑毛猪通排500g/份', 4, IMG_RIBS],
  ['黑毛猪通排1000g/份', 4, IMG_RIBS],
  ['黑毛猪龙骨500g/份', 5, IMG_RIBS],
  ['黑毛猪龙骨750g/份', 5, IMG_RIBS],
  ['黑毛猪筒子骨500g/份', 6, IMG_RIBS],
  ['黑毛猪筒子骨700g/份', 6, IMG_RIBS],
  ['黑毛猪扇子骨500g/份', 7, IMG_RIBS],
  ['黑毛猪扇子骨750g/份', 7, IMG_RIBS],
  ['黑毛猪扇子骨1000g/份', 7, IMG_RIBS],
  ['黑毛猪纯瘦肉250g/份', 8, IMG_LEAN],
  ['黑毛猪纯瘦肉500g/份', 8, IMG_LEAN],
  ['黑毛猪里脊肉250g/份', 9, IMG_LEAN],
  ['黑毛猪里脊肉500g/份', 9, IMG_LEAN],
  ['黑毛猪腰柳肉250g/份', 10, IMG_LEAN],
  ['黑毛猪腰柳肉400g/份', 10, IMG_LEAN],
  ['黑毛猪精梅花肉250g/份', 11, IMG_LEAN],
  ['黑毛猪精梅花肉500g/份', 11, IMG_LEAN],
  ['黑毛猪肥肉500g/份', 12, IMG_FAT],
  ['黑毛猪肥肉1000g/份', 12, IMG_FAT],
  ['黑毛猪板油500g/份', 13, IMG_FAT],
  ['黑毛猪板油1000g/份', 13, IMG_FAT],
  ['黑毛猪板油1500g/份', 13, IMG_FAT],
  ['黑毛猪板油2000g/份', 13, IMG_FAT],
  ['黑毛猪猪脚500g/份', 14, IMG_TROTTER],
  ['黑毛猪猪脚750g/份', 14, IMG_TROTTER],
  ['黑毛猪猪脚1000g/份', 14, IMG_TROTTER],
  ['黑毛猪蹄髈750g/份', 15, IMG_TROTTER],
  ['黑毛猪蹄髈1000g/份', 15, IMG_TROTTER],
  ['黑毛猪猪心', 16, IMG_OFFAL, 'kg'],
  ['黑毛猪猪肝', 16, IMG_OFFAL, 'kg'],
  ['黑毛猪猪肚', 16, IMG_OFFAL, 'kg'],
  ['黑毛猪猪肠', 16, IMG_OFFAL, 'kg'],
  ['黑毛猪猪腰子', 16, IMG_OFFAL, 'kg'],
  ['黑毛猪猪尾巴', 16, IMG_OFFAL, 'kg'],
  ['黑猪腊肉', 17, IMG_FAT, 'kg']
].map((r) => ({ name: r[0] as string, material: r[1] as number, img: r[2] as string, unit: r[3] as string | undefined }));

const VEG: PreviewProduct[] = [
  ['上海青250g/份', 20, IMG_VEG_LEAF],
  ['上海青500g/份', 20, IMG_VEG_LEAF],
  ['鸡毛菜250g/份', 21, IMG_VEG_LEAF],
  ['小白菜250g/份', 22, IMG_VEG_LEAF],
  ['小白菜500g/份', 22, IMG_VEG_LEAF],
  ['木耳菜250g/份', 23, IMG_VEG_LEAF],
  ['苋菜250g/份', 24, IMG_VEG_LEAF],
  ['菠菜250g/份', 25, IMG_VEG_LEAF],
  ['茼蒿250g/份', 26, IMG_VEG_LEAF],
  ['生菜250g/份', 27, IMG_VEG_LEAF],
  ['油麦菜250g/份', 28, IMG_VEG_LEAF],
  ['空心菜250g/份', 29, IMG_VEG_STEM],
  ['空心菜500g/份', 29, IMG_VEG_STEM],
  ['芹菜500g/份', 30, IMG_VEG_STEM],
  ['韭菜250g/份', 31, IMG_VEG_STEM],
  ['香菜100g/份', 32, IMG_VEG_STEM],
  ['茄子500g/份', 33, IMG_VEG_STEM],
  ['黄瓜500g/份', 34, IMG_VEG_STEM],
  ['番茄500g/份', 35, IMG_VEG_STEM],
  ['青椒250g/份', 36, IMG_VEG_STEM],
  ['丝瓜500g/份', 37, IMG_VEG_STEM],
  ['山药500g/份', 38, IMG_VEG_ROOT],
  ['山药1000g/份', 38, IMG_VEG_ROOT],
  ['冬瓜1000g/份', 39, IMG_VEG_ROOT],
  ['南瓜1000g/份', 40, IMG_VEG_ROOT],
  ['毛豆500g/份', 41, IMG_VEG_ROOT],
  ['豇豆500g/份', 42, IMG_VEG_ROOT],
  ['四季豆500g/份', 43, IMG_VEG_ROOT]
].map((r) => ({ name: r[0] as string, material: r[1] as number, img: r[2] as string }));

const OTHER: PreviewProduct[] = [
  ['土鸡蛋10枚装', 50, IMG_EGG, '份'],
  ['土鸡蛋20枚装', 50, IMG_EGG, '份'],
  ['土鸡蛋30枚装', 50, IMG_EGG, '份'],
  ['土鸡蛋42枚装', 50, IMG_EGG, '份'],
  ['黑猪腊肉500g/份', 51, IMG_FAT],
  ['黑猪腊肉1000g/份', 51, IMG_FAT],
  ['黑猪香肠500g/份', 52, IMG_FAT],
  ['黑猪香肠1000g/份', 52, IMG_FAT],
  ['笋干250g/份', 53, IMG_VEG_ROOT],
  ['笋干500g/份', 53, IMG_VEG_ROOT],
  ['干香菇100g/份', 54, IMG_VEG_ROOT],
  ['干木耳100g/份', 55, IMG_VEG_ROOT]
].map((r) => ({ name: r[0] as string, material: r[1] as number, img: r[2] as string, unit: r[3] as string | undefined }));

const GIFT: PreviewProduct[] = [
  ['黑猪肉礼盒装2.5斤', 60, IMG_HALF, '盒'],
  ['黑猪肉礼盒装5斤', 60, IMG_HALF, '盒'],
  ['土鸡蛋礼盒30枚', 61, IMG_GIFT, '盒'],
  ['土鸡蛋礼盒42枚', 61, IMG_GIFT, '盒'],
  ['时令蔬菜礼盒', 62, IMG_VEG_LEAF, '盒'],
  ['年货大礼包', 63, IMG_GIFT, '盒']
].map((r) => ({ name: r[0] as string, material: r[1] as number, img: r[2] as string, unit: r[3] as string | undefined }));

/** 打包页业态 → 该页的模拟成品。`belongType/belongTypes/kind` 由调用方按自己的 props 传。 */
function pickSet(kind: string, belongType?: string): PreviewProduct[] {
  if (kind === 'gift') return GIFT;
  if (kind === 'veg' || belongType === 'vegetable') return VEG;
  if (belongType === 'pork') return PORK;
  return OTHER;
}

/** 模拟成品卡片（ProductInfoVO 的鸭子类型；只填卡片和校验会读到的字段）。 */
export function previewProducts(kind: string, belongType?: string): Record<string, unknown>[] {
  return pickSet(kind, belongType).map((p, i) => ({
    id: pid(i),
    productName: p.name,
    productCode: 'PV' + String(i).padStart(3, '0'),
    productSpec: /(\d+(?:g|枚|斤)\/?份?)$/.exec(p.name)?.[1] ?? (p.unit === '盒' ? '礼盒装' : '散装'),
    productUnit: p.unit ?? (/\d+g\/份$/.test(p.name) ? '份' : 'kg'),
    productType: 1,
    belongType: belongType ?? 'other',
    productAttr: 1,
    productMaterial: mid(p.material),
    imageUrl: p.img
  }));
}

/**
 * 模拟「今日领用来源」。卡片只显示「原材料今天被领用过」的成品，所以每个用到的原材料造一条；
 * 但 earNo / plotId 只给 3 个值 —— 否则耳号/地块 chip 会有十几个、把 numpad 挤出可视区
 * （实测 12 个 chip → chip 区 290px、numpad 底部 643 超出滚动区 559）。
 */
export function previewSources(kind: string, belongType?: string, plotIds: (number | string)[] = []): Record<string, unknown>[] {
  const mats = Array.from(new Set(pickSet(kind, belongType).map((p) => p.material)));
  const ears = ['2026-08-10-001', '2026-08-10-002', '2026-08-10-003'];
  return mats.map((m, i) => ({
    id: mid(m),
    productId: mid(m),
    productName: '预览来源',
    productUnit: 'kg',
    productWeight: 42.5 - (i % 7) * 3.5,
    earNo: ears[i % ears.length],
    plotId: plotIds.length > 0 ? plotIds[i % Math.min(plotIds.length, 3)] : undefined
  }));
}

/** 模拟门店需求（productId → 份数）；0 不显示需求行，这里都给正数好看效果。 */
export function previewDemand(products: Record<string, unknown>[]): Record<string, number> {
  const map: Record<string, number> = {};
  products.forEach((p, i) => (map[String(p.id)] = (i % 7) + 2));
  return map;
}

/** 白条出库领用页：待领用白条卡（BarPickupItemVO 鸭子类型）。 */
export function previewBars(n = 9): Record<string, unknown>[] {
  // 形态照抄 staging 真实数据：bar_id 13 字符 `BAR2608060005`、ear_no 18 字符 `01-01-1-251003-004`、
  // 重量是 DECIMAL(x,3)。⚠️ 早期版本用 `78.4 - i * 2.5` 造重量，浮点误差直接渲染成
  // `63.4000000000000006kg`；数值一律 toFixed(3) 再转回 Number。
  const w = (v: number): number => Number(v.toFixed(3));
  return Array.from({ length: n }, (_, i) => ({
    inhouseId: mid(200 + i),
    barInfoId: mid(300 + i),
    whiteBarNo: `BAR26081${String(i + 1).padStart(5, '0')}`,
    barId: `BAR26081${String(i + 1).padStart(5, '0')}`,
    earNo: `01-0${(i % 3) + 1}-1-25100${(i % 5) + 1}-00${(i % 6) + 1}`,
    productName: i % 3 === 0 ? '黑毛猪白条（整只）' : '黑毛猪白条（半只）',
    marketingWeight: w(110.5 - i * 3.5),
    inWeight: w(78.4 - i * 2.5),
    inTime: `2026-08-0${(i % 8) + 1} 0${(i % 6) + 3}:${String((i * 7) % 60).padStart(2, '0')}:00`,
    productWeight: w(78.4 - i * 2.5),
    productUnit: 'kg'
  }));
}

/** 白条分割页：待分割白条 chip（PigCutRecordVO 鸭子类型）。 */
export function previewCuttable(n = 5): Record<string, unknown>[] {
  return Array.from({ length: n }, (_, i) => ({
    id: 900000 + i,
    cutId: `CUT2026081000${i + 1}`,
    barId: `BAR2026081000${i + 1}`,
    earNo: `2026-08-0${(i % 8) + 1}-00${(i % 5) + 1}`,
    isHalf: i % 2,
    pickupWeight: 78.4 - i * 4.5,
    remainingWeight: Math.max(2.5, 46.2 - i * 8.3),
    cutStatus: i === 0 ? 'cutting' : 'picked',
    locationName: '猪肉鲜品库'
  }));
}

/** 白条分割页：可分割成的猪肉**原材料**（attr=2，不是成品）。 */
export function previewCutProducts(): Record<string, unknown>[] {
  const parts: [string, string][] = [
    ['五花肉', IMG_PORK_BELLY],
    ['前腿肉', IMG_HALF],
    ['后腿肉', IMG_HALF],
    ['精肋排骨', IMG_RIBS],
    ['通排', IMG_RIBS],
    ['龙骨', IMG_RIBS],
    ['筒子骨', IMG_RIBS],
    ['扇子骨', IMG_RIBS],
    ['纯瘦肉', IMG_LEAN],
    ['里脊肉', IMG_LEAN],
    ['腰柳肉', IMG_LEAN],
    ['精梅花肉', IMG_LEAN],
    ['肥肉', IMG_FAT],
    ['板油', IMG_FAT],
    ['猪脚', IMG_TROTTER],
    ['蹄髈', IMG_TROTTER],
    ['猪心', IMG_OFFAL],
    ['猪肝', IMG_OFFAL],
    ['猪肚', IMG_OFFAL],
    ['猪肠', IMG_OFFAL]
  ];
  return parts.map(([name, img], i) => ({
    id: pid(500 + i),
    productName: '黑毛猪' + name,
    productCode: 'PVM' + String(i).padStart(3, '0'),
    productUnit: 'kg',
    productType: 1,
    belongType: 'pork',
    productAttr: 2,
    imageUrl: img
  }));
}

/* ============================ 清理清单（秤上验收通过后执行）============================
 * 1. 删除本文件 `_preview.ts`
 * 2. SkuPackForm.vue：删 import、删 performReload 开头那段 `if (isPreviewMode()) {...}`
 * 3. pickup/index.vue：删 import、删 loadItems() 里那段 preview 分支
 * 4. cut/index.vue：删 import、删 loadCuttable() / loadPorkProducts() 里那两段 preview 分支
 * 删完全局搜 `_preview` 和 `isPreviewMode` 应为 0 命中。
 * =================================================================================== */
