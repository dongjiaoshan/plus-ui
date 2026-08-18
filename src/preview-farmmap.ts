// 临时预览入口：不走登录/Layout，直接挂载农场地图 P0 草图页，用于确认画法与配色。
// P0 评审通过后删除本文件与 preview-farmmap.html。
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'uno.css';
import i18n from '@/lang/index';
import FarmMap from '@/views/djs-plant/farmmap/index.vue';

createApp(FarmMap).use(ElementPlus).use(i18n).mount('#app');
