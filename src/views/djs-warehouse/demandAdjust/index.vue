<!--
  需求调整管理（V6-R140）—— 系统管理 → 数据管理 → 需求调整管理，menu 5703。

  甲方原话「新增的菜单页面内容和【仓库管理】-【需求管理】的页面内容一致」，
  所以这里不复制一份页面，直接把需求管理本体当组件挂进来，只多传一个 adjustMode ——
  两页共用同一份列表 / 筛选 / 汇总 / 导出逻辑，需求管理那边改什么这边跟着变，不会分叉。

  唯一差别：adjustMode 让「查看需求」抽屉的操作列多出「调整」按钮
  （权限 djs:warehouse:demandAdjust:adjust，后端只在发货之前放行）。

  ⚠️ 列表数据仍走 djs:warehouse:demand:list —— 授本菜单的角色必须同时有需求管理的读权限。

  组件 name 与 DemandManage 分开：keep-alive 按路由组件 name 缓存，同名会让两个菜单共用一份缓存。
-->
<template>
  <DemandManage adjust-mode />
</template>

<script setup name="DemandAdjustManage" lang="ts">
import DemandManage from '../demand/index.vue';
</script>
