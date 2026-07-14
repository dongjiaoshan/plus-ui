# BizTable 通用列表组件

> 东角山项目 admin 端所有业务 list 页（djs-common / djs-breed / djs-plant / djs-warehouse / djs-store）统一使用。
> 替代裸 `<el-table>` + `RightToolbar` + `Pagination` + 字典 + 权限的重复样板。

## 能力

- 顶部查询表单（schema-driven，支持 input / number / select / date / daterange）
- 操作工具栏（新增 / 批量删除 / 导出 / 刷新 / 列显隐切换）
- el-table（单/多选、排序、字典联动列、时间格式化）
- 分页（复用 ruoyi `<pagination>`）
- 行操作 slot（默认 编辑 / 删除，可完全自定义）
- loading / empty 状态
- 字典自动加载（`dictTypes` props）
- 权限自动拼接（`permPrefix` + `:add` / `:edit` / `:remove` / `:export`）

## 基础用法

```vue
<template>
  <BizTable
    ref="tableRef"
    :data="list"
    :total="total"
    :loading="loading"
    :columns="columns"
    :search-schema="searchSchema"
    :search-model="searchModel"
    :dict-types="['sys_normal_disable']"
    :page-num="pageNum"
    :page-size="pageSize"
    row-key="id"
    selectable
    perm-prefix="djs:common:person"
    @search="handleSearch"
    @reset="handleReset"
    @add="handleAdd"
    @edit="handleEdit"
    @del="handleDel"
    @page-change="handlePageChange"
  />
</template>

<script setup lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, SearchFieldSchema, BizTableExpose } from '@/components/BizTable/types';

const tableRef = ref<BizTableExpose>();
const list = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive({ name: undefined, status: undefined });

const searchSchema: SearchFieldSchema[] = [
  { field: 'name', label: '名称', type: 'input' },
  { field: 'status', label: '状态', type: 'select', dictType: 'sys_normal_disable' }
];

const columns: BizTableColumn[] = [
  { prop: 'name', label: '名称', minWidth: 160 },
  { prop: 'status', label: '状态', width: 100, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'createTime', label: '创建时间', width: 180, align: 'center', formatter: 'datetime' }
];

function handleSearch(model: Record<string, any>) {
  /* 取数 */
}
function handleReset() {
  /* reset 后 emit search */
}
function handleAdd() {
  /* 打开新增弹窗 */
}
function handleEdit(row: any) {
  /* 打开编辑弹窗 */
}
function handleDel(rowOrRows: any | any[]) {
  /* 单行或批量删除 */
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
}
</script>
```

## Props

| prop           | 类型                  | 默认            | 说明                                                      |
| -------------- | --------------------- | --------------- | --------------------------------------------------------- |
| `data`         | `BizRow[]`            | —               | 表格数据                                                  |
| `total`        | `number`              | —               | 总条数                                                    |
| `loading`      | `boolean`             | `false`         | loading 态                                                |
| `searchSchema` | `SearchFieldSchema[]` | `[]`            | 查询表单字段 schema                                       |
| `searchModel`  | `Record<string, any>` | `{}`            | 查询表单 model                                            |
| `columns`      | `BizTableColumn[]`    | —               | 表格列定义                                                |
| `rowKey`       | `string`              | `'id'`          | el-table row-key                                          |
| `selectable`   | `boolean`             | `false`         | 多选                                                      |
| `pageNum`      | `number`              | `1`             | 当前页                                                    |
| `pageSize`     | `number`              | `10`            | 每页条数                                                  |
| `pageSizes`    | `number[]`            | `[10,20,30,50]` | 每页条数候选                                              |
| `dictTypes`    | `string[]`            | `[]`            | 字典自动加载（用于联动列与 select 查询）                  |
| `permPrefix`   | `string`              | —               | 权限前缀，自动拼 `:add` / `:edit` / `:remove` / `:export` |
| `showAdd`      | `boolean`             | `true`          | 工具栏新增按钮                                            |
| `showBatchDel` | `boolean`             | `true`          | 工具栏批量删除按钮                                        |
| `showExport`   | `boolean`             | `false`         | 工具栏导出按钮                                            |
| `height`       | `string \| number`    | —               | 表格高度（虚拟滚动）                                      |
| `tableStyle`   | `CSSProperties`       | —               | 表格自定义 style                                          |

## Emits

| event              | 参数                  | 说明                                       |
| ------------------ | --------------------- | ------------------------------------------ |
| `search`           | `(model)`             | 点击搜索 / 刷新 / 列显隐变化时触发         |
| `reset`            | —                     | 点击重置                                   |
| `add`              | —                     | 工具栏新增                                 |
| `edit`             | `(row)`               | 默认行编辑 slot                            |
| `del`              | `(row \| row[])`      | 单行删除 / 批量删除                        |
| `export`           | `(params)`            | 工具栏导出                                 |
| `page-change`      | `(pageNum, pageSize)` | 分页改变                                   |
| `selection-change` | `(rows)`              | 多选改变                                   |
| `sort-change`      | `({ prop, order })`   | 排序改变（order: 'asc' \| 'desc' \| null） |

## Slots

| slot            | 作用域           | 说明                                                    |
| --------------- | ---------------- | ------------------------------------------------------- |
| `cell-<prop>`   | `{ row, index }` | 自定义某一列内容（优先级低于 `dictType` / `formatter`） |
| `action`        | `{ row, index }` | 完全自定义行操作列；不传则默认编辑 + 删除按钮           |
| `toolbar-extra` | —                | 工具栏左侧追加按钮                                      |

## Expose

通过 `ref` 调用：

```ts
const tableRef = ref<BizTableExpose>();

tableRef.value?.refresh(); // 重新触发 search
tableRef.value?.reset(); // 重置查询表单
tableRef.value?.getSelected(); // 取当前选中行
tableRef.value?.clearSelection(); // 清空选中
```

## 列字典联动

```ts
const columns: BizTableColumn[] = [{ prop: 'status', label: '状态', dictType: 'djs_pig_lifecycle' }];
// 配合 props.dictTypes=['djs_pig_lifecycle']，列自动渲染 <dict-tag>
```

## 时间格式化

```ts
{ prop: 'createTime', label: '创建时间', formatter: 'datetime' } // YYYY-MM-DD HH:mm:ss
{ prop: 'birthDate',  label: '出生日期', formatter: 'date' }     // YYYY-MM-DD
{ prop: 'age',        label: '日龄',     formatter: (row) => `${row.age} 天` }
```

## 权限串约定

`permPrefix="djs:common:person"` 等价于：

- 新增按钮 `v-hasPermi="['djs:common:person:add']"`
- 编辑按钮 `v-hasPermi="['djs:common:person:edit']"`
- 删除按钮 `v-hasPermi="['djs:common:person:remove']"`
- 导出按钮 `v-hasPermi="['djs:common:person:export']"`
- 必须与后端 `@SaCheckPermission("djs:common:person:xxx")` 完全一致

## i18n key

固定走 `t('biz.table.*')`，zh_CN / en_US 已注册。业务列 label 自己加 key 或用裸文案。

## 已知限制

- 查询表单 `daterange` 把值绑成 `[start, end]` 数组；业务页负责在 `@search` 里拆成 `beginXxx` / `endXxx` 传给后端
- 列显隐切换状态不持久化（刷新页面回到默认）
- 树形表格暂未抽象到本组件（树形 list 直接用 `el-table tree-props`，不走 BizTable）
- 暴露的 expose 没暴露 `el-table` 原生 ref，需要细粒度操作请走 `cell-<prop>` slot 内的 scope
