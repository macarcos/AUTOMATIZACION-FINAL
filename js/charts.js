// ===== LÓGICA DE GRÁFICAS Y ESTADÍSTICAS =====

// ===== INICIALIZACIÓN DE GRÁFICAS =====

// Crea e inicializa todas las gráficas de Chart.js al cargar la página.
function initializeCharts() {
    try {
        // Comprueba si la librería Chart.js se cargó correctamente.
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            return;
        }

        console.log('Inicializando gráficas con altura fija...');

        // Evita que las gráficas cambien de tamaño automáticamente (responsive).
        Chart.defaults.responsive = false;
        // Permite forzar un alto y ancho específicos (ignora el aspect ratio).
        Chart.defaults.maintainAspectRatio = false;

        // --- Gráfica de sensores en tiempo real ---
        const sensorsCanvas = document.getElementById('sensorsChart');
        if (sensorsCanvas) {
            // Fija el ancho y alto del canvas (necesario por 'responsive: false').
            sensorsCanvas.width = 400;
            sensorsCanvas.height = 300;
            sensorsCanvas.style.width = '400px';
            sensorsCanvas.style.height = '300px';
            
            // Obtiene el contexto 2D para dibujar la gráfica.
            const sensorsCtx = sensorsCanvas.getContext('2d');
            // Crea la nueva gráfica de tipo 'line' (línea).
            charts.sensors = new Chart(sensorsCtx, {
                type: 'line',
                data: {
                    labels: [], // Eje X (timestamps) - se llenará después.
                    datasets: [ // Define las 3 líneas de datos.
                        {
                            label: 'Humedad Suelo (%)',
                            data: [],
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            tension: 0.4, // Suaviza la línea.
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
                    responsive: false, // Doble confirmación de tamaño fijo.
                    maintainAspectRatio: false,
                    width: 400,
                    height: 300,
                    scales: {
                        y: { // Configuración del Eje Y.
                            beginAtZero: true, // Empieza en 0.
                            max: 100, // Termina en 100.
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: { // Configuración del Eje X.
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top' // Leyenda en la parte superior.
                        }
                    },
                    animation: false // Desactiva animaciones para mejor rendimiento en tiempo real.
                }
            });
        }
        
        // --- Gráfica de alertas ---
        const alertsCanvas = document.getElementById('alertsChart');
        if (alertsCanvas) {
            alertsCanvas.width = 300;
            alertsCanvas.height = 300;
            // Limpia estilos previos que puedan interferir.
            alertsCanvas.removeAttribute('style');
            // Aplica forzosamente el tamaño deseado (300x300).
            alertsCanvas.style.cssText = 'width: 300px !important; height: 300px !important; display: block; box-sizing: border-box;';
            
            const alertsCtx = alertsCanvas.getContext('2d');
            // Crea la nueva gráfica de tipo 'doughnut' (dona).
            charts.alerts = new Chart(alertsCtx, {
                type: 'doughnut',
                data: {
                    // Define las etiquetas para cada "quesito".
                    labels: ['Bueno', 'Regular', 'Malo', 'Peligroso'],
                    datasets: [{
                        data: [0, 0, 0, 0], // Datos iniciales (se llenarán después).
                        backgroundColor: [
                            '#4CAF50', // Bueno (Verde)
                            '#FF9800', // Regular (Naranja)
                            '#F44336', // Malo (Rojo)
                            '#E91E63'  // Peligroso (Fucsia)
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
                            position: 'bottom' // Leyenda en la parte inferior.
                        }
                    },
                    animation: false
                }
            });
        }
        
        // --- Gráfica de gas ---
        const gasCanvas = document.getElementById('gasChart');
        if (gasCanvas) {
            gasCanvas.width = 400;
            gasCanvas.height = 300;
            gasCanvas.style.width = '400px';
            gasCanvas.style.height = '300px';
            
            const gasCtx = gasCanvas.getContext('2d');
            // Crea la gráfica de línea para el nivel de gas.
            charts.gas = new Chart(gasCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Nivel de Gas',
                        data: [],
                        borderColor: '#FF5722',
                        backgroundColor: 'rgba(255, 87, 34, 0.2)', // Relleno semitransparente.
                        tension: 0.4,
                        fill: true // Rellena el área bajo la línea.
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
        
        // --- Gráfica de ultrasonido ---
        const ultraCanvas = document.getElementById('ultraChart');
        if (ultraCanvas) {
            ultraCanvas.width = 300;
            ultraCanvas.height = 300;
            ultraCanvas.style.width = '300px';
            ultraCanvas.style.height = '300px';
            
            const ultraCtx = ultraCanvas.getContext('2d');
            // Crea la gráfica de tipo 'bar' (barras) para el ultrasonido.
            charts.ultrasonic = new Chart(ultraCtx, {
                type: 'bar',
                data: {
                    labels: ['Nivel Actual'],
                    datasets: [{
                        label: 'Distancia (cm)',
                        data: [0], // Valor inicial.
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
                            max: 50 // Eje Y fijo hasta 50cm (o el máximo esperado).
                        }
                    },
                    animation: false
                }
            });
        }
        
        // --- Gráfica de riego ---
        const irrigationCanvas = document.getElementById('irrigationChart');
        if (irrigationCanvas) {
            irrigationCanvas.width = 300;
            irrigationCanvas.height = 300;
            irrigationCanvas.style.width = '300px';
            irrigationCanvas.style.height = '300px';
            
            const irrigationCtx = irrigationCanvas.getContext('2d');
            // Crea la gráfica de barras para el conteo de riegos.
            charts.irrigation = new Chart(irrigationCtx, {
                type: 'bar',
                data: {
                    labels: ['Riegos Realizados'],
                    datasets: [{
                        label: 'Cantidad',
                        data: [0], // Contador inicial.
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
        
        // Marca que las gráficas ya están listas.
        chartsInitialized = true;
        // Desactiva la actualización hasta que haya nuevos datos.
        shouldUpdateCharts = false;
        
        console.log('Gráficas inicializadas correctamente');
        
    } catch (error) {
        console.error('Error inicializando gráficas:', error);
    }
}

// ===== ACTUALIZACIÓN DE GRÁFICAS =====

// Función principal que actualiza los datos de todas las gráficas (se llama repetidamente).
function updateCharts() {
    try {
        // (Inicio de 'Guard Clauses' o comprobaciones de seguridad)
        if (!chartsInitialized) {
            // console.log('Gráficas no inicializadas');
            return;
        }
        
        // No actualiza si no está permitido (ej. 'noSensorMode' o sensores desconectados).
        if (!shouldUpdateCharts) {
            // console.log('shouldUpdateCharts es false');
            return;
        }
        
        // No actualiza si los sensores están desconectados.
        if (!sensorsConnected) {
            // console.log('Sensores no conectados');
            return;
        }
        
        if (noSensorMode) {
            // console.log('En modo sin sensores');
            return;
        }
        
        // No actualiza si no hay datos (timestamps).
        if (sensorData.timestamps.length === 0) {
            // console.log('Sin timestamps');
            return;
        }
        
        // console.log('Actualizando gráficas...');
        
        // Define el número máximo de puntos a mostrar en gráficas de línea.
        const maxPoints = 10;
        
        // --- Actualizar gráfica de sensores ---
        if (charts.sensors) {
            // Toma solo los últimos 10 'timestamps' para el eje X.
            charts.sensors.data.labels = sensorData.timestamps.slice(-maxPoints);
            // Toma solo los últimos 10 datos de humedad de suelo.
            charts.sensors.data.datasets[0].data = sensorData.soil.slice(-maxPoints);
            // Toma solo los últimos 10 datos de temperatura.
            charts.sensors.data.datasets[1].data = sensorData.temperature.slice(-maxPoints);
            // Toma solo los últimos 10 datos de humedad de aire.
            charts.sensors.data.datasets[2].data = sensorData.humidity.slice(-maxPoints);
            // Actualiza la gráfica sin animación.
            charts.sensors.update('none');
        }
        
        // --- Actualizar gráfica de gas ---
        if (charts.gas && sensorData.gas.length > 0) {
            charts.gas.data.labels = sensorData.timestamps.slice(-maxPoints);
            charts.gas.data.datasets[0].data = sensorData.gas.slice(-maxPoints);
            charts.gas.update('none');
        }
        
        // --- Actualizar gráfica de ultrasonido ---
        if (charts.ultrasonic && sensorData.ultrasonic.length > 0) {
            // Obtiene solo el último valor del ultrasonido.
            const lastUltrasonic = sensorData.ultrasonic[sensorData.ultrasonic.length - 1];
            if (lastUltrasonic > 0) {
                // Asigna ese valor a la gráfica de barras.
                charts.ultrasonic.data.datasets[0].data = [lastUltrasonic];
                
                // Lógica para cambiar el color de la barra según el nivel.
                let color = '#4CAF50'; // Verde (Bueno)
                if (lastUltrasonic <= ultrasonicParameters.minimo) color = '#F44336'; // Rojo (Mínimo)
                else if (lastUltrasonic <= ultrasonicParameters.regular) color = '#FF9800'; // Naranja (Regular)
                else if (lastUltrasonic > ultrasonicParameters.maximo) color = '#9C27B0'; // Morado (Máximo/Peligro)
                
                charts.ultrasonic.data.datasets[0].backgroundColor = color;
                charts.ultrasonic.update('none');
            }
        }
        
        // --- Actualizar gráfica de alertas ---
        if (charts.alerts) {
            // Suma el total de alertas.
            const totalAlerts = alertStats.bueno + alertStats.regular + alertStats.malo + alertStats.peligroso;
            // Solo actualiza la dona si hay datos (para evitar un error).
            if (totalAlerts > 0) {
                // Asigna los conteos de alertas a la gráfica.
                charts.alerts.data.datasets[0].data = [
                    alertStats.bueno,
                    alertStats.regular,
                    alertStats.malo,
                    alertStats.peligroso
                ];
                charts.alerts.update('none');
            }
        }
        
        // --- Actualizar gráfica de riego ---
        if (charts.irrigation && systemStats.irrigationCount > 0) {
            // Actualiza el contador de riegos.
            charts.irrigation.data.datasets[0].data = [systemStats.irrigationCount];
            charts.irrigation.update('none');
        }
        
    } catch (error) {
        console.error('Error actualizando gráficas:', error);
    }
}

// Fuerza la actualización de la gráfica de alertas (usado en modo sin sensores).
function updateAlertsChartForced() {
    if (charts.alerts && chartsInitialized) {
        const totalAlerts = alertStats.bueno + alertStats.regular + alertStats.malo + alertStats.peligroso;
        
        console.log('Actualizando gráfica de alertas - Total:', totalAlerts);
        
        if (totalAlerts > 0) {
            charts.alerts.data.
