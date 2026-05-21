/**
 * 供应商主数据类型定义（SYS-MD-003）。
 */

/** 后端 SupplierVo 出参 */
export interface SupplierVO extends BaseEntity {
  id: number | string;
  supplierCode: string;
  supplierName: string;
  supplierType: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  businessStatus: number;
  settleType?: string;
  bankAccount?: string;
  bankName?: string;
  remark?: string;
}

/** 新增 / 编辑表单（supplierCode 由后端生成，前端不传） */
export interface SupplierForm {
  id?: number | string;
  supplierName: string;
  supplierType: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  businessStatus: number;
  settleType?: string;
  bankAccount?: string;
  bankName?: string;
  remark?: string;
}

/** 列表查询入参（继承 PageQuery 拿 pageNum/pageSize） */
export interface SupplierQuery extends PageQuery {
  supplierName?: string;
  supplierCode?: string;
  supplierType?: string;
  contactPhone?: string;
  businessStatus?: number;
}
