import readline from "readline";
import { sendRequest, closeTcpClient } from "./tcpClient";
import {
  TcpRequest,
  TcpResponse,
} from "./protocol/tcpMessages";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "./models/Ticket";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function printTicket(ticket: Ticket) {
  console.log(`ID: ${ticket.id}`);
  console.log(`Título: ${ticket.titulo}`);
  console.log(`Descrição: ${ticket.descricao}`);
  console.log(`Status: ${ticket.status}`);
  console.log(`Prioridade: ${ticket.prioridade}`);
  console.log(`Solicitante: ${ticket.solicitante}`);
  console.log(`Criado em: ${ticket.criadoEm}`);
  console.log("---------------");
}

function printResponse(response: TcpResponse) {
  console.log(response.message);
  if (response.data) {
    if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        console.log("Nenhum chamado encontrado.");
      } else {
        response.data.forEach((ticket) => printTicket(ticket));
      }
    } else {
      printTicket(response.data);
    }
  }
}

function normalizePriority(input: string): TicketPriority | null {
  const value = input.trim().toUpperCase();

  if (value === "BAIXA" || value === "MEDIA" || value === "ALTA") {
    return value;
  }

  return null;
}

function normalizeStatus(input: string): TicketStatus | null {
  const value = input.trim().toUpperCase();

  if (value === "ABERTO" || value === "EM_ATENDIMENTO" || value === "FECHADO") {
    return value;
  }

  return null;
}

async function handleRequest(request: TcpRequest) {
  try {
    const response = await sendRequest(request);
    printResponse(response);
  } catch (error) {
    console.error("Falha ao comunicar com o servidor:", error);
  }
}

async function handleCreateTicket() {
  const titulo = (await ask("Título: ")).trim();
  const descricao = (await ask("Descrição: ")).trim();
  const prioridadeInput = await ask("Prioridade (BAIXA|MEDIA|ALTA): ");
  const prioridade = normalizePriority(prioridadeInput);
  const solicitante = (await ask("Solicitante: ")).trim();

  if (!prioridade) {
    console.log("Prioridade inválida.");
    return;
  }

  await handleRequest({
    type: "CREATE_TICKET",
    payload: { titulo, descricao, prioridade, solicitante },
  });
}

async function handleListTickets() {
  await handleRequest({ type: "LIST_TICKETS", payload: {} });
}

async function handleGetTicket() {
  const idInput = await ask("ID do chamado: ");
  const id = Number.parseInt(idInput, 10);

  if (Number.isNaN(id)) {
    console.log("ID inválido.");
    return;
  }

  await handleRequest({ type: "GET_TICKET", payload: { id } });
}

async function handleUpdateTicketStatus() {
  const idInput = await ask("ID do chamado: ");
  const id = Number.parseInt(idInput, 10);

  if (Number.isNaN(id)) {
    console.log("ID inválido.");
    return;
  }

  const statusInput = await ask("Novo status (ABERTO|EM_ATENDIMENTO|FECHADO): ");
  const status = normalizeStatus(statusInput);

  if (!status) {
    console.log("Status inválido.");
    return;
  }

  await handleRequest({
    type: "UPDATE_TICKET_STATUS",
    payload: { id, status },
  });
}

async function loopMenu() {
  let running = true;

  while (running) {
    console.log("\n=== Central de Chamados (CLI) ===");
    console.log("1) Abrir novo chamado");
    console.log("2) Listar chamados");
    console.log("3) Ver detalhes de um chamado");
    console.log("4) Atualizar status de um chamado");
    console.log("5) Sair");

    const option = (await ask("Escolha uma opção: ")).trim();

    switch (option) {
      case "1":
        await handleCreateTicket();
        break;
      case "2":
        await handleListTickets();
        break;
      case "3":
        await handleGetTicket();
        break;
      case "4":
        await handleUpdateTicketStatus();
        break;
      case "5":
        running = false;
        break;
      default:
        console.log("Opção inválida.");
    }
  }
}

export async function mainMenu() {
  try {
    await loopMenu();
  } finally {
    rl.close();
    closeTcpClient();
    process.exit(0);
  }
}

