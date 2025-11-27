import WebSocket, { RawData, WebSocketServer } from "ws";

export const CHAT_HOST = "localhost";
export const CHAT_PORT = 8080;

export function startChatWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ port: CHAT_PORT });

  console.log(
    `[WS] Servidor de chat ouvindo em ws://${CHAT_HOST}:${CHAT_PORT}`,
  );

  wss.on("connection", (socket: WebSocket) => {
    console.log("[WS] Cliente conectado");

    socket.on("message", (message: RawData) => {
      const text = message.toString();

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(text);
        }
      });
    });

    socket.on("close", () => {
      console.log("[WS] Cliente desconectado");
    });

    socket.on("error", (error: Error) => {
      console.error("[WS] Erro no socket:", error.message);
    });
  });

  wss.on("error", (error: Error) => {
    console.error("[WS] Erro no servidor:", error.message);
  });

  return wss;
}
