import type {
  CreateTicketInput,
  Ticket,
  TicketStatus,
} from "../domain/Ticket";

class TicketService {
  private tickets: Ticket[] = [];
  private nextId = 1;

  createTicket(data: CreateTicketInput): Ticket {
    const newTicket: Ticket = {
      id: this.nextId++,
      titulo: data.titulo,
      descricao: data.descricao,
      prioridade: data.prioridade,
      solicitante: data.solicitante,
      status: "ABERTO",
      criadoEm: new Date().toISOString(),
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  listTickets(): Ticket[] {
    return [...this.tickets];
  }

  getTicketById(id: number): Ticket | null {
    return this.tickets.find((ticket) => ticket.id === id) ?? null;
  }

  updateTicketStatus(id: number, status: TicketStatus): Ticket | null {
    const ticket = this.getTicketById(id);

    if (!ticket) {
      return null;
    }

    ticket.status = status;
    return ticket;
  }
}

export const ticketService = new TicketService();

