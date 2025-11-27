import net from "net";
import readline from "readline";

const HOST = "127.0.0.1";
const PORT = 5000;

const client = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log(`Conectado ao servidor em ${HOST}:${PORT}`);
});

client.on("data", (data) => {
  console.log("Resposta do servidor:", data.toString().trim());
});

client.on("end", () => {
  console.log("Conexão encerrada pelo servidor");
  process.exit(0);
});

client.on("error", (err) => {
  console.error("Erro na conexão:", err.message);
});

// Interface de leitura do teclado
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar() {
  rl.question("Digite uma mensagem para o servidor (ou 'sair'): ", (answer) => {
    if (answer.toLowerCase() === "sair") {
      client.end();
      rl.close();
      return;
    }

    client.write(answer + "\n");
    perguntar();
  });
}

perguntar();
