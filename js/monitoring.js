// ===== LÓGICA DE MONITOREO DE SENSORES =====

// ===== PROCESAMIENTO DE DATOS DE SENSORES =====
function processSensorData(data) {
    try {
        const trimmedData = data.trim();
        console.log('Dato recibido del Arduino:', trimmedData);
        
        const sensorsLog = document.getElementById('sensorsLog');
        if (sensorsLog) {
            sensorsLog.textContent += '\n' + trimmedData;
            sensorsLog.scrollTop = sensorsLog.scrollHeight;
        }
        
        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
            try {
                const jsonData = JSON.parse(trimmedData);
                console.log('JSON parseado correctamente:', jsonData);
                
                const gasValue = parseFloat(jsonData.gas) || 0;
                const ultrasonicValue = parseFloat(jsonData.ultrasonic) || 0;
                const soilValue = parseFloat(jsonData.soil) || 0;
                const tempValue = parseFloat(jsonData.temperature) || 0;
                const humidValue = parseFloat(jsonData.humidity) || 0;
                
                console.log('=== VALORES EXTRAÍDOS ===');
                console.log('Gas:', gasValue, 'Ultra:', ultrasonicValue, 'Soil:', soilValue);
                console.log('Temp:', tempValue, 'Humid:', humidValue);
                
                const now = Date.now();
                const significantChange = 
                    Math.abs(gasValue - stableSensorValues.gas) > 5 ||
                    Math.abs(ultrasonicValue - stableSensorValues.ultrasonic) > 2 ||
                    Math.abs(soilValue - stableSensorValues.soil) > 3 ||
                    Math.abs(tempValue - stableSensorValues.temperature) > 1 ||
                    Math.abs(humidValue - stableSensorValues.humidity) > 3;
                
                if ((now - stableSensorValues.lastUpdate > UPDATE_INTERVAL) || significantChange) {
                    console.log('=== ACTUALIZANDO VALORES ESTABLES ===');
                    
                    stableSensorValues.gas = gasValue;
                    stableSensorValues.ultrasonic = ultrasonicValue;
                    stableSensorValues.soil = soilValue;
                    stableSensorValues.temperature = tempValue;
                    stableSensorValues.humidity = humidValue;
                    stableSensorValues.lastUpdate = now;
                    
                    lastDataReceived = now;
                    lastRealUpdate = now;
                    
                    if (sensorsConnected && !noSensorMode) {
                        const timestamp = new Date().toLocaleTimeString();
                        
                        sensorData.gas.push(gasValue);
                        sensorData.ultrasonic.push(ultrasonicValue);
                        sensorData.soil.push(soilValue);
                        sensorData.temperature.push(tempValue);
                        sensorData.humidity.push(humidValue);
                        sensorData.timestamps.push(timestamp);
                        
                        const maxValues = 20;
                        Object.keys(sensorData).forEach(key => {
                            if (sensorData[key].length > maxValues) {
                                sensorData[key].shift();
                            }
                        });
                        
                        systemStats.totalReadings++;
                    }
                    
                    updateSensorCardsStable();
                    
                    if (shouldUpdateCharts && sensorsConnected && !noSensorMode && typeof updateCharts === 'function') {
                        updateCharts();
                    }
                    
                    updateStatistics();
                    
                    if (autoModeActive && !emergencyStopActive) {
                        checkAutoIrrigation(soilValue);
                    }
                    
                    updateSensorDataDisplayStable();
                    
                } else {
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

function updateSensorCardsStable() {
    const gas = stableSensorValues.gas;
    const ultrasonic = stableSensorValues.ultrasonic;
    const soil = stableSensorValues.soil;
    const temp = stableSensorValues.temperature;
    const humid = stableSensorValues.humidity;
    
    console.log('Actualizando UI con valores estables:', { gas, ultrasonic, soil, temp, humid });
    
    const gasStatus = evaluateGasLevel(gas);
    const ultraStatus = evaluateUltrasonicLevel(ultrasonic);
    const soilStatus = getSoilStatus(soil);
    const tempStatus = getTemperatureStatus(temp);
    const humidStatus = getHumidityStatus(humid);
    
    updateCardStable('gasCard', 'gasValue', 'gasStatus', gas.toFixed(1), '', gasStatus);
    updateCardStable('ultrasonicCard', 'ultrasonicValue', 'ultrasonicStatus', ultrasonic.toFixed(1), ' cm', ultraStatus);
    updateCardStable('soilCard', 'soilValue', 'soilStatus', soil.toFixed(1), '%', soilStatus);
    updateCardStable('tempCard', 'tempValue', 'tempStatus', temp.toFixed(1), '°C', tempStatus);
    updateCardStable('humidCard', 'humidValue', 'humidStatus', humid.toFixed(1), '%', humidStatus);
}

function updateCardStable(cardId, valueId, statusId, value, unit, evaluation) {
    const card = document.getElementById(cardId);
    const valueEl = document.getElementById(valueId);
    const statusEl = document.getElementById(statusId);
    
    if (card) {
        const newClass = `status-card ${evaluation.level}`;
        if (card.className !== newClass) {
            card.className = newClass;
        }
    }
    
    if (valueEl) {
        const newValue = value + unit;
        if (valueEl.textContent !== newValue) {
            valueEl.textContent = newValue;
        }
    }
    
    if (statusEl) {
        const newStatus = `${evaluation.icon || ''} ${evaluation.message}`;
        if (statusEl.textContent !== newStatus) {
            statusEl.textContent = newStatus;
        }
    }
    
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
        
        if (typeof updateAlertsChartForced === 'function') {
            updateAlertsChartForced();
        }
    }
    
    if (evaluation.shouldAlert && sensorsConnected && !noSensorMode && parseFloat(value) > 0) {
        const sensorName = cardId.replace('Card', '');
        const now = Date.now();
        
        if (!lastAlertTime[sensorName] || (now - lastAlertTime[sensorName] > ALERT_COOLDOWN)) {
            const sensorDisplayNames = {
                'gas': 'Gas',
                'ultrasonic': 'Nivel de Tanque',  
                'soil': 'Humedad del Suelo',
                'temp': 'Temperatura',
                'humid': 'Humedad del Aire'
            };
            
            const alertMessage = `${sensorDisplayNames[sensorName]}: ${evaluation.message}`;
            showToastAlert(alertMessage, evaluation.alertType, sensorName);
            lastAlertTime[sensorName] = now;
        }
    }
}

function forceUpdateDisplayOnly() {
    console.log('Forzando actualización de display...');
    
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

function updateSensorDataDisplayStable() {
    const dataDisplay = document.getElementById('sensorsData');
    if (dataDisplay && sensorsConnected && !noSensorMode) {
        const timestamp = new Date().toLocaleTimeString();
        
        const displayText = `Gas: ${stableSensorValues.gas.toFixed(1)}
Ultrasonido: ${stableSensorValues.ultrasonic.toFixed(1)} cm
Suelo: ${stableSensorValues.soil.toFixed(1)}%
Temperatura: ${stableSensorValues.temperature.toFixed(1)}°C
Humedad: ${stableSensorValues.humidity.toFixed(1)}%
Última actualización: ${timestamp}`;
        
        if (dataDisplay.innerHTML !== displayText) {
            dataDisplay.innerHTML = displayText;
        }
    }
}

function initializeNoSensorDisplay() {
    console.log('Inicializando modo sin sensores...');
    
    sensorData = {
        gas: [],
        ultrasonic: [],
        soil: [],
        temperature: [],
        humidity: [],
        timestamps: []
    };
    
    shouldUpdateCharts = false;
    
    updateSensorCardsImproved(0, 0, 0, 0, 0);
    
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

function updateCardImproved(cardId, valueId, statusId, value, unit, evaluation) {
    const card = document.getElementById(cardId);
    const valueEl = document.getElementById(valueId);
    const statusEl = document.getElementById(statusId);
    
    if (card) card.className = `status-card ${evaluation.level}`;
    if (valueEl) valueEl.textContent = value + unit;
    if (statusEl) statusEl.textContent = `${evaluation.icon || ''} ${evaluation.message}`;
}

function checkAutoIrrigation(soilValue) {
    if (soilValue < plantParameters.soilMin && !pumpActive) {
        togglePump();
        showToastAlert('Riego automático activado - Suelo seco detectado', 'success', 'soil');
    } else if (soilValue > plantParameters.soilMax && pumpActive) {
        togglePump();
        showToastAlert('Riego automático desactivado - Suelo saturado', 'warning', 'soil');
    }
}

function startSensorDisplayMonitor() {
    console.log('Iniciando monitor de display de sensores...');
    
    setInterval(() => {
        if (sensorsConnected && !noSensorMode) {
            const humidEl = document.getElementById('humidValue');
            if (humidEl && stableSensorValues.humidity > 0) {
                const expectedValue = stableSensorValues.humidity.toFixed(1) + '%';
                if (humidEl.textContent !== expectedValue) {
                    humidEl.textContent = expectedValue;
                }
            }
        }
    }, 2000);
}

// ===== CONTROL DE BOMBA =====
async function togglePump() {
    if (!pumpConnected) {
        showToastAlert('Arduino de bomba no conectado', 'warning');
        return;
    }
    
    if (emergencyStopActive) {
        showToastAlert('Sistema en parada de emergencia', 'danger');
        return;
    }
    
    const targetState = !pumpActive;
    const command = targetState ? 'ON' : 'OFF';
    
    console.log(`Enviando comando: ${command}`);
    
    const success = await sendPumpCommand(command);
    
    if (success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        pumpActive = targetState;
        updatePumpDisplay();
        
        if (pumpActive) {
            systemStats.irrigationCount++;
            showToastAlert('Bomba ENCENDIDA', 'success');
        } else {
            showToastAlert('Bomba APAGADA', 'warning');
        }
        
        updatePumpData();
    } else {
        showToastAlert('Error enviando comando a la bomba', 'danger');
    }
}

function updatePumpDisplay() {
    const pumpBtn = document.getElementById('pumpBtn');
    const pumpState = document.getElementById('pumpState');
    
    if (pumpBtn) {
        if (pumpActive) {
            pumpBtn.textContent = '🟢 BOMBA ACTIVA - Click para Apagar';
            pumpBtn.className = 'btn pump-btn btn-danger';
        } else {
            pumpBtn.textContent = '🔴 BOMBA INACTIVA - Click para Encender';
            pumpBtn.className = 'btn pump-btn';
        }
    }
    
    if (pumpState) {
        pumpState.textContent = pumpActive ? 'ACTIVA 🟢' : 'INACTIVA 🔴';
    }
}

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

async function autoMode() {
    autoModeActive = true;
    const statusEl = document.getElementById('autoModeStatus');
    if (statusEl) {
        statusEl.textContent = 'Modo: Automático';
        statusEl.style.color = '#4CAF50';
    }
    
    if (typeof sendPumpCommand === 'function') {
        await sendPumpCommand('AUTO_MODE_ON');
    }
    showToastAlert('Modo automático activado', 'success');
}

async function manualMode() {
    autoModeActive = false;
    const statusEl = document.getElementById('autoModeStatus');
    if (statusEl) {
        statusEl.textContent = 'Modo: Manual';
        statusEl.style.color = '#ff9800';
    }
    
    if (typeof sendPumpCommand === 'function') {
        await sendPumpCommand('AUTO_MODE_OFF');
    }
    showToastAlert('Modo manual activado', 'warning');
}

async function emergencyStop() {
    emergencyStopActive = !emergencyStopActive;
    
    if (emergencyStopActive) {
        if (pumpConnected && typeof sendPumpCommand === 'function') {
            console.log('PARADA DE EMERGENCIA - Apagando bomba');
            await sendPumpCommand('OFF');
            await new Promise(resolve => setTimeout(resolve, 500));
            pumpActive = false;
            updatePumpDisplay();
        }
        
        autoModeActive = false;
        
        const statusEl = document.getElementById('autoModeStatus');
        if (statusEl) {
            statusEl.textContent = 'Modo: EMERGENCIA';
            statusEl.style.color = '#f44336';
        }
        
        showToastAlert('PARADA DE EMERGENCIA ACTIVADA - Bomba apagada', 'danger');
    } else {
        const statusEl = document.getElementById('autoModeStatus');
        if (statusEl) {
            statusEl.textContent = 'Modo: Manual';
            statusEl.style.color = '#ff9800';
        }
        
        showToastAlert('Parada de emergencia desactivada', 'success');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando monitoring.js...');
    
    loadSavedData();
    updateGasParametersDisplay();
    updateUltrasonicParametersDisplay();
    
    if (noSensorMode) {
        initializeNoSensorDisplay();
    }
    
    updatePumpDisplay();
    updateParametersDisplay();
    updateStatistics();
    startTimeUpdater();
    startSensorDisplayMonitor();
    
    setInterval(saveAllData, 300000);
    
    console.log('✅ monitoring.js inicializado correctamente');
});

console.log('✅ monitoring.js cargado correctamente');