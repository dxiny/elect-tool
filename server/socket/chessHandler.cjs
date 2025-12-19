// 存储游戏状态
const games = {}

module.exports = (io, socket) => {
  // 落子
  socket.on('chess-move', (data) => {
    // 广播给其他人
    socket.broadcast.emit('chess-move', data)
  })

  // 请求开始游戏
  socket.on('chess-request-start', (data) => {
    socket.broadcast.emit('chess-request-start', data)
  })

  // 确认开始游戏
  socket.on('chess-confirm-start', () => {
    io.emit('chess-start-game')
  })

  // 请求重新开始
  socket.on('chess-request-restart', (data) => {
    socket.broadcast.emit('chess-request-restart', data)
  })

  // 确认重新开始
  socket.on('chess-confirm-restart', () => {
    io.emit('chess-restart')
  })
}
