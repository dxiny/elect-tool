module.exports = (io, socket) => {
  // 画画开始
  socket.on('draw-start', (data) => {
    socket.broadcast.emit('draw-start', data)
  })

  // 画画过程
  socket.on('draw-move', (data) => {
    socket.broadcast.emit('draw-move', data)
  })

  // 画画结束
  socket.on('draw-end', () => {
    socket.broadcast.emit('draw-end')
  })

  // 清空画布
  socket.on('clear-canvas', () => {
    io.emit('clear-canvas')
  })
}
