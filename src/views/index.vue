<template>
  <div class="app-container home">
    <!-- 东角山品牌条 -->
    <div class="home-brand">
      <div class="home-brand__logo">
        <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#2f7c44" />
          <path
            d="M24 12 C16 12 12 20 12 26 C12 33 18 38 24 38 C30 38 36 33 36 26 C36 20 32 12 24 12 Z M24 18 C28 18 31 22 31 26 C31 30 28 33 24 33 C20 33 17 30 17 26 C17 22 20 18 24 18 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <path d="M24 22 L24 30 M20 26 L28 26" stroke="#2f7c44" stroke-width="2.4" stroke-linecap="round" />
        </svg>
      </div>
      <div class="home-brand__text">
        <h1 class="home-brand__title">{{ t('home.title') }}</h1>
        <p class="home-brand__subtitle">{{ t('home.subtitle') }}</p>
      </div>
    </div>

    <!-- 板块卡片 -->
    <el-row v-if="visibleCards.length > 0" :gutter="20" class="home-boards">
      <el-col v-for="card in visibleCards" :key="card.key" :xs="24" :sm="12" :md="8" :lg="8" :xl="8" class="home-boards__col">
        <el-card class="board-card" shadow="hover" :body-style="{ padding: '0' }" @click="goBoard(card)">
          <div class="board-card__img">
            <img :src="card.img" :alt="t(card.labelKey)" loading="lazy" />
          </div>
          <div class="board-card__body">
            <span class="board-card__label">{{ t(card.labelKey) }}</span>
            <el-icon class="board-card__arrow"><ArrowRightBold /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空态：当前账号未分配任何板块 -->
    <el-empty v-else :description="t('home.board.empty')" class="home-empty" />
  </div>
</template>

<script setup name="Index" lang="ts">
import { ArrowRightBold } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import type { RouteRecordRaw } from 'vue-router';
import { usePermissionStore } from '@/store/modules/permission';
import breedImg from '@/assets/images/boards/breed.svg';
import plantImg from '@/assets/images/boards/plant.svg';
import warehouseImg from '@/assets/images/boards/warehouse.svg';
import storeImg from '@/assets/images/boards/store.svg';
import opsImg from '@/assets/images/boards/ops.svg';
import dashboardImg from '@/assets/images/boards/dashboard.svg';

interface BoardCard {
  /** 板块标识 */
  key: string;
  /** i18n 文案 key */
  labelKey: string;
  /** 卡片配图（URL，占位 SVG，实景图到位后替换 assets/images/boards/* 不改逻辑） */
  img: string;
  /** 对应的顶级菜单 path（去前导斜杠）。用户菜单里有该顶级菜单即展示该板块——
   *  角色配置驱动（ADR-0020），不再硬编码 role_key，worker / admin 一视同仁。 */
  menuPath: string;
}

/** 板块卡片定义：可见性由「用户是否拥有对应顶级菜单」决定。
 *  新增板块在此追加一项 + 对齐后端顶级菜单 path 即可。 */
const BOARD_CARDS: BoardCard[] = [
  { key: 'breed', labelKey: 'home.board.breed', img: breedImg, menuPath: 'djs-breed' },
  { key: 'plant', labelKey: 'home.board.plant', img: plantImg, menuPath: 'djs-plant' },
  { key: 'warehouse', labelKey: 'home.board.warehouse', img: warehouseImg, menuPath: 'djs-warehouse' },
  { key: 'store', labelKey: 'home.board.store', img: storeImg, menuPath: 'djs-store' },
  { key: 'ops', labelKey: 'home.board.ops', img: opsImg, menuPath: 'djs-ops' },
  { key: 'dashboard', labelKey: 'home.board.system', img: dashboardImg, menuPath: 'system' }
];

const { t } = useI18n();
const router = useRouter();
const permissionStore = usePermissionStore();

interface VisibleCard extends BoardCard {
  /** 点击进入的路由 = 该板块第一个可见子菜单 */
  route: string;
}

/**
 * 顶级菜单 → 第一个可导航叶子页的完整路由。
 *
 * 逐层取第一个可见子菜单，**递归钻过 ParentView 目录**直到叶子（无子菜单）——
 * 否则会落在无页面组件的目录路由上（如 /djs-breed/breeding-config 育种配置目录）导致 404。
 */
function firstMenuRoute(top: RouteRecordRaw & { hidden?: boolean }): string {
  let path = top.path?.startsWith('/') ? top.path : `/${top.path}`;
  let node: RouteRecordRaw & { hidden?: boolean } = top;
  while (true) {
    const children = ((node.children as (RouteRecordRaw & { hidden?: boolean })[]) || []).filter((c) => !c.hidden);
    if (!children.length) break;
    const first = children[0];
    path = first.path?.startsWith('/') ? first.path : `${path.replace(/\/$/, '')}/${first.path}`;
    node = first;
  }
  return path;
}

/** 从用户实际下发的菜单（sidebarRouters）推导可见板块 */
const visibleCards = computed<VisibleCard[]>(() => {
  const routers = (permissionStore.sidebarRouters || []) as (RouteRecordRaw & { hidden?: boolean })[];
  const result: VisibleCard[] = [];
  for (const card of BOARD_CARDS) {
    const top = routers.find((r) => (r.path || '').replace(/^\//, '') === card.menuPath && !r.hidden);
    if (top) {
      result.push({ ...card, route: firstMenuRoute(top) });
    }
  }
  return result;
});

function goBoard(card: VisibleCard) {
  router.push(card.route);
}

// 单板块用户直接进入唯一板块的第一个菜单（不停首页）
onMounted(() => {
  if (visibleCards.value.length === 1) {
    router.replace(visibleCards.value[0].route);
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding: 24px;
}

.home-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #3a9659 0%, #2f7c44 100%);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(47, 124, 68, 0.18);

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.16);
    border-radius: 12px;
  }

  &__title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.3;
    color: #ffffff;
  }

  &__subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.82);
  }
}

.home-boards {
  &__col {
    margin-bottom: 20px;
  }
}

.board-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);

    .board-card__arrow {
      transform: translateX(4px);
    }
  }

  &__img {
    width: 100%;
    height: 140px;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
  }

  &__label {
    font-size: 17px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__arrow {
    color: var(--el-text-color-secondary);
    transition: transform 0.2s ease;
  }
}

.home-empty {
  padding: 80px 0;
}

// 桌面大屏：6 卡平铺一行（栅格 24 不整除 6 的等分需求，大屏覆盖为 1/6 等分）
@media (min-width: 1400px) {
  .home-boards {
    flex-wrap: nowrap;

    &__col {
      flex: 0 0 16.6667%;
      max-width: 16.6667%;
    }
  }
}
</style>
