<template>
  <div class="tl">
    <!-- 顶部 banner：封面图 + 标题 + 追溯码 -->
    <div class="tl-banner" :style="bannerStyle">
      <div class="tl-banner__mask">
        <div class="tl-banner__title">{{ title }}</div>
        <div v-if="traceCode" class="tl-banner__code">{{ traceCode }}</div>
      </div>
    </div>
    <div class="tl-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; traceCode?: string; cover?: string }>();

const bannerStyle = computed(() => {
  if (props.cover) {
    return { backgroundImage: `url(${props.cover})` };
  }
  return {};
});
</script>

<style lang="scss" scoped>
.tl-banner {
  height: 180px;
  background-color: #2f7c44;
  background-size: cover;
  background-position: center;
  position: relative;
}
.tl-banner__mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(47, 124, 68, 0.2) 0%, rgba(47, 124, 68, 0.78) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  color: #fff;
}
.tl-banner__title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}
.tl-banner__code {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.92;
  letter-spacing: 0.5px;
  font-variant-numeric: tabular-nums;
}
.tl-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
