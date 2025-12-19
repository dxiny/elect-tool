<template>
  <div class="game-wrapper">
    <h1>五子棋对战</h1>
    <p class="subtitle">
      当前回合:
      <span :class="currentTurn">{{ currentTurn === 'black' ? '黑方 ⚫' : '白方 ⚪' }}</span>
      <span v-if="!winner && myChessColor !== currentTurn" class="waiting-tip"
        >(等待对手落子...)</span
      >
    </p>

    <div class="game-area chess-area" ref="chessAreaRef" @click="handleChessClick">
      <!-- Overlay for waiting game start -->
      <div v-if="!gameStarted" class="game-overlay">
        <div class="start-panel">
          <h3>准备开始</h3>
          <p v-if="!startRequested">请点击下方按钮发起对战请求</p>
          <div v-else>
             <p v-if="startRequester === myChessColor">已发送请求，等待对方加入...</p>
             <p v-else>对方请求开始游戏，是否接受？</p>
          </div>
          
          <div class="start-actions">
            <a-button v-if="!startRequested" type="primary" size="large" @click="requestStart">发起对战</a-button>
            <a-button v-else-if="startRequester !== myChessColor" type="primary" size="large" @click="confirmStart">开始游戏</a-button>
          </div>
        </div>
      </div>

      <div class="chess-board" :class="{ disabled: !gameStarted }">
        <!-- Grid Lines -->
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

        <!-- Pieces -->
        <div
          v-for="(piece, key) in chessPieces"
          :key="key"
          class="chess-piece"
          :class="piece.color"
          :style="{ left: piece.x * 40 + 20 + 'px', top: piece.y * 40 + 20 + 'px' }"
        ></div>

        <!-- Highlight Last Move -->
        <div
          v-if="lastMove"
          class="last-move-marker"
          :style="{ left: lastMove.x * 40 + 20 + 'px', top: lastMove.y * 40 + 20 + 'px' }"
        ></div>
      </div>
    </div>

    <div class="controls chess-controls">
      <div class="player-info">
        <a-radio-group
          v-model:value="myChessColor"
          button-style="solid"
          :disabled="Object.keys(chessPieces).length > 0"
        >
          <a-radio-button value="black">我是黑方 ⚫</a-radio-button>
          <a-radio-button value="white">我是白方 ⚪</a-radio-button>
        </a-radio-group>
      </div>

      <div class="score-board">
        <div class="score-item">
          <span class="label">黑方胜</span>
          <span class="score">{{ scores.black }}</span>
        </div>
        <div class="vs">VS</div>
        <div class="score-item">
          <span class="label">白方胜</span>
          <span class="score">{{ scores.white }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <a-button v-if="!restartRequested" @click="requestRestart">重新开始</a-button>
        <div v-else class="restart-confirm">
          <span v-if="restartRequester === myChessColor">已请求重开，等待对方确认...</span>
          <a-button v-else type="primary" @click="confirmRestart">接受重开请求</a-button>
        </div>
      </div>

      <span class="turn-info" v-if="winner">
        🏆 获胜者: {{ winner === 'black' ? '黑方' : '白方' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Socket } from 'socket.io-client'
import { message } from 'ant-design-vue'

const props = defineProps<{
  socketInstance: Socket | null
}>()

const chessAreaRef = ref<HTMLElement | null>(null)
const myChessColor = ref('black') // 'black' | 'white'
const currentTurn = ref('black') // 'black' starts first
const chessPieces = reactive<Record<string, { x: number; y: number; color: string }>>({})
const lastMove = ref<{ x: number; y: number } | null>(null)
const winner = ref('')
const scores = reactive({ black: 0, white: 0 })

// Start Game State
const gameStarted = ref(false)
const startRequested = ref(false)
const startRequester = ref('')

// Restart Game State
const restartRequested = ref(false)
const restartRequester = ref('')

onMounted(() => {
  if (props.socketInstance) {
    props.socketInstance.on('chess-move', (data: any) => {
      const key = `${data.x},${data.y}`
      chessPieces[key] = { x: data.x, y: data.y, color: data.color }
      lastMove.value = { x: data.x, y: data.y }

      // Check win
      checkWin(data.x, data.y, data.color)

      // Switch turn
      if (!winner.value) {
        currentTurn.value = data.color === 'black' ? 'white' : 'black'
      }
    })

    // Start Game Handlers
    props.socketInstance.on('chess-request-start', (data: any) => {
      startRequested.value = true;
      startRequester.value = data.requester;
      if (data.requester !== myChessColor.value) {
        message.info('对方邀请您开始游戏');
      }
    });

    props.socketInstance.on('chess-start-game', () => {
      gameStarted.value = true;
      startRequested.value = false;
      startRequester.value = '';
      message.success('游戏开始！黑方先手');
      // Reset everything just in case
      resetChessBoard(true);
    });

    // Restart Handlers
    props.socketInstance.on('chess-request-restart', (data: any) => {
      restartRequested.value = true
      restartRequester.value = data.requester
      if (data.requester !== myChessColor.value) {
        message.info('对方请求重新开始游戏')
      }
    })

    props.socketInstance.on('chess-restart', () => {
      resetChessBoard()
      message.success('游戏已重新开始！')
    })
  }
})

const handleChessClick = (e: MouseEvent) => {
  if (!gameStarted.value) {
    message.warning('请先开始游戏')
    return
  }
  if (winner.value) {
    message.warning('游戏已结束，请重新开始')
    return
  }

  // Check turn
  if (currentTurn.value !== myChessColor.value) {
    message.warning('还未轮到您落子')
    return
  }

  if (!chessAreaRef.value) return
  const rect = chessAreaRef.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  // Board padding is 20px, grid size is 40px
  const x = Math.round((offsetX - 20) / 40)
  const y = Math.round((offsetY - 20) / 40)

  if (x < 0 || x > 14 || y < 0 || y > 14) return

  const key = `${x},${y}`
  if (chessPieces[key]) return // Already occupied

  // Optimistic update
  chessPieces[key] = { x, y, color: myChessColor.value }
  lastMove.value = { x, y }

  // Check win locally first
  checkWin(x, y, myChessColor.value)

  // Emit move
  props.socketInstance?.emit('chess-move', { x, y, color: myChessColor.value })

  // Switch turn locally
  if (!winner.value) {
    currentTurn.value = myChessColor.value === 'black' ? 'white' : 'black'
  }
}

const checkWin = (x: number, y: number, color: string) => {
  // Simple check in 4 directions
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    // Check forward
    let i = 1
    while (chessPieces[`${x + i * dx},${y + i * dy}`]?.color === color) {
      count++
      i++
    }
    // Check backward
    i = 1
    while (chessPieces[`${x - i * dx},${y - i * dy}`]?.color === color) {
      count++
      i++
    }

    if (count >= 5) {
      winner.value = color
      if (color === 'black') scores.black++
      else scores.white++

      message.success(`${color === 'black' ? '黑方' : '白方'} 获胜！`)
      return
    }
  }
}

const requestStart = () => {
  props.socketInstance?.emit('chess-request-start', { requester: myChessColor.value });
  startRequested.value = true;
  startRequester.value = myChessColor.value;
  message.loading('等待对方加入...', 0);
};

const confirmStart = () => {
  props.socketInstance?.emit('chess-confirm-start');
};

const requestRestart = () => {
  props.socketInstance?.emit('chess-request-restart', { requester: myChessColor.value });
  restartRequested.value = true;
  restartRequester.value = myChessColor.value;
  message.loading('已发送重开请求，等待对方确认...', 0);
};

const confirmRestart = () => {
  props.socketInstance?.emit('chess-confirm-restart');
};

const resetChessBoard = (keepScores = false) => {
  for (const key in chessPieces) delete chessPieces[key]
  winner.value = ''
  currentTurn.value = 'black'
  lastMove.value = null
  restartRequested.value = false
  restartRequester.value = ''
  if (!keepScores) {
    // Usually restart means new round, keep scores. But if full reset?
    // Let's keep scores for "Restart Round", maybe clear for "New Game"
    // Requirement says "display who wins more", so we should keep scores across rounds
  }
  message.destroy() // Clear loading message
}
</script>
<style scoped>
.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-size: 16px;
}

.black {
  color: #000;
  font-weight: bold;
}
.white {
  color: #999;
  font-weight: bold;
} /* Visible white on dark bg */
.waiting-tip {
  font-size: 14px;
  color: #666;
  margin-left: 8px;
  font-weight: normal;
}

.game-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.chess-area {
  width: 600px;
  height: 600px;
  background: #deb887; /* Wood color */
  position: relative;
  cursor: pointer;
  border: 4px solid #8b4513;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.chess-board {
  width: 100%;
  height: 100%;
  position: relative;
}

.line {
  position: absolute;
  background: #000;
}

.line.horizontal {
  height: 1px;
  left: 20px;
  right: 20px;
}

.line.vertical {
  width: 1px;
  top: 20px;
  bottom: 20px;
}

.chess-piece {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.chess-piece.black {
  background: radial-gradient(circle at 10px 10px, #666, #000);
}

.chess-piece.white {
  background: radial-gradient(circle at 10px 10px, #fff, #ddd);
}

.last-move-marker {
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: none;
}

.controls {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--sidebar-bg);
  padding: 16px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chess-controls {
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 400px;
}

.score-board {
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(0, 0, 0, 0.05);
  padding: 10px 30px;
  border-radius: 8px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-item .label {
  font-size: 12px;
  color: var(--text-secondary);
}
.score-item .score {
  font-size: 24px;
  font-weight: bold;
  color: var(--brand-primary);
}

.vs {
  font-weight: bold;
  color: #999;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
}

.start-panel {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.start-panel h3 {
  margin-bottom: 16px;
  color: #333;
}

.start-actions {
  margin-top: 24px;
}

.chess-board.disabled {
  filter: blur(2px);
  pointer-events: none;
}
</style>

