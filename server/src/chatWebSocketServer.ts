import WebSocket, { WebSocketServer } from 'ws'

const PORT = 8080

const wss = new WebSocketServer({ port: PORT })

console.log(`Chat WebSocket server running at ws://localhost:${PORT}`)

wss.on('connection', (socket: WebSocket) => {
  console.log('Client connected')

  socket.on('message', (message) => {
    const text = message.toString()

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text)
      }
    })
  })

  socket.on('close', () => {
    console.log('Client disconnected')
  })
})
