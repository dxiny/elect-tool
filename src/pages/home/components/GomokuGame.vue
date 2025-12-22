<template>
  <div class="game-wrapper">
    <!-- 状态：大厅 (Lobby) -->
    <div v-if="viewState === 'lobby'" class="lobby-container">
      <div class="role-selection">
        <h3>1. 选择你的执子颜色</h3>
        <a-radio-group v-model:value="myChessColor" button-style="solid" size="large">
          <a-radio-button value="black">我是黑方 ⚫ (先手)</a-radio-button>
          <a-radio-button value="white">我是白方 ⚪ (后手)</a-radio-button>
        </a-radio-group>
      </div>

      <div class="create-room">
        <h3>2. 创建房间等待挑战</h3>
        <a-button type="primary" size="large" @click="createRoom">创建房间</a-button>
      </div>

      <div class="room-list">
        <h3>3. 或加入现有房间</h3>
        <div v-if="roomList.length === 0" class="no-rooms">暂无房间，请创建</div>
        <div v-else class="room-grid">
          <div v-for="room in roomList" :key="room.id" class="room-card">
            <div class="room-info">
              <span class="room-id">房间: {{ room.id }}</span>
              <span class="host-role">房主执: {{ room.hostColor === 'black' ? '黑方' : '白方' }}</span>
            </div>
            <a-button type="primary" ghost @click="joinRoom(room.id)">加入对战</a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态：等待中 (Waiting) -->
    <div v-else-if="viewState === 'waiting'" class="waiting-container">
      <div class="waiting-content">
        <a-spin size="large" />
        <h2>正在等待对手加入...</h2>
        <p>您选择了: {{ myChessColor === 'black' ? '黑方 ⚫' : '白方 ⚪' }}</p>
        <p>房间号: {{ roomId }}</p>
        <a-button @click="leaveRoom">取消等待</a-button>
      </div>
    </div>

    <!-- 状态：游戏中 (Playing) -->
    <div v-else class="game-playing-container">
      <div class="game-header">
        <h1>五子棋对战 (房间: {{ roomId }})</h1>
        <p class="subtitle">
          当前回合:
          <span :class="currentTurn">{{ currentTurn === 'black' ? '黑方 ⚫' : '白方 ⚪' }}</span>
          <span v-if="!winner && myChessColor !== currentTurn" class="waiting-tip"
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
          <!-- 玩家信息 -->
          <div class="player-info">
             <div class="info-card" :class="{ active: myChessColor === 'black' }">
               <span class="role-label">我方</span>
               <span class="role-icon">{{ myChessColor === 'black' ? '⚫' : '⚪' }}</span>
             </div>
             <div class="vs-divider">VS</div>
             <div class="info-card" :class="{ active: myChessColor === 'white' }">
               <span class="role-label">对手</span>
               <span class="role-icon">{{ myChessColor === 'black' ? '⚪' : '⚫' }}</span>
             </div>
          </div>

          <!-- 记分板 -->
          <div class="score-board">
            <div class="score-item">
              <span class="label">黑方胜</span>
              <span class="score">{{ scores.black }}</span>
            </div>
            <div class="vs">:</div>
            <div class="score-item">
              <span class="label">白方胜</span>
              <span class="score">{{ scores.white }}</span>
            </div>
          </div>

          <!-- 游戏控制按钮 -->
          <div class="action-buttons">
            <div v-if="winner" class="winner-display">
               🏆 {{ winner === 'black' ? '黑方' : '白方' }} 获胜！
            </div>

            <div class="btn-group">
               <a-button v-if="!restartRequested" @click="requestRestart">重新开始</a-button>
               <div v-else class="restart-confirm">
                 <span v-if="restartRequester === myChessColor">已请求重开...</span>
                 <a-button v-else type="primary" @click="confirmRestart">接受重开</a-button>
               </div>
               
               <a-button danger @click="leaveRoom">退出房间</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps<{
  socketInstance: any
}>()

// 视图状态: lobby, waiting, playing
const viewState = ref<'lobby' | 'waiting' | 'playing'>('lobby')
const roomList = ref<any[]>([])
const roomId = ref('')

// 棋盘区域引用
const chessAreaRef = ref<HTMLElement | null>(null)
// 玩家状态
const myChessColor = ref('black') // 当前玩家颜色：'black' | 'white'
const currentTurn = ref('black') // 当前轮到谁下：黑方先手
// 棋子数据
const chessPieces = reactive<Record<string, { x: number; y: number; color: string }>>({})
// 最后一步落子
const lastMove = ref<{ x: number; y: number } | null>(null)
// 获胜者
const winner = ref('')
// 记分板
const scores = reactive({ black: 0, white: 0 })

// 重新开始状态管理
const restartRequested = ref(false)
const restartRequester = ref('')

// 监听 Socket 变化（确保 socket 初始化后再绑定事件）
watch(() => props.socketInstance, (socket) => {
  if (socket) {
    bindSocketEvents(socket)
    // 获取房间列表
    socket.emit('chess-get-rooms')
  }
}, { immediate: true })

const bindSocketEvents = (socket: any) => {
  // 移除旧监听，防止重复
  const events = [
    'chess-room-list',
    'chess-room-created',
    'chess-game-start',
    'chess-move',
    'chess-opponent-left',
    'chess-request-restart',
    'chess-restart',
    'chess-error'
  ]
  events.forEach(event => socket.off(event))

  // 错误处理
  socket.on('chess-error', (msg: string) => {
    message.error(msg)
    // 如果是因为房间不存在等原因，可能需要重置状态
    if (msg.includes('房间') && viewState.value !== 'lobby') {
       viewState.value = 'lobby'
       roomId.value = ''
       // 重新获取列表
       socket.emit('chess-get-rooms')
    }
  })

  // 房间列表更新
  socket.on('chess-room-list', (list: any[]) => {
    roomList.value = list
  })

  // 房间创建成功
  socket.on('chess-room-created', (data: any) => {
    roomId.value = data.roomId
    viewState.value = 'waiting'
    message.success('房间创建成功，等待对手...')
  })

  // 游戏开始
  socket.on('chess-game-start', (data: any) => {
    roomId.value = data.roomId
    // 如果我是后加入的（不是房主），需要根据房主颜色确定我的颜色
    // 这里后端直接发来了我的颜色，也可以自己推导
    // 简单处理：后端发来 hostColor, guestColor。
    // 如果 socket.id === guestId (后端没发 socketId，但发了 colors)
    // 我们可以根据我们选的角色来核对，或者后端直接告诉我们 "you are black"
    // 现在的后端实现是：
    /*
      io.to(roomId).emit('chess-game-start', {
        roomId,
        hostColor: room.hostColor,
        guestColor: ...
      })
    */
    // 由于我们在 createRoom 和 joinRoom 时已经确定了 myChessColor，这里只需确认
    // 加入者在 joinRoom 时需要被告知颜色，或者加入者必须选择与房主相反的颜色
    // 修正逻辑：joinRoom 时，如果房主是黑，我就只能是白。
    
    // 实际上，我们在 Join Room 时没有选择颜色，而是被迫接受相反颜色。
    // 所以我们需要更新 myChessColor
    if (viewState.value === 'lobby') {
       // 我是加入者
       myChessColor.value = data.guestColor
    }
    
    viewState.value = 'playing'
    resetChessBoard(true)
    message.success('游戏开始！')
  })

  // 收到落子
  socket.on('chess-move', (data: any) => {
    // 简单校验
    const key = `${data.x},${data.y}`
    if (chessPieces[key]) return

    chessPieces[key] = { x: data.x, y: data.y, color: data.color }
    lastMove.value = { x: data.x, y: data.y }
    checkWin(data.x, data.y, data.color)
    if (!winner.value) {
      currentTurn.value = data.color === 'black' ? 'white' : 'black'
    }
  })

  // 对手离开
  socket.on('chess-opponent-left', () => {
    message.warning('对手已离开房间')
    viewState.value = 'lobby'
    resetChessBoard(true)
    roomId.value = ''
    // 重新获取房间列表
    socket.emit('chess-get-rooms')
  })

  // 重开请求
  socket.on('chess-request-restart', () => {
    restartRequested.value = true
    // 既然收到了请求，那肯定不是我发的
    restartRequester.value = myChessColor.value === 'black' ? 'white' : 'black' 
    message.info('对手请求重新开始')
  })

  // 确认重开
  socket.on('chess-restart', () => {
    resetChessBoard()
    message.success('游戏已重新开始')
  })
}

// 创建房间
const createRoom = () => {
  if (!props.socketInstance) return message.error('未连接到服务器')
  props.socketInstance.emit('chess-create-room', { color: myChessColor.value })
}

// 加入房间
const joinRoom = (id: string) => {
  if (!props.socketInstance) return message.error('未连接到服务器')
  props.socketInstance.emit('chess-join-room', { roomId: id })
}

// 离开房间/取消等待
const leaveRoom = () => {
  if (props.socketInstance) {
    props.socketInstance.emit('chess-leave-room')
  }
  viewState.value = 'lobby'
  roomId.value = ''
  resetChessBoard(true)
}

// 落子逻辑
const handleChessClick = (e: MouseEvent) => {
  if (viewState.value !== 'playing') return
  if (winner.value) {
    message.warning('游戏已结束，请重新开始')
    return
  }
  if (currentTurn.value !== myChessColor.value) {
    message.warning('还未轮到您落子')
    return
  }

  if (!chessAreaRef.value) return
  const rect = chessAreaRef.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  const x = Math.round((offsetX - 20) / 40)
  const y = Math.round((offsetY - 20) / 40)

  if (x < 0 || x > 14 || y < 0 || y > 14) return

  const key = `${x},${y}`
  if (chessPieces[key]) return

  // 乐观更新
  chessPieces[key] = { x, y, color: myChessColor.value }
  lastMove.value = { x, y }
  checkWin(x, y, myChessColor.value)
  
  props.socketInstance?.emit('chess-move', { x, y, color: myChessColor.value })

  if (!winner.value) {
    currentTurn.value = myChessColor.value === 'black' ? 'white' : 'black'
  }
}

// 胜负判断
const checkWin = (x: number, y: number, color: string) => {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]
  for (const [dx, dy] of directions) {
    let count = 1
    let i = 1
    while (chessPieces[`${x + i * dx},${y + i * dy}`]?.color === color) {
      count++
      i++
    }
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

const requestRestart = () => {
  props.socketInstance?.emit('chess-request-restart')
  restartRequested.value = true
  restartRequester.value = myChessColor.value
  message.loading('等待对方确认...', 0)
}

const confirmRestart = () => {
  props.socketInstance?.emit('chess-confirm-restart')
}

const resetChessBoard = (keepScores = false) => {
  for (const key in chessPieces) delete chessPieces[key]
  winner.value = ''
  currentTurn.value = 'black'
  lastMove.value = null
  restartRequested.value = false
  restartRequester.value = ''
  if (!keepScores) {
    // scores.black = 0; scores.white = 0; 
  }
  message.destroy()
}

onUnmounted(() => {
  if (props.socketInstance) {
     const events = [
       'chess-room-list',
       'chess-room-created',
       'chess-game-start',
       'chess-move',
       'chess-opponent-left',
       'chess-request-restart',
       'chess-restart',
       'chess-error'
     ]
     events.forEach(event => props.socketInstance.off(event))
  }
})
</script>

<style scoped>
.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
}

/* Lobby Styles */
.lobby-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.role-selection, .create-room, .room-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
}

.room-card {
  border: 1px solid #eee;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  background: #fafafa;
}

.room-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: #666;
}

/* Waiting Styles */
.waiting-container {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.waiting-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Playing Styles */
.game-playing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.game-header {
  text-align: center;
  margin-bottom: 24px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.black { color: #000; font-weight: bold; }
.white { color: #999; font-weight: bold; }

.game-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

.chess-area {
  width: 600px;
  height: 600px;
  background: #deb887;
  position: relative;
  cursor: pointer;
  border: 4px solid #8b4513;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
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
.line.horizontal { height: 1px; left: 20px; right: 20px; }
.line.vertical { width: 1px; top: 20px; bottom: 20px; }

.chess-piece {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  z-index: 10;
}
.chess-piece.black { background: radial-gradient(circle at 10px 10px, #666, #000); }
.chess-piece.white { background: radial-gradient(circle at 10px 10px, #fff, #ddd); }

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
  flex-direction: column;
  gap: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 250px;
}

.player-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
}

.info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
}
.info-card.active {
  opacity: 1;
  font-weight: bold;
}

.score-board {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 20px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.winner-display {
  text-align: center;
  font-size: 18px;
  color: #faad14;
  font-weight: bold;
  margin-bottom: 8px;
}
</style>