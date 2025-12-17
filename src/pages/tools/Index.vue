<template>
  <div class="tools-layout">
    <div class="tools-sidebar">
      <div class="sidebar-header">
        <h1>工具箱</h1>
      </div>
      <div class="tool-list">
        <div 
          class="tool-item" 
          :class="{ active: currentTool === 'image' }"
          @click="currentTool = 'image'"
          title="图片格式转换"
        >
          <div class="icon-box">
            <FileImageOutlined />
          </div>
          <span class="name">图片转换</span>
        </div>

        <div 
          class="tool-item" 
          :class="{ active: currentTool === 'json' }"
          @click="currentTool = 'json'"
          title="JSON 格式化"
        >
          <div class="icon-box">
            <CodeOutlined />
          </div>
          <span class="name">JSON</span>
        </div>
      </div>
    </div>

    <div class="tools-main">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component :is="currentComponent" />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FileImageOutlined, CodeOutlined } from '@ant-design/icons-vue';
import ImageConverter from './components/ImageConverter.vue';
import JsonFormatter from './components/JsonFormatter.vue';

const currentTool = ref('image');

const currentComponent = computed(() => {
  switch (currentTool.value) {
    case 'image': return ImageConverter;
    case 'json': return JsonFormatter;
    default: return ImageConverter;
  }
});
</script>

<style scoped>
.tools-layout {
  display: flex;
  height: 100%;
  background: var(--bg-layout, #f5f7fa);
  overflow: hidden;
  color: var(--text-primary, #1f1f1f);
}

.tools-sidebar {
  width: 90px;
  background: var(--sidebar-bg, #fff);
  border-right: 1px solid var(--border-color-base, #f0f0f0);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
}

.sidebar-header {
  padding: 24px 0;
  width: 100%;
  text-align: center;
  border-bottom: 1px solid var(--border-color-base, #f0f0f0);
}

.sidebar-header h1 {
  font-size: 16px;
  margin: 0;
  font-weight: 600;
  color: var(--text-primary, #1f1f1f);
}

.tool-list {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  overflow-y: auto;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  width: 100%;
}

.tool-item:hover {
  background: var(--tool-item-hover-bg, #f5f5f5);
}

.tool-item.active {
  /* background: var(--tool-item-active-bg, #e6f7ff);
  border-color: var(--brand-primary, #bae7ff); */
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--icon-box-bg, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary, #595959);
  transition: all 0.2s;
}

.tool-item.active .icon-box {
  background: var(--brand-primary, #1890ff);
  color: #fff;
}

.name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #595959);
  text-align: center;
}

.tool-item.active .name {
  color: var(--brand-primary, #1890ff);
}

.tools-main {
  flex: 1;
  padding: 0;
  overflow-y: auto; /* Enable scroll */
  background-color: var(--bg-layout, #f5f7fa);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.tools-main::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}

/* Dark Mode Overrides */
:global(html[data-dark-mode="true"]) .tools-layout {
  --bg-layout: var(--content-bg-dark);
  --tool-item-hover-bg: rgba(255, 255, 255, 0.05);
  --tool-item-active-bg: rgba(122, 102, 255, 0.15);
  --icon-box-bg: rgba(255, 255, 255, 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
