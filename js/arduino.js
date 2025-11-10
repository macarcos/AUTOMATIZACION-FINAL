// ===== LÓGICA DE CONEXIÓN ARDUINO =====

// ===== CONEXIÓN ARDUINO DE SENSORES =====
async function connectSensorsArduino() {
    const connectBtn = document.getElementById('connectSensors');
    const disconnectBtn = document.getElementById('disconnectSensors');
    const statusSpan = document.getElementById('sensorsStatus');
    const card = document.getElementById('sensorsArduino');
    const logDiv = document.getElementById('sensorsLog');

    if (!navigator.serial) {
        showToastAlert('Web Serial API no soportada. Usa Chrome/Edge con HTTPS', 'danger');
        return;
    }

    try {
        connectBtn.disabled = true;
        statusSpan.textContent = '🟡';
        logDiv.textContent = 'Solicitando puerto serie para sensores...';

        const filters = [
            { usbVendorId: 0x2341 },
            { usbVendorId: 0x1A86 },
            { usbVendorId: 0x0403 }
        ];

        sensorsPort = await navigator.serial.requestPort({ filters });
        
        if (sensorsPort.readable) {
            await sensorsPort.close();
        }
        
        const baudRate = parseInt(document.getElementById('sensorsBaud')?.value || '9600');
        await sensorsPort.open({ 
            baudRate: baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            bufferSize: 255,
            flowControl: 'none'
        });

        sensorsConnected = true;
        noSensorMode = false;
        shouldUpdateCharts = true;
        
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        
        logDiv.textContent = 'Conectado exitosamente\nIniciando lectura...';
        showToastAlert('Arduino de sensores conectado correctamente', 'success');
        
        updateGlobalIndicators();
        updateStatusIndicator('sensorStatusIndicator', true, 'Arduino Sensores');
        
        setTimeout(() => {
            startReadingSensorData();
        }, 1000);

    } catch (error) {
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

async function disconnectSensorsArduino() {
    try {
        if (sensorsReader) {
            try {
                await sensorsReader.cancel();
            } catch (e) {
                console.log('Reader ya cerrado');
            }
            sensorsReader = null;
        }
        
        if (sensorsPort) {
            try {
                await sensorsPort.close();
            } catch (e) {
                console.log('Puerto ya cerrado');
            }
            sensorsPort = null;
        }
        
        sensorsConnected = false;
        noSensorMode = true;
        shouldUpdateCharts = false;
        
        updateSensorsUI(false);
        if (typeof initializeNoSensorDisplay === 'function') {
            initializeNoSensorDisplay();
        }
        
        updateGlobalIndicators();
        updateStatusIndicator('sensorStatusIndicator', false, 'Arduino Sensores');
        
        showToastAlert('Arduino de sensores desconectado', 'warning');
        
    } catch (error) {
        console.error('Error desconectando sensores:', error);
        sensorsConnected = false;
        noSensorMode = true;
        shouldUpdateCharts = false;
        updateSensorsUI(false);
        showToastAlert('Error al desconectar sensores', 'danger');
    }
}

function updateSensorsUI(connected) {
    const statusSpan = document.getElementById('sensorsStatus');
    const card = document.getElementById('sensorsArduino');
    const connectBtn = document.getElementById('connectSensors');
    const disconnectBtn = document.getElementById('disconnectSensors');
    const logDiv = document.getElementById('sensorsLog');
    
    if (connected) {
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
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

async function startReadingSensorData() {
    if (!sensorsPort || !sensorsConnected) {
        showToastAlert('Puerto de sensores no disponible', 'warning');
        return;
    }
    
    try {
        console.log('Iniciando lectura de datos de sensores...');
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = sensorsPort.readable.pipeTo(textDecoder.writable);
        sensorsReader = textDecoder.readable.getReader();
        
        let buffer = '';
        
        while (sensorsConnected && !emergencyStopActive) {
            try {
                const { value, done } = await sensorsReader.read();
                
                if (done) {
                    console.log('Lectura de sensores terminada');
                    break;
                }
                
                buffer += value;
                
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && typeof processSensorData === 'function') {
                        processSensorData(trimmedLine);
                    }
                }
                
            } catch (error) {
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

        const filters = [
            { usbVendorId: 0x2341 },
            { usbVendorId: 0x1A86 },
            { usbVendorId: 0x0403 }
        ];

        pumpPort = await navigator.serial.requestPort({ filters });
        
        if (pumpPort.readable) {
            await pumpPort.close();
        }
        
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
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Forzando bomba OFF al conectar...');
        await sendPumpCommand('OFF');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        pumpActive = false;
        realPumpState = false;
        
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

        startPumpStatusReader();

    } catch (error) {
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

async function disconnectPumpArduino() {
    try {
        if (pumpReader) {
            try {
                await pumpReader.cancel();
            } catch (e) {
                console.log('Reader ya cerrado');
            }
            pumpReader = null;
        }
        
        if (pumpPort) {
            try {
                await pumpPort.close();
            } catch (e) {
                console.log('Puerto ya cerrado');
            }
            pumpPort = null;
        }
        
        pumpConnected = false;
        pumpActive = false;
        updatePumpUI(false);
        
        updateGlobalIndicators();
        updateStatusIndicator('pumpStatusIndicator', false, 'Arduino Bomba');
        
        showToastAlert('Arduino de bomba desconectado', 'warning');
        
    } catch (error) {
        console.error('Error desconectando bomba:', error);
        pumpConnected = false;
        pumpActive = false;
        updatePumpUI(false);
        showToastAlert('Error al desconectar bomba', 'danger');
    }
}

function updatePumpUI(connected) {
    const statusSpan = document.getElementById('pumpStatus');
    const card = document.getElementById('pumpArduino');
    const connectBtn = document.getElementById('connectPump');
    const disconnectBtn = document.getElementById('disconnectPump');
    const logDiv = document.getElementById('pumpLog');
    
    if (connected) {
        statusSpan.textContent = '🟢';
        card.classList.add('connected');
        card.classList.remove('error');
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
    } else {
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

async function startPumpStatusReader() {
    if (!pumpPort || !pumpConnected) return;
    
    try {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = pumpPort.readable.pipeTo(textDecoder.writable);
        pumpReader = textDecoder.readable.getReader();
        
        let buffer = '';
        
        while (pumpConnected) {
            try {
                const { value, done } = await pumpReader.read();
                if (done) break;
                
                buffer += value;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
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

function processPumpResponse(response) {
    const pumpLog = document.getElementById('pumpLog');
    if (pumpLog) {
        pumpLog.textContent += '\nArduino: ' + response;
        pumpLog.scrollTop = pumpLog.scrollHeight;
    }
    
    if (response.includes('BOMBA ENCENDIDA') || response.includes('✅')) {
        realPumpState = true;
        console.log('Arduino confirma: BOMBA ENCENDIDA');
    } else if (response.includes('BOMBA APAGADA') || response.includes('🛑')) {
        realPumpState = false;
        console.log('Arduino confirma: BOMBA APAGADA');
    }
    
    if (response.startsWith('{') && response.includes('pump_active')) {
        try {
            const status = JSON.parse(response);
            realPumpState = status.pump_active;
            console.log('Estado JSON recibido:', realPumpState);
            
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

async function sendPumpCommand(command) {
    if (!pumpPort || !pumpConnected) {
        showToastAlert('Arduino de bomba no conectado', 'warning');
        return false;
    }
    
    try {
        const writer = pumpPort.writable.getWriter();
        const encoder = new TextEncoder();
        
        await writer.write(encoder.encode(command + '\n'));
        writer.releaseLock();
        
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
async function connectAllArduinos() {
    showToastAlert('Conectando todos los dispositivos...', 'info');
    try {
        await connectSensorsArduino();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await connectPumpArduino();
        showToastAlert('Conexión de dispositivos completada', 'success');
    } catch (error) {
        showToastAlert('Error en conexión múltiple', 'danger');
    }
}

function disconnectAllArduinos() {
    disconnectSensorsArduino();
    disconnectPumpArduino();
    showToastAlert('Todos los dispositivos desconectados', 'warning');
}

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

function loadConnectionState() {
    try {
        const saved = sessionStorage.getItem('connectionState');
        if (saved) {
            const state = JSON.parse(saved);
            const now = Date.now();
            
            // Solo restaurar si fue hace menos de 5 minutos
            if (now - state.timestamp < 300000) {
                // No podemos reconectar automáticamente, pero actualizar UI
                updateGlobalIndicators();
                console.log('Estado de conexión cargado (UI actualizado)');
            }
        }
    } catch (error) {
        console.error('Error cargando estado:', error);
    }
}

// Guardar estado cada vez que cambia
setInterval(saveConnectionState, 1000);

// Cargar estado al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadConnectionState();
});