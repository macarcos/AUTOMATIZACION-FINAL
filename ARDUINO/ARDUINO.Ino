// SISTEMA COMPLETO MEJORADO - Compatible con Web App v2.0
// Sensores: MQ-135 (Gas), DHT11 (Temp/Hum), HC-SR04 (Distancia), YL-69 (Suelo), Buzzer

#include <DHT.h> // Importa la librería para el sensor DHT.

// Configuración DHT11
#define DHT_PIN 3 // Define el pin digital para el sensor DHT11.
#define DHT_TYPE DHT11 // Define el tipo de sensor DHT.
DHT dht(DHT_PIN, DHT_TYPE); // Inicializa el objeto sensor DHT.

// Configuración Sensor Ultrasónico HC-SR04
#define TRIG_PIN 4 // Define el pin "Trigger" (disparador) del ultrasonido.
#define ECHO_PIN 5 // Define el pin "Echo" (respuesta) del ultrasonido.

// Configuración Sensor Humedad Suelo YL-69
#define SOIL_PIN A1 // Define el pin analógico (A1) para el sensor de suelo.

// Configuración Buzzer
#define BUZZER_PIN 6 // Define el pin digital para el buzzer (alarma).

// Configuración MQ-135 GAS SENSOR
const int mq135Pin = A0; // Define el pin analógico (A0) para el sensor de gas.
int valorReferencia = 0; // Almacena el valor "limpio" del aire al calibrar.
int lecturaActual = 0; // Almacena la lectura actual del gas.

// Variables para detección y control
bool gasDetectado = false; // Bandera (no usada activamente en este loop).
int historialGas[5]; // Array para suavizar lecturas de gas (no usado en el envío final).
int indiceHistorial = 0; // Posición actual en el array 'historialGas'.
unsigned long ultimaLecturaDHT = 0; // Controla cuándo fue la última lectura del DHT.
unsigned long ultimoEnvio = 0; // Controla cuándo fue el último envío de datos por Serial.
const unsigned long INTERVALO_ENVIO = 1000; // Envía datos cada 1 segundo (1000 ms).

// Variables para control de buzzer (alertas locales)
unsigned long inicioAlarmaSuelo = 0; // Controla el tiempo de la alarma de suelo.
unsigned long inicioAlarmaGas = 0; // Controla el tiempo de la alarma de gas.
unsigned long inicioAlarmaDistancia = 0; // Controla el tiempo de la alarma de distancia.
bool alarmaSueloActiva = false; // Bandera para saber si la alarma de suelo está sonando.
bool alarmaGasActiva = false; // Bandera para saber si la alarma de gas está sonando.
bool alarmaDistanciaActiva = false; // Bandera para saber si la alarma de distancia está sonando.

// Esta función se ejecuta una sola vez al encender el Arduino.
void setup() {
  Serial.begin(9600); // Inicia la comunicación serial (misma velocidad que en JS).
  dht.begin(); // Inicia el sensor DHT.
  
  pinMode(TRIG_PIN, OUTPUT); // Configura el pin TRIG como salida.
  pinMode(ECHO_PIN, INPUT); // Configura el pin ECHO como entrada.
  pinMode(BUZZER_PIN, OUTPUT); // Configura el pin del BUZZER como salida.
  digitalWrite(BUZZER_PIN, LOW); // Asegura que el buzzer esté apagado al inicio.
  
  // Imprime un mensaje de bienvenida en el Monitor Serial.
  Serial.println(F("╔══════════════════════════════════╗"));
  Serial.println(F("║  SISTEMA RIEGO v2.0 - ARDUINO    ║"));
  Serial.println(F("║    Compatible con Web App        ║"));
  Serial.println(F("╚══════════════════════════════════╝"));
  
  // El sensor de gas necesita tiempo para calentarse y dar lecturas estables.
  Serial.println(F("🔥 Precalentando MQ-135 (10s)..."));
  delay(10000); // Espera 10 segundos.
  
  calibrarSensorGas(); // Llama a la función para establecer el "aire limpio".
  probarTodosSensores(); // Llama a la función de auto-test de hardware.
  
  Serial.println(F("✅ Sistema listo - Enviando datos JSON"));
  Serial.println(F("================================================"));
}

// Esta función se ejecuta en bucle infinito después del setup().
void loop() {
  unsigned long tiempoActual = millis(); // Obtiene el tiempo actual en milisegundos.
  
  // Lee los sensores (excepto el DHT que es lento).
  int gasValue = leerGasPromedio(); // Lee el sensor de gas.
  float distancia = leerDistancia(); // Lee el sensor de ultrasonido.
  int humedadSuelo = leerHumedadSuelo(); // Lee el sensor de humedad de suelo.
  
  // El sensor DHT11 es lento, solo debe leerse cada 2 segundos.
  static float temperatura = 0; // 'static' mantiene el valor entre bucles.
  static float humedad = 0; // 'static' mantiene el valor entre bucles.
  if(tiempoActual - ultimaLecturaDHT > 2000) {
    float tempTemp = dht.readTemperature(); // Lee la temperatura.
    float tempHum = dht.readHumidity(); // Lee la humedad del aire.
    
    // Solo actualiza los valores si la lectura fue exitosa (no 'NaN').
    if(!isnan(tempTemp) && !isnan(tempHum)) {
      temperatura = tempTemp;
      humedad = tempHum;
    }
    ultimaLecturaDHT = tiempoActual; // Registra la hora de esta lectura.
  }
  
  // Activa el buzzer si hay alguna condición de alarma local.
  controlarBuzzerLocal(gasValue, distancia, humedadSuelo);
  
  // Controla el envío de datos a la Web App (cada 1 segundo).
  if(tiempoActual - ultimoEnvio >= INTERVALO_ENVIO) {
    // Llama a la función que imprime el JSON por el puerto serial.
    enviarDatosWeb(gasValue, distancia, humedadSuelo, temperatura, humedad);
    ultimoEnvio = tiempoActual; // Registra la hora de este envío.
  }
  
  delay(300); // Pequeña pausa para estabilizar el bucle (lectura aprox. 3-4 veces/seg).
}

// Mide el nivel de gas "limpio" al inicio.
void calibrarSensorGas() {
  Serial.println(F("⚖️ Calibrando MQ-135..."));
  
  long suma = 0;
  // Toma 50 lecturas para sacar un promedio estable.
  for(int i = 0; i < 50; i++) {
    suma += analogRead(mq135Pin);
    delay(100);
    if(i % 10 == 0) Serial.print(F("."));
  }
  
  valorReferencia = suma / 50; // Guarda el promedio como el valor de "aire limpio".
  
  // Llena el historial inicial con el valor de referencia.
  for(int i = 0; i < 5; i++) {
    historialGas[i] = valorReferencia;
  }
  
  Serial.println();
  Serial.print(F("🎯 Valor de referencia: "));
  Serial.println(valorReferencia);
}

// Lee el sensor de gas 3 veces y devuelve el promedio (suavizado simple).
int leerGasPromedio() {
  long suma = 0;
  for(int i = 0; i < 3; i++) {
    suma += analogRead(mq135Pin);
    delay(10);
  }
  
  int promedio = suma / 3; // Calcula el promedio de 3 lecturas.
  
  // Almacena el promedio en el array 'historialGas' (no usado en el envío).
  historialGas[indiceHistorial] = promedio;
  indiceHistorial = (indiceHistorial + 1) % 5; // Mueve el índice del historial.
  
  return promedio;
}

// Mide la distancia con el sensor HC-SR04.
float leerDistancia() {
  digitalWrite(TRIG_PIN, LOW); // Apaga el disparador.
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); // Envía un pulso de 10 microsegundos.
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Mide el tiempo que tarda en regresar el eco (con un timeout de 30ms).
  long duracion = pulseIn(ECHO_PIN, HIGH, 30000); 
  
  // Si 'duracion' es 0, hubo un error (timeout).
  if(duracion == 0) {
    return -1; // Devuelve -1 para indicar error.
  }
  
  // Fórmula para convertir el tiempo de eco a centímetros.
  float distancia = (duracion * 0.034) / 2;
  
  // Si la distancia está fuera del rango útil del sensor, devuelve error.
  if(distancia > 400 || distancia < 2) {
    return -1;
  }
  
  return distancia;
}

// Lee el sensor de humedad del suelo (YL-69).
int leerHumedadSuelo() {
  int valorSuelo = analogRead(SOIL_PIN); // Lee el valor analógico (0-1023).
  
  // Convierte (mapea) el rango analógico a un porcentaje (0-100%).
  // (1023 = seco = 0%) (300 = mojado = 100%) - ¡AJUSTA 300 SEGÚN TU SENSOR!
  int porcentajeHumedad = map(valorSuelo, 1023, 300, 0, 100);
  
  // Asegura que el valor esté siempre entre 0 y 100.
  if(porcentajeHumedad < 0) porcentajeHumedad = 0;
  if(porcentajeHumedad > 100) porcentajeHumedad = 100;
  
  return porcentajeHumedad;
}

// Función CLAVE: Envía los datos a la Web App en formato JSON.
void enviarDatosWeb(int gas, float ultra, int suelo, float temp, float hum) {
  // Imprime la cadena de texto JSON en una sola línea.
  Serial.print(F("{"));
  Serial.print(F("\"gas\":"));
  Serial.print(gas);
  Serial.print(F(",\"ultrasonic\":"));
  
  // Si el ultrasonido falló (dio -1), envía 0.
  if(ultra < 0) {
    Serial.print(F("0"));
  } else {
    Serial.print(ultra, 1); // Envía el ultrasonido con 1 decimal.
  }
  
  Serial.print(F(",\"soil\":"));
  Serial.print(suelo);
  Serial.print(F(",\"temperature\":"));
  Serial.print(temp, 1); // Envía la temperatura con 1 decimal.
  Serial.print(F(",\"humidity\":"));
  Serial.print(hum, 1); // Envía la humedad con 1 decimal.
  Serial.print(F(",\"timestamp\":"));
  Serial.print(millis()); // Envía el tiempo actual como timestamp.
  Serial.println(F("}")); // Cierra el JSON y envía un salto de línea.
  
  // Envía también una línea de "DEBUG" legible para el Monitor Serial.
  Serial.print(F("DEBUG: Gas="));
  Serial.print(gas);
  Serial.print(F(" | Ultra="));
  if(ultra < 0) {
    Serial.print(F("ERROR"));
  } else {
    Serial.print(ultra, 1);
    Serial.print(F("cm"));
  }
  Serial.print(F(" | Suelo="));
  Serial.print(suelo);
  Serial.print(F("% | Temp="));
  Serial.print(temp, 1);
  Serial.print(F("°C | Hum="));
  Serial.print(hum, 1);
  Serial.println(F("%"));
}

// Controla el buzzer físico para alertas locales (sin depender de la web).
void controlarBuzzerLocal(int gasValue, float distancia, int humedadSuelo) {
  unsigned long tiempoActual = millis();
  
  // Define las condiciones críticas (ajusta estos valores).
  int cambioGas = abs(gasValue - valorReferencia); // Calcula cuánto ha subido el gas.
  bool gasCritico = (cambioGas >= 50); // Alarma si el gas sube 50 puntos.
  bool distanciaCritica = (distancia > 0 && distancia < 5) || distancia > 30; // Alarma si está muy lleno (<5cm) o muy vacío (>30cm).
  bool sueloMuySeco = (humedadSuelo < 20); // Alarma si el suelo está bajo el 20%.
  
  // ALARMA DE GAS (máxima prioridad).
  if(gasCritico) {
    if(!alarmaGasActiva) {
      alarmaGasActiva = true; // Activa la bandera de alarma.
      inicioAlarmaGas = tiempoActual;
    }
    // Genera un pitido rápido e intermitente (BEEP-BEEP-BEEP).
    digitalWrite(BUZZER_PIN, (tiempoActual % 300) < 150 ? HIGH : LOW);
  } else {
    if(alarmaGasActiva) {
      alarmaGasActiva = false; // Desactiva la bandera.
      digitalWrite(BUZZER_PIN, LOW); // Apaga el buzzer.
    }
  }
  
  // ALARMA DE DISTANCIA (solo si no hay alarma de gas).
  if(distanciaCritica && !gasCritico) {
    if(!alarmaDistanciaActiva) {
      alarmaDistanciaActiva = true;
      inicioAlarmaDistancia = tiempoActual;
    }
    
    // Suena solo por 2 segundos (pitido medio).
    if(tiempoActual - inicioAlarmaDistancia < 2000) {
      digitalWrite(BUZZER_PIN, (tiempoActual % 500) < 250 ? HIGH : LOW);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
      alarmaDistanciaActiva = false; // Se auto-apaga después de 2 seg.
    }
  } else if(!distanciaCritica) {
    alarmaDistanciaActiva = false; // Resetea si la distancia vuelve a la normalidad.
  }
  
  // ALARMA DE SUELO (prioridad más baja).
  if(sueloMuySeco && !gasCritico && !alarmaDistanciaActiva) {
    if(!alarmaSueloActiva) {
      alarmaSueloActiva = true;
      inicioAlarmaSuelo = tiempoActual;
    }
    // Genera un pitido lento (BEEP... BEEP... BEEP...).
    digitalWrite(BUZZER_PIN, (tiempoActual % 1500) < 200 ? HIGH : LOW);
  } else {
    // Apaga la alarma de suelo solo si ya no está seco.
    if(alarmaSueloActiva && !sueloMuySeco) {
      alarmaSueloActiva = false;
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}

// Prueba rápida de hardware al inicio (solo visible en Monitor Serial).
void probarTodosSensores() {
  Serial.println(F("🧪 Probando todos los sensores..."));
  
  // Probar DHT11
  Serial.print(F("🌡️ DHT11: "));
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  
  if(isnan(h) || isnan(t)) {
    Serial.println(F("❌ Sin respuesta (verificar pin 3)"));
  } else {
    Serial.print(F("✅ OK - "));
    Serial.print(t);
    Serial.print(F("°C, "));
    Serial.print(h);
    Serial.println(F("%"));
  }
  
  // Probar Ultrasónico
  Serial.print(F("📏 HC-SR04: "));
  float dist = leerDistancia();
  if(dist < 0) {
    Serial.println(F("❌ Sin respuesta (verificar pins 4/5)"));
  } else {
    Serial.print(F("✅ OK - "));
    Serial.print(dist);
    Serial.println(F(" cm"));
  }
  
  // Probar sensor de suelo
  Serial.print(F("🌱 YL-69: "));
  int suelo = leerHumedadSuelo();
  Serial.print(F("✅ OK - "));
  Serial.print(suelo);
  Serial.println(F("% humedad"));
  
  // Probar MQ-135
  Serial.print(F("💨 MQ-135: "));
  int gas = leerGasPromedio();
  Serial.print(F("✅ OK - Valor: "));
  Serial.println(gas);
  
  // Probar buzzer
  Serial.print(F("🔊 Buzzer: "));
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println(F("✅ OK"));
  
  Serial.println(F("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
}

// Función opcional: Permite recibir comandos desde el Monitor Serial de Arduino.
void serialEvent() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n'); // Lee el comando.
    comando.trim(); // Limpia espacios en blanco.
    
    // Si escribes "STATUS" y das Enter...
    if(comando == "STATUS") {
      Serial.println(F("Sistema funcionando correctamente"));
      Serial.print(F("Referencia gas: "));
      Serial.println(valorReferencia);
      Serial.print(F("Uptime: "));
      Serial.print(millis() / 1000);
      Serial.println(F(" segundos"));
    }
    // Si escribes "CALIBRAR"...
    else if(comando == "CALIBRAR") {
      Serial.println(F("Recalibrando sensor de gas..."));
      calibrarSensorGas();
    }
    // Si escribes "TEST"...
    else if(comando == "TEST") {
      probarTodosSensores();
    }
    // Si escribes "BUZZER"...
    else if(comando.startsWith("BUZZER")) {
      Serial.println(F("Probando buzzer 3 segundos..."));
      unsigned long inicio = millis();
      while(millis() - inicio < 3000) {
        digitalWrite(BUZZER_PIN, (millis() % 500) < 250 ? HIGH : LOW);
      }
      digitalWrite(BUZZER_PIN, LOW);
      Serial.println(F("Buzzer test completado"));
    }
  }
}
