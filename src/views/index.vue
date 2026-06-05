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
import { useUserStore } from '@/store/modules/user';
import breedImg from '@/assets/images/boards/breed.svg';
import plantImg from '@/assets/images/boards/plant.svg';
import warehouseImg from '@/assets/images/boards/warehouse.svg';
import storeImg from '@/assets/images/boards/store.svg';
import dashboardImg from '@/assets/images/boards/dashboard.svg';

interface BoardCard {
  /** 板块标识 */
  key: string;
  /** i18n 文案 key */
  labelKey: string;
  /** 卡片配图（URL，占位 SVG，实景图到位后替换 assets/images/boards/* 不改逻辑） */
  img: string;
  /** 点击跳转的板块首页路由 */
  route: string;
  /** 可见角色 role_key（命中其一即展示该卡） */
  roles: string[];
}

/** 5 板块卡片定义：后续新增板块在此追加一项即可（admin 端角色过滤范式） */
const BOARD_CARDS: BoardCard[] = [
  { key: 'breed', labelKey: 'home.board.breed', img: breedImg, route: '/djs-breed/dashboard', roles: ['breed_admin'] },
  { key: 'plant', labelKey: 'home.board.plant', img: plantImg, route: '/djs-plant/dashboard', roles: ['plant_admin'] },
  { key: 'warehouse', labelKey: 'home.board.warehouse', img: warehouseImg, route: '/djs-warehouse/dashboard', roles: ['warehouse_admin'] },
  { key: 'store', labelKey: 'home.board.store', img: storeImg, route: '/djs-store/dashboard', roles: ['store_admin'] },
  { key: 'dashboard', labelKey: 'home.board.system', img: dashboardImg, route: '/system/user', roles: ['system_admin'] }
];

/** boss / 超管 / manager 类角色：看到全部板块（对齐 mp BoardPicker 全展示逻辑） */
const FULL_ACCESS_ROLES = ['superadmin', 'admin', 'boss', 'manager'];

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

function hasFullAccess(roles: string[]): boolean {
  return roles.some((role) => FULL_ACCESS_ROLES.some((full) => role.includes(full)));
}

function filterByRoles(cards: BoardCard[], roles: string[]): BoardCard[] {
  if (hasFullAccess(roles)) {
    return cards;
  }
  return cards.filter((card) => card.roles.some((r) => roles.includes(r)));
}

const visibleCards = computed<BoardCard[]>(() => filterByRoles(BOARD_CARDS, userStore.roles));

function goBoard(card: BoardCard) {
  router.push(card.route);
}

// 单板块用户直接进入唯一板块（不停首页，对齐 mp BoardPicker 单板块直入）
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

// 桌面大屏：5 卡平铺一行（栅格 24 不整除 5，大屏覆盖为 20% 等分）
@media (min-width: 1400px) {
  .home-boards {
    flex-wrap: nowrap;

    &__col {
      flex: 0 0 20%;
      max-width: 20%;
    }
  }
}
</style>
