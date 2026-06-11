/**
 * 公共图片库 + 分类默认图 类型定义（IMG-LIB-001）。
 *
 * 后端：org.dromara.djs.common.image.controller.{ImageLibraryController, DefaultImageController}
 */

/** 公共图库出参 ImageLibraryVo */
export interface ImageLibraryVO extends BaseEntity {
  id: number | string;
  /** 主名（与作物/商品 name 精确匹配） */
  imageName: string;
  /** 别名（逗号分隔，如 西红柿,tomato） */
  aliases?: string;
  /** 单张图 ossId（雪花 string，禁 Number） */
  ossId?: string | null;
  /** public URL（resolver 回填，预览用） */
  imageUrl?: string | null;
  sortOrder?: number;
  /** 字典 sys_normal_disable：0 正常 / 1 停用 */
  status?: string;
  remark?: string;
}

/** 新增 / 编辑表单 */
export interface ImageLibraryForm {
  id?: number | string;
  imageName: string;
  aliases?: string;
  ossId?: string | null;
  sortOrder?: number;
  status?: string;
  remark?: string;
}

/** 列表查询 */
export interface ImageLibraryQuery {
  pageNum: number;
  pageSize: number;
  imageName?: string;
  aliases?: string;
  status?: string;
}

/** 分类默认图出参 DefaultImageVo */
export interface DefaultImageVO {
  id: number | string;
  /** 分类键：pork/vegetable/white_bar/dry_good/egg/gift_box/global */
  categoryKey: string;
  ossId?: string | null;
  imageUrl?: string | null;
  isGlobal?: number;
}

/** 默认图编辑表单（只改 ossId） */
export interface DefaultImageForm {
  id: number | string;
  categoryKey?: string;
  ossId?: string | null;
}

/** 批量重新匹配返回（各域更新条数） */
export type RematchResult = Record<string, number>;
