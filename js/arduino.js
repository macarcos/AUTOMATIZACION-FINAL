// ===== LÓGICA DE CONEXIÓN ARDUINO =====

// ===== CONEXIÓN ARDUINO DE SENSORES =====

// Inicia la conexión con el Arduino de sensores.
async function connectSensorsArduino() {
    const connectBtn = document.getElementById('connectSensors');
    const disconnectBtn = document.getElementById('disconnectSensors');
    const statusSpan = document.getElementById('sensorsStatus');
    const card = document.getElementById('sensorsArduino');
    const logDiv = document.getElementById('sensorsLog');

    // Verifica si el navegador soporta la Web Serial API.
    if (!navigator.serial) {
        showToastAlert('Web Serial API no soportada. Usa Chrome/Edge con HTTPS', 'danger');
        return;
    }

    try {
        // Actualiza la UI para mostrar "conectando".
        connectBtn.disabled = true;
        statusSpan.textContent = '🟡';
        logDiv.textContent = 'Solicitando puerto serie para sensores...';

        // Filtros para encontrar Arduinos fácilmente.
        const filters = [
            { usbVendorId: 0x2341 },
            { usbVendorId: 0x1A86 },
            { usbVendorId: 0x0403 }
        ];

        // Pide al usuario que seleccione un puerto.
        sensorsPort = await navigator.serial.requestPort({ filters });
        
        // Cierra el puerto si estaba abierto previamente.
        if (sensorsPort.readable) {
            await sensorsPort.close();
        }
        
        // Abre el puerto con la velocidad (baudRate) configurada.
        const baudRate = parseInt(document.getElementById('sensorsBaud')?.value || '9600');
        await sensorsPort.open({ 
            baudRate: baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            bufferSize: 255,
            flowControl: 'none'
        });

        // Actualiza variables globales de estado.
        sensorsConnected = true;
        noSensorMode = false;
        shouldUpdateCharts = true;
        
        // Actualiza la UI a "conectado".
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        
        logDiv.textContent = 'Conectado exitosamente\nIniciando lectura...';
        showToastAlert('Arduino de sensores conectado correctamente', 'success');
        
        updateGlobalIndicators();
        updateStatusIndicator('sensorStatusIndicator', true, 'Arduino Sensores');
        
        // Inicia la lectura de datos después de 1 segundo.
        setTimeout(() => {
            startReadingSensorData();
        }, 1000);

    } catch (error) {
        // Maneja errores si la conexión falla.
        console.error('Error conectando sensores:', error);
        connectBtn.disabled = false;
        statusSpan.textContent = '🔴';
        card.classList.add('error');
        card.classList.remove('connected');
        
        sensorsConnected = false;
        noSensorMode = true;
        shouldUpdateCharts = false;
        
        let errorMessage = 'Error de conexión';
        if (error.message.includes('No port selected')) {
            errorMessage = 'No se seleccionó puerto';
        } else if (error.message.includes('Failed to open')) {
            errorMessage = 'Puerto ocupado o sin permisos';
        }
        
        logDiv.textContent = `Error: ${errorMessage}`;
        showToastAlert(`Error conectando sensores: ${errorMessage}`, 'danger');
    }
}

// Cierra la conexión con el Arduino de sensores.
async function disconnectSensorsArduino() {
    try {
        // Cancela el lector de datos si está activo.
        if (sensorsReader) {
            try {
                await sensorsReader.cancel();
            } catch (e) {
                console.log('Reader ya cerrado');
            }
            sensorsReader = null;
        }
        
        // Cierra el puerto serial si está abierto.
        if (sensorsPort) {
            try {
                await sensorsPort.close();
            } catch (e) {
                console.log('Puerto ya cerrado');
            }
            sensorsPort = null;
        }
        
        // Resetea las variables de estado.
        sensorsConnected = false;
        noSensorMode = true;
        shouldUpdateCharts = false;
        
        // Actualiza la UI a "desconectado".
        updateSensorsUI(false);
        if (typeof initializeNoSensorDisplay === 'function') {
            initializeNoSensorDisplay();
        }
        
        updateGlobalIndicators();
        updateStatusIndicator('sensorStatusIndicator', false, 'Arduino Sensores');
        
        showToastAlert('Arduino de sensores desconectado', 'warning');
        
    } catch (error) {
        // Maneja errores al desconectar.
        console.error('Error desconectando sensores:', error);
        sensorsConnected = false;
        noSensorMode = true;
        shouldUpdateCharts = false;
        updateSensorsUI(false);
        showToastAlert('Error al desconectar sensores', 'danger');
    }
}

// Actualiza la tarjeta de UI de sensores (conectado/desconectado).
function updateSensorsUI(connected) {
    const statusSpan = document.getElementById('sensorsStatus');
    const card = document.getElementById('sensorsArduino');
    const connectBtn = document.getElementById('connectSensors');
    const disconnectBtn = document.getElementById('disconnectSensors');
    const logDiv = document.getElementById('sensorsLog');
    
    if (connected) {
        // UI en estado "conectado".
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
        // UI en estado "desconectado".
        statusSpan.textContent = '⚪';
        card.classList.remove('connected', 'error');
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        logDiv.textContent = 'Arduino de sensores desconectado';
        
        const dataDisplay = document.getElementById('sensorsData');
        if (dataDisplay) {
            dataDisplay.innerHTML = 'Sin datos de sensores';
        }
    }
}

// Inicia el bucle para leer datos del Arduino de sensores.
async function startReadingSensorData() {
    if (!sensorsPort || !sensorsConnected) {
        showToastAlert('Puerto de sensores no disponible', 'warning');
        return;
    }
    
    try {
        console.log('Iniciando lectura de datos de sensores...');
        // Convierte los bytes del puerto a texto.
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = sensorsPort.readable.pipeTo(textDecoder.writable);
        sensorsReader = textDecoder.readable.getReader();
        
        let buffer = '';
        
        // Bucle de lectura continua.
        while (sensorsConnected && !emergencyStopActive) {
            try {
                const { value, done } = await sensorsReader.read();
                
                if (done) {
                    console.log('Lectura de sensores terminada');
                    break;
                }
                
                // Acumula datos en el buffer.
                buffer += value;
                
                // Procesa los datos línea por línea.
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Guarda la última línea incompleta.
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    // Envía la línea limpia a la función de procesamiento.
                    if (trimmedLine && typeof processSensorData === 'function') {
                        processSensorData(trimmedLine);
                    }
                }
                
            } catch (error) {
                // Maneja errores comunes al desconectar.
                if (error.name === 'NetworkError' || error.name === 'AbortError') {
                    console.log('Lectura interrumpida:', error.name);
                    break;
                } else {
                    console.error('Error leyendo datos:', error);
                    showToastAlert('Error en lectura de datos', 'warning');
                    break;
                }
            }
        }
        
    } catch (error) {
        console.error('Error iniciando lectura:', error);
        showToastAlert('Error al iniciar lectura de sensores', 'danger');
    }
}

// ===== CONEXIÓN ARDUINO DE BOMBA =====

// Inicia la conexión con el Arduino de la bomba.
async function connectPumpArduino() {
    const connectBtn = document.getElementById('connectPump');
    const disconnectBtn = document.getElementById('disconnectPump');
    const statusSpan = document.getElementById('pumpStatus');
    const card = document.getElementById('pumpArduino');
    const logDiv = document.getElementById('pumpLog');

    if (!navigator.serial) {
        showToastAlert('Web Serial API no soportada. Usa Chrome/Edge con HTTPS', 'danger');
        return;
    }

    try {
        connectBtn.disabled = true;
        statusSpan.textContent = '🟡';
        logDiv.textContent = 'Solicitando puerto serie para bomba...';

        // Mismos filtros de Vendor ID.
        const filters = [
            { usbVendorId: 0x2341 },
            { usbVendorId: 0x1A86 },
            { usbVendorId: 0x0403 }
        ];

        // Pide al usuario que seleccione el puerto de la bomba.
        pumpPort = await navigator.serial.requestPort({ filters });
        
        if (pumpPort.readable) {
            await pumpPort.close();
        }
        
        // Abre el puerto con la velocidad (baudRate) configurada.
        const baudRate = parseInt(document.getElementById('pumpBaud')?.value || '9600');
        await pumpPort.open({ 
            baudRate: baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            bufferSize: 255,
            flowControl: 'none'
        });

        pumpConnected = true;
        
        // Espera 1 seg a que se estabilice la conexión.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Acción de seguridad: Apaga la bomba al conectar.
        console.log('Forzando bomba OFF al conectar...');
        await sendPumpCommand('OFF');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Resetea los estados de la bomba.
        pumpActive = false;
        realPumpState = false;
        
        // Actualiza la UI a "conectado".
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        
        if (typeof updatePumpDisplay === 'function') {
            updatePumpDisplay();
        }
        
        logDiv.textContent = 'Conectado exitosamente\nBomba FORZADA a OFF\nBomba lista para control';
        showToastAlert('Arduino de bomba conectado - Bomba apagada por seguridad', 'success');

        updateGlobalIndicators();
        updateStatusIndicator('pumpStatusIndicator', true, 'Arduino Bomba');

        // Inicia el lector de respuestas de la bomba.
        startPumpStatusReader();

    } catch (error) {
        // Maneja errores de conexión de la bomba.
        console.error('Error conectando bomba:', error);
        connectBtn.disabled = false;
        statusSpan.textContent = '🔴';
        card.classList.add('error');
        card.classList.remove('connected');
        
        pumpConnected = false;
        pumpActive = false;
        realPumpState = false;
        
        showToastAlert('Error conectando bomba: ' + error.message, 'danger');
    }
}

// Cierra la conexión con el Arduino de la bomba.
async function disconnectPumpArduino() {
    try {
        // Cancela el lector de respuestas si está activo.
        if (pumpReader) {
            try {
                await pumpReader.cancel();
            } catch (e) {
                console.log('Reader ya cerrado');
            }
            pumpReader = null;
        }
        
        // Cierra el puerto serial de la bomba.
        if (pumpPort) {
            try {
                await pumpPort.close();
            } catch (e) {
                console.log('Puerto ya cerrado');
            }
            pumpPort = null;
        }
        
        // Resetea estados y actualiza la UI.
        pumpConnected = false;
        pumpActive = false;
        updatePumpUI(false);
        
        updateGlobalIndicators();
        updateStatusIndicator('pumpStatusIndicator', false, 'Arduino Bomba');
        
        showToastAlert('Arduino de bomba desconectado', 'warning');
        
    } catch (error) {
        // Maneja errores al desconectar la bomba.
        console.error('Error desconectando bomba:', error);
        pumpConnected = false;
        pumpActive = false;
        updatePumpUI(false);
        showToastAlert('Error al desconectar bomba', 'danger');
    }
}

// Actualiza la tarjeta de UI de la bomba (conectado/desconectado).
function updatePumpUI(connected) {
    const statusSpan = document.getElementById('pumpStatus');
    const card = document.getElementById('pumpArduino');
    const connectBtn = document.getElementById('connectPump');
    const disconnectBtn = document.getElementById('disconnectPump');
    const logDiv = document.getElementById('pumpLog');
    
    if (connected) {
        // UI en estado "conectado".
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
        // UI en estado "desconectado".
        statusSpan.textContent = '⚪';
        card.classList.remove('connected', 'error');
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        logDiv.textContent = 'Arduino de bomba desconectado';
        if (typeof updatePumpDisplay === 'function') {
            updatePumpDisplay();
        }
    }
}

// Inicia el bucle para leer respuestas del Arduino de la bomba.
async function startPumpStatusReader() {
    if (!pumpPort || !pumpConnected) return;
    
    try {
        // Convierte los bytes del puerto a texto.
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = pumpPort.readable.pipeTo(textDecoder.writable);
        pumpReader = textDecoder.readable.getReader();
        
        let buffer = '';
        
        // Bucle de lectura de respuestas.
        while (pumpConnected) {
            try {
                const { value, done } = await pumpReader.read();
                if (done) break;
                
                buffer += value;
                // Procesa las respuestas línea por línea.
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
                        // Envía la respuesta a la función de procesamiento.
                        processPumpResponse(trimmedLine);
                    }
                }
            } catch (error) {
                if (error.name === 'NetworkError' || error.name === 'AbortError') {
                    break;
                } else {
                    console.error('Error leyendo respuesta de bomba:', error);
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error iniciando lectura de bomba:', error);
    }
}

// Procesa e interpreta las respuestas de texto de la bomba.
function processPumpResponse(response) {
    // Muestra la respuesta del Arduino en el log.
    const pumpLog = document.getElementById('pumpLog');
    if (pumpLog) {
        pumpLog.textContent += '\nArduino: ' + response;
        pumpLog.scrollTop = pumpLog.scrollHeight;
    }
    
    // Interpreta respuestas simples para saber el estado real.
    if (response.includes('BOMBA ENCENDIDA') || response.includes('✅')) {
        realPumpState = true;
        console.log('Arduino confirma: BOMBA ENCENDIDA');
    } else if (response.includes('BOMBA APAGADA') || response.includes('🛑')) {
        realPumpState = false;
        console.log('Arduino confirma: BOMBA APAGADA');
    }
    
    // Interpreta respuestas en formato JSON.
    if (response.startsWith('{') && response.includes('pump_active')) {
        try {
            const status = JSON.parse(response);
            realPumpState = status.pump_active;
            console.log('Estado JSON recibido:', realPumpState);
            
            // Sincroniza el estado de la UI si no coincide con el real.
            if (realPumpState !== pumpActive) {
                console.log('Sincronizando estados - Real:', realPumpState, 'Local:', pumpActive);
                pumpActive = realPumpState;
                if (typeof updatePumpDisplay === 'function') {
                    updatePumpDisplay();
                }
            }
        } catch (e) {
            console.log('Respuesta no JSON:', response);
        }
    }
}

// Envía un comando de texto (ej. "ON", "OFF") a la bomba.
async function sendPumpCommand(command) {
    if (!pumpPort || !pumpConnected) {
        showToastAlert('Arduino de bomba no conectado', 'warning');
        return false;
    }
    
    try {
        // Obtiene el "escritor" del puerto.
        const writer = pumpPort.writable.getWriter();
        const encoder = new TextEncoder();
        
        // Escribe el comando codificado como bytes y añade un salto de línea.
        await writer.write(encoder.encode(command + '\n'));
        writer.releaseLock();
        
        // Muestra el comando enviado en el log.
        const pumpLog = document.getElementById('pumpLog');
        if (pumpLog) {
            pumpLog.textContent += `\nComando: ${command}`;
            pumpLog.scrollTop = pumpLog.scrollHeight;
        }
        
        return true;
    } catch (error) {
        console.error('Error enviando comando:', error);
        showToastAlert('Error enviando comando a la bomba', 'danger');
        return false;
    }
}

// ===== CONTROLES RÁPIDOS =====

// Conecta ambos Arduinos en secuencia.
async function connectAllArduinos() {
    showToastAlert('Conectando todos los dispositivos...', 'info');
    try {
        await connectSensorsArduino();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 seg.
        await connectPumpArduino();
        showToastAlert('Conexión de dispositivos completada', 'success');
    } catch (error) {
        showToastAlert('Error en conexión múltiple', 'danger');
    }
}

// Desconecta ambos Arduinos.
function disconnectAllArduinos() {
    disconnectSensorsArduino();
    disconnectPumpArduino();
    showToastAlert('Todos los dispositivos desconectados', 'warning');
}

// Muestra un resumen del estado de conexión.
function testConnections() {
    let testResults = [];
    
    if (sensorsConnected) {
        testResults.push('✅ Arduino sensores: Conectado');
    } else {
        testResults.push('❌ Arduino sensores: Desconectado');
    }
    
    if (pumpConnected) {
        testResults.push('✅ Arduino bomba: Conectado');
    } else {
        testResults.push('❌ Arduino bomba: Desconectado');
    }
    
    const message = testResults.join('\n');
    showToastAlert(message, (sensorsConnected && pumpConnected) ? 'success' : 'warning');
}

// Actualiza los indicadores de estado globales (puntos de color).
function updateStatusIndicator(indicatorId, connected, deviceName) {
    const indicator = document.getElementById(indicatorId);
    if (indicator) {
        const statusClass = connected ? 'connected' : 'disconnected';
        const statusText = connected ? 'Conectado' : 'Desconectado';
        indicator.className = `status-indicator ${statusClass}`;
        indicator.innerHTML = `
            <span class="status-dot"></span>
            <span>${deviceName}: ${statusText}</span>
        `;
    }
}

console.log('✅ arduino.js cargado correctamente');

// ===== PERSISTENCIA DE ESTADO DE CONEXIONES =====

// Guarda el estado actual en sessionStorage.
function saveConnectionState() {
    const connectionState = {
        sensorsConnected: sensorsConnected,
        pumpConnected: pumpConnected,
        pumpActive: pumpActive,
        autoModeActive: autoModeActive,
        timestamp: Date.now()
    };
    sessionStorage.setItem('connectionState', JSON.stringify(connectionState));
}

// Carga el estado guardado de sessionStorage al iniciar.
function loadConnectionState() {
    try {
        const saved = sessionStorage.getItem('connectionState');
        if (saved) {
            const state = JSON.parse(saved);
            const now = Date.now();
            
            // Solo restaura si fue guardado hace menos de 5 minutos.
            if (now - state.timestamp < 300000) {
                // Actualiza la UI con el estado guardado.
                updateGlobalIndicators();
                console.log('Estado de conexión cargado (UI actualizado)');
            }
        }
    } catch (error) {
        console.error('Error cargando estado:', error);
    }
}

// Guarda el estado automáticamente cada segundo.
setInterval(saveConnectionState, 1000);

// Carga el estado al iniciar la página.
document.addEventListener('DOMContentLoaded', function() {
    loadConnectionState();
});
