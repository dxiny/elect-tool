<template>
  <div class="logo-area">
    <div class="radial-menu" :class="{ active: radialActive }">
      <img class="logo-img" src="/build/icon.svg" alt="logo" @click="toggleRadial" />
      <li style="--i: 0">
        <button class="radial-btn minimize" :class="{ raised: radialRaised }" @click.stop="onMinimize"><MinusOutlined /></button>
      </li>
      <li style="--i: 1">
        <button class="radial-btn" :class="{ raised: radialRaised }" @click.stop="onToggleMaximize">
          <component :is="isMaximized ? 'FullscreenExitOutlined' : 'FullscreenOutlined'" />
        </button>
      </li>
      <li style="--i: 2">
        <button class="radial-btn close" :class="{ raised: radialRaised }" @click.stop="onClose"><CloseOutlined /></button>
      </li>
      <!-- <li style="--i: 3">
        <div class="radial-btn theme-bubble" :class="{ raised: radialRaised }" @click.stop="onThemeBubbleClick">
          <div class="theme-mini">
            <ThemeSwitch />
          </div>
        </div>
      </li> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitch from "@/components/ThemeSwitch.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  MinusOutlined,
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons-vue";
import { profileApi } from "@/api/profile";

const radialActive = ref(false);
const radialRaised = ref(false);
const isMaximized = ref(false);

const toggleRadial = () => {
  const next = !radialActive.value;
  radialActive.value = next;
  if (next) {
    radialRaised.value = false;
    setTimeout(() => (radialRaised.value = true), 160);
  } else {
    radialRaised.value = false;
  }
};

const onMinimize = () => {
  window.electronAPI?.minimizeWindow();
  radialActive.value = false;
  radialRaised.value = false;
};

const onToggleMaximize = () => {
  window.electronAPI?.maximizeWindow();
  isMaximized.value = !isMaximized.value;
  radialActive.value = false;
  radialRaised.value = false;
};

const onClose = () => {
  window.electronAPI?.closeWindow();
  radialActive.value = false;
  radialRaised.value = false;
};

const onThemeBubbleClick = () => {
  setTimeout(() => {
    radialActive.value = false;
    radialRaised.value = false;
  }, 1000);
};

// Persist dark mode changes
let observer: MutationObserver | null = null;
onMounted(() => {
  try {
    const saved = localStorage.getItem("app:dark-mode");
    if (saved === "true" || saved === "false") {
      document.body.setAttribute("data-dark-mode", saved);
      document.documentElement.setAttribute("data-dark-mode", saved);
    }
  } catch {}

  try {
    observer = new MutationObserver(() => {
      const mode = document.body.getAttribute("data-dark-mode");
      if (mode === "true" || mode === "false") {
        try {
          localStorage.setItem("app:dark-mode", mode);
          profileApi.updateTheme(mode === 'true' ? 'dark' : 'light').catch(() => {});
        } catch {}
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-dark-mode"] });
  } catch {}
});

onBeforeUnmount(() => {
  try {
    observer?.disconnect();
    observer = null;
  } catch {}
});
</script>

<style scoped>
.logo-img {
  width: 44px;
  height: 44px;
  -webkit-app-region: no-drag;
  display: block;
  cursor: pointer;
  filter: drop-shadow(0 8px 18px rgba(122, 102, 255, 0.35))
    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  position: relative;
  z-index: 1200;
}

.radial-menu {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-app-region: no-drag;
  z-index: 1200;
  overflow: visible;
  --gap: 25px;
  --R: calc(22px + var(--gap));
}

.radial-menu li {
  list-style: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translate(0px, 0px);
  transition: transform 0.28s ease-out, opacity 0.2s ease;
  transition-delay: calc(0.06s * var(--i));
  opacity: 0;
  pointer-events: none;
}
.radial-menu li:nth-of-type(1) {
  --tx: var(--R);
  --ty: 0px;
}
.radial-menu li:nth-of-type(2) {
  --tx: calc(var(--R) * 0.7071);
  --ty: calc(var(--R) * 0.7071);
}
.radial-menu li:nth-of-type(3) {
  --tx: 0px;
  --ty: var(--R);
}
.radial-menu li:nth-of-type(4) {
  --tx: 0px;
  --ty: calc(var(--R) + 35px);
}

.radial-menu.active li {
  transform: translate(-50%, -50%) translate(var(--tx), var(--ty));
  opacity: 1;
  pointer-events: auto;
}

.radial-btn {
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border: none;
  cursor: pointer;
  -webkit-app-region: no-drag;
  position: relative;
  z-index: 1190;
  width: 25px;
  height: 25px;
  color: rgb(112, 108, 119);
}
.radial-btn.raised {
  z-index: 1250;
}
.radial-btn.theme-bubble {
  width: 50px;
  height: 30px;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 6px;
}
.theme-mini {
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-mini :deep(.toggle) {
  width: 50px;
  height: 24px;
}
</style>
