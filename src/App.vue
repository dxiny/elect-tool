<template>
  <div id="app">
    <aside class="sidebar">
      <Sidebar />
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";

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
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  display: flex;
  flex-direction: row; /* Change to row */
  overflow: hidden;
}

.sidebar {
  width: 80px; /* Match reference sidebar width */
  height: 100%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1000;
}

.main-content {
  flex: 1;
  height: 100%;
  overflow: auto;
  position: relative;
  /* border-top-left-radius: 5px;
  border-bottom-left-radius: 5px; */
  background: var(--content-bg-light);
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  margin: 0;
  padding: 24px;
}
/* Hide scrollbar in right content area */
.main-content::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.main-content {
  scrollbar-width: none; /* Firefox */
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
  margin: 0;
}
*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
*::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}

/* Dark Mode Styles */
#app[data-dark-mode="true"] .main-content,
body[data-dark-mode="true"] .main-content {
  background: var(--content-bg-dark) !important;
  color: #e6edf3 !important;
}

html[data-dark-mode="true"],
body[data-dark-mode="true"] {
  --sidebar-active-bg: color-mix(in srgb, var(--brand-primary), black 25%);
  --sidebar-active-text: #ffffff;
  --menu-text-default: #a7b0c0;
  --menu-icon-default: #a7b0c0;
  --sidebar-bg: #25233a;
  --content-bg-dark: #090d1c;
}

:root {
  --brand-primary: #7a66ff; /* Wisteria purple */
  --brand-gradient-start: #7a66ff;
  --brand-gradient-end: #6f59ff;

  --sidebar-active-bg: #fff;
  --sidebar-active-text: var(--brand-primary);
  --sidebar-bg: #ffffff;

  --menu-text-default: #b5b6b8;
  --menu-icon-default: var(--menu-text-default);

  --content-bg-light: #f5f8ff;
  --content-bg-dark: #0d1125;

  --app-bg-light: radial-gradient(
    circle at 40% 0%,
    #eaf2ff 0%,
    #8fb6ff 35%,
    #5a8ae3 100%
  );
  --app-bg-dark: radial-gradient(circle at 80% 50%, rgba(123, 74, 255, 0.35) 0%, rgba(36, 16, 72, 0.6) 30%, #0a0d18 75%, #070a12 100%);
}

html:not([data-dark-mode]),
body:not([data-dark-mode]),
html[data-dark-mode="false"],
body[data-dark-mode="false"] {
  --sidebar-bg: #ffffff !important;
}

#app > :not(.sidebar),
.main-content > * {
  position: relative;
  z-index: 1;
}
</style>
