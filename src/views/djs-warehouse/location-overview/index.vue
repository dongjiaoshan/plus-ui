<template>
  <div class="p-2">
    <LocationCardGrid />
  </div>
</template>

<script setup lang="ts">
import LocationCardGrid from '../location/components/LocationCardGrid.vue';

defineOptions({ name: 'LocationOverview' });
</script>
