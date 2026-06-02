/**
 * 门店白条分割类型定义（STR-SPLIT-001，admin only 无 mp）。
 *
 * 与后端 org.dromara.djs.store.split.domain.* 对齐。id / locationId / whiteBarId / createBy
 * 均 string（snowflake JS 精度问题，参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 * 分割部位字典 djs_pig_cut_part：lean / part / bone / skin / scrap。
 * 来源 source：固定 store=门店再分（列表只看门店行，不含 warehouse 仓库分割行）。
 */

/** 门店分割明细 VO（映射 t_warehouse_product_inhouse 中 source='store' 的行）。 */
export interface StoreSplitVO {
  id: string;
  /** djs_pig_cut_part：lean / part / bone / skin / scrap */
  cutPart: string;
  productName: string;
  productWeight: number | string;
  locationId?: string;
  whiteBarId?: string;
  /** 固定 store=门店再分 */
  source: string;
  /** ISO yyyy-MM-dd */
  produceDate: string;
  remark?: string;
  createBy?: string;
  createByName?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  createTime?: string;
}

/** 门店再分录入入参（选部位 + 录重量 + 库位 + 可选源白条 → INSERT source='store'）。 */
export interface StoreSplitForm {
  /** djs_pig_cut_part 部位 key */
  cutPart: string;
  productWeight: number | string;
  locationId?: string;
  /** 源白条溯源（可空，snowflake string） */
  whiteBarId?: string;
  remark?: string;
}

/** 门店分割列表查询。 */
export interface StoreSplitQuery extends PageQuery {
  /** djs_pig_cut_part 部位 key（可选） */
  cutPart?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  produceDateStart?: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  produceDateEnd?: string;
}
