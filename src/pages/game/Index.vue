<template>
  <div class="home-container">
    <div class="header-controls">
      <div class="title">⚫ 五子棋对战</div>
      <!-- Socket 连接状态展示 -->
      <div class="status">
        <span :class="{ connected: gameStore.isConnected }">
          {{ gameStore.isConnected ? '● 已连接服务器' : '○ Socket未连接 ' }}
        </span>
      </div>
    </div>

    <!-- 五子棋游戏组件 -->
    <GomokuGame />
  </div>
</template>

<script setup lang="ts">
import GomokuGame from './components/GomokuGame/index.vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
</script>

<style lang="scss" scoped>
@use './styles/home.scss';
</style>
