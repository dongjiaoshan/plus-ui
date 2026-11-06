/**
 * 超龄猪（日龄 > 365 天）提醒，猪只入库管理与白条分割管理共用（V7 第30/34/35行）。
 * 卡片样式见同目录 overAge.scss；日龄展示统一为「368天」，不带「日龄」二字（省宽度，保耳号单行）。
 */
export const OVER_AGE_DAYS = 365;

export function isOverAgeDays(ageDays: number | null | undefined): boolean {
  return ageDays != null && ageDays > OVER_AGE_DAYS;
}
