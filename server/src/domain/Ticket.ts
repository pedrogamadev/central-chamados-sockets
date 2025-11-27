export type TicketStatus = "ABERTO" | "EM_ATENDIMENTO" | "FECHADO";

export type TicketPriority = "BAIXA" | "MEDIA" | "ALTA";

export interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  status: TicketStatus;
  prioridade: TicketPriority;
  solicitante: string;
  criadoEm: string;
}

export interface CreateTicketInput {
  titulo: string;
  descricao: string;
  prioridade: TicketPriority;
  solicitante: string;
}

