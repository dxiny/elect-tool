<template>
  <el-card>
    <template #header>
      公共配置
    </template>
    <el-form label-position="top">
      <el-form-item label="API Base URL">
        <el-input v-model="apiBaseUrl" placeholder="例如 http://localhost:3000" />
      </el-form-item>
      <el-form-item label="Assets Base URL">
        <el-input v-model="assetsBaseUrl" placeholder="静态资源域名或CDN前缀" />
      </el-form-item>
      <el-form-item label="域名">
        <el-input v-model="domain" placeholder="如 example.com" />
      </el-form-item>
      <el-form-item label="IP">
        <el-input v-model="ip" placeholder="如 192.168.1.10" />
      </el-form-item>
      <el-form-item label="图片公共路径">
        <el-input v-model="imageBasePath" placeholder="如 https://cdn.example.com/images/" />
      </el-form-item>
      <el-space>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="test">测试后端健康</el-button>
      </el-space>
      <el-alert v-if="msg" :title="msg" :type="alertType" show-icon closable style="margin-top:8px" />
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getConfig, setConfig } from '@/config/app'

const apiBaseUrl = ref('')
const assetsBaseUrl = ref('')
const domain = ref('')
const ip = ref('')
const imageBasePath = ref('')
const msg = ref('')
const alertType = computed(() => (msg.value.includes('正常') || msg.value.includes('已保存')) ? 'success' : 'warning')

const load = () => {
  const c = getConfig()
  apiBaseUrl.value = c.apiBaseUrl || ''
  assetsBaseUrl.value = c.assetsBaseUrl || ''
  domain.value = c.domain || ''
  ip.value = c.ip || ''
  imageBasePath.value = c.imageBasePath || ''
}

const save = () => {
  setConfig({ apiBaseUrl: apiBaseUrl.value.trim(), assetsBaseUrl: assetsBaseUrl.value.trim(), domain: domain.value.trim(), ip: ip.value.trim(), imageBasePath: imageBasePath.value.trim() })
  msg.value = '已保存'
}

const test = async () => {
  msg.value = ''
  const base = apiBaseUrl.value.trim()
  if (!base) { msg.value = '请先填写 API Base URL'; return }
  try {
    const r = await fetch(`${base}/api/health`)
    const j = await r.json()
    msg.value = j && j.ok ? '连接正常' : '连接失败'
  } catch {
    msg.value = '连接失败'
  }
}

onMounted(load)
</script>

<style scoped>
</style>
