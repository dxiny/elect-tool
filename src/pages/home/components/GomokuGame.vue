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

    <!-- 棋盘区域 -->
    <div class="game-area chess-area" ref="chessAreaRef" @click="handleChessClick">
      <!-- 游戏未开始时的遮罩层 -->
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
          v-for="(piece, key) in chessPieces"
          :key="key"
          class="chess-piece"
          :class="piece.color"
          :style="{ left: piece.x * 40 + 20 + 'px', top: piece.y * 40 + 20 + 'px' }"
        ></div>

        <!-- 最后一步落子的高亮标记 -->
        <div
          v-if="lastMove"
          class="last-move-marker"
          :style="{ left: lastMove.x * 40 + 20 + 'px', top: lastMove.y * 40 + 20 + 'px' }"
        ></div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="controls chess-controls">
      <!-- 角色选择 -->
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

      <!-- 记分板 -->
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

      <!-- 游戏控制按钮（重开） -->
      <div class="action-buttons">
        <a-button v-if="!restartRequested" @click="requestRestart">重新开始</a-button>
        <div v-else class="restart-confirm">
          <span v-if="restartRequester === myChessColor">已请求重开，等待对方确认...</span>
          <a-button v-else type="primary" @click="confirmRestart">接受重开请求</a-button>
        </div>
      </div>

      <!-- 获胜提示 -->
      <span class="turn-info" v-if="winner">
        🏆 获胜者: {{ winner === 'black' ? '黑方' : '白方' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps<{
  socketInstance: any
}>()

// 棋盘区域引用
const chessAreaRef = ref<HTMLElement | null>(null)
// 玩家状态
const myChessColor = ref('black') // 当前玩家颜色：'black' | 'white'
const currentTurn = ref('black') // 当前轮到谁下：黑方先手
// 棋子数据：key为 "x,y" 坐标字符串，value 为棋子信息
const chessPieces = reactive<Record<string, { x: number; y: number; color: string }>>({})
// 最后一步落子位置（用于高亮显示）
const lastMove = ref<{ x: number; y: number } | null>(null)
// 获胜者
const winner = ref('')
// 记分板
const scores = reactive({ black: 0, white: 0 })

// 游戏开始状态管理
const gameStarted = ref(false) // 游戏是否进行中
const startRequested = ref(false) // 是否发起了开始请求
const startRequester = ref('') // 发起人颜色

// 重新开始状态管理
const restartRequested = ref(false) // 是否发起了重开请求
const restartRequester = ref('') // 重开发起人

onMounted(() => {
  if (props.socketInstance) {
    // 监听对方落子事件
    props.socketInstance.on('chess-move', (data: any) => {
      const key = `${data.x},${data.y}`
      // 更新棋盘数据
      chessPieces[key] = { x: data.x, y: data.y, color: data.color }
      lastMove.value = { x: data.x, y: data.y }

      // 检查是否获胜
      checkWin(data.x, data.y, data.color)

      // 切换回合
      if (!winner.value) {
        currentTurn.value = data.color === 'black' ? 'white' : 'black'
      }
    })

    // 监听游戏开始请求
    props.socketInstance.on('chess-request-start', (data: any) => {
      startRequested.value = true;
      startRequester.value = data.requester;
      if (data.requester !== myChessColor.value) {
        message.info('对方邀请您开始游戏');
      }
    });

    // 监听游戏正式开始
    props.socketInstance.on('chess-start-game', () => {
      gameStarted.value = true;
      startRequested.value = false;
      startRequester.value = '';
      message.success('游戏开始！黑方先手');
      // 游戏开始时重置棋盘
      resetChessBoard(true);
    });

    // 监听重新开始请求
    props.socketInstance.on('chess-request-restart', (data: any) => {
      restartRequested.value = true
      restartRequester.value = data.requester
      if (data.requester !== myChessColor.value) {
        message.info('对方请求重新开始游戏')
      }
    })

    // 监听确认重新开始
    props.socketInstance.on('chess-restart', () => {
      resetChessBoard()
      message.success('游戏已重新开始！')
    })
  }
})

// 处理棋盘点击（落子）
const handleChessClick = (e: MouseEvent) => {
  if (!gameStarted.value) {
    message.warning('请先开始游戏')
    return
  }
  if (winner.value) {
    message.warning('游戏已结束，请重新开始')
    return
  }

  // 检查是否轮到自己下
  if (currentTurn.value !== myChessColor.value) {
    message.warning('还未轮到您落子')
    return
  }

  if (!chessAreaRef.value) return
  // 获取点击位置相对于棋盘的坐标
  const rect = chessAreaRef.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  // 计算落子点（棋盘格子大小40px，边距20px）
  const x = Math.round((offsetX - 20) / 40)
  const y = Math.round((offsetY - 20) / 40)

  // 边界检查（15x15棋盘，索引0-14）
  if (x < 0 || x > 14 || y < 0 || y > 14) return

  const key = `${x},${y}`
  if (chessPieces[key]) return // 该位置已有棋子

  // 乐观更新（先在本地显示，再发送请求）
  chessPieces[key] = { x, y, color: myChessColor.value }
  lastMove.value = { x, y }

  // 本地检查是否获胜
  checkWin(x, y, myChessColor.value)

  // 发送落子事件给服务器
  props.socketInstance?.emit('chess-move', { x, y, color: myChessColor.value })

  // 本地切换回合
  if (!winner.value) {
    currentTurn.value = myChessColor.value === 'black' ? 'white' : 'black'
  }
}

// 检查是否获胜（五子连珠）
const checkWin = (x: number, y: number, color: string) => {
  // 四个检查方向：横、竖、正斜、反斜
  const directions = [
    [1, 0],   // 横向
    [0, 1],   // 纵向
    [1, 1],   // 正斜
    [1, -1]   // 反斜
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    // 向前检查
    let i = 1
    while (chessPieces[`${x + i * dx},${y + i * dy}`]?.color === color) {
      count++
      i++
    }
    // 向后检查
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

// 发起开始游戏请求
const requestStart = () => {
  props.socketInstance?.emit('chess-request-start', { requester: myChessColor.value });
  startRequested.value = true;
  startRequester.value = myChessColor.value;
  message.loading('等待对方加入...', 0);
};

// 确认开始游戏（接受请求）
const confirmStart = () => {
  props.socketInstance?.emit('chess-confirm-start');
};

// 发起重新开始请求
const requestRestart = () => {
  props.socketInstance?.emit('chess-request-restart', { requester: myChessColor.value });
  restartRequested.value = true;
  restartRequester.value = myChessColor.value;
  message.loading('已发送重开请求，等待对方确认...', 0);
};

// 确认重新开始
const confirmRestart = () => {
  props.socketInstance?.emit('chess-confirm-restart');
};

// 重置棋盘状态
const resetChessBoard = (keepScores = false) => {
  for (const key in chessPieces) delete chessPieces[key]
  winner.value = ''
  currentTurn.value = 'black'
  lastMove.value = null
  restartRequested.value = false
  restartRequester.value = ''
  if (!keepScores) {
    // 如果不是保留分数的重置（如彻底的新游戏），可以在这里清零分数
    // 目前逻辑是保留分数的
  }
  message.destroy() // 清除 loading 提示
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

