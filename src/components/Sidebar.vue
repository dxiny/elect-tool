<template>
  <div class="menu">
    <el-menu :default-active="route.path" class="el-menu-vertical" router>
      <el-menu-item v-for="item in menu" :key="item.id" :index="item.path">
        <el-icon class="menu-icon" :size="22">
          <component :is="item.icon" />
        </el-icon>
        <span class="menu-text">{{ item.title }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from "@/stores/menu";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const store = useMenuStore();
const { menu } = storeToRefs(store);
const route = useRoute();
</script>

<style scoped>
.menu {
  height: 100%;
}
.el-menu-vertical {
  width: 66px;
  border-right: none;
  height: 100%;
  padding-top: 8px;
  background: transparent;
}
.el-menu-vertical :deep(.el-menu-item) {
  height: 50px;
  margin: 0 5px;
  margin-bottom: 15px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--menu-text-default);

  &:nth-of-type(1) {
    margin-top: 10px;
  }
}
.el-menu-vertical :deep(.el-menu-item span) {
  line-height: 1;
  margin: 0;
  display: block;
}
.el-menu-vertical :deep(.el-menu-item .el-icon) {
  margin: 0;
}
.el-menu-vertical :deep(.el-menu-item:hover) {
  background-color: transparent !important;
}
.el-menu-vertical :deep(.el-menu-item.is-active) {
  /* background: var(--sidebar-active-bg); */
  color: var(--sidebar-active-text);
}
.menu-icon {
  line-height: 1;
  color: var(--menu-icon-default);
}
.menu-text {
  font-size: 12px;
  color: var(--menu-text-default);
}
.el-menu-vertical :deep(.el-menu-item.is-active .el-icon),
.el-menu-vertical :deep(.el-menu-item.is-active .menu-text) {
  color: var(--sidebar-active-text);
}
</style>
