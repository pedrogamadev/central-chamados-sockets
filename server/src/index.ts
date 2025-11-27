import net from "net";

const HOST = "127.0.0.1";
const PORT = 5000;

const server = net.createServer((socket) => {
  console.log("Cliente conectado:", socket.remoteAddress, socket.remotePort);

  socket.on("data", (data) => {
    const msg = data.toString().trim();
    console.log("Recebido do cliente:", msg);

    // Resposta simples por enquanto
    socket.write(`Servidor recebeu: ${msg}\n`);
  });

  socket.on("end", () => {
    console.log("Cliente desconectado");
  });

  socket.on("error", (err) => {
    console.error("Erro no socket:", err.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor ouvindo em ${HOST}:${PORT}`);
});
