<template>
  <header class="topbar">
    <div class="left">
      <!-- <div class="logo">📘</div> -->
      <div class="title">{{ projectName }}</div>
    </div>
    <div class="right">
      <ThemeSwitch />
      <el-icon class="icon-btn" @click="toHome"><House /></el-icon>
      <button class="icon-btn" @click="refreshPage" title="刷新">
        <el-icon :class="{ spin: refreshing }"><RefreshRight /></el-icon>
      </button>
      <el-dropdown
        trigger="hover"
        placement="bottom-end"
        :hide-on-click="false"
        @command="onDropdownCommand"
      >
        <span class="avatar">
          <el-avatar :src="avatarUrl" :size="28" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人资料</el-dropdown-item>
            <el-dropdown-item command="auth">{{
              isLoggedIn ? "退出登录" : "登录"
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="window-controls">
        <el-icon @click="minimizeWindow" class="window-btn"
          ><SemiSelect
        /></el-icon>
        <el-icon @click="maximizeWindow" class="window-btn"
          ><FullScreen
        /></el-icon>
        <el-icon @click="closeWindow" class="window-btn close"
          ><CloseBold
        /></el-icon>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ThemeSwitch from "@/components/ThemeSwitch.vue";

const route = useRoute();
const router = useRouter();
const projectName = "Elect-Tool";
const pageTitle = computed(() => (route.meta?.title as string) || "首页");
const isLoggedIn = ref(false);
const refreshing = ref(false);

const minimizeWindow = () => {
  window.electronAPI?.minimizeWindow();
};
const maximizeWindow = () => {
  window.electronAPI?.maximizeWindow();
};
const closeWindow = () => {
  window.electronAPI?.closeWindow();
};

const refreshPage = () => {
  refreshing.value = true;
  setTimeout(() => {
    location.reload();
  }, 500);
};

const toHome = () => router.push("/");

const toProfile = () => router.push("/profile");
const loginOrLogout = () => {
  isLoggedIn.value = !isLoggedIn.value;
};

const onDropdownCommand = (cmd: string) => {
  if (cmd === "profile") toProfile();
  if (cmd === "auth") loginOrLogout();
};

const mockAvatarLogged = "https://i.pravatar.cc/64?img=12";
const mockAvatarGuest = "https://i.pravatar.cc/64?img=1";
const avatarUrl = computed(() =>
  isLoggedIn.value ? mockAvatarLogged : mockAvatarGuest
);
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3px;
  padding-bottom: 3px;
  margin-top: -3px;
  height: 35px;
  -webkit-app-region: drag;
}
.left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-image: linear-gradient(135deg, var(--brand-gradient-start) 0%, var(--brand-gradient-end) 100%);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--brand-gradient-end), transparent 65%);
  -webkit-app-region: no-drag;
}
.title {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.2px;
  color: color-mix(in srgb, var(--brand-primary), #1f2937 70%);
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.icon-btn {
  width: 33px;
  height: 33px;
  line-height: 0;
  border: none;
  cursor: pointer;
  margin-right: 5px;
  background: #ffffff00;
}
.avatar {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.window-controls {
  display: flex;
  gap: 6px;
  margin-left: 10px;
}
.window-btn {
  width: 18px;
  height: 18px;
  border: none;
  cursor: pointer;
  margin-left: 14px;
}
.window-btn.close {
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.spin {
  animation: spin 0.8s linear infinite;
}
</style>
