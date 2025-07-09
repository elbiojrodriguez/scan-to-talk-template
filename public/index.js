const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`);

const donos = {}; // Mapeia IDs de dono → conexão WebSocket

wss.on('connection', (ws) => {
  console.log('🟢 Nova conexão recebida');

  ws.on('message', (msg) => {
    const texto = msg.toString();
    console.log(`📨 Mensagem recebida: ${texto}`);

    const [tipo, id] = texto.split(':');

    if (tipo === 'owner') {
      donos[id] = ws;
      console.log(`✅ Dono registrado com ID: ${id}`);
    }

    if (tipo === 'visitante') {
      console.log(`🔔 Visitante chamou com ID: ${id}`);
      const donoWs = donos[id];

      if (donoWs && donoWs.readyState === WebSocket.OPEN) {
        donoWs.send(`visitante:${id}`);
        console.log(`📤 Mensagem enviada ao dono: visitante:${id}`);
      } else {
        console.log(`❌ Dono com ID ${id} não está conectado ou não foi registrado`);
      }
    }
  });

  ws.on('close', () => {
    // Remove dono da lista se ele se desconectar
    for (const id in donos) {
      if (donos[id] === ws) {
        delete donos[id];
        console.log(`🔴 Dono desconectado: ${id}`);
        break;
      }
    }
  });
});
