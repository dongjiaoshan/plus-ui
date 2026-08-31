/**
 * 追溯码配置管理类型定义（V6-R146）。
 *
 * 后端 VO：org.dromara.djs.warehouse.trace.domain.vo.TracePageConfigVo
 */

/** 后端 TracePageConfigVo 出参 */
export interface TraceCodeConfigVO {
  id: number | string;
  /** 追溯码类型：pork=猪肉 / veg=果蔬 */
  codeType: 'pork' | 'veg';
  /** 追溯码名称（列表第一列，如「猪肉追溯码」） */
  configName: string;
  /** OSS oss_id（雪花 string，禁 Number） */
  baseIntroImageOssId?: string | null;
  /** 基地介绍页图片可访问 URL（后端解析；未配置为 null） */
  baseIntroImageUrl?: string | null;
  /** 更新时间 yyyy-MM-dd HH:mm:ss */
  updateTime?: string;
  /** 更新人 sys_user.user_id */
  updateBy?: number | string;
  /** 更新人姓名（后端 @Translation 翻译） */
  updateByName?: string;
}

/** 保存基地介绍图入参（ossId 传 null/空 = 清空配置） */
export interface TraceCodeConfigImageForm {
  id: number | string;
  baseIntroImageOssId?: string | null;
}
