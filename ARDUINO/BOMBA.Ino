// ARDUINO BOMBA - Sistema Riego v2.2 SUPER CORREGIDO
// CORRECCIONES: Estado inicial OFF, botón emergencia funcional, control correcto
// Pin 7 = IN1 del relay, Pin 3 = botón emergencia

// ===== CONFIGURACIÓN DE PINES =====
#define RELAY_PIN 7        // Pin IN1 del relay para la bomba
#define BOTON_EMERGENCIA 3 // Botón físico para EMERGENCIA (solo apagar)
#define BUZZER_PIN 11      // Buzzer para confirmación

// ===== CONFIGURACIÓN RELAY =====
// Define cómo se activa tu relay (false = se activa con LOW, true = se activa con HIGH).
const bool RELAY_ACTIVE_HIGH = false;

// ===== VARIABLES DE CONTROL =====
bool bombaActiva = false;            // Estado lógico de la bomba (ON/OFF).
bool botonAnterior = HIGH;           // Almacena el estado anterior del botón (para debounce).
unsigned long ultimoDebounce = 0;    // Temporizador para el debounce del botón.
const unsigned long DEBOUNCE_DELAY = 50; // 50ms para evitar rebotes del botón.

// Control de tiempos
unsigned long tiempoInicioBomba = 0; // Almacena cuándo se encendió la bomba.
const unsigned long TIEMPO_MAXIMO = 300000; // 5 minutos (en ms) de funcionamiento máximo.
unsigned long ultimoEnvioEstado = 0; // Temporizador para enviar estado a la web.

// Estadísticas
int vecesActivada = 0; // Contador de cuántas veces se ha encendido.
int vecesEmergencia = 0; // Contador de paradas de emergencia.
unsigned long tiempoTotalFuncionamiento = 0; // Suma total del tiempo (ms) que ha estado activa.

// Función de configuración, se ejecuta una vez al encender.
void setup() {
    Serial.begin(9600); // Inicia comunicación serial (misma velocidad que JS).
    
    // Configurar pines
    pinMode(RELAY_PIN, OUTPUT); // Pin del relay como salida.
    pinMode(BOTON_EMERGENCIA, INPUT_PULLUP);  // Botón como entrada con resistencia interna.
    pinMode(BUZZER_PIN, OUTPUT); // Buzzer como salida.
    
    // CRÍTICO: ESTADO INICIAL SEGURO - BOMBA SIEMPRE OFF
    forzarBombaOFF(); // Llama a la función que apaga el relay físicamente.
    bombaActiva = false; // Asegura que el estado lógico sea OFF.
    
    // Imprime el mensaje de bienvenida en el Monitor Serial.
    Serial.println(F("╔══════════════════════════════════╗"));
    Serial.println(F("║  ARDUINO BOMBA v2.2 CORREGIDO    ║"));
    Serial.println(F("║    INICIO SEGURO - BOMBA OFF     ║"));
    Serial.println(F("╚══════════════════════════════════╝"));
    Serial.println();
    
    // Realiza un test de hardware al iniciar.
    testInicial();
    
    // Muestra los comandos disponibles.
    Serial.println(F("✅ Sistema listo"));
    Serial.println(F("📱 Comandos disponibles:"));
    Serial.println(F("    ON  / PUMP_ON   - Encender bomba"));
    Serial.println(F("    OFF / PUMP_OFF  - Apagar bomba"));
    Serial.println(F("    STATUS          - Ver estado"));
    Serial.println(F("    TEST            - Probar relay"));
    Serial.println(F("🚨 Botón emergencia: Pin 3 (SOLO APAGAR)"));
    Serial.println(F("💡 Pin relay IN1: Pin 7"));
    Serial.println(F("====================================="));
    
    // Confirmación sonora (1 beep = listo).
    beep(1);
    
    // Muestra el estado inicial.
    mostrarStatus();
}

// Bucle principal, se ejecuta continuamente.
void loop() {
    // 1. ALTA PRIORIDAD: Revisa el botón de emergencia en cada ciclo.
    verificarBotonEmergencia();
    
    // 2. Revisa si la bomba ha excedido su tiempo máximo de encendido.
    verificarTiempoMaximo();
    
    // 3. Si hay datos en el puerto serial (comandos de la web), los procesa.
    if (Serial.available()) {
        procesarComando();
    }
    
    // 4. Envía el estado actual (JSON) a la web cada 5 segundos.
    if (millis() - ultimoEnvioEstado >= 5000) {
        enviarEstado();
        ultimoEnvioEstado = millis();
    }
    
    delay(10); // Pausa mínima para estabilizar el loop y la lectura del botón.
}

// ===== FUNCIÓN CRÍTICA: FORZAR BOMBA OFF =====
// Asegura que el relay esté en estado APAGADO, respetando la lógica (HIGH/LOW).
void forzarBombaOFF() {
    if (RELAY_ACTIVE_HIGH) {
        digitalWrite(RELAY_PIN, LOW);   // OFF para relay normal (activo en HIGH).
    } else {
        digitalWrite(RELAY_PIN, HIGH);  // OFF para relay invertido (activo en LOW).
    }
    
    // Imprime el estado físico real del pin del relay para depuración.
    Serial.println(F("🛑 BOMBA FORZADA A OFF (seguridad)"));
    Serial.print(F("🔧 Pin IN1 ("));
    Serial.print(RELAY_PIN);
    Serial.print(F("): "));
    Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW"));
}

// ===== BOTÓN DE EMERGENCIA MEJORADO =====
// Verifica si el botón físico de emergencia ha sido presionado.
void verificarBotonEmergencia() {
    bool estadoActual = digitalRead(BOTON_EMERGENCIA); // Lee el estado actual del pin.
    
    // Detecta un cambio en el estado del botón.
    if (estadoActual != botonAnterior) {
        ultimoDebounce = millis(); // Registra el tiempo del cambio.
    }
    
    // Si el estado se ha mantenido estable por más tiempo que el DEBOUNCE_DELAY...
    if ((millis() - ultimoDebounce) > DEBOUNCE_DELAY) {
        // Detecta el momento exacto de la presión (flanco descendente: de HIGH a LOW).
        if (botonAnterior == HIGH && estadoActual == LOW) {
            
            // Si la bomba estaba activa, la apaga.
            if (bombaActiva) {
                Serial.println(F("🚨 ¡BOTÓN EMERGENCIA PRESIONADO!"));
                Serial.println(F("🛑 APAGANDO BOMBA INMEDIATAMENTE"));
                
                apagarBomba(); // Llama a la función de apagado.
                vecesEmergencia++; // Incrementa el contador de emergencias.
                
                beep(3); // 3 beeps rápidos = emergencia.
                
                Serial.print(F("📊 Paradas de emergencia totales: "));
                Serial.println(vecesEmergencia);
            } else {
                // Si la bomba ya estaba apagada, solo informa.
                Serial.println(F("🚨 Botón emergencia presionado"));
                Serial.println(F("💡 Bomba ya está apagada"));
                beep(1); // 1 beep = confirmación.
            }
        }
    }
    
    botonAnterior = estadoActual; // Guarda el estado actual para el próximo ciclo.
}

// ===== FUNCIONES DE CONTROL DE BOMBA =====
// Activa el relay y actualiza el estado a ENCENDIDO.
void encenderBomba() {
    if (!bombaActiva) { // Solo actúa si la bomba está apagada.
        bombaActiva = true; // Actualiza el estado lógico.
        tiempoInicioBomba = millis(); // Registra la hora de inicio.
        vecesActivada++; // Incrementa el contador de usos.
        
        // Escribe en el pin del relay según la configuración (ACTIVE_HIGH/LOW).
        if (RELAY_ACTIVE_HIGH) {
            digitalWrite(RELAY_PIN, HIGH);
        } else {
            digitalWrite(RELAY_PIN, LOW);
        }
        
        Serial.println(F("✅ BOMBA ENCENDIDA"));
        Serial.print(F("🔄 Activación #"));
        Serial.println(vecesActivada);
        Serial.print(F("🔧 Relay IN1 activado: "));
        Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW"));
        Serial.println(F("⏱️ Tiempo máximo: 5 minutos"));
        
        beep(2); // Dos beeps = encendido.
    } else {
        Serial.println(F("⚠️ Bomba ya está encendida"));
    }
}

// Desactiva el relay y actualiza el estado a APAGADO.
void apagarBomba() {
    if (bombaActiva) { // Solo actúa si la bomba está encendida.
        // Calcula cuánto tiempo estuvo encendida.
        unsigned long tiempoFuncionamiento = millis() - tiempoInicioBomba;
        tiempoTotalFuncionamiento += tiempoFuncionamiento; // Suma al total histórico.
        
        bombaActiva = false; // Actualiza el estado lógico.
        
        // Llama a la función de apagado forzado (más segura).
        forzarBombaOFF();
        
        Serial.println(F("🛑 BOMBA APAGADA"));
        Serial.print(F("⏱️ Funcionó por: "));
        Serial.print(tiempoFuncionamiento / 1000); // Muestra el tiempo en segundos.
        Serial.println(F(" segundos"));
        
        beep(1); // Un beep = apagado.
    } else {
        Serial.println(F("⚠️ Bomba ya está apagada"));
    }
}

// ===== VERIFICAR TIEMPO MÁXIMO =====
// Protección para evitar que la bomba funcione indefinidamente si algo falla.
void verificarTiempoMaximo() {
    // Si la bomba está activa Y ha superado el tiempo máximo...
    if (bombaActiva && (millis() - tiempoInicioBomba >= TIEMPO_MAXIMO)) {
        Serial.println(F("⚠️ PROTECCIÓN: Tiempo máximo alcanzado (5 min)"));
        Serial.println(F("🛑 Apagando automáticamente..."));
        
        apagarBomba(); // Apaga la bomba.
        
        beep(5); // 5 beeps = alarma de protección.
    }
}

// ===== PROCESAR COMANDOS SERIE =====
// Lee y ejecuta los comandos recibidos desde la Web App (JS).
void procesarComando() {
    String comando = Serial.readStringUntil('\n'); // Lee el texto hasta el salto de línea.
    comando.trim(); // Limpia espacios en blanco.
    comando.toUpperCase(); // Convierte a mayúsculas (ON, OFF, STATUS).
    
    Serial.print(F("📨 Comando recibido: '"));
    Serial.print(comando);
    Serial.println(F("'"));
    
    // Ejecuta la función correspondiente al comando.
    if (comando == "ON" || comando == "PUMP_ON") {
        encenderBomba();
    }
    else if (comando == "OFF" || comando == "PUMP_OFF") {
        apagarBomba();
    }
    else if (comando == "STATUS") {
        mostrarStatus();
    }
    else if (comando == "TEST") {
        testRelay();
    }
    else if (comando == "RESET") {
        // Resetea los contadores de estadísticas.
        vecesActivada = 0;
        vecesEmergencia = 0;
        tiempoTotalFuncionamiento = 0;
        Serial.println(F("🔄 Estadísticas reseteadas"));
    }
    else if (comando.length() > 0) {
        // Informa si el comando no se reconoce.
        Serial.print(F("❓ Comando desconocido: '"));
        Serial.print(comando);
        Serial.println(F("'"));
        Serial.println(F("💡 Comandos: ON, OFF, STATUS, TEST, RESET"));
    }
}

// ===== ENVIAR ESTADO (JSON para web app) =====
// Envía el estado actual en formato JSON, para que la Web App lo entienda.
void enviarEstado() {
    Serial.print(F("{\"pump_active\":")); // Inicio del JSON.
    Serial.print(bombaActiva ? F("true") : F("false"));
    Serial.print(F(",\"activations\":"));
    Serial.print(vecesActivada);
    Serial.print(F(",\"emergencies\":"));
    Serial.print(vecesEmergencia);
    Serial.print(F(",\"total_time\":"));
    Serial.print(tiempoTotalFuncionamiento / 1000); // Envía tiempo total en segundos.
    
    // Si la bomba está encendida, añade el tiempo actual y restante.
    if (bombaActiva) {
        Serial.print(F(",\"current_time\":"));
        Serial.print((millis() - tiempoInicioBomba) / 1000);
        Serial.print(F(",\"time_left\":"));
        Serial.print((TIEMPO_MAXIMO - (millis() - tiempoInicioBomba)) / 1000);
    }
    
    Serial.println(F("}")); // Fin del JSON y salto de línea.
}

// ===== MOSTRAR STATUS COMPLETO =====
// Imprime un reporte detallado del estado en el Monitor Serial (para depuración).
void mostrarStatus() {
    Serial.println(F("╔═══════════ ESTADO BOMBA ═══════════╗"));
    Serial.print(F("║ Estado actual: "));
    if (bombaActiva) {
        Serial.println(F("ENCENDIDA ✅"));
    } else {
        Serial.println(F("APAGADA ❌"));
    }
    
    Serial.print(F("║ Pin relay IN1 ("));
    Serial.print(RELAY_PIN);
    Serial.print(F("): "));
    Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW"));
    
    Serial.print(F("║ Activaciones totales: "));
    Serial.println(vecesActivada);
    
    Serial.print(F("║ Paradas emergencia: "));
    Serial.println(vecesEmergencia);
    
    Serial.print(F("║ Tiempo total funcionamiento: "));
    Serial.print(tiempoTotalFuncionamiento / 1000);
    Serial.println(F(" seg"));
    
    if (bombaActiva) {
        unsigned long tiempoActual = millis() - tiempoInicioBomba;
        Serial.print(F("║ Tiempo funcionando: "));
        Serial.print(tiempoActual / 1000);
        Serial.println(F(" seg"));
        
        unsigned long tiempoRestante = TIEMPO_MAXIMO - tiempoActual;
        Serial.print(F("║ Tiempo restante: "));
        Serial.print(tiempoRestante / 1000);
        Serial.println(F(" seg"));
    }
    
    Serial.print(F("║ Botón emergencia ("));
    Serial.print(BOTON_EMERGENCIA);
    Serial.print(F("): "));
    Serial.println(digitalRead(BOTON_EMERGENCIA) ? F("NO presionado") : F("PRESIONADO"));
    
    Serial.println(F("╚════════════════════════════════════╝"));
}

// ===== TEST INICIAL DEL SISTEMA =====
// Prueba rápida de hardware al inicio.
void testInicial() {
    Serial.println(F("🔧 TEST INICIAL DEL SISTEMA"));
    
    // 1. Test del relay
    Serial.println(F("1️⃣ Probando relay..."));
    Serial.print(F("    Configuración: "));
    Serial.println(RELAY_ACTIVE_HIGH ? F("ACTIVE HIGH") : F("ACTIVE LOW"));
    Serial.print(F("    Pin IN1 inicial: "));
    Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW")); // Debe estar en estado OFF.
    
    // 2. Test del botón
    Serial.println(F("2️⃣ Probando botón emergencia..."));
    Serial.print(F("    Estado botón pin "));
    Serial.print(BOTON_EMERGENCIA);
    Serial.print(F(": "));
    Serial.println(digitalRead(BOTON_EMERGENCIA) ? F("HIGH (no presionado)") : F("LOW (presionado)"));
    
    // 3. Test del buzzer
    Serial.println(F("3️⃣ Probando buzzer..."));
    beep(1);
    
    Serial.println(F("✅ Test inicial completado"));
    Serial.println();
}

// ===== TEST COMPLETO DEL RELAY =====
// Prueba manual (vía comando "TEST") para encender y apagar el relay.
void testRelay() {
    Serial.println(F("🔧 INICIANDO PRUEBA COMPLETA DEL RELAY"));
    
    bool estadoOriginal = bombaActiva; // Guarda el estado actual de la bomba.
    
    if (bombaActiva) {
        Serial.println(F("⚠️ Bomba está activa - será incluida en el test"));
    }
    
    Serial.println(F(""));
    Serial.println(F("1️⃣ Estado OFF (seguro)"));
    forzarBombaOFF(); // Apaga la bomba.
    Serial.print(F("    Pin IN1: "));
    Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW"));
    delay(2000);
    
    Serial.println(F("2️⃣ Estado ON (3 segundos)"));
    // Activa el relay (según la configuración).
    if (RELAY_ACTIVE_HIGH) {
        digitalWrite(RELAY_PIN, HIGH);
    } else {
        digitalWrite(RELAY_PIN, LOW);
    }
    Serial.print(F("    Pin IN1: "));
    Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW"));
    Serial.println(F("    👂 Escucha el 'click' del relay"));
    Serial.println(F("    👀 Observa si la bomba funciona"));
    delay(3000);
    
    Serial.println(F("3️⃣ Regresando a OFF"));
    forzarBombaOFF(); // Apaga la bomba.
    Serial.print(F("    Pin IN1: "));
    Serial.println(digitalRead(RELAY_PIN) ? F("HIGH") : F("LOW"));
    
    // Si la bomba estaba encendida antes del test, la vuelve a encender.
    if (estadoOriginal) {
        Serial.println(F("🔄 Restaurando estado original..."));
        encenderBomba();
    }
    
    Serial.println(F(""));
    Serial.println(F("✅ PRUEBA COMPLETADA"));
    Serial.println(F("🔍 Si no funcionó:"));
    Serial.println(F("    • Verifica conexiones IN1 → Pin 7"));
    Serial.println(F("    • Verifica alimentación del relay"));
    Serial.println(F("    • Verifica conexiones de la bomba"));
    Serial.println(F(""));
}

// ===== FUNCIÓN BUZZER =====
// Genera 'cantidad' de beeps cortos.
void beep(int cantidad) {
    for (int i = 0; i < cantidad; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(100); // Duración del beep.
        digitalWrite(BUZZER_PIN, LOW);
        if (i < cantidad - 1) delay(150); // Pausa entre beeps.
    }
}
