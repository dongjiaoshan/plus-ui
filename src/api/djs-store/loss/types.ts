/**
 * 门店损耗记录类型定义（DENGBO-R30，admin only 无 mp）。
 *
 * 与后端 org.dromara.djs.store.loss.domain.* 对齐。id / storeId / productId 均 string
 * （snowflake JS 精度问题）。损耗类型字典 djs_store_loss_type：store_daily_loss / white_bar_split_loss。
 */

/** 门店损耗记录 VO（映射 t_store_loss_record）。 */
export interface StoreLossRecordVO {
  id: string;
  storeId?: string;
  storeName?: string;
  productId?: string;
  /** 产品名称（白条分割损耗汇总行=损耗类型中文占位）。 */
  productName?: string;
  /** 产品单位。 */
  productUnit?: string;
  /** 损耗量。 */
  lossQty?: number | string;
  /** ISO yyyy-MM-dd */
  lossDate?: string;
  /** djs_store_loss_type：store_daily_loss / white_bar_split_loss */
  lossType?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  createTime?: string;
}

/** 当日白条分割损耗信息（门店盘点抽屉展示；口径同定时任务：max(0, 到店重−退回入库重)）。 */
export interface WhiteBarSplitLossVO {
  /** 当日白条到店重量 kg（>0 才显示分割损耗块）。 */
  arriveWeight?: number | string;
  /** 当日白条退回产品入库重 kg（t_store_return 门店退回仓库、已入库、白条退回产品）。 */
  returnReceivedWeight?: number | string;
  /** 当日白条分割损耗 kg = max(0, arriveWeight − returnReceivedWeight)。 */
  splitLoss?: number | string;
}

/** 门店损耗记录列表查询。 */
export interface StoreLossQuery extends PageQuery {
  /** 产品名称模糊 */
  productName?: string;
  /** djs_store_loss_type 损耗类型 */
  lossType?: string;
  /** ISO yyyy-MM-dd 损耗日期下界（含） */
  lossDateFrom?: string;
  /** ISO yyyy-MM-dd 损耗日期上界（含） */
  lossDateTo?: string;
}
