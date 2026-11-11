🚀 Recife Labs — IoT na Prática: Controle de Hardware em Tempo Real

Curso Nivelamento / Porta de Entrada Recife Labs

Saia do zero e controle um dispositivo físico pelo navegador do seu celular usando QR Code, WebSockets e MQTT sem depender de aplicativos de terceiros.

📁 Estrutura do Repositório

recife-labs-iot-starter/
├── firmware/
│   └── esp32_mqtt_led.ino   # Código C++ para o microcontrolador ESP32
├── public/
│   └── index.html           # Interface Web (Dark Mode) + MQTT via WebSocket + QR Code
├── package.json             # Dependências do projeto Node.js
├── README.md                # Guia completo de instalação e deploy
└── server.js                # Servidor Express com detecção automática de IP/Dominio


🛠️ 1. Pré-requisitos

Node.js (v18 ou superior)

Arduino IDE com suporte ao ESP32 instalado

Biblioteca Arduino: PubSubClient (por Nick O'Leary)

Placa ESP32 (DevKit v1 ou similar)

Cabo Micro-USB / USB-C com suporte a transferência de dados

💻 2. Executando Localmente (Ambiente do Aluno)

Passos no Computador:

Clone este repositório e instale as dependências:

git clone https://github.com/RecifeLabs/recifelabs-frontend.git
cd recifelabs-frontend/iot-starter
npm install


Inicie o servidor Node.js:

npm start


O terminal exibirá o endereço local (ex: http://localhost:8000).

Passos no ESP32:

Abra o arquivo firmware/esp32_mqtt_led.ino na Arduino IDE.

Atualize as variáveis de Wi-Fi com suas credenciais:

const char* WIFI_SSID     = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";


Selecione a placa ESP32 Dev Module, a porta COM correspondente e clique em Carregar.

Abra o Monitor Serial (baudrate 115200) para verificar a conexão com o Wi-Fi e o Broker MQTT.

🌐 3. Servidor e Serviços (MQTT e WebSocket)

Arquitetura de Comunicação

Navegador Web / Celular: Conecta-se ao broker MQTT através de WebSockets Seguros (WSS) na porta 8084 (wss://broker.emqx.io:8084/mqtt).

ESP32: Conecta-se ao mesmo broker MQTT via protocolo TCP puro na porta 1883 (broker.emqx.io:1883).

Tópico Padrão: recifelabs/iot/esp32/led

☁️ 4. Deploy em Produção (VPS Nginx + SSL)

Para disponibilizar o projeto no subdomínio start.labs.recife.br com suporte total a HTTPS e WebSockets:

A. Subir a Aplicação na VPS (Porta Interna 8000)

# Na pasta do projeto na VPS
npm install
PORT=8000 NODE_ENV=production pm2 start server.js --name "recifelabs-start"
pm2 save


B. Configuração do Proxy Reverso no Nginx

Adicione ou edite o arquivo /etc/nginx/sites-available/recifelabs:

# ================================
# 1. REDIRECIONAMENTO HTTP -> HTTPS
# ================================
server {
    listen 80;
    server_name recifelabs.dev www.recifelabs.dev labs.recife.br www.labs.recife.br zpanel.recifelabs.dev start.labs.recife.br;

    location / {
        return 301 https://$host$request_uri;
    }
}

# ================================
# 2. START IOT / CURSO (start.labs.recife.br)
# ================================
server {
    listen 443 ssl;
    server_name start.labs.recife.br;

    ssl_certificate /etc/letsencrypt/live/start.labs.recife.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/start.labs.recife.br/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        
        # Cabeçalhos obrigatórios para WebSockets
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Cabeçalhos padrão de Proxy Reverso
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


C. Emissão do Certificado SSL e Reload

sudo certbot --nginx -d start.labs.recife.br
sudo nginx -t && sudo systemctl reload nginx


🏆 5. Validação de Conclusão e XP

Ao finalizar o projeto:

Faça o push do seu código para o seu repositório pessoal no GitHub.

Envie o link do repositório na área de membros da Nutror / Alpha Class.

O link validado libera o badge "IoT Pioneer" e garante seus pontos de XP na plataforma labs.recife.br.