<template>
  <div class="game-wrapper">
    <!-- 状态：大厅 (Lobby) -->
    <div v-if="gameStore.viewState === 'lobby'" class="lobby-container">
      <div class="role-selection">
        <h3>1. 选择你的执子颜色</h3>
        <a-radio-group v-model:value="gameStore.myChessColor" button-style="solid" size="large">
          <a-radio-button value="black">我是黑方 ⚫ (先手)</a-radio-button>
          <a-radio-button value="white">我是白方 ⚪ (后手)</a-radio-button>
        </a-radio-group>
      </div>

      <div class="create-room">
        <h3>2. 创建房间等待挑战</h3>
        <a-button type="primary" size="large" @click="gameStore.createRoom">创建房间</a-button>
      </div>

      <div class="room-list">
        <h3>3. 或加入现有房间</h3>
        <div v-if="gameStore.roomList.length === 0" class="no-rooms">暂无房间，请创建</div>
        <div v-else class="room-grid">
          <div v-for="room in gameStore.roomList" :key="room.id" class="room-card">
            <div class="room-info">
              <span class="room-id">房间: {{ room.id }}</span>
              <span class="host-role"
                >房主执: {{ room.hostColor === 'black' ? '黑方' : '白方' }}</span
              >
            </div>
            <a-button type="primary" ghost @click="gameStore.joinRoom(room.id)">加入对战</a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态：等待中 (Waiting) -->
    <div v-else-if="gameStore.viewState === 'waiting'" class="waiting-container">
      <div class="waiting-content">
        <a-spin size="large" />
        <h2>正在等待对手加入...</h2>
        <p>您选择了: {{ gameStore.myChessColor === 'black' ? '黑方 ⚫' : '白方 ⚪' }}</p>
        <p>房间号: {{ gameStore.roomId }}</p>
        <a-button @click="gameStore.leaveRoom">取消等待</a-button>
      </div>
    </div>

    <!-- 状态：游戏中 (Playing) -->
    <div v-else class="game-playing-container">
      <div class="game-header">
        <h1>五子棋对战 (房间: {{ gameStore.roomId }})</h1>
        <p class="subtitle">
          当前回合:
          <span :class="gameStore.currentTurn">{{
            gameStore.currentTurn === 'black' ? '黑方 ⚫' : '白方 ⚪'
          }}</span>
          <span
            v-if="!gameStore.winner && gameStore.myChessColor !== gameStore.currentTurn"
            class="waiting-tip"
            >(等待对手落子...)</span
          >
        </p>
      </div>

      <div class="game-content">
        <!-- 棋盘区域 -->
        <div class="game-area chess-area" ref="chessAreaRef" @click="handleChessClick">
          <div class="chess-board">
            <!-- 棋盘网格线 -->
            <div
              v-for="i in 15"
              :key="`h-${i}`"
              class="line horizontal"
              :style="{ top: (i - 1) * 40 + 20 + 'px' }"
            ></div>
            <div
              v-for="i in 15"
              :key="`v-${i}`"
              class="line vertical"
              :style="{ left: (i - 1) * 40 + 20 + 'px' }"
            ></div>

            <!-- 棋子渲染 -->
            <div
              v-for="(piece, key) in gameStore.chessPieces"
              :key="key"
              class="chess-piece"
              :class="piece.color"
              :style="{ left: piece.x * 40 + 20 + 'px', top: piece.y * 40 + 20 + 'px' }"
            ></div>

            <!-- 最后一步落子的高亮标记 -->
            <div
              v-if="gameStore.lastMove"
              class="last-move-marker"
              :style="{
                left: gameStore.lastMove.x * 40 + 20 + 'px',
                top: gameStore.lastMove.y * 40 + 20 + 'px'
              }"
            ></div>
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="controls chess-controls">
          <!-- 玩家信息 -->
          <div class="player-info">
            <div class="info-card" :class="{ active: gameStore.myChessColor === 'black' }">
              <span class="role-label">我方</span>
              <span class="role-icon">{{ gameStore.myChessColor === 'black' ? '⚫' : '⚪' }}</span>
            </div>
            <div class="vs-divider">VS</div>
            <div class="info-card" :class="{ active: gameStore.myChessColor === 'white' }">
              <span class="role-label">对手</span>
              <span class="role-icon">{{ gameStore.myChessColor === 'black' ? '⚪' : '⚫' }}</span>
            </div>
          </div>

          <!-- 记分板 -->
          <div class="score-board">
            <div class="score-item">
              <span class="label">黑方胜</span>
              <span class="score">{{ gameStore.scores.black }}</span>
            </div>
            <div class="vs">:</div>
            <div class="score-item">
              <span class="label">白方胜</span>
              <span class="score">{{ gameStore.scores.white }}</span>
            </div>
          </div>

          <!-- 游戏控制按钮 -->
          <div class="action-buttons">
            <div v-if="gameStore.winner" class="winner-display">
              🏆 {{ gameStore.winner === 'black' ? '黑方' : '白方' }} 获胜！
            </div>

            <div class="btn-group">
              <a-button v-if="!gameStore.restartRequested" @click="gameStore.requestRestart"
                >重新开始</a-button
              >
              <div v-else class="restart-confirm">
                <span v-if="gameStore.restartRequester === gameStore.myChessColor"
                  >已请求重开...</span
                >
                <a-button v-else type="primary" @click="gameStore.confirmRestart"
                  >接受重开</a-button
                >
              </div>

              <a-button danger @click="gameStore.leaveRoom">退出房间</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const chessAreaRef = ref<HTMLElement | null>(null)

// 初始化
onMounted(() => {
  // Store 内部会判断是否已连接，不会重复初始化
  gameStore.initSocket()
})

// 落子逻辑
const handleChessClick = (e: MouseEvent) => {
  if (!chessAreaRef.value) return
  const rect = chessAreaRef.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  const x = Math.round((offsetX - 20) / 40)
  const y = Math.round((offsetY - 20) / 40)

  if (x < 0 || x > 14 || y < 0 || y > 14) return

  gameStore.makeMove(x, y)
}
</script>

<style lang="scss" scoped>
@use '../../styles/gomoku.scss';
</style>
