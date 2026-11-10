const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve os arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota auxiliar para descobrir o IP local da máquina na rede Wi-Fi
// Isso permite gerar um QR Code válido para o celular acessar
app.get('/api/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Filtra apenas endereços IPv4 externos (rede local)
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }

  res.json({
    url: `http://${localIp}:${PORT}`,
    broker: 'wss://broker.emqx.io:8084/mqtt',
    topic: 'recifelabs/iot/esp32/led'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('==================================================');
  console.log('🚀 Recife Labs IoT Server rodando!');
  console.log(`📡 Acesse no navegador: http://localhost:${PORT}`);
  console.log('==================================================');
});
