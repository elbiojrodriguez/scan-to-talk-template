const urlParams = new URLSearchParams(window.location.search);
const visitorId = urlParams.get("id");
const visitorName = urlParams.get("name");

const nomeVisitante = document.getElementById("nomeVisitante");
const botaoChamar = document.getElementById("botaoChamar");
const videoPreview = document.getElementById("videoPreview");

if (visitorId) {
  nomeVisitante.innerText = `👤 Visitante: ${decodeURIComponent(visitorName || "Anônimo")}`;
}

const socket = new WebSocket("wss://lemur-websocket.onrender.com");

socket.addEventListener("open", () => {
  botaoChamar.disabled = false;
});

botaoChamar.addEventListener("click", () => {
  if (socket.readyState === WebSocket.OPEN && visitorId) {
    socket.send(`visitante:${visitorId}`);
    botaoChamar.innerText = "Chamando... 📡";
    botaoChamar.disabled = true;
  }
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    videoPreview.srcObject = stream;

    const peerConnection = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => {
        console.log("📨 Offer local criada:");
        console.log(peerConnection.localDescription.sdp);

        if (socket.readyState === WebSocket.OPEN && visitorId) {
          const sdpEncoded = btoa(peerConnection.localDescription.sdp);
          const offerMensagem = `offer:${visitorId}:${sdpEncoded}`;
          socket.send(offerMensagem);
          console.log("📤 Offer enviada ao dono via WebSocket");
        }
      })
      .catch(error => {
        console.error("❌ Erro ao criar offer:", error);
      });
  })
  .catch(error => {
    console.warn("Erro ao acessar câmera:", error);
  });
