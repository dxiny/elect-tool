<template>
  <el-card>
    <template #header>个人资料</template>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="邮箱">{{ email }}</el-descriptions-item>
      <el-descriptions-item label="用户ID">{{ userId }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 本地演示：从 localStorage 读取
const email = ref(localStorage.getItem('auth:user') ? JSON.parse(localStorage.getItem('auth:user')||'{}').email : '未登录')
const userId = ref(localStorage.getItem('auth:user') ? JSON.parse(localStorage.getItem('auth:user')||'{}').id : '-')
</script>

<style scoped>
</style>
