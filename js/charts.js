// ===== LÓGICA DE GRÁFICAS Y ESTADÍSTICAS =====

// ===== INICIALIZACIÓN DE GRÁFICAS =====
function initializeCharts() {
    try {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            return;
        }

        console.log('Inicializando gráficas con altura fija...');

        Chart.defaults.responsive = false;
        Chart.defaults.maintainAspectRatio = false;

        // Gráfica de sensores en tiempo real
        const sensorsCanvas = document.getElementById('sensorsChart');
        if (sensorsCanvas) {
            sensorsCanvas.width = 400;
            sensorsCanvas.height = 300;
            sensorsCanvas.style.width = '400px';
            sensorsCanvas.style.height = '300px';
            
            const sensorsCtx = sensorsCanvas.getContext('2d');
            charts.sensors = new Chart(sensorsCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Humedad Suelo (%)',
                            data: [],
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Temperatura (°C)',
                            data: [],
                            borderColor: '#FF5722',
                            backgroundColor: 'rgba(255, 87, 34, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Humedad Aire (%)',
                            data: [],
                            borderColor: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            tension: 0.4,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    width: 400,
                    height: 300,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    animation: false
                }
            });
        }
        
        // Gráfica de alertas
        const alertsCanvas = document.getElementById('alertsChart');
        if (alertsCanvas) {
            alertsCanvas.width = 300;
            alertsCanvas.height = 300;
            alertsCanvas.style.width = '300px !important';
            alertsCanvas.style.height = '300px !important';
            
            alertsCanvas.removeAttribute('style');
            alertsCanvas.style.cssText = 'width: 300px !important; height: 300px !important; display: block; box-sizing: border-box;';
            
            const alertsCtx = alertsCanvas.getContext('2d');
            charts.alerts = new Chart(alertsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Bueno', 'Regular', 'Malo', 'Peligroso'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            '#4CAF50',
                            '#FF9800',
                            '#F44336',
                            '#E91E63'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    width: 300,
                    height: 300,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    animation: false
                }
            });
        }
        
        // Gráfica de gas
        const gasCanvas = document.getElementById('gasChart');
        if (gasCanvas) {
            gasCanvas.width = 400;
            gasCanvas.height = 300;
            gasCanvas.style.width = '400px';
            gasCanvas.style.height = '300px';
            
            const gasCtx = gasCanvas.getContext('2d');
            charts.gas = new Chart(gasCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Nivel de Gas',
                        data: [],
                        borderColor: '#FF5722',
                        backgroundColor: 'rgba(255, 87, 34, 0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    width: 400,
                    height: 300,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: false
                }
            });
        }
        
        // Gráfica de ultrasonido
        const ultraCanvas = document.getElementById('ultraChart');
        if (ultraCanvas) {
            ultraCanvas.width = 300;
            ultraCanvas.height = 300;
            ultraCanvas.style.width = '300px';
            ultraCanvas.style.height = '300px';
            
            const ultraCtx = ultraCanvas.getContext('2d');
            charts.ultrasonic = new Chart(ultraCtx, {
                type: 'bar',
                data: {
                    labels: ['Nivel Actual'],
                    datasets: [{
                        label: 'Distancia (cm)',
                        data: [0],
                        backgroundColor: '#cccccc',
                        borderColor: '#999',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    width: 300,
                    height: 300,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 50
                        }
                    },
                    animation: false
                }
            });
        }
        
        // Gráfica de riego
        const irrigationCanvas = document.getElementById('irrigationChart');
        if (irrigationCanvas) {
            irrigationCanvas.width = 300;
            irrigationCanvas.height = 300;
            irrigationCanvas.style.width = '300px';
            irrigationCanvas.style.height = '300px';
            
            const irrigationCtx = irrigationCanvas.getContext('2d');
            charts.irrigation = new Chart(irrigationCtx, {
                type: 'bar',
                data: {
                    labels: ['Riegos Realizados'],
                    datasets: [{
                        label: 'Cantidad',
                        data: [0],
                        backgroundColor: '#2196F3',
                        borderColor: '#1976D2',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    width: 300,
                    height: 300,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: false
                }
            });
        }
        
        chartsInitialized = true;
        shouldUpdateCharts = false;
        
        console.log('Gráficas inicializadas correctamente');
        
    } catch (error) {
        console.error('Error inicializando gráficas:', error);
    }
}

// ===== ACTUALIZACIÓN DE GRÁFICAS =====
function updateCharts() {
    try {
        if (!chartsInitialized) {
            console.log('Gráficas no inicializadas');
            return;
        }
        
        if (!shouldUpdateCharts) {
            console.log('shouldUpdateCharts es false');
            return;
        }
        
        if (!sensorsConnected) {
            console.log('Sensores no conectados');
            return;
        }
        
        if (noSensorMode) {
            console.log('En modo sin sensores');
            return;
        }
        
        if (sensorData.timestamps.length === 0) {
            console.log('Sin timestamps');
            return;
        }
        
        console.log('Actualizando gráficas...');
        
        const maxPoints = 10;
        
        // Actualizar gráfica de sensores
        if (charts.sensors) {
            charts.sensors.data.labels = sensorData.timestamps.slice(-maxPoints);
            charts.sensors.data.datasets[0].data = sensorData.soil.slice(-maxPoints);
            charts.sensors.data.datasets[1].data = sensorData.temperature.slice(-maxPoints);
            charts.sensors.data.datasets[2].data = sensorData.humidity.slice(-maxPoints);
            charts.sensors.update('none');
        }
        
        // Actualizar gráfica de gas
        if (charts.gas && sensorData.gas.length > 0) {
            charts.gas.data.labels = sensorData.timestamps.slice(-maxPoints);
            charts.gas.data.datasets[0].data = sensorData.gas.slice(-maxPoints);
            charts.gas.update('none');
        }
        
        // Actualizar gráfica de ultrasonido
        if (charts.ultrasonic && sensorData.ultrasonic.length > 0) {
            const lastUltrasonic = sensorData.ultrasonic[sensorData.ultrasonic.length - 1];
            if (lastUltrasonic > 0) {
                charts.ultrasonic.data.datasets[0].data = [lastUltrasonic];
                
                let color = '#4CAF50';
                if (lastUltrasonic <= ultrasonicParameters.minimo) color = '#F44336';
                else if (lastUltrasonic <= ultrasonicParameters.regular) color = '#FF9800';
                else if (lastUltrasonic > ultrasonicParameters.maximo) color = '#9C27B0';
                
                charts.ultrasonic.data.datasets[0].backgroundColor = color;
                charts.ultrasonic.update('none');
            }
        }
        
        // Actualizar gráfica de alertas
        if (charts.alerts) {
            const totalAlerts = alertStats.bueno + alertStats.regular + alertStats.malo + alertStats.peligroso;
            if (totalAlerts > 0) {
                charts.alerts.data.datasets[0].data = [
                    alertStats.bueno,
                    alertStats.regular,
                    alertStats.malo,
                    alertStats.peligroso
                ];
                charts.alerts.update('none');
            }
        }
        
        // Actualizar gráfica de riego
        if (charts.irrigation && systemStats.irrigationCount > 0) {
            charts.irrigation.data.datasets[0].data = [systemStats.irrigationCount];
            charts.irrigation.update('none');
        }
        
    } catch (error) {
        console.error('Error actualizando gráficas:', error);
    }
}

function updateAlertsChartForced() {
    if (charts.alerts && chartsInitialized) {
        const totalAlerts = alertStats.bueno + alertStats.regular + alertStats.malo + alertStats.peligroso;
        
        console.log('Actualizando gráfica de alertas - Total:', totalAlerts);
        
        if (totalAlerts > 0) {
            charts.alerts.data.datasets[0].data = [
                alertStats.bueno,
                alertStats.regular,
                alertStats.malo,
                alertStats.peligroso
            ];
            charts.alerts.update('none');
        } else {
            charts.alerts.data.datasets[0].data = [1, 0, 0, 0];
            charts.alerts.update('none');
        }
    }
}

// ===== FUNCIONES DE DATOS =====
function resetSensors() {
    if (!confirm('¿Resetear los datos de sensores?')) return;
    
    sensorData = {
        gas: [],
        ultrasonic: [],
        soil: [],
        temperature: [],
        humidity: [],
        timestamps: []
    };
    
    alertStats = {
        bueno: 0,
        regular: 0,
        malo: 0,
        peligroso: 0
    };
    
    systemStats.totalReadings = 0;
    systemStats.alertCount = 0;
    
    if (chartsInitialized) {
        if (charts.sensors) {
            charts.sensors.data.labels = [];
            charts.sensors.data.datasets.forEach(dataset => {
                dataset.data = [];
            });
            charts.sensors.update('none');
        }
        
        if (charts.gas) {
            charts.gas.data.labels = [];
            charts.gas.data.datasets[0].data = [];
            charts.gas.update('none');
        }
        
        if (charts.ultrasonic) {
            charts.ultrasonic.data.datasets[0].data = [0];
            charts.ultrasonic.data.datasets[0].backgroundColor = '#cccccc';
            charts.ultrasonic.update('none');
        }
        
        if (charts.alerts) {
            charts.alerts.data.datasets[0].data = [0, 0, 0, 0];
            charts.alerts.update('none');
        }
        
        if (charts.irrigation) {
            charts.irrigation.data.datasets[0].data = [0];
            charts.irrigation.update('none');
        }
    }
    
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }
    
    showToastAlert('Datos de sensores reseteados', 'success');
}

function clearData() {
    if (!confirm('¿Limpiar todos los datos del sistema?')) return;
    
    sensorData = {
        gas: [],
        ultrasonic: [],
        soil: [],
        temperature: [],
        humidity: [],
        timestamps: []
    };
    
    systemStats = {
        totalReadings: 0,
        alertCount: 0,
        irrigationCount: 0,
        startTime: Date.now(),
        backupInterval: systemStats.backupInterval
    };
    
    alertStats = {
        bueno: 0,
        regular: 0,
        malo: 0,
        peligroso: 0
    };
    
    alertHistory = [];
    
    const keysToKeep = ['plantParameters', 'gasParameters', 'ultrasonicParameters'];
    Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
        }
    });
    
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }
    
    showToastAlert('Todos los datos limpiados', 'success');
}

function exportData() {
    try {
        const exportData = {
            timestamp: new Date().toISOString(),
            sensorData: sensorData,
            systemStats: systemStats,
            plantParameters: plantParameters,
            gasParameters: gasParameters,
            ultrasonicParameters: ultrasonicParameters,
            alertHistory: alertHistory,
            alertStats: alertStats,
            systemInfo: {
                noSensorMode: noSensorMode,
                sensorsConnected: sensorsConnected,
                pumpConnected: pumpConnected,
                autoModeActive: autoModeActive
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `riego_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToastAlert('Datos exportados correctamente', 'success');
    } catch (error) {
        console.error('Error exportando:', error);
        showToastAlert('Error al exportar datos', 'danger');
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.sensorData && typeof importedData.sensorData === 'object') {
                sensorData = importedData.sensorData;
            }
            
            if (importedData.plantParameters && typeof importedData.plantParameters === 'object') {
                plantParameters = importedData.plantParameters;
                if (typeof updateParametersDisplay === 'function') {
                    updateParametersDisplay();
                }
            }
            
            if (importedData.gasParameters && typeof importedData.gasParameters === 'object') {
                gasParameters = importedData.gasParameters;
                if (typeof updateGasParametersDisplay === 'function') {
                    updateGasParametersDisplay();
                }
            }
            
            if (importedData.ultrasonicParameters && typeof importedData.ultrasonicParameters === 'object') {
                ultrasonicParameters = importedData.ultrasonicParameters;
                if (typeof updateUltrasonicParametersDisplay === 'function') {
                    updateUltrasonicParametersDisplay();
                }
            }
            
            if (importedData.alertHistory && Array.isArray(importedData.alertHistory)) {
                alertHistory = importedData.alertHistory;
            }
            
            if (importedData.alertStats && typeof importedData.alertStats === 'object') {
                alertStats = importedData.alertStats;
            }
            
            if (importedData.systemStats && typeof importedData.systemStats === 'object') {
                systemStats = { 
                    ...systemStats, 
                    ...importedData.systemStats, 
                    startTime: systemStats.startTime 
                };
            }
            
            if (chartsInitialized && shouldUpdateCharts) {
                updateCharts();
            }
            
            if (typeof updateStatistics === 'function') {
                updateStatistics();
            }
            
            showToastAlert('Datos importados correctamente', 'success');
            
        } catch (error) {
            console.error('Error importando:', error);
            showToastAlert('Error al importar datos: archivo inválido', 'danger');
        }
    };
    
    reader.readAsText(file);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando charts.js...');
    
    setTimeout(() => {
        initializeCharts();
    }, 500);
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', importData);
    }
    
    console.log('✅ charts.js inicializado correctamente');
});

console.log('✅ charts.js cargado correctamente');