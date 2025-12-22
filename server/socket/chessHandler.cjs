// 存储房间状态
const rooms = {}

// 生成简单的房间ID
const generateRoomId = () => Math.random().toString(36).substring(2, 8)

module.exports = (io, socket) => {
  // 获取房间列表
  const broadcastRoomList = () => {
    const roomList = Object.values(rooms).map(room => ({
      id: room.id,
      hostId: room.hostId,
      hostColor: room.hostColor,
      status: room.status, // 'waiting', 'playing'
    })).filter(r => r.status === 'waiting')
    
    io.emit('chess-room-list', roomList)
  }

  // 获取房间列表请求
  socket.on('chess-get-rooms', () => {
    broadcastRoomList()
  })

  // 创建房间
  socket.on('chess-create-room', ({ color }) => {
    const roomId = generateRoomId()
    
    // 离开之前的房间（如果有）
    if (socket.roomId) {
      leaveRoom(socket.roomId)
    }

    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      hostColor: color,
      guestId: null,
      status: 'waiting',
      pieces: {}, // 存储棋盘状态
      currentTurn: 'black'
    }

    socket.join(roomId)
    socket.roomId = roomId
    
    socket.emit('chess-room-created', { roomId })
    broadcastRoomList()
  })

  // 加入房间
  socket.on('chess-join-room', ({ roomId }) => {
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

    // 离开之前的房间
    if (socket.roomId) {
      leaveRoom(socket.roomId)
    }

    room.guestId = socket.id
    room.status = 'playing'
    
    socket.join(roomId)
    socket.roomId = roomId

    // 通知双方游戏开始
    io.to(roomId).emit('chess-game-start', {
      roomId,
      hostColor: room.hostColor,
      guestColor: room.hostColor === 'black' ? 'white' : 'black'
    })
    
    broadcastRoomList()
  })

  // 离开房间辅助函数
  const leaveRoom = (roomId) => {
    const room = rooms[roomId]
    if (!room) return

    // 只有房主或房客才能触发销毁/通知
    if (room.hostId === socket.id || room.guestId === socket.id) {
       // 通知房间内其他人
       io.to(roomId).emit('chess-opponent-left')
       
       // 删除房间（任何一方离开都解散房间）
       delete rooms[roomId]
       broadcastRoomList()
    }
  }

  // 离开房间/取消等待
  socket.on('chess-leave-room', () => {
    if (socket.roomId) {
      leaveRoom(socket.roomId)
      socket.leave(socket.roomId)
      socket.roomId = null
    }
  })

  // 断开连接
  socket.on('disconnect', () => {
    if (socket.roomId) {
      leaveRoom(socket.roomId)
    }
  })

  // 落子
  socket.on('chess-move', (data) => {
    const room = rooms[socket.roomId]
    if (!room || room.status !== 'playing') return

    // 验证是否轮到该颜色
    if (data.color !== room.currentTurn) return

    // 验证操作者身份（防止篡改颜色或替下）
    const isHost = socket.id === room.hostId
    const isGuest = socket.id === room.guestId
    
    if (isHost && room.hostColor !== data.color) return // 房主执色不符
    if (isGuest && room.hostColor === data.color) return // 房客执色不符 (房客颜色应与房主相反)
    if (!isHost && !isGuest) return // 旁观者或其他异常

    // 记录棋子
    const key = `${data.x},${data.y}`
    if (room.pieces[key]) return // 已有子

    room.pieces[key] = data

    // 切换回合
    room.currentTurn = room.currentTurn === 'black' ? 'white' : 'black'

    // 广播给房间内所有人（包括自己，确保状态同步，或者只发给对方）
    // 通常前端已经乐观更新了，这里广播给对方即可
    socket.to(socket.roomId).emit('chess-move', data)
  })

  // 重新开始请求
  socket.on('chess-request-restart', () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('chess-request-restart')
    }
  })

  // 确认重新开始
  socket.on('chess-confirm-restart', () => {
    const room = rooms[socket.roomId]
    if (room) {
      room.pieces = {}
      room.currentTurn = 'black'
      io.to(socket.roomId).emit('chess-restart')
    }
  })
}
