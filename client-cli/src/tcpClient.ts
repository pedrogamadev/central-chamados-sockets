import net from "net";
import type { TcpRequest, TcpResponse } from "./protocol/tcpMessages";

const TCP_HOST = "127.0.0.1";
const TCP_PORT = 5000;

let buffer = "";
const pendingResolvers: Array<(response: TcpResponse) => void> = [];
const pendingRejecters: Array<(error: Error) => void> = [];

const client = net.createConnection(
  { host: TCP_HOST, port: TCP_PORT },
  () => {
    console.log(
      `Conectado ao servidor de chamados em ${TCP_HOST}:${TCP_PORT}`,
    );
  },
);

const connectionReady = new Promise<void>((resolve) => {
  if (client.readyState === "open") {
    resolve();
  } else {
    client.once("connect", () => resolve());
  }
});

client.on("data", (chunk: Buffer) => {
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
      const response = JSON.parse(rawMessage) as TcpResponse;
      const resolve = pendingResolvers.shift();
      const reject = pendingRejecters.shift();

      if (resolve) {
        resolve(response);
      } else if (reject) {
        reject(new Error("Resposta inesperada do servidor."));
      }
    } catch (error) {
      console.error("Resposta inválida do servidor:", error);
    }

    newlineIndex = buffer.indexOf("\n");
  }
});

client.on("error", (error: Error) => {
  console.error("Erro na conexão TCP:", error.message);

  while (pendingRejecters.length > 0) {
    const reject = pendingRejecters.shift();
    if (reject) {
      reject(error);
    }
  }

  pendingResolvers.length = 0;
});

client.on("close", () => {
  console.log("Conexão com o servidor TCP encerrada.");
});

export async function sendRequest(req: TcpRequest): Promise<TcpResponse> {
  await connectionReady;

  return new Promise<TcpResponse>((resolve, reject) => {
    pendingResolvers.push(resolve);
    pendingRejecters.push(reject);

    try {
      client.write(`${JSON.stringify(req)}\n`);
    } catch (error) {
      pendingResolvers.pop();
      pendingRejecters.pop();
      reject(error as Error);
    }
  });
}

export function closeTcpClient() {
  if (!client.destroyed) {
    client.end();
  }
}

