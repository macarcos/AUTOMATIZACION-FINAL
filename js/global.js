// ===== VARIABLES GLOBALES COMPARTIDAS =====

// ----- Variables de conexión Arduino -----
let sensorsPort = null; // Almacena el objeto del puerto serial de sensores.
let pumpPort = null; // Almacena el objeto del puerto serial de la bomba.
let sensorsConnected = false; // Indica si el Arduino de sensores está conectado (true/false).
let pumpConnected = false; // Indica si el Arduino de bomba está conectado (true/false).
let sensorsReader = null; // Objeto que lee activamente los datos del puerto de sensores.
let pumpReader = null; // Objeto que lee activamente los datos del puerto de bomba.
let lastDataReceived = 0; // Timestamp (hora) de la última vez que se recibieron datos.

// ----- Variables de datos del sistema -----
// Almacena los arrays (historial) de todas las lecturas de sensores.
let sensorData = {
    gas: [],
    ultrasonic: [],
    soil: [],
    temperature: [],
    humidity: [],
    timestamps: [] // Almacena la hora de cada lectura para las gráficas.
};

// Almacena el conteo de cuántas veces se ha estado en cada estado (bueno, malo, etc.).
let alertStats = {
    bueno: 0,
    regular: 0,
    malo: 0,
    peligroso: 0
};

// ----- Parámetros configurables -----
// Define los límites (umbrales) para las alertas del sensor de gas.
let gasParameters = {
    bueno: 30,
    regular: 100,
    malo: 150,
    peligroso: 151
};

// Define los límites (en cm) para el sensor de nivel de agua (ultrasonido).
let ultrasonicParameters = {
    minimo: 5,
    regular: 15,
    maximo: 25
};

// Define los parámetros óptimos, mínimos y máximos para el riego de la planta.
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

// Almacena estadísticas generales del sistema (contadores y tiempo de inicio).
let systemStats = {
    totalReadings: 0,
    alertCount: 0,
    irrigationCount: 0,
    startTime: Date.now(),
    backupInterval: null
};

// ----- Variables de estado -----
let alertHistory = []; // Almacena un historial de todas las alertas mostradas.
let noSensorMode = true; // Define si la app está en modo simulación (true) o real (false).
let pumpActive = false; // Estado (ON/OFF) que la app *desea* que tenga la bomba.
let autoModeActive = false; // Indica si el modo de riego automático está activado.
let emergencyStopActive = false; // Indica si el botón de Parada de Emergencia está activado.
let charts = {}; // Objeto que guarda las instancias de las gráficas (Chart.js).
let chartsInitialized = false; // Indica si las gráficas ya fueron creadas (true/false).
let shouldUpdateCharts = false; // Permiso para que las gráficas se actualicen con datos reales.

// ----- Control de alertas -----
// Guarda la hora de la última alerta para evitar spam (cooldown).
let lastAlertTime = {
    gas: 0,
    ultrasonic: 0,
    soil: 0,
    temperature: 0,
    humidity: 0
};

// Tiempo (en milisegundos) que debe pasar antes de repetir una alerta del mismo tipo.
const ALERT_COOLDOWN = 5000;

// ----- Valores estables de sensores -----
// Almacena el último valor estable (promediado) de los sensores.
let stableSensorValues = {
    gas: 0,
    ultrasonic: 0,
    soil: 0,
    temperature: 0,
    humidity: 0,
    lastUpdate: 0
};

let lastRealUpdate = 0; // Timestamp de la última actualización real de datos.
const UPDATE_INTERVAL = 2000; // Intervalo (ms) deseado entre lecturas de datos.
let realPumpState = false; // Estado real de la bomba (confirmado por el Arduino).

// ===== SISTEMA DE ALERTAS TOAST (NO INVASIVAS) =====

// Muestra una notificación "Toast" (emergente) en la esquina de la pantalla.
function showToastAlert(message, type = 'info', sensorType = null) {
    // Si es una alerta de sensor, comprueba el "cooldown" (enfriamiento) para evitar spam.
    if (sensorType) {
        const now = Date.now();
        if (now - lastAlertTime[sensorType] < ALERT_COOLDOWN) {
            console.log(`Alerta de ${sensorType} en cooldown, ignorando`);
            return; // Detiene la función si la alerta es muy reciente.
        }
        lastAlertTime[sensorType] = now; // Registra la hora de esta alerta.
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`); // Muestra la alerta en la consola.
    
    // Busca el contenedor de notificaciones; si no existe, lo crea.
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }
    
    // Define los emojis para cada tipo de alerta.
    const icons = {
        success: '✅',
        danger: '🚨',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Crea el elemento HTML para la nueva notificación.
    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;
    toast.innerHTML = `
        <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
        <span style="flex: 1; font-weight: 500;">${message}</span>
        <span style="opacity: 0.7; font-size: 0.8rem; cursor: pointer;">✕</span>
    `;
    
    // Crea la barra de progreso visual para la notificación.
    const progressBar = document.createElement('div');
    progressBar.className = `toast-progress ${type}`;
    toast.appendChild(progressBar);
    
    // Añade la notificación a la pantalla.
    toastContainer.appendChild(toast);
    
    // Inicia un temporizador para eliminar la notificación automáticamente después de 4 segundos.
    const autoRemove = setTimeout(() => {
        removeToast(toast);
    }, 4000);
    
    // Permite al usuario cerrar la notificación haciendo clic en ella.
    toast.addEventListener('click', () => {
        clearTimeout(autoRemove); // Cancela el auto-borrado.
        removeToast(toast);
    });
    
    // Si no estamos en modo simulación, guarda la alerta en el historial.
    if (!noSensorMode || sensorsConnected) {
        alertHistory.push({
            message: message,
            type: type,
            sensorType: sensorType,
            timestamp: new Date().toISOString()
        });
        
        // Limita el historial a las últimas 50 alertas para no usar mucha memoria.
        if (alertHistory.length > 50) {
            alertHistory.shift(); // Elimina la alerta más antigua.
        }
        
        // Incrementa el contador de alertas (solo si es advertencia o peligro).
        if (type !== 'success' && type !== 'info') {
            systemStats.alertCount++;
        }
    }
}

// Elimina la notificación (toast) de la pantalla con una animación de salida.
function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease'; // Aplica la animación CSS de salida.
        // Espera a que termine la animación (300ms) antes de borrar el elemento.
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// ===== FUNCIONES DE EVALUACIÓN =====

// Devuelve un estado (normal, peligroso) y un mensaje basado en el valor del gas.
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

// Devuelve un estado (lleno, vacío, desborde) basado en el valor del ultrasonido.
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

// Evalúa si la humedad del suelo es óptima, seca o muy húmeda.
function getSoilStatus(soilValue) {
    if (soilValue === 0) {
        return { level: 'normal', message: 'Sin datos del sensor', shouldAlert: false };
    }
    
    if (soilValue >= plantParameters.soilMin && soilValue <= plantParameters.soilMax) {
        return { level: 'normal', message: 'Humedad óptima', shouldAlert: false };
    } else if (soilValue < plantParameters.soilMin) {
        const criticalLevel = plantParameters.soilMin * 0.7; // Define un nivel crítico (70% del mínimo).
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

// Evalúa si la temperatura ambiente es óptima o extrema.
function getTemperatureStatus(tempValue) {
    if (tempValue === 0) {
        return { level: 'normal', message: 'Sin datos', shouldAlert: false };
    }
    
    const tempDiff = Math.abs(tempValue - plantParameters.tempOptimal); // Calcula la diferencia con el óptimo.
    
    if (tempDiff < 3) {
        return { level: 'normal', message: 'Temperatura óptima', shouldAlert: false };
    } else if (tempDiff < 7) {
        return { level: 'warning', message: 'Temperatura moderada', shouldAlert: false };
    } else {
        const isExtreme = tempDiff > 15; // Define si la temperatura es extrema.
        return {
            level: isExtreme ? 'danger' : 'warning',
            message: isExtreme ? 'Temperatura extrema - ¡REVISAR!' : 'Temperatura no ideal',
            shouldAlert: isExtreme,
            alertType: 'warning'
        };
    }
}

// Evalúa si la humedad del aire es óptima o extrema.
function getHumidityStatus(humidValue) {
    if (humidValue === 0) {
        return { level: 'normal', message: 'Sin datos', shouldAlert: false };
    }
    
    const humidDiff = Math.abs(humidValue - plantParameters.humidOptimal); // Calcula la diferencia con el óptimo.
    
    if (humidDiff < 10) {
        return { level: 'normal', message: 'Humedad ideal', shouldAlert: false };
    } else if (humidDiff < 20) {
        return { level: 'warning', message: 'Humedad aceptable', shouldAlert: false };
    } else {
        const isExtreme = humidDiff > 30; // Define si la humedad es extrema.
        return {
            level: isExtreme ? 'danger' : 'warning',
            message: isExtreme ? 'Humedad extrema - ¡REVISAR!' : 'Humedad no ideal',
            shouldAlert: isExtreme,
            alertType: 'warning'
        };
    }
}

// ===== ACTUALIZACIÓN DE PARÁMETROS =====

// Lee los valores de los inputs de gas y actualiza la variable global.
function updateGasParameters() {
    const bueno = parseInt(document.getElementById('gasGoodMax').value) || 30;
    const regular = parseInt(document.getElementById('gasRegularMax').value) || 100;
    const malo = parseInt(document.getElementById('gasBadMax').value) || 150;
    
    // Valida que los rangos sean lógicos (Bueno < Regular < Malo).
    if (bueno >= regular || regular >= malo) {
        showToastAlert('Error: Los valores deben ser: Bueno < Regular < Malo', 'danger');
        return;
    }
    
    // Actualiza la variable global de parámetros de gas.
    gasParameters = {
        bueno: bueno,
        regular: regular,
        malo: malo,
        peligroso: malo + 1
    };
    
    updateGasParametersDisplay(); // Actualiza la UI.
    showToastAlert('Parámetros de gas actualizados correctamente', 'success');
}

// Lee los valores de los inputs de ultrasonido y actualiza la variable global.
function updateUltrasonicParameters() {
    const minimo = parseInt(document.getElementById('ultraMinMax').value) || 5;
    const regular = parseInt(document.getElementById('ultraRegularMax').value) || 15;
    const maximo = parseInt(document.getElementById('ultraMaxMax').value) || 25;
    
    // Valida que los rangos sean lógicos.
    if (minimo >= regular || regular >= maximo) {
        showToastAlert('Error: Los valores deben ser: Mínimo < Regular < Máximo', 'danger');
        return;
    }
    
    // Actualiza la variable global de parámetros de ultrasonido.
    ultrasonicParameters = {
        minimo: minimo,
        regular: regular,
        maximo: maximo
    };
    
    updateUltrasonicParametersDisplay(); // Actualiza la UI.
    showToastAlert('Parámetros de ultrasonido actualizados correctamente', 'success');
}

// Actualiza el texto en la UI que muestra los parámetros de gas actuales.
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

// Actualiza el texto en la UI que muestra los parámetros de ultrasonido actuales.
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

// Lee los valores de los inputs de la planta y actualiza la variable global.
function updateParameters() {
    // Función auxiliar para leer un valor numérico de un input de forma segura.
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
    updateParametersDisplay(); // Actualiza la UI.
}

// Actualiza el texto en la UI que muestra los parámetros de la planta actuales.
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

// Actualiza todos los contadores de estadísticas en la UI.
function updateStatistics() {
    // Función auxiliar para cambiar el texto de un elemento HTML por su ID.
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    updateElement('totalReadings', systemStats.totalReadings);
    updateElement('alertCount', systemStats.alertCount);
    updateElement('irrigationCount', systemStats.irrigationCount);
    updateElement('uptime', getSystemUptime()); // Actualiza el tiempo activo.
    
    // Actualiza el conteo de alertas de gas.
    updateElement('gasGoodCount', alertStats.bueno);
    updateElement('gasRegularCount', alertStats.regular);
    updateElement('gasBadCount', alertStats.malo);
    updateElement('gasDangerCount', alertStats.peligroso);
}

// Calcula y formatea el tiempo que la app lleva abierta (ej. "1h 5m 10s").
function getSystemUptime() {
    const now = Date.now();
    const uptime = now - systemStats.startTime; // Diferencia en milisegundos.
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Inicia un intervalo que actualiza las estadísticas (incluyendo el tiempo activo) cada segundo.
function startTimeUpdater() {
    setInterval(() => {
        updateStatistics();
    }, 1000);
}

// ===== ACTUALIZACIÓN DE INDICADORES GLOBALES =====

// Actualiza los puntos de estado (🟢/⚪) de conexión (sensores/bomba) en la barra superior.
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

// Guarda todas las variables y parámetros importantes en el localStorage del navegador.
function saveAllData() {
    try {
        localStorage.setItem('sensorData', JSON.stringify(sensorData));
        localStorage.setItem('systemStats', JSON.stringify({
            ...systemStats,
            startTime: systemStats.startTime // Guarda las estadísticas.
        }));
        localStorage.setItem('alertHistory', JSON.stringify(alertHistory));
        localStorage.setItem('alertStats', JSON.stringify(alertStats));
        localStorage.setItem('plantParameters', JSON.stringify(plantParameters));
        localStorage.setItem('gasParameters', JSON.stringify(gasParameters));
        localStorage.setItem('ultrasonicParameters', JSON.stringify(ultrasonicParameters));
        localStorage.setItem('systemConfig', JSON.stringify({
            noSensorMode: noSensorMode,
            autoModeActive: autoModeActive,
            emergencyStopActive: false // Siempre guarda la emergencia como apagada.
        }));
        
        console.log('Datos guardados automáticamente');
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
}

// Carga todos los datos guardados del localStorage al iniciar la app.
function loadSavedData() {
    try {
        const savedSensorData = localStorage.getItem('sensorData');
        if (savedSensorData) {
            const loadedSensorData = JSON.parse(savedSensorData);
            // Carga los datos de sensores solo si no están vacíos.
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
                startTime: Date.now() // Restaura estadísticas, pero reinicia el tiempo activo.
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
            emergencyStopActive = false; // Asegura que la app no inicie en parada de emergencia.
        }
        
        console.log('Datos guardados cargados');
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ===== EVENTOS GLOBALES =====

// Ejecuta 'saveAllData' automáticamente si el usuario cierra o recarga la pestaña.
window.addEventListener('beforeunload', function(e) {
    console.log('Guardando datos antes del cierre...');
    saveAllData();
});

console.log('✅ global.js cargado correctamente');
