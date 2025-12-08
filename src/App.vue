<template>
  <div id="app">
    <TopBar />
    <div class="content-wrap">
      <aside class="sidebar">
        <Sidebar />
      </aside>
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import TopBar from "@/components/TopBar.vue";

const route = useRoute();
const projectName = "Elect-Tool";
const pageTitle = computed(() => (route.meta?.title as string) || "首页");

watch(
  pageTitle,
  (t) => {
    document.title = `${t} · ${projectName}`;
  },
  { immediate: true }
);

// 顶部交互迁移至 TopBar 组件
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: calc(100vh - 3px);
  display: flex;
  flex-direction: column;
  position: relative;
}
.content-wrap {
  display: flex;
  flex: 1;
  min-height: 0;
  margin-bottom: 15px;
}
.sidebar {
  width: 66px;
  margin-right: 3px;
  border-radius: 5px;
  /* background: #fff; */
}
.main-content {
  flex: 1;
  padding: 24px;
  /* background: #fff; */
  overflow: auto;
  border-radius: 5px;
  position: relative;
}
</style>

<style>
html {
  height: 100%;
  overflow: hidden;
  background-image: var(--app-bg-light);
}
body {
  height: 100%;
  overflow: hidden;
  background: transparent !important;
}
*::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}
#app[data-dark-mode="true"] .main-content,
body[data-dark-mode="true"] .main-content {
  background: var(--content-bg-dark) !important;
  color: #e6edf3 !important;
}
body[data-dark-mode="true"] {
  --sidebar-active-bg: color-mix(in srgb, var(--brand-primary), black 80%);
  --sidebar-active-text: color-mix(in srgb, var(--brand-primary), white 30%);
  --menu-text-default: #cfd4dc;
  --menu-icon-default: #cfd4dc;
}
:root {
  --brand-primary: var(--el-color-primary);
  --brand-gradient-start: color-mix(in srgb, var(--brand-primary), white 20%);
  --brand-gradient-end: color-mix(in srgb, var(--brand-primary), #8b5cf6 20%);
  --sidebar-active-bg: color-mix(in srgb, var(--brand-primary), white 85%);
  --sidebar-active-text: var(--brand-primary);
  --menu-text-default: #9aa3af;
  --menu-icon-default: var(--menu-text-default);
  --content-bg-light: #f3faffc7;
  --content-bg-dark: rgb(19 22 42 / 38%);
  --app-bg-light: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);
  --app-bg-dark: linear-gradient(-20deg, #1b374a 0%, #3a3257 100%);
}

/* 让过渡层位于背景与内容之间：覆盖层 z-index:0；内容提升到 z-index:1 */
#app > *,
.main-content > * {
  position: relative;
  z-index: 1;
}

/* 仅提前切换文字与图标颜色，不改变背景 */
#app[data-ink-dark="true"] .main-content {
  color: #e6edf3 !important;
}
#app[data-ink-dark="true"] {
  --menu-text-default: #cfd4dc;
  --menu-icon-default: #cfd4dc;
}
/* #app[data-ink-dark="true"] input, */
#app[data-ink-dark="true"] textarea,
#app[data-ink-dark="true"] select,
/* #app[data-ink-dark="true"] .el-input__wrapper, */
#app[data-ink-dark="true"] .el-textarea__inner {
  color: #e6edf3 !important;
}
/* #app[data-ink-dark="true"] input::placeholder, */
#app[data-ink-dark="true"] textarea::placeholder {
  color: #d8e0e9 !important;
}
/* #app[data-dark-mode="true"] input, */
#app[data-dark-mode="true"] textarea,
#app[data-dark-mode="true"] select,
/* #app[data-dark-mode="true"] .el-input__wrapper, */
#app[data-dark-mode="true"] .el-textarea__inner,
/* body[data-dark-mode="true"] input, */
body[data-dark-mode="true"] textarea,
body[data-dark-mode="true"] select,
/* body[data-dark-mode="true"] .el-input__wrapper, */
body[data-dark-mode="true"] .el-textarea__inner {
  background: var(--content-bg-dark) !important;
  color: #e6edf3 !important;
}

/* #app[data-dark-mode="false"] input, */
#app[data-dark-mode="false"] textarea,
#app[data-dark-mode="false"] select,
/* #app[data-dark-mode="false"] .el-input__wrapper, */
#app[data-dark-mode="false"] .el-textarea__inner,
/* body[data-dark-mode="false"] input, */
body[data-dark-mode="false"] textarea,
body[data-dark-mode="false"] select,
/* body[data-dark-mode="false"] .el-input__wrapper, */
body[data-dark-mode="false"] .el-textarea__inner {
  background: #f3faffc7 !important;
  color: #333 !important;
}

/* #app[data-dark-mode="true"] input::placeholder, */
#app[data-dark-mode="true"] textarea::placeholder,
/* body[data-dark-mode="true"] input::placeholder, */
body[data-dark-mode="true"] textarea::placeholder {
  color: #d8e0e9 !important;
}
#app[data-dark-mode="false"] .main-content,
body:not([data-dark-mode]) .main-content,
body[data-dark-mode="false"] .main-content {
  background: var(--content-bg-light) !important;
  color: #333 !important;
}
</style>
