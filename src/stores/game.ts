import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { message } from 'ant-design-vue'

export const useGameStore = defineStore('game', {
  state: () => ({
    socket: null as Socket | null,
    isConnected: false,
    userId: '',
    
    // 游戏状态
    viewState: 'lobby' as 'lobby' | 'waiting' | 'playing',
    roomId: '',
    myChessColor: 'black', // 'black' | 'white'
    roomList: [] as any[],
    
    // 对局数据
    chessPieces: {} as Record<string, { x: number; y: number; color: string }>,
    currentTurn: 'black',
    lastMove: null as { x: number; y: number } | null,
    winner: '',
    scores: { black: 0, white: 0 },
    
    // 重开状态
    restartRequested: false,
    restartRequester: ''
  }),

  actions: {
    initSocket() {
      // 1. 获取或生成 userId
      let storedUserId = localStorage.getItem('chess_user_id')
      if (!storedUserId) {
        storedUserId = Math.random().toString(36).substring(2, 10)
        localStorage.setItem('chess_user_id', storedUserId)
      }
      this.userId = storedUserId

      // 2. 如果 socket 已存在且连接中，无需重新初始化
      if (this.socket && this.socket.connected) {
        console.log('Socket already connected')
        return
      }

      const serverUrl = import.meta.env.VITE_SERVER_URL
      console.log('Connecting to Socket Server:', serverUrl, 'User:', this.userId)

      // 3. 建立连接
      this.socket = io(serverUrl, {
        query: { userId: this.userId },
        reconnection: true,
        reconnectionAttempts: 10
      })

      // 4. 绑定基础事件
      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('Socket connected:', this.socket?.id)
        // 连接后立即获取房间列表
        this.socket?.emit('chess-get-rooms')
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        console.log('Socket disconnected:', reason)
      })

      this.socket.on('connect_error', (error) => {
        this.isConnected = false
        console.error('Socket error:', error)
      })

      // 5. 绑定全局业务事件 (无论在哪个页面都应该监听)
      this.bindGameEvents()
    },

    bindGameEvents() {
      if (!this.socket) return

      // 房间列表
      this.socket.on('chess-room-list', (list) => {
        this.roomList = list
      })

      // 创建房间成功
      this.socket.on('chess-room-created', ({ roomId }) => {
        this.roomId = roomId
        this.viewState = 'waiting'
        message.success('房间创建成功，等待对手...')
      })

      // 游戏开始
      this.socket.on('chess-game-start', (data) => {
        this.roomId = data.roomId
        // 如果在大厅，说明我是加入者，更新颜色
        if (this.viewState === 'lobby') {
           this.myChessColor = data.guestColor
        }
        this.viewState = 'playing'
        this.resetBoard(true)
        message.success('游戏开始！')
      })
      
      // 重连成功
      this.socket.on('chess-reconnected', (data) => {
        console.log('Reconnected to active game:', data)
        this.roomId = data.roomId
        this.viewState = 'playing' // 或者是 data.status
        this.myChessColor = data.myColor
        this.chessPieces = data.pieces || {}
        this.currentTurn = data.currentTurn
        
        // 恢复分数等其他状态可能需要后端支持，暂时重置或保持
        message.success('已恢复到之前的对局')
      })

      // 落子
      this.socket.on('chess-move', (data) => {
        const key = `${data.x},${data.y}`
        this.chessPieces[key] = { x: data.x, y: data.y, color: data.color }
        this.lastMove = { x: data.x, y: data.y }
        this.checkWin(data.x, data.y, data.color)
        if (!this.winner) {
          this.currentTurn = data.color === 'black' ? 'white' : 'black'
        }
      })
      
      // 对方掉线
      this.socket.on('chess-user-disconnected', () => {
        message.warning('对方已断线，等待重连...', 5)
      })

      // 对方离开
      this.socket.on('chess-opponent-left', () => {
        message.warning('对手已离开房间')
        this.viewState = 'lobby'
        this.roomId = ''
        this.resetBoard(true)
        this.socket?.emit('chess-get-rooms')
      })
      
      // 错误
      this.socket.on('chess-error', (msg) => {
        message.error(msg)
        if (msg.includes('房间') && this.viewState !== 'lobby') {
           this.viewState = 'lobby'
           this.roomId = ''
           this.socket?.emit('chess-get-rooms')
        }
      })

      // 重开相关
      this.socket.on('chess-request-restart', () => {
        this.restartRequested = true
        this.restartRequester = this.myChessColor === 'black' ? 'white' : 'black'
        message.info('对手请求重新开始')
      })

      this.socket.on('chess-restart', () => {
        this.resetBoard()
        message.success('游戏已重新开始')
      })
    },

    // 动作方法
    createRoom() {
      this.socket?.emit('chess-create-room', { color: this.myChessColor, userId: this.userId })
    },

    joinRoom(roomId: string) {
      this.socket?.emit('chess-join-room', { roomId, userId: this.userId })
    },

    leaveRoom() {
      this.socket?.emit('chess-leave-room')
      this.viewState = 'lobby'
      this.roomId = ''
      this.resetBoard(true)
    },

    makeMove(x: number, y: number) {
      if (this.viewState !== 'playing') return
      if (this.winner) return
      if (this.currentTurn !== this.myChessColor) {
        message.warning('还未轮到您落子')
        return
      }

      const key = `${x},${y}`
      if (this.chessPieces[key]) return

      // 乐观更新
      this.chessPieces[key] = { x, y, color: this.myChessColor }
      this.lastMove = { x, y }
      this.checkWin(x, y, this.myChessColor)
      
      this.socket?.emit('chess-move', { x, y, color: this.myChessColor })

      if (!this.winner) {
        this.currentTurn = this.myChessColor === 'black' ? 'white' : 'black'
      }
    },

    requestRestart() {
      this.socket?.emit('chess-request-restart')
      this.restartRequested = true
      this.restartRequester = this.myChessColor
    },

    confirmRestart() {
      this.socket?.emit('chess-confirm-restart')
    },

    resetBoard(keepScores = false) {
      this.chessPieces = {}
      this.winner = ''
      this.currentTurn = 'black'
      this.lastMove = null
      this.restartRequested = false
      this.restartRequester = ''
      if (!keepScores) {
        // scores 不需要清零，除非是完全退出
      }
      message.destroy()
    },

    checkWin(x: number, y: number, color: string) {
      const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]
      for (const [dx, dy] of directions) {
        let count = 1
        let i = 1
        while (this.chessPieces[`${x + i * dx},${y + i * dy}`]?.color === color) { count++; i++ }
        i = 1
        while (this.chessPieces[`${x - i * dx},${y - i * dy}`]?.color === color) { count++; i++ }
        
        if (count >= 5) {
          this.winner = color
          if (color === 'black') this.scores.black++
          else this.scores.white++
          message.success(`${color === 'black' ? '黑方' : '白方'} 获胜！`)
          return
        }
      }
    }
  }
})
