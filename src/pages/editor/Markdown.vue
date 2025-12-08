<template>
  <el-card>
    <template #header>Markdown编辑器</template>
    <el-input type="textarea" v-model="text" :rows="12" />
    <el-card shadow="never" style="margin-top:12px">
      <template #header>预览</template>
      <div v-html="text"></div>
    </el-card>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
const text = ref("# 示例\n\n这里是预览…");
onMounted(() => {});
</script>

<style scoped>
</style>
