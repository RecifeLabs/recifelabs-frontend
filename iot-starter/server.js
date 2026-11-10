const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// Serve os arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Mantém as informações de conexão disponíveis para clientes externos.
app.get('/api/network-info', (req, res) => {
  res.json({
    url: process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`,
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
