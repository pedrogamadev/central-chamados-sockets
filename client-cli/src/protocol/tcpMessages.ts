import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../models/Ticket";

export interface CreateTicketPayload {
  titulo: string;
  descricao: string;
  prioridade: TicketPriority;
  solicitante: string;
}

export type ListTicketsPayload = Record<string, never>;

export interface GetTicketPayload {
  id: number;
}

export interface UpdateTicketStatusPayload {
  id: number;
  status: TicketStatus;
}

export type TcpRequest =
  | { type: "CREATE_TICKET"; payload: CreateTicketPayload }
  | { type: "LIST_TICKETS"; payload: ListTicketsPayload }
  | { type: "GET_TICKET"; payload: GetTicketPayload }
  | { type: "UPDATE_TICKET_STATUS"; payload: UpdateTicketStatusPayload };

export interface TcpResponse {
  success: boolean;
  message: string;
  data?: Ticket | Ticket[] | null;
}

