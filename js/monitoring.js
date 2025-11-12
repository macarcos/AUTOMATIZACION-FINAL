// ===== LÓGICA DE MONITOREO DE SENSORES =====

// ===== PROCESAMIENTO DE DATOS DE SENSORES =====

// Procesa la línea de datos (JSON) recibida del Arduino de sensores.
function processSensorData(data) {
    try {
        const trimmedData = data.trim();
        console.log('Dato recibido del Arduino:', trimmedData);
        
        // Añade el dato crudo al log de sensores en la UI.
        const sensorsLog = document.getElementById('sensorsLog');
        if (sensorsLog) {
            sensorsLog.textContent += '\n' + trimmedData;
            sensorsLog.scrollTop = sensorsLog.scrollHeight;
        }
        
        // Comprueba si el dato es un objeto JSON válido.
        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
            try {
                // Convierte el texto JSON en un objeto JavaScript.
                const jsonData = JSON.parse(trimmedData);
                console.log('JSON parseado correctamente:', jsonData);
                
                // Extrae y limpia cada valor numérico del JSON.
                const gasValue = parseFloat(jsonData.gas) || 0;
                const ultrasonicValue = parseFloat(jsonData.ultrasonic) || 0;
                const soilValue = parseFloat(jsonData.soil) || 0;
                const tempValue = parseFloat(jsonData.temperature) || 0;
                const humidValue = parseFloat(jsonData.humidity) || 0;
                
                console.log('=== VALORES EXTRAÍDOS ===');
                console.log('Gas:', gasValue, 'Ultra:', ultrasonicValue, 'Soil:', soilValue);
                console.log('Temp:', tempValue, 'Humid:', humidValue);
                
                const now = Date.now();
                // Define si el cambio en los datos es lo suficientemente grande como para actualizar la UI.
                const significantChange = 
                    Math.abs(gasValue - stableSensorValues.gas) > 5 ||
                    Math.abs(ultrasonicValue - stableSensorValues.ultrasonic) > 2 ||
                    Math.abs(soilValue - stableSensorValues.soil) > 3 ||
                    Math.abs(tempValue - stableSensorValues.temperature) > 1 ||
                    Math.abs(humidValue - stableSensorValues.humidity) > 3;
                
                // Actualiza los datos "estables" solo si ha pasado tiempo (UPDATE_INTERVAL) o si el cambio es importante.
                if ((now - stableSensorValues.lastUpdate > UPDATE_INTERVAL) || significantChange) {
                    console.log('=== ACTUALIZANDO VALORES ESTABLES ===');
                    
                    // Guarda los nuevos valores como los "estables" (los que ve el usuario).
                    stableSensorValues.gas = gasValue;
                    stableSensorValues.ultrasonic = ultrasonicValue;
                    stableSensorValues.soil = soilValue;
                    stableSensorValues.temperature = tempValue;
                    stableSensorValues.humidity = humidValue;
                    stableSensorValues.lastUpdate = now;
                    
                    lastDataReceived = now;
                    lastRealUpdate = now;
                    
                    // Si estamos conectados (no en modo simulación), guarda los datos en el historial.
                    if (sensorsConnected && !noSensorMode) {
                        const timestamp = new Date().toLocaleTimeString();
                        
                        // Guarda los nuevos datos en los arrays de historial.
                        sensorData.gas.push(gasValue);
                        sensorData.ultrasonic.push(ultrasonicValue);
                        sensorData.soil.push(soilValue);
                        sensorData.temperature.push(tempValue);
                        sensorData.humidity.push(humidValue);
                        sensorData.timestamps.push(timestamp);
                        
                        // Limita el historial de datos a los últimos 20 valores.
                        const maxValues = 20;
                        Object.keys(sensorData).forEach(key => {
                            if (sensorData[key].length > maxValues) {
                                sensorData[key].shift();
                            }
                        });
                        
                        // Incrementa el contador total de lecturas.
                        systemStats.totalReadings++;
                    }
                    
                    // Actualiza las 5 tarjetas de sensores en la UI.
                    updateSensorCardsStable();
                    
                    // Actualiza las gráficas (si está permitido).
                    if (shouldUpdateCharts && sensorsConnected && !noSensorMode && typeof updateCharts === 'function') {
                        updateCharts();
                    }
                    
                    // Actualiza las estadísticas (contadores).
                    updateStatistics();
                    
                    // Si el modo automático está activo, comprueba si debe regar.
                    if (autoModeActive && !emergencyStopActive) {
                        checkAutoIrrigation(soilValue);
                    }
                    
                    // Actualiza el log de texto de "Datos de Sensores".
                    updateSensorDataDisplayStable();
                    
                } else {
                    // Si el cambio no fue "significante", solo refresca los números (ahorra recursos).
                    forceUpdateDisplayOnly();
                }
                
            } catch (parseError) {
                console.error('Error parseando JSON:', parseError);
            }
        }
        
    } catch (error) {
        console.error('Error procesando datos del sensor:', error);
    }
}

// Actualiza las 5 tarjetas de estado (Gas, Ultrasonido, Suelo, etc.) con los valores estables.
function updateSensorCardsStable() {
    const gas = stableSensorValues.gas;
    const ultrasonic = stableSensorValues.ultrasonic;
    const soil = stableSensorValues.soil;
    const temp = stableSensorValues.temperature;
    const humid = stableSensorValues.humidity;
    
    console.log('Actualizando UI con valores estables:', { gas, ultrasonic, soil, temp, humid });
    
    // Evalúa el estado de cada sensor (ej. "bueno", "peligro").
    const gasStatus = evaluateGasLevel(gas);
    const ultraStatus = evaluateUltrasonicLevel(ultrasonic);
    const soilStatus = getSoilStatus(soil);
    const tempStatus = getTemperatureStatus(temp);
    const humidStatus = getHumidityStatus(humid);
    
    // Llama a la función auxiliar para actualizar cada tarjeta.
    updateCardStable('gasCard', 'gasValue', 'gasStatus', gas.toFixed(1), '', gasStatus);
    updateCardStable('ultrasonicCard', 'ultrasonicValue', 'ultrasonicStatus', ultrasonic.toFixed(1), ' cm', ultraStatus);
    updateCardStable('soilCard', 'soilValue', 'soilStatus', soil.toFixed(1), '%', soilStatus);
    updateCardStable('tempCard', 'tempValue', 'tempStatus', temp.toFixed(1), '°C', tempStatus);
    updateCardStable('humidCard', 'humidValue', 'humidStatus', humid.toFixed(1), '%', humidStatus);
}

// Función auxiliar para actualizar una sola tarjeta (valor, color de fondo, y mensaje de estado).
function updateCardStable(cardId, valueId, statusId, value, unit, evaluation) {
    const card = document.getElementById(cardId);
    const valueEl = document.getElementById(valueId);
    const statusEl = document.getElementById(statusId);
    
    // Cambia el color de fondo de la tarjeta (ej. 'status-card danger').
    if (card) {
        const newClass = `status-card ${evaluation.level}`;
        if (card.className !== newClass) {
            card.className = newClass;
        }
    }
    
    // Actualiza el valor numérico (ej. "25.5°C").
    if (valueEl) {
        const newValue = value + unit;
        if (valueEl.textContent !== newValue) {
            valueEl.textContent = newValue;
        }
    }
    
    // Actualiza el mensaje de estado (ej. "🟢 Humedad óptima").
    if (statusEl) {
        const newStatus = `${evaluation.icon || ''} ${evaluation.message}`;
        if (statusEl.textContent !== newStatus) {
            statusEl.textContent = newStatus;
        }
    }
    
    // Incrementa los contadores de estadísticas (bueno, regular, malo) para la gráfica de dona.
    if (!noSensorMode && sensorsConnected && parseFloat(value) > 0) {
        switch(evaluation.level) {
            case 'normal': 
                alertStats.bueno++; 
                break;
            case 'warning': 
                alertStats.regular++; 
                break;
            case 'danger': 
                alertStats.malo++; 
                break;
            case 'critical': 
                alertStats.peligroso++; 
                break;
        }
        
        // Actualiza la gráfica de dona (en charts.js).
        if (typeof updateAlertsChartForced === 'function') {
            updateAlertsChartForced();
        }
    }
    
    // Si la evaluación lo requiere (ej. "Suelo muy seco"), dispara una alerta "toast".
    if (evaluation.shouldAlert && sensorsConnected && !noSensorMode && parseFloat(value) > 0) {
        const sensorName = cardId.replace('Card', '');
        const now = Date.now();
        
        // Comprueba el cooldown (enfriamiento) para no enviar alertas repetidas.
        if (!lastAlertTime[sensorName] || (now - lastAlertTime[sensorName] > ALERT_COOLDOWN)) {
            const sensorDisplayNames = {
                'gas': 'Gas',
                'ultrasonic': 'Nivel de Tanque', 
                'soil': 'Humedad del Suelo',
                'temp': 'Temperatura',
                'humid': 'Humedad del Aire'
            };
            
            // Muestra la notificación (en global.js).
            const alertMessage = `${sensorDisplayNames[sensorName]}: ${evaluation.message}`;
            showToastAlert(alertMessage, evaluation.alertType, sensorName);
            lastAlertTime[sensorName] = now;
        }
    }
}

// Refresca solo el texto (número) de las tarjetas, sin re-evaluar el estado (optimización).
function forceUpdateDisplayOnly() {
    console.log('Forzando actualización de display...');
    
    // Esta función revisa si el valor en la UI es diferente al valor en memoria y lo corrige.
    const humidEl = document.getElementById('humidValue');
    const humidStatusEl = document.getElementById('humidStatus');
    
    if (humidEl && stableSensorValues.humidity > 0) {
        const currentValue = stableSensorValues.humidity.toFixed(1) + '%';
        if (humidEl.textContent !== currentValue) {
            humidEl.textContent = currentValue;
        }
    }
    
    const gasEl = document.getElementById('gasValue');
    if (gasEl && stableSensorValues.gas > 0) {
        const currentValue = stableSensorValues.gas.toFixed(1);
        if (gasEl.textContent !== currentValue) {
            gasEl.textContent = currentValue;
        }
    }
    
    const soilEl = document.getElementById('soilValue');
    if (soilEl && stableSensorValues.soil > 0) {
        const currentValue = stableSensorValues.soil.toFixed(1) + '%';
        if (soilEl.textContent !== currentValue) {
            soilEl.textContent = currentValue;
        }
    }
    
    const tempEl = document.getElementById('tempValue');
    if (tempEl && stableSensorValues.temperature > 0) {
        const currentValue = stableSensorValues.temperature.toFixed(1) + '°C';
        if (tempEl.textContent !== currentValue) {
            tempEl.textContent = currentValue;
        }
    }
    
    const ultraEl = document.getElementById('ultrasonicValue');
    if (ultraEl && stableSensorValues.ultrasonic > 0) {
        const currentValue = stableSensorValues.ultrasonic.toFixed(1) + ' cm';
        if (ultraEl.textContent !== currentValue) {
            ultraEl.textContent = currentValue;
        }
    }
}

// Actualiza el cuadro de "Datos de Sensores" (el log de texto) con los valores estables.
function updateSensorDataDisplayStable() {
    const dataDisplay = document.getElementById('sensorsData');
    if (dataDisplay && sensorsConnected && !noSensorMode) {
        const timestamp = new Date().toLocaleTimeString();
        
        // Formatea el texto que se mostrará en el log.
        const displayText = `Gas: ${stableSensorValues.gas.toFixed(1)}
Ultrasonido: ${stableSensorValues.ultrasonic.toFixed(1)} cm
Suelo: ${stableSensorValues.soil.toFixed(1)}%
Temperatura: ${stableSensorValues.temperature.toFixed(1)}°C
Humedad: ${stableSensorValues.humidity.toFixed(1)}%
Última actualización: ${timestamp}`;
        
        // Actualiza el HTML solo si el contenido ha cambiado.
        if (dataDisplay.innerHTML !== displayText) {
            dataDisplay.innerHTML = displayText;
        }
    }
}

// Resetea la UI al estado "Sin Sensores" (todo en 0) cuando se desconecta.
function initializeNoSensorDisplay() {
    console.log('Inicializando modo sin sensores...');
    
    // Vacía los datos de sensores.
    sensorData = {
        gas: [],
        ultrasonic: [],
        soil: [],
        temperature: [],
        humidity: [],
        timestamps: []
    };
    
    shouldUpdateCharts = false;
    
    // Pone todas las tarjetas en 0 y con estado normal.
    updateSensorCardsImproved(0, 0, 0, 0, 0);
    
    // Limpia el log de "Datos de Sensores".
    const dataDisplay = document.getElementById('sensorsData');
    if (dataDisplay) {
        dataDisplay.innerHTML = `Gas: 0
Ultrasonido: 0 cm
Suelo: 0%
Temperatura: 0°C
Humedad: 0%
Estado: Sin sensores conectados`;
    }
    
    console.log('Modo sin sensores inicializado');
}

// Actualiza todas las tarjetas de sensores (usado por el modo simulación/reset).
function updateSensorCardsImproved(gas, ultrasonic, soil, temp, humid) {
    const gasStatus = evaluateGasLevel(gas);
    updateCardImproved('gasCard', 'gasValue', 'gasStatus', gas.toFixed(1), '', gasStatus);
    
    const ultraStatus = evaluateUltrasonicLevel(ultrasonic);
    updateCardImproved('ultrasonicCard', 'ultrasonicValue', 'ultrasonicStatus', ultrasonic.toFixed(1), ' cm', ultraStatus);
    
    const soilStatus = getSoilStatus(soil);
    updateCardImproved('soilCard', 'soilValue', 'soilStatus', soil.toFixed(1), '%', soilStatus);
    
    const tempStatus = getTemperatureStatus(temp);
    updateCardImproved('tempCard', 'tempValue', 'tempStatus', temp.toFixed(1), '°C', tempStatus);
    
    const humidStatus = getHumidityStatus(humid);
    updateCardImproved('humidCard', 'humidValue', 'humidStatus', humid.toFixed(1), '%', humidStatus);
}

// Función auxiliar (más simple) para actualizar una tarjeta (sin lógica de alertas).
function updateCardImproved(cardId, valueId, statusId, value, unit, evaluation) {
    const card = document.getElementById(cardId);
    const valueEl = document.getElementById(valueId);
    const statusEl = document.getElementById(statusId);
    
    if (card) card.className = `status-card ${evaluation.level}`;
    if (valueEl) valueEl.textContent = value + unit;
    if (statusEl) statusEl.textContent = `${evaluation.icon || ''} ${evaluation.message}`;
}

// Lógica del modo automático: enciende/apaga la bomba si el suelo está muy seco o muy húmedo.
function checkAutoIrrigation(soilValue) {
    // Si el suelo está seco Y la bomba está apagada, enciéndela.
    if (soilValue < plantParameters.soilMin && !pumpActive) {
        togglePump();
        showToastAlert('Riego automático activado - Suelo seco detectado', 'success', 'soil');
    // Si el suelo está muy húmedo Y la bomba está encendida, apágala.
    } else if (soilValue > plantParameters.soilMax && pumpActive) {
        togglePump();
        showToastAlert('Riego automático desactivado - Suelo saturado', 'warning', 'soil');
    }
}

// Inicia un temporizador que "corrige" la UI si se desincroniza (solo revisa la humedad).
function startSensorDisplayMonitor() {
    console.log('Iniciando monitor de display de sensores...');
    
    // Esta es una función de "seguridad" que cada 2 segundos revisa si la UI miente.
    setInterval(() => {
        if (sensorsConnected && !noSensorMode) {
            const humidEl = document.getElementById('humidValue');
            if (humidEl && stableSensorValues.humidity > 0) {
                const expectedValue = stableSensorValues.humidity.toFixed(1) + '%';
                // Si el valor en la UI no coincide con el valor en memoria, lo corrige.
                if (humidEl.textContent !== expectedValue) {
                    humidEl.textContent = expectedValue;
                }
            }
        }
    }, 2000);
}

// ===== CONTROL de BOMBA =====

// Envía el comando ON/OFF a la bomba y actualiza la UI.
async function togglePump() {
    // No hace nada si la bomba no está conectada.
    if (!pumpConnected) {
        showToastAlert('Arduino de bomba no conectado', 'warning');
        return;
    }
    
    // No hace nada si la parada de emergencia está activa.
    if (emergencyStopActive) {
        showToastAlert('Sistema en parada de emergencia', 'danger');
        return;
    }
    
    // Invierte el estado actual (si estaba ON, el objetivo es OFF).
    const targetState = !pumpActive;
    const command = targetState ? 'ON' : 'OFF';
    
    console.log(`Enviando comando: ${command}`);
    
    // Envía el comando (función de arduino.js).
    const success = await sendPumpCommand(command);
    
    // Si el comando se envió correctamente...
    if (success) {
        // Espera 1 segundo para que el Arduino procese el comando.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Actualiza el estado local (en la app).
        pumpActive = targetState;
        // Actualiza el botón de la bomba.
        updatePumpDisplay();
        
        if (pumpActive) {
            // Si se encendió, incrementa el contador de riegos.
            systemStats.irrigationCount++;
            showToastAlert('Bomba ENCENDIDA', 'success');
        } else {
            showToastAlert('Bomba APAGADA', 'warning');
        }
        
        // Actualiza el cuadro de datos de la bomba.
        updatePumpData();
    } else {
        showToastAlert('Error enviando comando a la bomba', 'danger');
    }
}

// Actualiza el botón principal de la bomba (texto y color).
function updatePumpDisplay() {
    const pumpBtn = document.getElementById('pumpBtn');
    const pumpState = document.getElementById('pumpState');
    
    if (pumpBtn) {
        if (pumpActive) {
            pumpBtn.textContent = '🟢 BOMBA ACTIVA - Click para Apagar';
            pumpBtn.className = 'btn pump-btn btn-danger'; // Botón rojo (para apagar).
        } else {
            pumpBtn.textContent = '🔴 BOMBA INACTIVA - Click para Encender';
            pumpBtn.className = 'btn pump-btn'; // Botón normal.
        }
    }
    
    // Actualiza el indicador de estado pequeño.
    if (pumpState) {
        pumpState.textContent = pumpActive ? 'ACTIVA 🟢' : 'INACTIVA 🔴';
    }
}

// Actualiza el cuadro de datos de la bomba (estado, modo, riegos totales).
function updatePumpData() {
    const pumpData = document.getElementById('pumpData');
    if (pumpData) {
        pumpData.innerHTML = `Estado: ${pumpActive ? 'ACTIVA 🟢' : 'INACTIVA 🔴'}
Modo: ${autoModeActive ? 'Automático' : 'Manual'}
Estado real Arduino: ${realPumpState ? 'ON' : 'OFF'}
Riegos totales: ${systemStats.irrigationCount}
Última acción: ${new Date().toLocaleTimeString()}`;
    }
}

// Activa el modo automático.
async function autoMode() {
    autoModeActive = true;
    const statusEl = document.getElementById('autoModeStatus');
    if (statusEl) {
        statusEl.textContent = 'Modo: Automático';
        statusEl.style.color = '#4CAF50';
    }
    
    // Envía un comando al Arduino (opcional) para informarle del modo.
    if (typeof sendPumpCommand === 'function') {
        await sendPumpCommand('AUTO_MODE_ON');
    }
    showToastAlert('Modo automático activado', 'success');
}

// Desactiva el modo automático (activa el modo manual).
async function manualMode() {
    autoModeActive = false;
    const statusEl = document.getElementById('autoModeStatus');
    if (statusEl) {
        statusEl.textContent = 'Modo: Manual';
        statusEl.style.color = '#ff9800';
    }
    
    // Envía un comando al Arduino (opcional) para informarle del modo.
    if (typeof sendPumpCommand === 'function') {
        await sendPumpCommand('AUTO_MODE_OFF');
    }
    showToastAlert('Modo manual activado', 'warning');
}

// Activa o desactiva la parada de emergencia (apaga la bomba forzosamente).
async function emergencyStop() {
    emergencyStopActive = !emergencyStopActive; // Invierte el estado de emergencia.
    
    if (emergencyStopActive) {
        // Si se activa la emergencia, apaga la bomba inmediatamente.
        if (pumpConnected && typeof sendPumpCommand === 'function') {
            console.log('PARADA DE EMERGENCIA - Apagando bomba');
            await sendPumpCommand('OFF');
            await new Promise(resolve => setTimeout(resolve, 500));
            pumpActive = false;
            updatePumpDisplay();
        }
        
        // Desactiva el modo automático.
        autoModeActive = false;
        
        // Actualiza la UI al estado de emergencia.
        const statusEl = document.getElementById('autoModeStatus');
        if (statusEl) {
            statusEl.textContent = 'Modo: EMERGENCIA';
            statusEl.style.color = '#f44336';
        }
        
        showToastAlert('PARADA DE EMERGENCIA ACTIVADA - Bomba apagada', 'danger');
    } else {
        // Si se desactiva la emergencia, vuelve a modo manual.
        const statusEl = document.getElementById('autoModeStatus');
        if (statusEl) {
            statusEl.textContent = 'Modo: Manual';
            statusEl.style.color = '#ff9800';
        }
        
        showToastAlert('Parada de emergencia desactivada', 'success');
    }
}

// ===== INICIALIZACIÓN =====

// Se ejecuta cuando la página termina de cargar (HTML listo).
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando monitoring.js...');
    
    // Carga los datos guardados en localStorage (de global.js).
    loadSavedData();
    // Actualiza la UI con los parámetros de gas cargados.
    updateGasParametersDisplay();
    // Actualiza la UI con los parámetros de ultrasonido cargados.
    updateUltrasonicParametersDisplay();
    
    // Si no hay sensores, inicializa la UI en modo simulación.
    if (noSensorMode) {
        initializeNoSensorDisplay();
    }
    
    // Actualiza todos los displays de la UI al cargar.
    updatePumpDisplay();
    updateParametersDisplay();
    updateStatistics();
    // Inicia el reloj de "tiempo activo" (en global.js).
    startTimeUpdater();
    // Inicia el monitor de "corrección" de UI.
    startSensorDisplayMonitor();
    
    // Guarda automáticamente todos los datos en localStorage cada 5 minutos (300000 ms).
    setInterval(saveAllData, 300000);
    
    console.log('✅ monitoring.js inicializado correctamente');
});

console.log('✅ monitoring.js cargado correctamente');
