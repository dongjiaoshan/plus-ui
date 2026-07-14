/**
 * BizTable 通用列表组件类型定义
 *
 * 设计目标：业务 list 页（djs-common / djs-breed / djs-plant / djs-warehouse / djs-store）
 * 复用同一组件签名，避免每个页面重复写 el-table + RightToolbar + Pagination + 字典 + 权限。
 */

import type { CSSProperties } from 'vue';

/** 表格行：业务字段不收敛，每页 vo 不同，统一用 Record<string, any> */
export type BizRow = Record<string, any>;

/** 查询表单字段类型（month=月份选择器，回写 'YYYY-MM'） */
export type SearchFieldType = 'input' | 'select' | 'date' | 'month' | 'daterange' | 'number';

/**
 * 查询表单字段 schema
 *
 * 例：
 * ```ts
 * { field: 'name', label: '名称', type: 'input', placeholder: '请输入名称' }
 * { field: 'status', label: '状态', type: 'select', dictType: 'djs_user_status' }
 * { field: 'createTime', label: '创建时间', type: 'daterange' }
 * ```
 */
export interface SearchFieldSchema {
  /** 字段名（绑到 searchModel） */
  field: string;
  /** 表单 label（i18n key 或裸文案） */
  label: string;
  /** 字段类型 */
  type: SearchFieldType;
  /** 输入框占位文案 */
  placeholder?: string;
  /** type=select 时必填，二选一：dictType 走全局字典 / options 自定义 */
  dictType?: string;
  options?: Array<{ label: string; value: string | number }>;
  /** 是否可清空 */
  clearable?: boolean;
  /** type=select 多选（R70 关键搜索筛选下拉多选）；多选时 v-model 值为数组，buildQuery 需按数组传后端 IN */
  multiple?: boolean;
  /** 表单项宽度 */
  width?: string | number;
}

/** 表格列定义 */
export interface BizTableColumn {
  /** 字段名（el-table-column prop） */
  prop: string;
  /** 表头文案 */
  label: string;
  /** 列宽 */
  width?: string | number;
  /** 最小列宽 */
  minWidth?: string | number;
  /** 对齐 */
  align?: 'left' | 'center' | 'right';
  /** 列固定 */
  fixed?: boolean | 'left' | 'right';
  /** 是否可排序（走后端排序） */
  sortable?: boolean | 'custom';
  /** 字典联动：传字典类型，自动渲染 <dict-tag> */
  dictType?: string;
  /** 字段渲染为时间格式 */
  formatter?: 'date' | 'datetime' | ((row: BizRow) => string);
  /** 是否默认显示（false 走 RightToolbar 显隐切换） */
  visible?: boolean;
  /** 是否显示 overflow tooltip */
  showOverflowTooltip?: boolean;
}

/** 主组件 props */
export interface BizTableProps {
  /** 数据 */
  data: BizRow[];
  /** 总数 */
  total: number;
  /** loading 态 */
  loading?: boolean;
  /** 查询字段 schema */
  searchSchema?: SearchFieldSchema[];
  /** 查询表单 model（v-model） */
  searchModel?: Record<string, any>;
  /** 表格列 */
  columns: BizTableColumn[];
  /** 行 key（el-table 必需） */
  rowKey?: string;
  /** 是否多选 */
  selectable?: boolean;
  /** 当前页 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 每页条数候选 */
  pageSizes?: number[];
  /** 字典自动加载 */
  dictTypes?: string[];
  /** 权限前缀（如 djs:common:person，自动拼 :add / :edit / :remove / :export） */
  permPrefix: string;
  /** 工具栏按钮显隐 */
  showAdd?: boolean;
  showBatchDel?: boolean;
  showExport?: boolean;
  /** 行操作列内置 Edit / Del 显隐（业务页面用 `#action` slot 自定义时可关掉，避免出现两个操作列）*/
  showRowEdit?: boolean;
  showRowDel?: boolean;
  /** 行操作列宽度（px）；`#action` slot 放多个按钮时可调宽，默认 160 */
  actionWidth?: number;
  /** 行操作列最小宽度（px）；设置后操作列改用 min-width 参与等宽分配（列少时让操作列与数据列同宽），优先于 actionWidth */
  actionMinWidth?: number;
  /** 表格高度 */
  height?: string | number;
  /** 表格自定义 style */
  tableStyle?: CSSProperties;
}

/** emits 类型 */
export interface BizTableEmits {
  (e: 'search', model: Record<string, any>): void;
  (e: 'reset'): void;
  (e: 'add'): void;
  (e: 'edit', row: BizRow): void;
  (e: 'del', rowOrRows: BizRow | BizRow[]): void;
  (e: 'export', params: Record<string, any>): void;
  (e: 'page-change', pageNum: number, pageSize: number): void;
  (e: 'selection-change', rows: BizRow[]): void;
  (e: 'sort-change', sort: { prop: string; order: 'asc' | 'desc' | null }): void;
}

/** 父组件可调的方法（defineExpose） */
export interface BizTableExpose {
  /** 触发父组件 search emit（外部调用刷新） */
  refresh: () => void;
  /** 重置查询表单 */
  reset: () => void;
  /** 取当前选中行 */
  getSelected: () => BizRow[];
  /** 清空选中 */
  clearSelection: () => void;
  /** 全选/取消全选当前页所有行 */
  toggleAllSelection: () => void;
}
