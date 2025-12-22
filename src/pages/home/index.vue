<template>
  <div class="home-container">
    <div class="header-controls">
      <div class="title">五子棋对战</div>
      <!-- Socket 连接状态展示 -->
      <div class="status">
        <span :class="{ connected: isConnected }">
          {{ isConnected ? '● 已连接服务器' : '○ Socket未连接 ' }}
        </span>
      </div>
    </div>

    <!-- 五子棋游戏组件 -->
    <GomokuGame :socketInstance="socket" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import GomokuGame from './components/GomokuGame.vue'

// 游戏状态管理
// Socket 连接状态
const isConnected = ref(false)
// Socket 实例对象
const socket = ref<any>(null)

/**
 * 初始化 Socket 连接
 * 负责建立与服务器的实时通信通道，并监听连接状态变化
 */
const initSocket = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL
  console.log('正在连接 Socket 服务器:', serverUrl)

  // 建立连接
  socket.value = io(serverUrl)

  // 监听连接成功事件
  socket.value.on('connect', () => {
    isConnected.value = true
    console.log('Socket 连接成功，ID:', socket.value.id)
  })

  // 监听连接断开事件
  socket.value.on('disconnect', (reason: any) => {
    isConnected.value = false
    console.log('Socket 连接断开，原因:', reason)
  })

  // 监听连接错误事件
  socket.value.on('connect_error', (error: any) => {
    isConnected.value = false
    console.error('Socket 连接错误:', error.message)
  })
}

// 组件挂载完成后初始化 Socket 连接
onMounted(() => {
  initSocket()
})

// 组件卸载前断开 Socket 连接，释放资源
onUnmounted(() => {
  socket.value?.disconnect()
})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  height: 100%;
  color: var(--text-primary);
  overflow-y: auto;
  max-width: 1400px;
  max-height: 1200px;
  margin: 0 auto;
}

.header-controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.status {
  font-size: 12px;
  color: var(--text-secondary);
}

.connected {
  color: #52c41a;
  font-weight: bold;
}
</style>
