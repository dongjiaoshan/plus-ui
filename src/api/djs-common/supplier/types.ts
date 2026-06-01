/**
 * 供应商主数据类型定义（SYS-MD-003 + SYS-MD-FIX-002）。
 */

/** 后端 SupplierVo 出参 */
export interface SupplierVO extends BaseEntity {
  id: number | string;
  supplierCode: string;
  supplierName: string;
  /** 营业执照编号 */
  licenseNo?: string;
  /** 营业执照图片 OSS oss_id */
  licenseImageOssId?: number | null;
  /** 经营许可证编号 */
  businessLicenseNo?: string;
  /** ISO 日期 yyyy-MM-dd */
  cooperationStartDate?: string;
  /** 字典 djs_supplier_type：feed/breed/med/seed/other */
  supplierType: string;
  liaisonName?: string;
  liaisonPhone?: string;
  address?: string;
  /** 字典 djs_supplier_status：0=合作中 / 1=已终止 */
  businessStatus: string;
  /** 字典 djs_settle_type：cash/monthly/quarterly */
  settleType?: string;
  bankAccount?: string;
  bankName?: string;
  /** V1 stub：始终 0；BRD-MED / WMS-PURCHASE 落地后回填 */
  dealCount?: number;
  /** V1 stub：始终 0 */
  purchaseQty?: number | string;
  remark?: string;
  /** 更新人 sys_user.user_id */
  updateBy?: number | string;
}

/** 新增 / 编辑表单（supplierCode / dealCount / purchaseQty 不传） */
export interface SupplierForm {
  id?: number | string;
  supplierName: string;
  licenseNo?: string;
  licenseImageOssId?: number | null;
  businessLicenseNo?: string;
  cooperationStartDate?: string;
  supplierType: string;
  liaisonName?: string;
  liaisonPhone?: string;
  address?: string;
  businessStatus: string;
  settleType?: string;
  bankAccount?: string;
  bankName?: string;
  remark?: string;
}

/**
 * 供应商交易明细行（DJS-FIX-ADMIN-W22-005）。
 *
 * 后端 SupplierDealVo：跨模块聚合 breed 药品入库批次 + warehouse 物资入库流水。
 */
export interface SupplierDealVO {
  /** 交易日期 yyyy-MM-dd */
  dealDate: string;
  /** 交易商品名称 */
  dealProduct: string;
  /** 交易量 */
  dealQuantity: number | string;
  /** 计量单位 */
  dealUnit?: string;
  /** 来源类型 medicine / material（前端不展示，仅调试） */
  sourceType?: string;
}

/** 列表查询入参（继承 PageQuery 拿 pageNum/pageSize） */
export interface SupplierQuery extends PageQuery {
  supplierName?: string;
  supplierCode?: string;
  supplierType?: string;
  liaisonName?: string;
  liaisonPhone?: string;
  businessStatus?: string;
  settleType?: string;
  /** 更新时间范围 - 开始（含），ISO yyyy-MM-dd HH:mm:ss */
  updateTimeBegin?: string;
  /** 更新时间范围 - 结束（含），ISO yyyy-MM-dd HH:mm:ss */
  updateTimeEnd?: string;
  /** 更新人 sys_user.user_id */
  updateBy?: number;
}
