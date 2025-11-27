import { startTcpServer, TCP_HOST, TCP_PORT } from "./tcpServer";
import {
  startChatWebSocketServer,
  CHAT_HOST,
  CHAT_PORT,
} from "./chatWebSocketServer";

startTcpServer();
startChatWebSocketServer();

console.log(
  `Servidor TCP de chamados ouvindo em ${TCP_HOST}:${TCP_PORT}`,
);
console.log(
  `Servidor WebSocket de chat ouvindo em ws://${CHAT_HOST}:${CHAT_PORT}`,
);
