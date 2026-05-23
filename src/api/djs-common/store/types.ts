/**
 * 门店主数据类型定义（SYS-MD-002 + SYS-MD-FIX-002）。
 */

/** 后端 StoreVo 出参 */
export interface StoreVO extends BaseEntity {
  id: number | string;
  storeCode: string;
  storeName: string;
  shortName?: string;
  /** ISO 日期 yyyy-MM-dd */
  openDate?: string;
  /** 字典 djs_store_type：direct=直营 / franchise=加盟 */
  storeType?: string;
  /** 字典 djs_store_status：0=合作中 / 1=已终止 / 2=装修中 */
  businessStatus: string;
  address?: string;
  managerName?: string;
  managerPhone?: string;
  /** sys_user.user_id；NULL=未设置店长 */
  managerUserId?: number | null;
  posSystemId?: string;
  /** OSS oss_id；前端用 image-preview 展示 */
  imageOssId?: number | null;
  remark?: string;
}

/** 新增 / 编辑表单（storeCode / managerUserId 不传） */
export interface StoreForm {
  id?: number | string;
  storeName: string;
  shortName?: string;
  openDate?: string;
  storeType?: string;
  businessStatus: string;
  address?: string;
  managerName?: string;
  managerPhone?: string;
  posSystemId?: string;
  imageOssId?: number | null;
  remark?: string;
}

/** 列表查询入参（继承 PageQuery 拿 pageNum/pageSize） */
export interface StoreQuery extends PageQuery {
  storeName?: string;
  storeCode?: string;
  storeType?: string;
  managerName?: string;
  businessStatus?: string;
}
