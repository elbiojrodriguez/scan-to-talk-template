const WebSocket = require("ws");
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Servidor WebSocket ativo na porta ${PORT}`);

const donos = {}; // ID do dono → conexão WebSocket

wss.on("connection", (ws) => {
  console.log("🟢 Nova conexão WebSocket");

  ws.on("message", (msg) => {
    const texto = msg.toString();
    console.log(`📨 Mensagem recebida: ${texto}`);

    const [tipo, id] = texto.split(":");

    if (tipo === "owner") {
      donos[id] = ws;
      console.log(`✅ Dono registrado com ID: ${id}`);
    }

    if (tipo === "visitante") {
      const donoWs = donos[id];
      if (donoWs && donoWs.readyState === WebSocket.OPEN) {
        donoWs.send(`visitante:${id}`);
        console.log(`📤 Enviado para dono: visitante:${id}`);
      } else {
        console.log(`❌ Dono com ID ${id} não está conectado`);
      }
    }
  });

  ws.on("close", () => {
    for (const id in donos) {
      if (donos[id] === ws) {
        delete donos[id];
        console.log(`🔴 Dono desconectado: ${id}`);
      }
    }
  });
});
