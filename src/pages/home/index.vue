<template>
  <div class="home-container">
    <div class="header-controls">
      <a-radio-group v-model:value="currentGame" button-style="solid" size="large">
        <a-radio-button value="draw">🎨 你画我猜</a-radio-button>
        <a-radio-button value="gomoku">⚫ 五子棋</a-radio-button>
      </a-radio-group>

      <div class="status">
        <span :class="{ connected: isConnected }">
          {{ isConnected ? '● 已连接服务器' : '○ 未连接 (请启动 npm run server)' }}
        </span>
      </div>
    </div>

    <!-- Drawing Game -->
    <DrawGame v-show="currentGame === 'draw'" :socketInstance="socket" />

    <!-- Gomoku Game -->
    <GomokuGame v-show="currentGame === 'gomoku'" :socketInstance="socket" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import DrawGame from './components/DrawGame.vue'
import GomokuGame from './components/GomokuGame.vue'

// Game State
const currentGame = ref('draw') // 'draw' | 'gomoku'
const isConnected = ref(false)
const socket = ref<Socket | null>(null)

const initSocket = () => {
  // Use environment variable if available, otherwise fallback to localhost
  // In production (Electron packaged), you might want to point to your cloud IP
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
  console.log('Connecting to Socket Server:', serverUrl)

  socket.value = io(serverUrl)

  socket.value.on('connect', () => {
    isConnected.value = true
  })

  socket.value.on('disconnect', () => {
    isConnected.value = false
  })
}

onMounted(() => {
  initSocket()
})

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

.status {
  font-size: 12px;
  color: var(--text-secondary);
}

.connected {
  color: #52c41a;
  font-weight: bold;
}
</style>
