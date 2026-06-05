/**
 * 门店看板配色 / 常量（STR-DASH-001，ADMIN-DASH-CHART-001 ECharts 化）。
 *
 * 门店 / 种植按常规配色（无养殖的红=好/绿=差反转）：主色农场绿 #2f7c44，
 * 辅助色用于双轴折线 / 多序列区分。配色集中此处，禁止散落硬编码到组件。
 */

/** 门店看板配色（主色农场绿 + 辅助色，按用途命名） */
export const STORE_CHART_COLOR = {
  /** 主色：农场绿（饼图首扇区 / 订单柱 / 销售额线） */
  primary: '#2f7c44',
  /** 辅助绿：横条 bar */
  bar: '#2ea36c',
  /** 辅助橙：客单价线（双轴右侧） */
  accent: '#e6a23c',
  /** 饼图调色板（扇区按业态轮转，主色起头） */
  pie: ['#2f7c44', '#2ea36c', '#e6a23c', '#5c93f0', '#9a7bd1', '#56c0c0', '#f08e5c', '#c0ca33'] as readonly string[]
} as const;

/** 5 分钟轮询周期（毫秒） */
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
