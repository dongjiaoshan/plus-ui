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
  belongType?: string;
  buyClass?: string;
  productStatus?: number;
}
