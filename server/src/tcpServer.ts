import net from "net";
import { ticketService } from "./services/TicketService";
import type {
  TcpRequest,
  TcpResponse,
  UpdateTicketStatusPayload,
} from "./protocol/tcpMessages";
import type {
  TicketPriority,
  TicketStatus,
} from "./domain/Ticket";

export const TCP_HOST = "127.0.0.1";
export const TCP_PORT = 5000;

function isValidPriority(value: unknown): value is TicketPriority {
  return value === "BAIXA" || value === "MEDIA" || value === "ALTA";
}

function isValidStatus(value: unknown): value is TicketStatus {
  return (
    value === "ABERTO" ||
    value === "EM_ATENDIMENTO" ||
    value === "FECHADO"
  );
}

function sendResponse(socket: net.Socket, response: TcpResponse) {
  socket.write(`${JSON.stringify(response)}\n`);
}

function handleRequest(request: TcpRequest): TcpResponse {
  switch (request.type) {
    case "CREATE_TICKET": {
      const { titulo, descricao, prioridade, solicitante } = request.payload;

      if (
        typeof titulo !== "string" ||
        typeof descricao !== "string" ||
        typeof solicitante !== "string" ||
        !isValidPriority(prioridade)
      ) {
        return {
          success: false,
          message: "Payload inválido para criação de chamado.",
        };
      }

      const ticket = ticketService.createTicket({
        titulo,
        descricao,
        prioridade,
        solicitante,
      });

      return {
        success: true,
        message: "Chamado criado com sucesso.",
        data: ticket,
      };
    }

    case "LIST_TICKETS": {
      return {
        success: true,
        message: "Lista de chamados obtida com sucesso.",
        data: ticketService.listTickets(),
      };
    }

    case "GET_TICKET": {
      const { id } = request.payload;

      if (typeof id !== "number" || Number.isNaN(id)) {
        return { success: false, message: "ID inválido." };
      }

      const ticket = ticketService.getTicketById(id);

      if (!ticket) {
        return { success: false, message: "Chamado não encontrado." };
      }

      return {
        success: true,
        message: "Chamado encontrado.",
        data: ticket,
      };
    }

    case "UPDATE_TICKET_STATUS": {
      const payload = request.payload as UpdateTicketStatusPayload;
      const { id, status } = payload;

      if (typeof id !== "number" || Number.isNaN(id) || !isValidStatus(status)) {
        return {
          success: false,
          message: "Payload inválido para atualização de status.",
        };
      }

      const ticket = ticketService.updateTicketStatus(id, status);

      if (!ticket) {
        return { success: false, message: "Chamado não encontrado." };
      }

      return {
        success: true,
        message: "Status do chamado atualizado.",
        data: ticket,
      };
    }
  }
}

export function startTcpServer(): net.Server {
  const server = net.createServer((socket) => {
    const address = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[TCP] Cliente conectado: ${address}`);

    let buffer = "";

    socket.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();

      let newlineIndex = buffer.indexOf("\n");

      while (newlineIndex !== -1) {
        const rawMessage = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (rawMessage.length === 0) {
          newlineIndex = buffer.indexOf("\n");
          continue;
        }

        try {
          const request = JSON.parse(rawMessage) as TcpRequest;
          const response = handleRequest(request);
          sendResponse(socket, response);
        } catch (error) {
          console.error("[TCP] Erro ao processar mensagem:", error);
          sendResponse(socket, {
            success: false,
            message: "Mensagem inválida.",
          });
        }

        newlineIndex = buffer.indexOf("\n");
      }
    });

    socket.on("close", () => {
      console.log(`[TCP] Cliente desconectado: ${address}`);
    });

    socket.on("error", (error: Error) => {
      console.error(`[TCP] Erro no socket (${address}):`, error.message);
    });
  });

  server.on("error", (error: Error) => {
    console.error("[TCP] Erro no servidor:", error.message);
  });

  server.listen(TCP_PORT, TCP_HOST, () => {
    console.log(
      `[TCP] Servidor de chamados ouvindo em ${TCP_HOST}:${TCP_PORT}`,
    );
  });

  return server;
}

