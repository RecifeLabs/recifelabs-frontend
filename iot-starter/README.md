
Gerar o código base comentado (Node.js + Frontend + ESP32) para o repositório do aluno

Aqui está o código base completo e comentado para o repositório oficial do aluno no GitHub (recife-labs-iot-starter). A estrutura foi dividida em três partes simples para que o estudante compreenda claramente onde roda cada camada da arquitetura: o servidor web em Node.js, a interface com QR Code e MQTT via WebSocket, e o firmware do ESP32.

Estrutura de Pastas do Repositório

text
recife-labs-iot-starter/
├── firmware/
│   └── esp32_mqtt_led.ino
├── public/
│   └── index.html
├── package.json
└── server.js
Use o código com cuidado.

1. Configuração do Projeto (package.json)

Este arquivo define as dependências mínimas do servidor Node.js para servir a aplicação web e facilitar o teste local.
json
{
  "name": "recife-labs-iot-starter",
  "version": "1.0.0",
  "description": "Controle de ESP32 via MQTT e WebSockets - Recife Labs",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
Use o código com cuidado.

2. Backend Node.js (server.js)

O servidor Node.js entrega a interface web e detecta automaticamente o IP da rede local para que o QR Code funcione imediatamente no celular do aluno.
javascript
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
Use o código com cuidado.

3. Frontend Web + MQTT via WebSocket + QR Code (public/index.html)

Interface escura (Prompt First / padrão Recife Labs) que conecta o navegador diretamente ao Broker MQTT via WebSocket seguro (WSS) e gera o QR Code de acesso.
html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recife Labs — Controle IoT em Tempo Real</title>
  <!-- Biblioteca MQTT.js via CDN para conexão WebSocket no Browser -->
  <script src="https://unpkg.com"></script>
  <!-- Biblioteca QRCode.js para gerar o acesso instantâneo -->
  <script src="https://cloudflare.com"></script>
  <style>
    :root {
      --bg: #0b0f19;
      --card: #131a2a;
      --accent: #00f5a0;
      --text: #e2e8f0;
      --muted: #64748b;
    }
    body {
      margin: 0;
      font-family: 'Courier New', Courier, monospace;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: var(--card);
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 32px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(0, 245, 160, 0.1);
      color: var(--accent);
      margin-bottom: 16px;
    }
    h1 { font-size: 20px; margin: 0 0 8px; }
    p { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
    .led-indicator {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin: 0 auto 24px;
      background: #1e293b;
      border: 2px solid #334155;
      transition: all 0.3s ease;
    }
    .led-indicator.on {
      background: #38bdf8;
      border-color: #7dd3fc;
      box-shadow: 0 0 30px #38bdf8;
    }
    button {
      width: 100%;
      padding: 14px;
      font-size: 15px;
      font-weight: bold;
      font-family: inherit;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: var(--accent);
      color: #0b0f19;
      transition: opacity 0.2s;
    }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    .qr-section {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px dashed #334155;
    }
    #qrcode {
      background: #ffffff;
      padding: 10px;
      display: inline-block;
      border-radius: 8px;
      margin-top: 10px;
    }
    .status { font-size: 12px; margin-top: 16px; color: var(--muted); }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">recife-labs://telemetry</span>
    <h1>Controle LED D2 (ESP32)</h1>
    <p>Comunicação via MQTT sobre WebSocket</p>

    <!-- Representação visual do LED físico -->
    <div id="ledVisual" class="led-indicator"></div>

    <button id="toggleBtn" disabled>Conectando ao Broker...</button>
    <div id="statusText" class="status">Status: Inicializando...</div>

    <!-- Área do QR Code para controle pelo celular -->
    <div class="qr-section">
      <p style="margin-bottom: 6px;">Escaneie para controlar pelo celular:</p>
      <div id="qrcode"></div>
    </div>
  </div>

  <script>
    // Tópico MQTT exclusivo (o aluno pode personalizar o ID para evitar conflito)
    const TOPIC = 'recifelabs/iot/esp32/led';
    // Broker público gratuito com suporte a WebSocket Seguro (WSS)
    const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

    let ledState = false;
    const toggleBtn = document.getElementById('toggleBtn');
    const ledVisual = document.getElementById('ledVisual');
    const statusText = document.getElementById('statusText');

    // 1. Busca a URL da rede local no backend Node.js e gera o QR Code
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        new QRCode(document.getElementById('qrcode'), {
          text: data.url,
          width: 128,
          height: 128
        });
      });

    // 2. Conecta o navegador diretamente ao Broker MQTT via WebSocket
    const client = mqtt.connect(BROKER_URL, {
      clientId: 'recifelabs_web_' + Math.random().toString(16).substring(2, 8)
    });

    client.on('connect', () => {
      statusText.innerText = 'Status: Conectado via WebSocket';
      toggleBtn.disabled = false;
      updateUI();

      // Assina o tópico para sincronizar o estado caso outro celular clique
      client.subscribe(TOPIC);
    });

    // 3. Recebe atualizações em tempo real (sincroniza múltiplos navegadores)
    client.on('message', (topic, message) => {
      if (topic === TOPIC) {
        const payload = JSON.parse(message.toString());
        ledState = payload.led === 'ON';
        updateUI();
      }
    });

    // 4. Publica o comando MQTT ao clicar no botão
    toggleBtn.addEventListener('click', () => {
      const nextState = !ledState ? 'ON' : 'OFF';
      const payload = JSON.stringify({
        led: nextState,
        source: 'web-client',
        timestamp: Date.now()
      });

      // Publica com retain=true para manter o último estado salvo no broker
      client.publish(TOPIC, payload, { qos: 1, retain: true });
    });

    function updateUI() {
      if (ledState) {
        ledVisual.classList.add('on');
        toggleBtn.innerText = 'DESLIGAR LED D2';
      } else {
        ledVisual.classList.remove('on');
        toggleBtn.innerText = 'LIGAR LED D2';
      }
    }
  </script>
</body>
</html>
Use o código com cuidado.

4. Firmware do Microcontrolador (firmware/esp32_mqtt_led.ino)

Código para Arduino IDE / PlatformIO. Ele conecta o ESP32 ao Wi-Fi, assina o mesmo tópico do navegador e controla o pino D2 (LED azul embutido na maioria das placas ESP32 DevKit).
cpp
#include <WiFi.h>
#include <PubSubClient.h> // Instale via Library Manager: "PubSubClient" de Nick O'Leary

// --- CONFIGURAÇÕES DE REDE E BROKER ---
const char* WIFI_SSID     = "SEU_WIFI_AQUI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI_AQUI";

const char* MQTT_BROKER   = "broker.emqx.io";
const int   MQTT_PORT     = 1883; // Porta TCP padrão para microcontroladores
const char* MQTT_TOPIC    = "recifelabs/iot/esp32/led";

// Pino D2 (GPIO 2) - LED interno da placa ESP32
const int LED_PIN = 2;

WiFiClient espClient;
PubSubClient client(espClient);

// Conecta ao Wi-Fi
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi conectado! IP: ");
  Serial.println(WiFi.localIP());
}

// Função executada automaticamente sempre que chega uma mensagem MQTT
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Verifica o comando no JSON recebido e aciona o LED D2
  if (message.indexOf("\"led\":\"ON\"") >= 0) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("-> LED D2 LIGADO");
  } else if (message.indexOf("\"led\":\"OFF\"") >= 0) {
    digitalWrite(LED_PIN, LOW);
    Serial.println("-> LED D2 DESLIGADO");
  }
}

// Reconecta ao Broker MQTT caso a conexão caia
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Conectando ao Broker MQTT...");
    String clientId = "ESP32_RecifeLabs_" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("Conectado!");
      // Assina o tópico para escutar os comandos vindos do navegador
      client.subscribe(MQTT_TOPIC);
    } else {
      Serial.print("Falha, rc=");
      Serial.print(client.state());
      Serial.println(" Tentando novamente em 3 segundos...");
      delay(3000);
    }
  }
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); // Inicia desligado

  Serial.begin(115200);
  setupWiFi();

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop(); // Mantém a conexão MQTT ativa e escutando mensagens
}
Use o código com cuidado.

Como o Aluno Testa em 3 Passos (Para colocar no README.md)

1. Subir o Servidor Web. No terminal, dentro da pasta do projeto, execute npm install e depois npm start.
2. Gravar o ESP32. Abra o arquivo firmware/esp32_mqtt_led.ino, preencha o nome e a senha do seu Wi-Fi e envie o código para a placa.
3. Controlar via QR Code. Abra http://localhost:3000 no computador, aponte a câmera do celular para o QR Code na tela e toque no botão para acender ou apagar o LED D2 em tempo real.
Agora que temos o código base pronto, qual deve ser o próximo passo para estruturar o lançamento?
• Escrever os roteiros das 5 aulas baseados exatamente nesse código
• Criar a página de inscrição/vendas da Eduzz e o texto de boas-vindas do Nutror
