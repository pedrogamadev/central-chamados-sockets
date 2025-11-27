import type {
  CreateTicketInput,
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../domain/Ticket";

export type CreateTicketPayload = CreateTicketInput;

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

export type TcpRequestType = TcpRequest["type"];

