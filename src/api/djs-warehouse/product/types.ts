/**
 * 产品 / 商品 / 礼盒类型定义（WMS-MD-002）。
 *
 * - 共表 3 形态：productType=1 自产 / 2 外购 / 3 礼盒
 * - productId 是业务码 VARCHAR(32)（用户手填），不是 snowflake 主键 id
 * - giftComponents 仅 productType=3 时使用，详情接口返回；列表接口不返
 */

export interface ProductInfoVO extends BaseEntity {
  id: number | string;
  productId: string;
  productName: string;
  productType: number; // 1 / 2 / 3
  productUnit: string;
  productSpec?: string;
  belongType?: string;
  buyClass?: string;
  productThumb?: string;
  productImg?: string;
  /** 主图 ossId（IMG-LIB-001 L1） */
  imageOssId?: string | null;
  /** 图来源（0 自动 / 1 手动） */
  imageSource?: number;
  /** 主图 public URL（resolver 兜底回填） */
  imageUrl?: string | null;
  productAttr?: number;
  productWorkshop?: number;
  storeLocationId?: string;
  /** 存储仓库名称（后端按 store_location_id 关联 location_info 回填；多库位逗号拼接） */
  storeLocationName?: string;
  productStatus: number;
  productMaterial?: number | string;
  productDesc?: string;
  materialNum?: number | string;
  isDelivery: number;
  supplierId?: number | string;
  isBuyOut: number;
  remark?: string;
  giftComponents?: GiftBoxVO[];
  /** 更新人姓名（后端 @Translation 回填） */
  updateByName?: string;
}

/** 产品详情「生产记录」子表行（生产 / 退货） */
export interface ProductionRecordVO {
  id: number | string;
  produceDate?: string;
  /** produce=生产 / return=退货 */
  produceType?: string;
  produceNum?: number | string;
  produceUnit?: string;
  standardWeight?: number | string;
  produceWeight?: number | string;
  diffWeight?: number | string;
}

/** 商品详情「业务流水」子表行（入库 / 领用出库 / 后台出库） */
export interface ProductFlowRecordVO {
  id: number | string;
  bizDate?: string;
  /** in_stock=入库 / pick_out=领用出库 / backend_out=后台出库 */
  bizType?: string;
  bizNum?: number | string;
  bizUnit?: string;
}

/** 产品入库入参（产品 / 库位 / 数量） */
export interface ProductInboundForm {
  productId: number | string;
  locationId: number | string;
  quantity: number;
  remark?: string;
}

export interface GiftBoxVO {
  id: number | string;
  boxProductId: number | string;
  componentProductId: number | string;
  componentProductName?: string;
  componentCount: number | string;
  componentUnit: string;
  componentSort: number;
}

export interface ProductInfoForm {
  id?: number | string;
  productId: string;
  productName: string;
  productType: number;
  productUnit: string;
  productSpec?: string;
  belongType?: string;
  buyClass?: string;
  productThumb?: string;
  productImg?: string;
  /** 主图 ossId（IMG-LIB-001；手选则提交 imageSource=1） */
  imageOssId?: string | null;
  /** 图来源（0 自动 / 1 手动） */
  imageSource?: number;
  productAttr?: number;
  productWorkshop?: number;
  storeLocationId?: string;
  productStatus: number;
  productMaterial?: number | string;
  productDesc?: string;
  materialNum?: number;
  isDelivery: number;
  supplierId?: number | string;
  isBuyOut: number;
  remark?: string;
  giftComponents?: GiftBoxForm[];
}

export interface GiftBoxForm {
  id?: number | string;
  componentProductId: number | string;
  componentCount: number;
  componentUnit: string;
  componentSort: number;
}

export interface ProductInfoQuery extends PageQuery {
  productId?: string;
  productName?: string;
  productType?: number;
  /** 产品类型集合（产品配置入口 {1,3}，商品配置入口 {2}）；非空时优先于 productType */
  productTypes?: number[];
  belongType?: string;
  /** 归属类型集合（其他产品打包入口 {egg, dry_good, other}）；非空叠加 belong_type IN (...) */
  belongTypes?: string[];
  buyClass?: string;
  /** 生产车间（djs_product_workshop） */
  productWorkshop?: number;
  /** 产品属性 djs_product_attr：1=生产产品（打包目标成品）/ 2=原材料（取数逻辑 doc#13） */
  productAttr?: number;
  /** 关联原材料（自引用 FK → product_info.id 雪花 id，超 JS Number 精度故用 string 精确匹配） */
  productMaterial?: string;
  /** 存储仓库（location_info.id 精确匹配） */
  storeLocationId?: string;
  productStatus?: number;
  /** 更新人员（sys_user.user_id） */
  updateBy?: number | string;
  /** 更新时间区间起 yyyy-MM-dd */
  updateBeginTime?: string;
  /** 更新时间区间止 yyyy-MM-dd */
  updateEndTime?: string;
}
