# Recife Labs IoT Starter

Aplicação de demonstração para controlar o LED integrado de um ESP32 pelo
navegador, usando MQTT e WebSockets. O projeto também monitora a presença do
ESP32 por meio de um identificador baseado no endereço MAC, heartbeat e Last
Will and Testament (LWT).

## Como funciona

```text
Navegador
  ├─ HTTP → server.js
  │          └─ entrega public/index.html e /api/network-info
  └─ WSS → broker.emqx.io
             ├─ tópico de comandos → ESP32
             └─ tópico de presença  → Navegador

ESP32
  └─ MQTT TCP → broker.emqx.io:1883
```

O `server.js` não mantém uma conexão MQTT. Ele serve a interface e entrega ao
frontend a configuração do broker, dos tópicos e do timeout de presença. A
conexão MQTT do navegador é feita diretamente por MQTT.js via WebSocket seguro.

## Estrutura

```text
iot-starter/
├── arduino-ide/
│   └── sketch_curso-iot-start.ino  # Firmware do ESP32
├── public/
│   └── index.html                  # Interface web e cliente MQTT
├── package.json
├── server.js                       # Servidor Express
└── README.md
```

## Pré-requisitos

- Node.js 18 ou superior
- Arduino IDE com suporte à placa ESP32
- Biblioteca `PubSubClient` instalada na Arduino IDE
- ESP32 DevKit ou placa compatível
- Wi-Fi com acesso à internet

## Executar localmente

```bash
cd iot-starter
npm install
npm start
```

O servidor escuta em `0.0.0.0:8000`. Abra `http://localhost:8000` no
navegador. Para acessar pelo celular na mesma rede, use o endereço IP da
máquina que está executando o servidor.

O QR Code da interface usa `window.location.origin`, portanto aponta
automaticamente para o endereço pelo qual a página foi acessada. Em produção,
por exemplo, ele aponta para `https://start.labs.recife.br`.

## Configurar e gravar o ESP32

Abra `arduino-ide/sketch_curso-iot-start.ino`, informe as credenciais da rede e
grave o firmware na placa:

```cpp
const char* WIFI_SSID     = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";
```

Use a placa `ESP32 Dev Module` e o Monitor Serial em `115200` baud. O firmware
exibe o MAC usado como identificador do dispositivo e o estado da conexão.

## MQTT e presença do dispositivo

Configuração padrão:

| Finalidade | Valor |
|---|---|
| Broker MQTT do ESP32 | `broker.emqx.io:1883` |
| Broker MQTT do navegador | `wss://broker.emqx.io:8084/mqtt` |
| Comandos do LED | `recifelabs/iot/esp32/led` |
| Presença | `recifelabs/iot/esp32/status/<MAC>` |
| Intervalo do heartbeat | 5 segundos |
| Timeout no frontend | 15 segundos |

O ESP32:

1. Obtém `WiFi.macAddress()` e remove os dois-pontos para criar o `deviceId`.
2. Usa esse ID no client ID MQTT e no tópico individual de presença.
3. Publica `online` ao conectar, com mensagem retida.
4. Publica um heartbeat `online` a cada 5 segundos.
5. Configura uma mensagem LWT `{"status":"offline"}` para o broker publicar
   quando a conexão for perdida inesperadamente.

Exemplo de presença online:

```json
{
  "deviceId": "AABBCCDDEEFF",
  "status": "online",
  "timestamp": 123456
}
```

O frontend assina `recifelabs/iot/esp32/status/#`. Ao receber um sinal online,
exibe o MAC e acende a bolinha verde. Se nenhum sinal chegar por 15 segundos,
exibe o dispositivo como desconectado.

Os comandos publicados pelo botão têm este formato:

```json
{
  "led": "ON",
  "source": "web-client",
  "timestamp": 1730000000000
}
```

O último comando do LED é publicado com `retain=true`, permitindo que novos
clientes recebam o estado mais recente.

## API do servidor

### `GET /api/network-info`

Retorna a URL pública da aplicação e a configuração consumida pelo frontend:

```json
{
  "url": "https://start.labs.recife.br",
  "broker": "wss://broker.emqx.io:8084/mqtt",
  "topic": "recifelabs/iot/esp32/led",
  "statusTopic": "recifelabs/iot/esp32/status/#",
  "deviceSignalTimeout": 15000
}
```

`url` usa `PUBLIC_URL` quando definida; caso contrário, é montada a partir da
requisição recebida. As demais configurações podem ser sobrescritas no
ambiente do servidor:

```bash
PUBLIC_URL=https://start.labs.recife.br
MQTT_BROKER_URL=wss://broker.emqx.io:8084/mqtt
MQTT_TOPIC=recifelabs/iot/esp32/led
MQTT_STATUS_TOPIC=recifelabs/iot/esp32/status/#
DEVICE_SIGNAL_TIMEOUT=15000
npm start
```

## Deploy em produção

Execute o Node.js na porta interna `8000`:

```bash
cd iot-starter
npm install
PUBLIC_URL=https://start.labs.recife.br \
NODE_ENV=production \
pm2 start server.js --name recifelabs-start
pm2 save
```

Configure o Nginx para encaminhar `start.labs.recife.br` para
`http://127.0.0.1:8000` e preservar os cabeçalhos de proxy:

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Depois, valide e recarregue o Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

O certificado TLS deve estar configurado para `start.labs.recife.br`, pois o
frontend usa WebSocket seguro (`wss://`) no navegador.

## Verificação rápida

1. Abra a aplicação e confirme `Status: Conectado via WebSocket`.
2. Ligue o ESP32 e confirme a bolinha verde e o MAC do dispositivo.
3. Pressione o botão e observe o LED D2.
4. Desligue ou desconecte o ESP32 e confirme o estado desconectado após até
   15 segundos.
