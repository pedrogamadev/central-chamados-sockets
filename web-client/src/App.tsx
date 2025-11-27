import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import "./App.css"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

type ChatMessage = {
  author: string
  text: string
  timestamp: string
}

function parseIncomingMessage(raw: string): ChatMessage {
  try {
    const parsed = JSON.parse(raw) as Partial<ChatMessage>

    if (parsed && typeof parsed.text === "string") {
      return {
        author: typeof parsed.author === "string" ? parsed.author : "Visitante",
        text: parsed.text,
        timestamp:
          typeof parsed.timestamp === "string"
            ? parsed.timestamp
            : new Date().toISOString(),
      }
    }
  } catch (error) {
    // Ignora erro e trata como texto simples
  }

  return {
    author: "Visitante",
    text: raw,
    timestamp: new Date().toISOString(),
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [connectionId, setConnectionId] = useState(0)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected")

  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const author = useMemo(
    () => `Visitante-${Math.floor(Math.random() * 900) + 100}`,
    [],
  )

  useEffect(() => {
    if (!isChatOpen) {
      return
    }

    setConnectionStatus("connecting")
    const socket = new WebSocket("ws://localhost:8080")
    socketRef.current = socket

    const handleMessage = (event: MessageEvent) => {
      setMessages((prev) => [...prev, parseIncomingMessage(event.data.toString())])
    }

    socket.addEventListener("open", () => setConnectionStatus("connected"))
    socket.addEventListener("message", handleMessage)
    socket.addEventListener("close", () => setConnectionStatus("error"))
    socket.addEventListener("error", () => setConnectionStatus("error"))

    return () => {
      socket.removeEventListener("message", handleMessage)
      socket.close()
      socketRef.current = null
      setConnectionStatus("disconnected")
    }
  }, [isChatOpen, connectionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleOpenChat = () => {
    if (!isChatOpen) {
      setIsChatOpen(true)
      return
    }

    if (connectionStatus === "error") {
      setMessages([])
      setConnectionId((id) => id + 1)
    }
  }

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = currentMessage.trim()
    if (!text) return

    const socket = socketRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message: ChatMessage = {
        author,
        text,
        timestamp: new Date().toISOString(),
      }

      socket.send(JSON.stringify(message))
      setCurrentMessage("")
    }
  }

  const connectionMessage = (() => {
    if (connectionStatus === "connecting") return "Conectando ao chat..."
    if (connectionStatus === "connected") return "Conectado"
    if (connectionStatus === "error") return "Conexão com o chat perdida"
    return "Chat fechado"
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
          disabled={isChatOpen && connectionStatus !== "error"}
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
                <div key={`${message.timestamp}-${index}`} className="message-item">
                  <div className="message-meta">
                    <span className="author">{message.author}</span>
                    <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <p className="message-text">{message.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Digite uma mensagem"
              value={currentMessage}
              onChange={(event) => setCurrentMessage(event.target.value)}
              disabled={connectionStatus !== "connected"}
            />
            <button
              type="submit"
              className="send-button"
              disabled={connectionStatus !== "connected" || !currentMessage.trim()}
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
