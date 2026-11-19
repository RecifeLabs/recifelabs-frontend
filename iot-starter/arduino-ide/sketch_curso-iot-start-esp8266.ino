#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <PubSubClient.h> // Instale via Library Manager: "PubSubClient" de Nick O'Leary

// --- CONFIGURACOES DE REDE E BROKER ---
const char* WIFI_SSID     = "SSID";
const char* WIFI_PASSWORD = "WIFIPASS";

const char* MQTT_BROKER   = "broker.emqx.io";
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "recifelabs/iot/esp8266/led";
const char* MQTT_STATUS_TOPIC_BASE = "recifelabs/iot/esp8266/status/";
const unsigned long HEARTBEAT_INTERVAL = 5000;
const char* TRACCAR_SERVER_URL = "http://demo.traccar.org:5055/";
const float FIXED_LATITUDE = -8.0476;
const float FIXED_LONGITUDE = -34.8770;
const float FIXED_SPEED = 0.0;
const float FIXED_ALTITUDE = 0.0;

// LED integrado da placa NodeMCU (D4/GPIO2). Em algumas NodeMCU,
// o LED integrado possui logica invertida (LOW liga, HIGH desliga).
const int LED_PIN = LED_BUILTIN;

WiFiClient espClient;
PubSubClient client(espClient);
String deviceId;
String statusTopic;
unsigned long lastHeartbeat = 0;
bool traccarConnected = false;

void publishPresence(const char* status, bool retained) {
  String payload = "{\"deviceId\":\"" + deviceId + "\",\"status\":\"" + status +
                   "\",\"traccarConnected\":" + String(traccarConnected ? "true" : "false") +
                   ",\"timestamp\":" + String(millis()) + "}";
  client.publish(statusTopic.c_str(), payload.c_str(), retained);
}

bool sendLocationToTraccar() {
  if (TRACCAR_SERVER_URL[0] == '\0') {
    Serial.println("Traccar: TRACCAR_SERVER_URL nao configurada");
    return false;
  }

  WiFiClient traccarClient;
  HTTPClient http;
  String url = String(TRACCAR_SERVER_URL) +
               "?id=" + deviceId +
               "&lat=" + String(FIXED_LATITUDE, 6) +
               "&lon=" + String(FIXED_LONGITUDE, 6) +
               "&speed=" + String(FIXED_SPEED, 1) +
               "&altitude=" + String(FIXED_ALTITUDE, 1);

  if (!http.begin(traccarClient, url)) {
    Serial.println("Traccar: falha ao iniciar requisicao HTTP");
    return false;
  }

  http.setTimeout(5000);
  int responseCode = http.GET();
  Serial.print("Traccar: HTTP ");
  Serial.println(responseCode);
  http.end();
  return responseCode >= 200 && responseCode < 300;
}

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

// Funcao executada automaticamente sempre que chega uma mensagem MQTT
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Verifica o comando no JSON recebido e aciona o LED integrado
  if (message.indexOf("\"led\":\"ON\"") >= 0) {
    digitalWrite(LED_PIN, LOW);
    Serial.println("-> LED integrado LIGADO");
  } else if (message.indexOf("\"led\":\"OFF\"") >= 0) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("-> LED integrado DESLIGADO");
  }
}

// Reconecta ao Broker MQTT caso a conexao caia
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Conectando ao Broker MQTT...");
    String clientId = "ESP8266_RecifeLabs_" + deviceId;

    if (client.connect(clientId.c_str(), statusTopic.c_str(), 0, true,
                       "{\"status\":\"offline\"}")) {
      Serial.println("Conectado!");
      // Assina o topico para escutar os comandos vindos do navegador
      client.subscribe(MQTT_TOPIC);
      publishPresence("online", true);
      lastHeartbeat = millis();
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
  digitalWrite(LED_PIN, HIGH); // LED integrado inicia desligado

  Serial.begin(115200);
  setupWiFi();

  deviceId = WiFi.macAddress();
  deviceId.replace(":", "");
  statusTopic = String(MQTT_STATUS_TOPIC_BASE) + deviceId;
  Serial.print("ID do dispositivo: ");
  Serial.println(deviceId);

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop(); // Mantem a conexao MQTT ativa e escutando mensagens

  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    traccarConnected = sendLocationToTraccar();
    publishPresence("online", false);
    lastHeartbeat = millis();
  }
}
