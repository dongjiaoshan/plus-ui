/**
 * 门店会员档案 + 手录消费类型定义（STR-MEMBER-001）。
 *
 * 与后端 org.dromara.djs.store.member.domain.* 对齐。id / memberId / storeId / createBy
 * 均 string（snowflake JS 精度问题，参 .claude/skills/coder-djs-cross-layer-contract.md §契约 1）。
 * 会员等级字典 djs_member_level：normal=普通 / vip=重要价值客户 / keep=重要保持客户。
 *
 * V1 会员只做「档案 + 手录消费」，不做 RFM / A-B-C 分类 / 营销分析（迁 V2）。
 */

/** 会员档案 VO（列表 / 详情）。 */
export interface StoreMemberVO {
  id: string;
  memberNo: string;
  memberName: string;
  phone: string;
  /** djs_member_level：normal / vip / keep */
  memberLevel?: string;
  /** ISO yyyy-MM-dd */
  joinDate?: string;
  storeId?: string;
  storeName?: string;
  memberTags?: string;
  /** 1=正常 / 0=停用 */
  memberStatus: number;
  createBy?: string;
  /** 建档人姓名（后端 USER_ID_TO_NAME 翻译） */
  createName?: string;
  createTime?: string;
  remark?: string;
}

/** 会员档案新增 / 编辑表单（memberNo 不传，后端生成）。 */
export interface StoreMemberForm {
  id?: string;
  memberName: string;
  phone: string;
  memberLevel?: string;
  /** ISO yyyy-MM-dd */
  joinDate?: string;
  storeId?: string;
  memberTags?: string;
  /** 1=正常 / 0=停用 */
  memberStatus?: number;
  remark?: string;
}

/** 会员档案列表查询。 */
export interface StoreMemberQuery extends PageQuery {
  phone?: string;
  memberName?: string;
  /** djs_member_level */
  memberLevel?: string;
  storeId?: string;
}

/** 会员手录消费记录 VO。 */
export interface StoreMemberConsumptionVO {
  id: string;
  memberId: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  consumeDate: string;
  storeId?: string;
  sku?: string;
  quantity?: number | string;
  amountManual?: number | string;
  notes?: string;
  createBy?: string;
  /** 录入人姓名（USER_ID_TO_NAME 翻译，mapper=createBy） */
  operatorName?: string;
  createTime?: string;
}

/** 会员手录消费录入入参。 */
export interface StoreMemberConsumptionForm {
  memberId: string;
  /** ISO yyyy-MM-dd HH:mm:ss */
  consumeDate: string;
  storeId?: string;
  sku?: string;
  quantity?: number | string;
  amountManual?: number | string;
  notes?: string;
}

/** 简单统计：本月会员数 + 本月录入消费记录数（两个 count，不做 RFM）。 */
export interface StoreMemberStatsVO {
  monthlyMemberCount: number;
  monthlyConsumptionCount: number;
}
