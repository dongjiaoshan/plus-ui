import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';

/**
 * 仓库生产管理 - 打包/分割录入 admin 端 API（A5）。
 *
 * 后端：org.dromara.djs.warehouse.pack.controller.WarehousePackEntryController  /djs/warehouse/packEntry
 *
 * 全部复用 mp 端已落的 ServiceImpl 业务方法（submitDryPack / submitGiftPack / submitVegPack /
 * submitCutOut / submitCutDone / submitPickup / submitWhiteBarOut），admin 仅多一层 @SaCheckPermission 委托。
 *
 * 跨层契约：snowflake ID 全链路 number | string（前端不截断；本层透传，提交时用 number | string）。
 */

/** 可打包/可领用来源过程产品（来自 t_warehouse_product_inhouse） */
export interface PackSourceVO {
  id: number;
  productName: string;
  productId: number;
  productUnit: string;
  productSpec?: string;
  productWeight: number;
  plotId?: number;
  earNo?: string;
  cutPart?: string;
  locationId?: number;
  produceDate?: string;
  produceTime?: string;
}

/** 待领用白条（status='in_stock'） */
/** 燎毛产出分产品（白条领用卡片展示用，FIX-WMS-OUTSOURCE-001 行51） */
export interface BurnProductVO {
  /** 产品名（如「白条·半只」「五花肉」「整只」） */
  productName?: string;
  /** 该分产品燎毛入库重量 kg */
  productWeight?: number;
  /** 计量单位 */
  productUnit?: string;
}

export interface BarInfoVO {
  id: number;
  barId: string;
  earNo?: string;
  /** 出栏重量 kg（领用称重校验上界） */
  marketingWeight?: number;
  inWeight?: number;
  inTime?: string;
  status: string;
  /** 该白条燎毛实际产出的分产品（半只/五花肉/整只 等 + 各自重量），FIX-WMS-OUTSOURCE-001 行51 */
  burnProducts?: BurnProductVO[];
}

/**
 * 白条领用「按燎毛产出行」卡片（FIX-WMS-CUTPICKUP-SPLIT-001）。
 *
 * 一头在库白条的每个未领燎毛产出行（半只/半扇）= 一项，可单独领用进分割车间；
 * 燎毛无产出行的白条回落一项「整只」卡（inhouseId 缺省）。实现「两个半只→两条记录→分两次领用」。
 */
export interface BarPickupItemVO {
  /** 燎毛产出行 id（缺省 = 整只兜底卡，提交走整猪路径） */
  inhouseId?: number | string;
  /** 白条流水号（半只/整只白条唯一标识） */
  whiteBarNo?: string;
  /** 白条 id */
  barInfoId: number | string;
  barId?: string;
  earNo?: string;
  /** 外购白条标识号（外购无耳号时 chip 用） */
  markId?: string;
  /** 出栏重量 kg（累计领用校验上界） */
  marketingWeight?: number;
  inWeight?: number;
  inTime?: string;
  /** 该产出行产品名（半只/半扇/整只） */
  productName?: string;
  /** 该产出行燎毛入库重量 kg（领用过磅默认值） */
  productWeight?: number;
  productUnit?: string;
}

/** 待称重/称重中分割记录（picked/cutting） */
export interface PigCutRecordVO {
  id: number;
  cutId: string;
  barId: string;
  earNo?: string;
  /** 外购猪只白条标识号 bar_info.mark_id（仅外购回填；外购无耳号时 chip 显示用，FIX-WMS-OUTSOURCE-001 行53） */
  markId?: string;
  /** 是否外购普通白条（后端 compute-on-read：bar_info.supplier_id != null） */
  isOutsource?: boolean;
  /** 领用称重 kg（分割白条领用时现场过磅，白条重量展示用此值，非 in_weight） */
  pickupWeight?: number;
  /** 剩余可分割重量 kg（= pickupWeight − 已入库分割产品重量合计；后端计算回填） */
  remainingWeight?: number;
  isHalf: number;
  cutStatus: 'pending_pickup' | 'picked' | 'cutting' | 'done';
  locationName?: string;
}

/** 发送位置字典 djs_pack_send_dest：platform 发货月台 / mail 邮寄 / gift 礼盒 */
export type DeliverDest = 'platform' | 'mail' | 'gift';

/** 肉品/其他产品打包 BO（dry 口：选目标 SKU；locationId 收银台不采集，可空 → service 默认库位兜底） */
export interface DryPackBo {
  sourceInhouseId: number | string;
  productId: number | string;
  productWeight: number;
  /**
   * 本次打包的「成品数量」（V6 row34）：单位 = 成品自身单位（4 枚 / 2 份），后端按它扣门店需求。
   * 与 productWeight 不同 —— productWeight 落库的是**原材料消耗量**（份数模式 = 打包量 × 每份规格）。
   * 仅在录入框显示的就是「打包量」时回传；重量模式（录入的是重量）不传，后端回落「一次打包扣 1 份」。
   */
  packQuantity?: number;
  allowOverMeasure?: boolean;
  productUnit: string;
  locationId?: number | string;
  storeId?: number | string;
  deliverDest?: DeliverDest;
  productSpec?: string;
  proofOssIds?: string;
  remark?: string;
}

/** 礼盒打包 BO（service 按 box_product_id 自动查组件清单；locationId 收银台不采集，可空 → service 默认库位兜底） */
export interface GiftPackBo {
  giftBoxProductId: number | string;
  packBoxCount: number;
  locationId?: number | string;
  storeId?: number | string;
  deliverDest?: DeliverDest;
  proofOssIds?: string;
  remark?: string;
}

/** 果蔬打包 BO（地块来源蔬菜；locationId 收银台不采集，可空 → service 默认库位兜底） */
export interface VegPackBo {
  sourceInhouseId: number | string;
  productId: number | string;
  productWeight: number;
  allowOverMeasure?: boolean;
  locationId?: number | string;
  materialConsume?: number;
  materialId?: number | string;
  storeId?: number | string;
  deliverDest?: DeliverDest;
  productSpec?: string;
  proofOssIds?: string;
  remark?: string;
}

/** 打包提交结果（确认并打印追溯码用） */
export interface PackSubmitResultVO {
  id: number | string;
  traceCode?: string;
  /** 生产编号（produce_no 业务码）：追溯码打印弹框「生产序号」展示 */
  produceNo?: string;
}

/** 某产品各门店未发货需求份数（底部「门店(N份)」标签条） */
export interface StoreDemandCopiesVO {
  storeId: number | string;
  storeName: string;
  copies: number;
}

/** 果蔬日损耗（V4：日损耗 = 领用入库 − 打包消耗 − 退回 − 饲喂，按自然日 compute-on-read） */
export interface VegDailyLossVO {
  /** 统计自然日 yyyy-MM-dd */
  statDate: string;
  /** 领用入库总重 kg */
  pickedWeight: number;
  /** 打包消耗总重 kg */
  packedWeight: number;
  /** 退回总重 kg */
  returnedWeight: number;
  /** 饲喂总重 kg */
  feedWeight: number;
  /** 日损耗 kg（负值归零） */
  lossWeight: number;
}

/**
 * 分割部位明细。
 *
 * 按具体产品对齐原型（Kevin 定）：分割成品按 productId 录入（冻五花肉/排骨/肘子/大排 等，belong_type=pork）；
 * cutPart 5 部位枚举为向后兼容回落项，productId 非空时优先。两者至少传一个。
 */
export interface CutPartItem {
  productId?: number | string;
  cutPart?: 'lean' | 'part' | 'bone' | 'skin' | 'scrap';
  productWeight: number;
  productSpec?: string;
}

/** 分割出库称重 BO（多部位） */
export interface PigCutOutBo {
  cutRecordId: number | string;
  locationId: number | string;
  partItems: CutPartItem[];
  proofOssIds?: string;
}

/** 白条完成分割 BO（滴水损耗由后端自动计算：白条入库重量 − 出库重量，前端不录入） */
export interface PigCutDoneBo {
  cutRecordId: number | string;
  proofOssIds?: string;
  remark?: string;
}

/** 白条领用到分割车间 BO（locationId 领用阶段可空，实际入冻品库位在 cutOut 阶段采集） */
export interface PigCutPickupBo {
  barInfoId: number | string;
  /**
   * 燎毛产出行 id（FIX-WMS-CUTPICKUP-SPLIT-001）：admin 按产出行逐条领用时回传，后端按此行消耗，
   * 该白条所有产出行领满才建整猪 cut_record。缺省 = 整猪兜底路径。
   */
  inhouseId?: number | string;
  /** 领用称重 kg（现场过磅，校验 ≤ 白条出栏重量；可空则回落 in_weight 快照） */
  pickupWeight?: number;
  locationId?: number | string;
  targetStoreId?: number | string;
  targetDemandId?: number | string;
  isHalf?: number;
  remark?: string;
}

/** 白条/猪肉发货领用 BO（出库到发货月台） */
export interface WhiteBarOutBo {
  sourceInhouseId: number | string;
  productWeight: number;
  storeId?: number | string;
  proofOssIds?: string;
  remark?: string;
}

/** 白条/猪肉「仓库出库」BO（row17：出库位置=仓库出库，不发往门店，记出库去向 djs_stock_out_dest） */
export interface WarehouseOutBo {
  sourceInhouseId: number | string;
  productWeight: number;
  /** 出库去向（字典 djs_stock_out_dest 的 dict_value；admin row2 落 cut_record.out_dest） */
  outDest: string;
  proofOssIds?: string;
  remark?: string;
}

// ==================== 打包提交 ====================

// 打包提交（dry/gift/veg）统一带 suppressErrorMsg：失败不走全局自动消失的 ElMessage，
// 由 SkuPackForm 在 catch 里用 ElNotification（X 才关）展示，便于工人看清「组件不足」等长文案。
/** 肉品/其他产品打包（dry 口） → 返 {id, traceCode} */
export const submitDryPack = (data: DryPackBo): AxiosPromise<PackSubmitResultVO> => {
  return request({ url: '/djs/warehouse/packEntry/dry', method: 'post', data, suppressErrorMsg: true } as any);
};

/** 礼盒打包 → 返 {id, traceCode} */
export const submitGiftPack = (data: GiftPackBo): AxiosPromise<PackSubmitResultVO> => {
  return request({ url: '/djs/warehouse/packEntry/gift', method: 'post', data, suppressErrorMsg: true } as any);
};

/** 果蔬打包 → 返 {id, traceCode} */
export const submitVegPack = (data: VegPackBo): AxiosPromise<PackSubmitResultVO> => {
  return request({ url: '/djs/warehouse/packEntry/veg', method: 'post', data, suppressErrorMsg: true } as any);
};

/** 某产品各门店未发货需求份数（底部「门店(N份)」标签条） */
export const listStoreDemand = (productId: number | string): AxiosPromise<StoreDemandCopiesVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/storeDemand', method: 'get', params: { productId } });
};

/**
 * 批量版「各产品各门店未发货需求份数」（卡片网格「需求量」批量聚合，去前端 N+1）。
 *
 * 口径与单产品 listStoreDemand 完全一致，product_id 由 = 改 IN，按 productId 分组。
 * 返回 Map：key = 产品雪花 id 字符串，value = 该产品各门店份数列表；无需求的产品不在 Map 中。
 * productIds 为空 → 不带参数（后端返空 Map）。
 */
export const listStoreDemandBatch = (productIds: (number | string)[]): AxiosPromise<Record<string, StoreDemandCopiesVO[]>> => {
  const ids = productIds.filter((v) => v != null && v !== '');
  return request({
    url: '/djs/warehouse/packEntry/storeDemand/batch',
    method: 'get',
    params: ids.length > 0 ? { productIds: ids.join(',') } : {}
  });
};

/** 果蔬日损耗（V4，compute-on-read；statDate 缺省=当天 yyyy-MM-dd） */
export const getVegDailyLoss = (statDate?: string): AxiosPromise<VegDailyLossVO> => {
  return request({ url: '/djs/warehouse/packEntry/vegDailyLoss', method: 'get', params: { statDate } });
};

// ==================== 白条分割 ====================

/** 分割出库称重（多部位） */
export const submitCutOut = (data: PigCutOutBo): AxiosPromise<void> => {
  return request({ url: '/djs/warehouse/packEntry/cutOut', method: 'post', data });
};

/** 白条完成分割 */
export const submitCutDone = (data: PigCutDoneBo): AxiosPromise<void> => {
  return request({ url: '/djs/warehouse/packEntry/cutDone', method: 'post', data });
};

// ==================== 白条领用 ====================

/** 白条领用到分割车间 → 返新 cut_record.id */
export const submitPickup = (data: PigCutPickupBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/pickup', method: 'post', data });
};

/** 白条/猪肉发货领用（出库到发货月台） → 返新 production.id */
export const submitWhiteBarOut = (data: WhiteBarOutBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/whiteBarOut', method: 'post', data });
};

/** 白条/猪肉仓库出库（row17，出库位置=仓库出库，记出库去向） → 返新 production.id */
export const submitWarehouseOut = (data: WarehouseOutBo): AxiosPromise<number> => {
  return request({ url: '/djs/warehouse/packEntry/warehouseOut', method: 'post', data });
};

/**
 * 果蔬打包成品列表（按本次领用原料反查 product_material 命中成品，doc#12）。
 *
 * 后端已按 belong_type='vegetable' + product_type=1 过滤；materialIds 非空再叠加 product_material IN。
 * materialIds 为空 → 返全部果蔬自产成品（向后兼容）。
 *
 * @param materialIds 本次领用原料的 product_info.id（雪花，逗号串透传）；空数组 → 不带 materialIds 参数
 */
export const listVegProductsByMaterial = (materialIds: (number | string)[]): AxiosPromise<ProductInfoVO[]> => {
  const ids = materialIds.filter((v) => v != null && v !== '');
  return request({
    url: '/djs/warehouse/packEntry/vegProductsByMaterial',
    method: 'get',
    params: ids.length > 0 ? { materialIds: ids.join(',') } : {}
  });
};

// ==================== 来源/白条列表 ====================

/** 打包来源过程产品列表（肉品/其他打包用） */
export const listSourceDry = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceDry', method: 'get' });
};

/** 蔬菜可打包来源列表（plot_id 非空，果蔬打包用） */
export const listSourceVeg = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceVeg', method: 'get' });
};

/** 肉品打包可选来源列表（belong_type='pork'，ear_no = 来源猪只耳号，肉品打包耳号去重条用） */
export const listSourceMeat = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceMeat', method: 'get' });
};

/** 白条/猪肉发货可选来源列表（belong_type ∈ white_bar/pork） */
export const listSourceWhiteBar = (): AxiosPromise<PackSourceVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/sourceWhiteBar', method: 'get' });
};

/** 待领用白条列表（status='in_stock'） */
export const listAvailableBars = (): AxiosPromise<BarInfoVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/availableBars', method: 'get' });
};

/** 白条领用「按燎毛产出行」卡片列表（FIX-WMS-CUTPICKUP-SPLIT-001，半只/半扇各一条，可分次领用） */
export const listPickupItems = (): AxiosPromise<BarPickupItemVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/pickupItems', method: 'get' });
};

/** 待称重/称重中分割记录列表（cut_status ∈ picked/cutting） */
export const listCuttable = (): AxiosPromise<PigCutRecordVO[]> => {
  return request({ url: '/djs/warehouse/packEntry/cuttableList', method: 'get' });
};

/**
 * 批量查目标成品的「原材料实时库存」（卡片库存口径统一，取数逻辑 doc#13）。
 *
 * 后端对每个成品取 product_material 指向的原材料 location_stock 合计，与打包校验/扣减口径一致。
 * 返回 Map：key = 成品雪花 id 字符串（精度安全），value = 库存合计字符串；未配 product_material 的成品不在 Map 中。
 */
export const listMaterialStock = (productIds: (number | string)[]): AxiosPromise<Record<string, string>> => {
  return request({ url: '/djs/warehouse/packEntry/materialStock', method: 'get', params: { productIds: productIds.join(',') } });
};

/**
 * 批量查目标成品「今天已打包份数」（每条 product_production = 一份）。
 * 卡片用：份数 ≥ 门店需求 → 标「打包完成」、禁选。返回 Map：成品雪花 id 字符串 → 今天已打包份数（无记录的成品不在 Map）。
 */
export const listPackedCount = (productIds: (number | string)[]): AxiosPromise<Record<string, number>> => {
  return request({ url: '/djs/warehouse/packEntry/packedCount', method: 'get', params: { productIds: productIds.join(',') } });
};

/**
 * 批量判定目标成品「是否打包完成（按门店分别判）」（FIX-WMS-PACKDEMAND-001 行52）。
 *
 * 同一产品多门店需求时「打包完成」按门店分别判：把份数全打给同一门店不会让另一门店也算完成。
 * 返回已完成（每个有需求门店都打满）的成品雪花 id 字符串数组。
 */
export const listPackedDone = (productIds: (number | string)[]): AxiosPromise<string[]> => {
  return request({ url: '/djs/warehouse/packEntry/packedDone', method: 'get', params: { productIds: productIds.join(',') } });
};

/**
 * 批量查目标成品「已打包总重量 kg」（果蔬「领用剩余重量」口径用）。
 * 「领用剩余重量」= 领用总重 − 已打包总重（前端钳 ≥ 0）。
 * 返回 Map：成品雪花 id 字符串 → 已打包总重 kg 字符串（BigDecimal 序列化为字符串，前端 Number() 强转再算；无记录的成品不在 Map）。
 */
export const listPackedWeight = (productIds: (number | string)[]): AxiosPromise<Record<string, string>> => {
  return request({ url: '/djs/warehouse/packEntry/packedWeight', method: 'get', params: { productIds: productIds.join(',') } });
};
