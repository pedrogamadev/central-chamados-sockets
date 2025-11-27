import { FormEvent, useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [connectionId, setConnectionId] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected')

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!isChatOpen) {
      return
    }

    setConnectionStatus('connecting')
    const socket = new WebSocket('ws://localhost:8080')
    socketRef.current = socket

    const handleMessage = (event: MessageEvent) => {
      setMessages((prev) => [...prev, event.data.toString()])
    }

    socket.addEventListener('open', () => setConnectionStatus('connected'))
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('close', () => setConnectionStatus('error'))
    socket.addEventListener('error', () => setConnectionStatus('error'))

    return () => {
      socket.removeEventListener('message', handleMessage)
      socket.close()
      socketRef.current = null
      setConnectionStatus('disconnected')
    }
  }, [isChatOpen, connectionId])

  const handleOpenChat = () => {
    if (!isChatOpen) {
      setIsChatOpen(true)
      return
    }

    if (connectionStatus === 'error') {
      setConnectionId((id) => id + 1)
    }
  }

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = currentMessage.trim()
    if (!text) return

    const socket = socketRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(text)
      setCurrentMessage('')
    }
  }

  const connectionMessage = (() => {
    if (connectionStatus === 'connecting') return 'Conectando ao chat...'
    if (connectionStatus === 'connected') return 'Conectado'
    if (connectionStatus === 'error') return 'Conexão com o chat perdida'
    return 'Chat fechado'
  })()

  return (
    <div className="app">
      <header className="hero">
        <h1>Central de Chamados – Chat Público</h1>
        <p>Abra o chat para conversar em tempo real com outros visitantes.</p>
        <button
          type="button"
          className="primary-button"
          onClick={handleOpenChat}
          disabled={isChatOpen && connectionStatus !== 'error'}
        >
          Abrir chat
        </button>
      </header>

      {isChatOpen && (
        <section className="chat-card">
          <div className="chat-header">
            <div>
              <p className="label">Chat em tempo real</p>
              <h2>Mensagens públicas</h2>
            </div>
            <span className={`status-badge ${connectionStatus}`}>
              {connectionMessage}
            </span>
          </div>

          <div className="messages-box">
            {messages.length === 0 ? (
              <p className="empty">Nenhuma mensagem ainda.</p>
            ) : (
              messages.map((message, index) => (
                <div key={`${message}-${index}`} className="message-item">
                  {message}
                </div>
              ))
            )}
          </div>

          <form className="chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Digite uma mensagem"
              value={currentMessage}
              onChange={(event) => setCurrentMessage(event.target.value)}
              disabled={connectionStatus !== 'connected'}
            />
            <button
              type="submit"
              className="send-button"
              disabled={connectionStatus !== 'connected' || !currentMessage.trim()}
            >
              Enviar
            </button>
          </form>
        </section>
      )}
    </div>
  )
}

export default App
