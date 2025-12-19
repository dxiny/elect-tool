module.exports = (io, socket) => {
  // --- Gomoku (Five in a Row) Events ---
  socket.on('chess-move', (data) => {
    socket.broadcast.emit('chess-move', data)
  })

  // Start Game Handshake
  socket.on('chess-request-start', (data) => {
    // data: { requester: 'black' | 'white' }
    socket.broadcast.emit('chess-request-start', data)
  })

  socket.on('chess-confirm-start', () => {
    io.emit('chess-start-game')
  })

  // Restart Handshake
  socket.on('chess-request-restart', (data) => {
    socket.broadcast.emit('chess-request-restart', data)
  })

  socket.on('chess-confirm-restart', () => {
    io.emit('chess-restart')
  })
}
