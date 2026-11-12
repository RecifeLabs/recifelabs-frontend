const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'wss://broker.emqx.io:8084/mqtt';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'recifelabs/iot/esp32/led';
const MQTT_STATUS_TOPIC = process.env.MQTT_STATUS_TOPIC || 'recifelabs/iot/esp32/status/#';
const DEVICE_SIGNAL_TIMEOUT = Number(process.env.DEVICE_SIGNAL_TIMEOUT || 15000);

// Serve os arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Mantém as informações de conexão disponíveis para clientes externos.
app.get('/api/network-info', (req, res) => {
  res.json({
    url: process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`,
    broker: MQTT_BROKER_URL,
    topic: MQTT_TOPIC,
    statusTopic: MQTT_STATUS_TOPIC,
    deviceSignalTimeout: DEVICE_SIGNAL_TIMEOUT
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('==================================================');
  console.log('🚀 Recife Labs IoT Server rodando!');
  console.log(`📡 Acesse no navegador: http://localhost:${PORT}`);
  console.log('==================================================');
});
