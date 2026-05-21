/**
 * 门店主数据类型定义（SYS-MD-002）。
 */

/** 后端 StoreVo 出参 */
export interface StoreVO extends BaseEntity {
  id: number | string;
  storeCode: string;
  storeName: string;
  /** direct=直营 / franchise=加盟（V1 自由文本） */
  storeType?: string;
  /** 1=合作中 / 0=已终止 */
  businessStatus: number;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  remark?: string;
}

/** 新增 / 编辑表单（storeCode 由后端生成，前端不传） */
export interface StoreForm {
  id?: number | string;
  storeName: string;
  storeType?: string;
  businessStatus: number;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  remark?: string;
}

/** 列表查询入参（继承 PageQuery 拿 pageNum/pageSize） */
export interface StoreQuery extends PageQuery {
  storeName?: string;
  storeCode?: string;
  storeType?: string;
  businessStatus?: number;
  contactPhone?: string;
}
