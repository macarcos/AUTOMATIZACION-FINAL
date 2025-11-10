// ===== VARIABLES GLOBALES COMPARTIDAS =====
// Variables de conexión Arduino
let sensorsPort = null;
let pumpPort = null;
let sensorsConnected = false;
let pumpConnected = false;
let sensorsReader = null;
let pumpReader = null;
let lastDataReceived = 0;

// Variables de datos del sistema
let sensorData = {
    gas: [],
    ultrasonic: [],
    soil: [],
    temperature: [],
    humidity: [],
    timestamps: []
};

let alertStats = {
    bueno: 0,
    regular: 0,
    malo: 0,
    peligroso: 0
};

// Parámetros configurables
let gasParameters = {
    bueno: 30,
    regular: 100,
    malo: 150,
    peligroso: 151
};

let ultrasonicParameters = {
    minimo: 5,
    regular: 15,
    maximo: 25
};

let plantParameters = {
    soilOptimal: 50,
    soilMin: 25,
    soilMax: 75,
    tempOptimal: 25,
    humidOptimal: 60,
    tempMin: 15,
    tempMax: 35,
    humidityMin: 40,
    humidityMax: 80,
    gasThreshold: 300,
    irrigationDuration: 30
};

let systemStats = {
    totalReadings: 0,
    alertCount: 0,
    irrigationCount: 0,
    startTime: Date.now(),
    backupInterval: null
};

// Variables de estado
let alertHistory = [];
let noSensorMode = true;
let pumpActive = false;
let autoModeActive = false;
let emergencyStopActive = false;
let charts = {};
let chartsInitialized = false;
let shouldUpdateCharts = false;

// Control de alertas
let lastAlertTime = {
    gas: 0,
    ultrasonic: 0,
    soil: 0,
    temperature: 0,
    humidity: 0
};

const ALERT_COOLDOWN = 5000;

// Valores estables de sensores
let stableSensorValues = {
    gas: 0,
    ultrasonic: 0,
    soil: 0,
    temperature: 0,
    humidity: 0,
    lastUpdate: 0
};

let lastRealUpdate = 0;
const UPDATE_INTERVAL = 2000;
let realPumpState = false;

// ===== SISTEMA DE ALERTAS TOAST (NO INVASIVAS) =====
function showToastAlert(message, type = 'info', sensorType = null) {
    if (sensorType) {
        const now = Date.now();
        if (now - lastAlertTime[sensorType] < ALERT_COOLDOWN) {
            console.log(`Alerta de ${sensorType} en cooldown, ignorando`);
            return;
        }
        lastAlertTime[sensorType] = now;
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }
    
    const icons = {
        success: '✅',
        danger: '🚨',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;
    toast.innerHTML = `
        <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
        <span style="flex: 1; font-weight: 500;">${message}</span>
        <span style="opacity: 0.7; font-size: 0.8rem; cursor: pointer;">✕</span>
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = `toast-progress ${type}`;
    toast.appendChild(progressBar);
    
    toastContainer.appendChild(toast);
    
    const autoRemove = setTimeout(() => {
        removeToast(toast);
    }, 4000);
    
    toast.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeToast(toast);
    });
    
    if (!noSensorMode || sensorsConnected) {
        alertHistory.push({
            message: message,
            type: type,
            sensorType: sensorType,
            timestamp: new Date().toISOString()
        });
        
        if (alertHistory.length > 50) {
            alertHistory.shift();
        }
        
        if (type !== 'success' && type !== 'info') {
            systemStats.alertCount++;
        }
    }
}

function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// ===== FUNCIONES DE EVALUACIÓN =====
function evaluateGasLevel(gasValue) {
    if (gasValue <= gasParameters.bueno) {
        return { level: 'normal', message: 'Aire limpio', icon: '🟢' };
    } else if (gasValue <= gasParameters.regular) {
        return { level: 'warning', message: 'Calidad regular', icon: '🟡' };
    } else if (gasValue <= gasParameters.malo) {
        return { level: 'danger', message: 'Aire contaminado', icon: '🟠' };
    } else {
        return { level: 'critical', message: '¡PELIGROSO!', icon: '🔴' };
    }
}

function evaluateUltrasonicLevel(ultraValue) {
    if (ultraValue <= 0) {
        return { level: 'normal', message: 'Sin datos del sensor', icon: '❌' };
    } else if (ultraValue <= ultrasonicParameters.minimo) {
        return { level: 'danger', message: '¡DESBORDE!', icon: '🔴' };
    } else if (ultraValue <= ultrasonicParameters.regular) {
        return { level: 'warning', message: 'Nivel máximo - Lleno', icon: '🟢' };
    } else if (ultraValue <= ultrasonicParameters.maximo) {
        return { level: 'normal', message: 'Nivel regular', icon: '🟡' };
    } else {
        return { level: 'critical', message: 'Nivel mínimo - Vacío', icon: '⚠️' };
    }
}

function getSoilStatus(soilValue) {
    if (soilValue === 0) {
        return { level: 'normal', message: 'Sin datos del sensor', shouldAlert: false };
    }
    
    if (soilValue >= plantParameters.soilMin && soilValue <= plantParameters.soilMax) {
        return { level: 'normal', message: 'Humedad óptima', shouldAlert: false };
    } else if (soilValue < plantParameters.soilMin) {
        const criticalLevel = plantParameters.soilMin * 0.7;
        const isCritical = soilValue < criticalLevel;
        return { 
            level: isCritical ? 'danger' : 'warning', 
            message: isCritical ? 'Suelo muy seco - ¡RIEGO URGENTE!' : 'Suelo seco - Necesita riego',
            shouldAlert: true,
            alertType: isCritical ? 'danger' : 'warning'
        };
    } else {
        return { 
            level: 'warning', 
            message: 'Suelo muy húmedo - Reducir riego', 
            shouldAlert: true,
            alertType: 'warning' 
        };
    }
}

function getTemperatureStatus(tempValue) {
    if (tempValue === 0) {
        return { level: 'normal', message: 'Sin datos', shouldAlert: false };
    }
    
    const tempDiff = Math.abs(tempValue - plantParameters.tempOptimal);
    
    if (tempDiff < 3) {
        return { level: 'normal', message: 'Temperatura óptima', shouldAlert: false };
    } else if (tempDiff < 7) {
        return { level: 'warning', message: 'Temperatura moderada', shouldAlert: false };
    } else {
        const isExtreme = tempDiff > 15;
        return {
            level: isExtreme ? 'danger' : 'warning',
            message: isExtreme ? 'Temperatura extrema - ¡REVISAR!' : 'Temperatura no ideal',
            shouldAlert: isExtreme,
            alertType: 'warning'
        };
    }
}

function getHumidityStatus(humidValue) {
    if (humidValue === 0) {
        return { level: 'normal', message: 'Sin datos', shouldAlert: false };
    }
    
    const humidDiff = Math.abs(humidValue - plantParameters.humidOptimal);
    
    if (humidDiff < 10) {
        return { level: 'normal', message: 'Humedad ideal', shouldAlert: false };
    } else if (humidDiff < 20) {
        return { level: 'warning', message: 'Humedad aceptable', shouldAlert: false };
    } else {
        const isExtreme = humidDiff > 30;
        return {
            level: isExtreme ? 'danger' : 'warning',
            message: isExtreme ? 'Humedad extrema - ¡REVISAR!' : 'Humedad no ideal',
            shouldAlert: isExtreme,
            alertType: 'warning'
        };
    }
}

// ===== ACTUALIZACIÓN DE PARÁMETROS =====
function updateGasParameters() {
    const bueno = parseInt(document.getElementById('gasGoodMax').value) || 30;
    const regular = parseInt(document.getElementById('gasRegularMax').value) || 100;
    const malo = parseInt(document.getElementById('gasBadMax').value) || 150;
    
    if (bueno >= regular || regular >= malo) {
        showToastAlert('Error: Los valores deben ser: Bueno < Regular < Malo', 'danger');
        return;
    }
    
    gasParameters = {
        bueno: bueno,
        regular: regular,
        malo: malo,
        peligroso: malo + 1
    };
    
    updateGasParametersDisplay();
    showToastAlert('Parámetros de gas actualizados correctamente', 'success');
}

function updateUltrasonicParameters() {
    const minimo = parseInt(document.getElementById('ultraMinMax').value) || 5;
    const regular = parseInt(document.getElementById('ultraRegularMax').value) || 15;
    const maximo = parseInt(document.getElementById('ultraMaxMax').value) || 25;
    
    if (minimo >= regular || regular >= maximo) {
        showToastAlert('Error: Los valores deben ser: Mínimo < Regular < Máximo', 'danger');
        return;
    }
    
    ultrasonicParameters = {
        minimo: minimo,
        regular: regular,
        maximo: maximo
    };
    
    updateUltrasonicParametersDisplay();
    showToastAlert('Parámetros de ultrasonido actualizados correctamente', 'success');
}

function updateGasParametersDisplay() {
    const display = document.getElementById('gasParametersDisplay');
    if (display) {
        display.innerHTML = `
            <strong>Parámetros de Gas:</strong><br>
            🟢 Bueno: 0 - ${gasParameters.bueno}<br>
            🟡 Regular: ${gasParameters.bueno + 1} - ${gasParameters.regular}<br>
            🟠 Malo: ${gasParameters.regular + 1} - ${gasParameters.malo}<br>
            🔴 Peligroso: ${gasParameters.malo + 1}+
        `;
    }
}

function updateUltrasonicParametersDisplay() {
    const display = document.getElementById('ultraParametersDisplay');
    if (display) {
        display.innerHTML = `
            <strong>Parámetros de Ultrasonido:</strong><br>
            🔴 Mínimo (Vacío): 0 - ${ultrasonicParameters.minimo} cm<br>
            🟡 Regular: ${ultrasonicParameters.minimo + 1} - ${ultrasonicParameters.regular} cm<br>
            🟢 Máximo (Lleno): ${ultrasonicParameters.regular + 1} - ${ultrasonicParameters.maximo} cm<br>
            ⚠️ Desborde: ${ultrasonicParameters.maximo + 1}+ cm
        `;
    }
}

function updateParameters() {
    const getValue = (id, defaultValue) => {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) || defaultValue : defaultValue;
    };
    
    plantParameters.soilOptimal = getValue('soilOptimal', 50);
    plantParameters.soilMin = getValue('soilMin', 25);
    plantParameters.soilMax = getValue('soilMax', 75);
    plantParameters.tempOptimal = getValue('tempOptimal', 25);
    plantParameters.humidOptimal = getValue('humidOptimal', 60);
    
    showToastAlert('Parámetros de planta actualizados correctamente', 'success');
    updateParametersDisplay();
}

function updateParametersDisplay() {
    const paramsDisplay = document.getElementById('currentParameters');
    if (paramsDisplay) {
        paramsDisplay.innerHTML = `
            <strong>Parámetros Actuales:</strong><br>
            Humedad Suelo: ${plantParameters.soilMin}% - ${plantParameters.soilMax}%<br>
            Temperatura Óptima: ${plantParameters.tempOptimal}°C<br>
            Humedad Aire Óptima: ${plantParameters.humidOptimal}%
        `;
    }
}

// ===== ESTADÍSTICAS =====
function updateStatistics() {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    updateElement('totalReadings', systemStats.totalReadings);
    updateElement('alertCount', systemStats.alertCount);
    updateElement('irrigationCount', systemStats.irrigationCount);
    updateElement('uptime', getSystemUptime());
    
    updateElement('gasGoodCount', alertStats.bueno);
    updateElement('gasRegularCount', alertStats.regular);
    updateElement('gasBadCount', alertStats.malo);
    updateElement('gasDangerCount', alertStats.peligroso);
}

function getSystemUptime() {
    const now = Date.now();
    const uptime = now - systemStats.startTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

function startTimeUpdater() {
    setInterval(() => {
        updateStatistics();
    }, 1000);
}

// ===== ACTUALIZACIÓN DE INDICADORES GLOBALES =====
function updateGlobalIndicators() {
    const sensorIndicator = document.getElementById('sensor-indicator');
    const pumpIndicator = document.getElementById('pump-indicator');
    
    if (sensorIndicator) {
        const dot = sensorIndicator.querySelector('.indicator-dot');
        if (sensorsConnected) {
            dot.textContent = '🟢';
        } else {
            dot.textContent = '⚪';
        }
    }
    
    if (pumpIndicator) {
        const dot = pumpIndicator.querySelector('.indicator-dot');
        if (pumpConnected) {
            dot.textContent = '🟢';
        } else {
            dot.textContent = '⚪';
        }
    }
}

// ===== GUARDADO Y CARGA DE DATOS =====
function saveAllData() {
    try {
        localStorage.setItem('sensorData', JSON.stringify(sensorData));
        localStorage.setItem('systemStats', JSON.stringify({
            ...systemStats,
            startTime: systemStats.startTime
        }));
        localStorage.setItem('alertHistory', JSON.stringify(alertHistory));
        localStorage.setItem('alertStats', JSON.stringify(alertStats));
        localStorage.setItem('plantParameters', JSON.stringify(plantParameters));
        localStorage.setItem('gasParameters', JSON.stringify(gasParameters));
        localStorage.setItem('ultrasonicParameters', JSON.stringify(ultrasonicParameters));
        localStorage.setItem('systemConfig', JSON.stringify({
            noSensorMode: noSensorMode,
            autoModeActive: autoModeActive,
            emergencyStopActive: false
        }));
        
        console.log('Datos guardados automáticamente');
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
}

function loadSavedData() {
    try {
        const savedSensorData = localStorage.getItem('sensorData');
        if (savedSensorData) {
            const loadedSensorData = JSON.parse(savedSensorData);
            if (loadedSensorData.timestamps && loadedSensorData.timestamps.length > 0) {
                sensorData = { ...sensorData, ...loadedSensorData };
            }
        }
        
        const savedSystemStats = localStorage.getItem('systemStats');
        if (savedSystemStats) {
            const stats = JSON.parse(savedSystemStats);
            systemStats = { 
                ...systemStats, 
                ...stats, 
                startTime: Date.now()
            };
        }
        
        const savedAlertHistory = localStorage.getItem('alertHistory');
        if (savedAlertHistory) {
            alertHistory = JSON.parse(savedAlertHistory);
        }
        
        const savedAlertStats = localStorage.getItem('alertStats');
        if (savedAlertStats) {
            alertStats = JSON.parse(savedAlertStats);
        }
        
        const savedPlantParameters = localStorage.getItem('plantParameters');
        if (savedPlantParameters) {
            plantParameters = { ...plantParameters, ...JSON.parse(savedPlantParameters) };
        }
        
        const savedGasParameters = localStorage.getItem('gasParameters');
        if (savedGasParameters) {
            gasParameters = { ...gasParameters, ...JSON.parse(savedGasParameters) };
        }
        
        const savedUltrasonicParameters = localStorage.getItem('ultrasonicParameters');
        if (savedUltrasonicParameters) {
            ultrasonicParameters = { ...ultrasonicParameters, ...JSON.parse(savedUltrasonicParameters) };
        }
        
        const savedConfig = localStorage.getItem('systemConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            autoModeActive = config.autoModeActive || false;
            emergencyStopActive = false;
        }
        
        console.log('Datos guardados cargados');
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ===== EVENTOS GLOBALES =====
window.addEventListener('beforeunload', function(e) {
    console.log('Guardando datos antes del cierre...');
    saveAllData();
});

console.log('✅ global.js cargado correctamente');