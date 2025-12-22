// 存储房间状态
const rooms = {}
// 用户ID -> 房间ID 的映射，用于快速查找用户是否在房间中
const userRoomMap = {}
// 房间清理定时器 map
const roomCleanupTimers = {}

// 生成简单的房间ID
const generateRoomId = () => Math.random().toString(36).substring(2, 8)

module.exports = (io, socket) => {
  const userId = socket.handshake.query.userId
  
  // 打印连接日志
  console.log(`[Socket] User connected: ${socket.id}, UserId: ${userId}`)

  // 尝试重连逻辑
  if (userId && userRoomMap[userId]) {
    const roomId = userRoomMap[userId]
    const room = rooms[roomId]
    
    if (room) {
      console.log(`[Socket] User ${userId} reconnecting to room ${roomId}`)
      // 取消房间清理定时器（如果存在）
      if (roomCleanupTimers[roomId]) {
        clearTimeout(roomCleanupTimers[roomId])
        delete roomCleanupTimers[roomId]
        console.log(`[Socket] Cancelled cleanup timer for room ${roomId}`)
      }

      // 更新 socket.id
      if (room.hostUserId === userId) {
        room.hostId = socket.id
      } else if (room.guestUserId === userId) {
        room.guestId = socket.id
      }

      socket.join(roomId)
      socket.roomId = roomId
      
      // 发送重连成功事件，恢复状态
      socket.emit('chess-reconnected', {
        roomId,
        hostColor: room.hostColor,
        myColor: room.hostUserId === userId ? room.hostColor : (room.hostColor === 'black' ? 'white' : 'black'),
        pieces: room.pieces,
        currentTurn: room.currentTurn,
        status: room.status,
        isHost: room.hostUserId === userId
      })
    } else {
      // 房间数据不一致，清理映射
      delete userRoomMap[userId]
    }
  }

  // 获取房间列表
  const broadcastRoomList = () => {
    const roomList = Object.values(rooms).map(room => ({
      id: room.id,
      hostId: room.hostId, // socketId
      hostUserId: room.hostUserId,
      hostColor: room.hostColor,
      status: room.status, // 'waiting', 'playing'
    })).filter(r => r.status === 'waiting')
    
    io.emit('chess-room-list', roomList)
  }

  // 获取房间列表请求
  socket.on('chess-get-rooms', () => {
    console.log(`[Socket] User ${userId || socket.id} requested room list`)
    broadcastRoomList()
  })

  // 创建房间
  socket.on('chess-create-room', ({ color, userId: clientUserId }) => {
    // 优先使用 handshake 中的 userId，如果没有则使用参数中的（兼容旧逻辑）
    const finalUserId = userId || clientUserId || socket.id
    console.log(`[Socket] Creating room. User: ${finalUserId}, Color: ${color}`)

    const roomId = generateRoomId()
    
    // 离开之前的房间（如果有）
    if (socket.roomId) {
      leaveRoom(socket.roomId)
    }

    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      hostUserId: finalUserId,
      hostColor: color,
      guestId: null,
      guestUserId: null,
      status: 'waiting',
      pieces: {}, // 存储棋盘状态
      currentTurn: 'black'
    }
    
    // 记录映射
    userRoomMap[finalUserId] = roomId

    socket.join(roomId)
    socket.roomId = roomId
    
    socket.emit('chess-room-created', { roomId })
    broadcastRoomList()
    console.log(`[Socket] Room ${roomId} created by ${finalUserId}`)
  })

  // 加入房间
  socket.on('chess-join-room', ({ roomId, userId: clientUserId }) => {
    const finalUserId = userId || clientUserId || socket.id
    console.log(`[Socket] User ${finalUserId} attempting to join room ${roomId}`)

    const room = rooms[roomId]
    
    // 检查房间是否存在、状态是否为等待中
    if (!room || room.status !== 'waiting') {
      socket.emit('chess-error', '房间不存在或已开始游戏')
      return
    }

    // 再次确认房间是否已满（防止并发）
    if (room.guestId) {
      socket.emit('chess-error', '房间已满')
      return
    }
    
    // 防止自己加入自己的房间
    if (room.hostUserId === finalUserId) {
      socket.emit('chess-error', '不能加入自己的房间')
      return
    }

    // 离开之前的房间
    if (socket.roomId) {
      leaveRoom(socket.roomId)
    }

    room.guestId = socket.id
    room.guestUserId = finalUserId
    room.status = 'playing'
    
    // 记录映射
    userRoomMap[finalUserId] = roomId
    
    socket.join(roomId)
    socket.roomId = roomId

    // 通知双方游戏开始
    io.to(roomId).emit('chess-game-start', {
      roomId,
      hostColor: room.hostColor,
      guestColor: room.hostColor === 'black' ? 'white' : 'black'
    })
    
    broadcastRoomList()
    console.log(`[Socket] User ${finalUserId} joined room ${roomId}. Game Started.`)
  })

  // 离开房间辅助函数
  const leaveRoom = (roomId, isDisconnect = false) => {
    const room = rooms[roomId]
    if (!room) return

    console.log(`[Socket] leaveRoom called for room ${roomId}, isDisconnect: ${isDisconnect}, Socket: ${socket.id}`)

    // 如果是断开连接，且房间正在游戏中，则不立即销毁，而是等待重连
    if (isDisconnect && room.status === 'playing') {
      console.log(`[Socket] User disconnected from active game. Setting cleanup timer for room ${roomId}`)
      // 设置清理定时器（例如 60秒）
      // 如果对方也离开了，或者超时未重连，则销毁
      
      // 通知对方有人掉线
      socket.to(roomId).emit('chess-user-disconnected', { userId })

      // 如果房间已经有一个定时器了（说明另一个人也掉线了），或者这是第一个掉线
      // 这里简化处理：只要有人掉线，就启动倒计时。如果所有人都掉线了，倒计时结束就销毁。
      // 如果有一人重连，取消倒计时？不，必须等所有人都回来？
      // 策略：如果房主掉线，给房主保留 60s。如果房客掉线，给房客保留 60s。
      // 只要房间里还有人（或都在重连期），就保留房间。
      
      if (!roomCleanupTimers[roomId]) {
         roomCleanupTimers[roomId] = setTimeout(() => {
           console.log(`[Socket] Cleanup timer expired for room ${roomId}. Destroying.`)
           destroyRoom(roomId)
         }, 60000)
      }
      return
    }

    // 只有房主或房客主动离开，或者等待状态下断线，才销毁
    if (room.hostId === socket.id || room.guestId === socket.id) {
       // 通知房间内其他人
       io.to(roomId).emit('chess-opponent-left')
       
       destroyRoom(roomId)
    }
  }

  const destroyRoom = (roomId) => {
    const room = rooms[roomId]
    if (!room) return
    
    console.log(`[Socket] Destroying room ${roomId}`)

    // 清理映射
    if (room.hostUserId) delete userRoomMap[room.hostUserId]
    if (room.guestUserId) delete userRoomMap[room.guestUserId]
    
    // 清理定时器
    if (roomCleanupTimers[roomId]) {
      clearTimeout(roomCleanupTimers[roomId])
      delete roomCleanupTimers[roomId]
    }

    delete rooms[roomId]
    broadcastRoomList()
  }

  // 离开房间/取消等待
  socket.on('chess-leave-room', () => {
    if (socket.roomId) {
      console.log(`[Socket] User ${socket.id} explicitly leaving room ${socket.roomId}`)
      leaveRoom(socket.roomId, false)
      socket.leave(socket.roomId)
      socket.roomId = null
    }
  })

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnect: ${socket.id}, Reason: ${reason}`)
    if (socket.roomId) {
      leaveRoom(socket.roomId, true)
    }
  })

  // 落子
  socket.on('chess-move', (data) => {
    const room = rooms[socket.roomId]
    if (!room || room.status !== 'playing') return

    // 验证是否轮到该颜色
    if (data.color !== room.currentTurn) return

    // 验证操作者身份
    const isHost = socket.id === room.hostId
    const isGuest = socket.id === room.guestId
    
    if (isHost && room.hostColor !== data.color) return 
    if (isGuest && room.hostColor === data.color) return 
    if (!isHost && !isGuest) return 

    const key = `${data.x},${data.y}`
    if (room.pieces[key]) return 

    room.pieces[key] = data
    room.currentTurn = room.currentTurn === 'black' ? 'white' : 'black'
    
    console.log(`[Socket] Move in room ${socket.roomId}: ${data.color} (${data.x}, ${data.y})`)
    socket.to(socket.roomId).emit('chess-move', data)
  })

  // 重新开始请求
  socket.on('chess-request-restart', () => {
    if (socket.roomId) {
      console.log(`[Socket] Restart requested in room ${socket.roomId}`)
      socket.to(socket.roomId).emit('chess-request-restart')
    }
  })

  // 确认重新开始
  socket.on('chess-confirm-restart', () => {
    const room = rooms[socket.roomId]
    if (room) {
      console.log(`[Socket] Restart confirmed in room ${socket.roomId}`)
      room.pieces = {}
      room.currentTurn = 'black'
      io.to(socket.roomId).emit('chess-restart')
    }
  })
}
