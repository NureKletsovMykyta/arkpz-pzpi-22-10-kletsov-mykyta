#include <WiFi.h>
#include <PubSubClient.h>
#define BUTTON_PIN 32
#define BUTTON2_PIN 33
#define BUTTON3_PIN 25

// Налаштування Wi-Fi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Налаштування MQTT
const char* mqttServer = "broker.hivemq.com"; // або IP-адреса вашого MQTT-брокера
const int mqttPort = 1883;
volatile int i = 0;
volatile int j = 0;
volatile int n = 0;

// Створюємо об'єкт WiFi та MQTT-клієнта
WiFiClient espClient;
PubSubClient client(espClient);

// Функція для підключення до Wi-Fi
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Підключення до Wi-Fi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.print("Підключено! IP адреса: ");
  Serial.println(WiFi.localIP());
}

// Функція для підключення до MQTT-брокера
void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Підключення до MQTT...");
    // Створюємо унікальний клієнтський ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("підключено!");
    } else {
      Serial.print("Помилка підключення, код: ");
      Serial.print(client.state());
      Serial.println(" Повторна спроба через 5 секунд");
      delay(5000);
    }
  }
}

void IRAM_ATTR buttonISR() {
    i++;
}

void IRAM_ATTR button2ISR() { j++; }
void IRAM_ATTR button3ISR() { n++; }

void setup() {
  Serial.begin(115200);
  setupWiFi();
  client.setServer(mqttServer, mqttPort);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(BUTTON2_PIN, INPUT_PULLUP);
    pinMode(BUTTON3_PIN, INPUT_PULLUP);

    // Призначаємо переривання для кожної кнопки
   

  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);
   attachInterrupt(digitalPinToInterrupt(BUTTON2_PIN), button2ISR, FALLING);
    attachInterrupt(digitalPinToInterrupt(BUTTON3_PIN), button3ISR, FALLING);

}


void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();
    
  // Симулюємо зчитування даних (наприклад, кількість авто на різних ділянках)
 // int count1 = random(0, 2); // статус датчика (активний\неактивний)
  //int count2 = random(1, 4); // номер датчика (на в'їзді, всередені, на виїзді)
  //int count3 = random(0, 20); // кількість авто наприклад, від 0 до 20 авто
  //if (count1==0) {count3=0;}
//  String payload = "{\"Status\": " + String(count1) + ", \"Type\": " + String(count2) + ", \"Count\": " + String(count3) +"}";
 // int buttonState = digitalRead(BUTTON_PIN);  // Зчитуємо стан кнопки
  

   // if (buttonState == LOW) {  // Якщо кнопка натиснута (контакт з GND)
    //    Serial.println("Кнопка натиснута!");
   //     i++ ;
   // } 
String payload = "{\"Entrance\": " + String(i) + ", \"Into\": " + String(j) + ", \"Exit\": " + String(n) +"}";
  
  // Публікуємо дані в топік "iot/count"
  if (client.publish("iot/count", payload.c_str())) {
    Serial.print("Дані відправлено: ");
    Serial.println(payload);
  } else {
    Serial.println("Не вдалося відправити дані");
  }
  i=0;
  j=0;
  n=0;
  delay(5000); // надсилання даних кожні 5 секунд
  
}