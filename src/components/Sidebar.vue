<template>
  <div class="sidebar-container">
    <!-- logo+气泡 -->
    <LogoRadialMenu />

    <!-- 菜单 -->
    <div class="menu-area">
      <div
        v-for="item in menu"
        :key="item.path"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
        @click="handleMenuClick(item.path)"
      >
        <a-tooltip
          color="var(--menu-tooltip-bg)"
          placement="right"
          :title="item.title"
          :overlayInnerStyle="{
            fontSize: '12px',
            color: isDarkMode ? '#fff' : '#000',
          }"
        >
          <component :is="item.icon" class="menu-icon" />
        </a-tooltip>
      </div>
    </div>

    <!-- 头像 -->
    <div class="bottom-area">
      <div
        class="action-btn"
        :class="{ spin: isRefreshing }"
        @click="handleRefresh"
        title="刷新页面"
      >
        <ReloadOutlined />
      </div>
      <div class="avatar-wrapper" @click="toProfile" title="个人资料">
        <a-avatar :size="36" :src="avatar">
          <template #icon><UserOutlined /></template>
        </a-avatar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from "@/stores/menu";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import LogoRadialMenu from "@/components/LogoRadialMenu.vue";
import { UserOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import avatar from "@/assets/images/avatar.jpg";

const store = useMenuStore();
const { menu } = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const isRefreshing = ref(false);

const isActive = (path: string) => {
  if (path === "/" && route.path === "/") return true;
  if (path !== "/" && route.path.startsWith(path)) return true;
  return false;
};
const isDarkMode = ref(document.body.getAttribute("data-dark-mode") === "true");
let darkObserver: MutationObserver | null = null;

onMounted(() => {
  darkObserver = new MutationObserver(() => {
    isDarkMode.value = document.body.getAttribute("data-dark-mode") === "true";
  });
  darkObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-dark-mode"],
  });
});

onBeforeUnmount(() => {
  darkObserver?.disconnect();
  darkObserver = null;
});

const handleMenuClick = (path: string) => {
  router.push(path);
};

const handleRefresh = () => {
  isRefreshing.value = true;
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

const toProfile = () => {
  router.push("/profile");
};
</script>

<style scoped>
.menu-tooltip {
  font-size: 12px;
}
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  width: 80px;
  background: var(--sidebar-bg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  -webkit-app-region: drag;
}

.menu-area {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  overflow-y: auto;
}

.menu-item {
  width: 100%;
  height: 44px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--menu-icon-default);
  transition: color 0.2s ease;
  -webkit-app-region: no-drag;
}

.menu-item:hover {
  color: color-mix(in srgb, var(--brand-primary), #000 15%);
}

.menu-item.active {
  color: var(--brand-primary);
}
.menu-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 3px;
  background: var(--brand-primary);
}

.menu-icon {
  font-size: 22px;
}

.bottom-area {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  -webkit-app-region: no-drag;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--menu-icon-default);
  transition: all 0.2s;
  border-radius: 50%;
}

.action-btn:hover {
  color: var(--brand-primary);
  background: rgba(0, 0, 0, 0.05);
}

.action-btn.spin {
  animation: spin 1s linear infinite;
  color: var(--brand-primary);
  pointer-events: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.avatar-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid transparent;
  border-radius: 50%;
  -webkit-app-region: no-drag;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  /* border-color: var(--brand-primary); */
}

.theme-wrapper {
  transform: scale(0.6);
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
  background: #ffffff;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.window-controls {
  display: flex;
  gap: 8px;
  padding: 4px;
}

.window-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.window-btn:hover {
  background: #eee;
  color: #333;
}

.window-btn.close:hover {
  background: #ff4d4f;
  color: white;
}
</style>

<style>
.window-controls-popover .ant-popover-inner {
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

[data-dark-mode="true"] .window-controls-popover .ant-popover-inner {
  background: var(--sidebar-bg);
  border: 1px solid var(--divider-color);
}

[data-dark-mode="true"] .window-btn {
  color: #9ca3af;
}

[data-dark-mode="true"] .window-btn:hover {
  background: #374151;
  color: #e5e7eb;
}

[data-dark-mode="true"] .window-btn.close:hover {
  background: #ef4444;
}
</style>
