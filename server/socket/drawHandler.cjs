module.exports = (io, socket) => {
  // --- Drawing Game Events ---
  socket.on('draw-start', data => {
    socket.broadcast.emit('draw-start', data)
  })

  socket.on('draw-move', data => {
    socket.broadcast.emit('draw-move', data)
  })

  socket.on('draw-end', () => {
    socket.broadcast.emit('draw-end')
  })

  socket.on('clear-canvas', () => {
    io.emit('clear-canvas')
  })
}
