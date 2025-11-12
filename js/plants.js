// ===== GLOSARIO COMPLETO DE PLANTAS DE ECUADOR =====

// Define la base de datos principal de plantas como un objeto.
const plantasEcuador = {
    // === FRUTAS TROPICALES ===
    mango: {
        nombre: "Mango",
        regiones: { // Parámetros específicos por región
            costa: { soilOptimal: 45, soilMin: 30, soilMax: 65, tempOptimal: 28, humidOptimal: 70, descripcion: "Clima cálido y húmedo" },
            sierra: { soilOptimal: 50, soilMin: 35, soilMax: 70, tempOptimal: 25, humidOptimal: 65, descripcion: "Valles temperados" },
            oriente: { soilOptimal: 40, soilMin: 25, soilMax: 60, tempOptimal: 30, humidOptimal: 75, descripcion: "Alta humedad tropical" }
        },
        notas: "Rico en vitamina C, prefiere suelos bien drenados" // Notas generales de la planta
    },
    
    banano: {
        nombre: "Banano",
        regiones: {
            costa: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 27, humidOptimal: 75, descripcion: "Principal zona productora" },
            sierra: { soilOptimal: 70, soilMin: 55, soilMax: 85, tempOptimal: 22, humidOptimal: 70, descripcion: "Cultivo limitado en valles" },
            oriente: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 29, humidOptimal: 80, descripcion: "Excelente para banano orgánico" }
        },
        notas: "Requiere mucha agua y temperaturas estables"
    },

    cacao: {
        nombre: "Cacao",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 26, humidOptimal: 75, descripcion: "Cacao fino de aroma" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 23, humidOptimal: 70, descripcion: "Valles subtropicales" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 28, humidOptimal: 80, descripcion: "Cacao amazónico tradicional" }
        },
        notas: "Necesita sombra parcial y suelos ricos en materia orgánica"
    },

    platano: {
        nombre: "Plátano",
        regiones: {
            costa: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 27, humidOptimal: 75, descripcion: "Zona productora por excelencia" },
            sierra: { soilOptimal: 70, soilMin: 55, soilMax: 85, tempOptimal: 21, humidOptimal: 65, descripcion: "Solo en valles cálidos" },
            oriente: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 28, humidOptimal: 80, descripcion: "Buena producción orgánica" }
        },
        notas: "Similar al banano, pero con mayor diversidad de usos culinarios"
    },

    maracuya: {
        nombre: "Maracuyá",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 27, humidOptimal: 70, descripcion: "Fruta de exportación" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 20, humidOptimal: 65, descripcion: "En valles interandinos cálidos" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 28, humidOptimal: 80, descripcion: "Abundancia en zonas amazónicas" }
        },
        notas: "Necesita tutoreo, floración continua y buen drenaje"
    },

    // (NUEVA) Planta añadida: Pitahaya
    pitahaya: {
        nombre: "Pitahaya (Fruta del Dragón)",
        regiones: {
            costa: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 26, humidOptimal: 70, descripcion: "Requiere buen drenaje" },
            sierra: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 22, humidOptimal: 65, descripcion: "Valles subtropicales (Ej. Zumba)" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 25, humidOptimal: 75, descripcion: "Principal zona de exportación (Palora)" }
        },
        notas: "Fruta exótica de exportación, es una cactácea que requiere soporte y polinización manual nocturna."
    },

    // === CÍTRICOS ===
    naranja: {
        nombre: "Naranja",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 26, humidOptimal: 65, descripcion: "Zonas bajas costeras" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 20, humidOptimal: 60, descripcion: "Valles templados" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 27, humidOptimal: 75, descripcion: "Clima húmedo amazónico" }
        },
        notas: "Fuente de vitamina C, requiere riego regular"
    },

    limon: {
        nombre: "Limón",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 27, humidOptimal: 70, descripcion: "Cultivado extensamente en Manabí y Los Ríos" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 19, humidOptimal: 60, descripcion: "Producción en valles cálidos interandinos" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 28, humidOptimal: 75, descripcion: "Zonas amazónicas húmedas" }
        },
        notas: "Muy resistente, ciclos productivos continuos"
    },

    // === FRUTAS DE LA SIERRA ===
    fresa: {
        nombre: "Fresa",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 20, humidOptimal: 60, descripcion: "En zonas altas costeras" },
            sierra: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 16, humidOptimal: 55, descripcion: "Zona principal de cultivo" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 18, humidOptimal: 65, descripcion: "Microclimas frescos amazónicos" }
        },
        notas: "Requiere suelos ricos en materia orgánica y buen riego"
    },

    mora: {
        nombre: "Mora",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 19, humidOptimal: 65, descripcion: "En zonas frescas de la costa" },
            sierra: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 15, humidOptimal: 60, descripcion: "Cultivo predominante" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 18, humidOptimal: 70, descripcion: "Microclimas húmedos frescos" }
        },
        notas: "Muy productiva, utilizada para jugos y mermeladas"
    },

    // === HORTALIZAS ===
    tomate: {
        nombre: "Tomate",
        regiones: {
            costa: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 24, humidOptimal: 65, descripcion: "Tomate industrial" },
            sierra: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 21, humidOptimal: 60, descripcion: "Tomate riñón de mesa" },
            oriente: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 26, humidOptimal: 70, descripcion: "Tomate cherry amazónico" }
        },
        notas: "Rico en licopeno, requiere tutoreo y podas"
    },

    lechuga: {
        nombre: "Lechuga",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 20, humidOptimal: 65, descripcion: "Cultivo de ciclo corto" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 16, humidOptimal: 60, descripcion: "Zona principal de producción" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 21, humidOptimal: 70, descripcion: "Condiciones húmedas" }
        },
        notas: "Requiere riego constante y sombra ligera"
    },

    // (NUEVA) Planta añadida: Brócoli
    brocoli: {
        nombre: "Brócoli",
        regiones: {
            costa: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 18, humidOptimal: 70, descripcion: "Solo en zonas costeras muy altas y frescas" },
            sierra: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 17, humidOptimal: 65, descripcion: "Principal zona de exportación (Cotopaxi, Pichincha)" },
            oriente: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 19, humidOptimal: 75, descripcion: "Estribaciones altas" }
        },
        notas: "Hortaliza de clima frío, principal exportación no tradicional. Muy sensible a la humedad del suelo."
    },

    // === TUBÉRCULOS ===
    papa: {
        nombre: "Papa",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 16, humidOptimal: 60, descripcion: "Papas tempranas en zonas altas" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 14, humidOptimal: 55, descripcion: "Zona principal - múltiples variedades" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 18, humidOptimal: 65, descripcion: "Estribaciones orientales" }
        },
        notas: "Alimento básico, más de 400 variedades nativas"
    },

    // (NUEVA) Categoría y Planta: Granos Andinos
    // === GRANOS ANDINOS ===
    quinua: {
        nombre: "Quinua",
        regiones: {
            costa: { soilOptimal: 40, soilMin: 25, soilMax: 55, tempOptimal: 19, humidOptimal: 50, descripcion: "Cultivo experimental en zonas secas" },
            sierra: { soilOptimal: 45, soilMin: 30, soilMax: 60, tempOptimal: 15, humidOptimal: 40, descripcion: "Cultivo tradicional de altiplano (Imbabura, Chimborazo)" },
            oriente: { soilOptimal: 40, soilMin: 25, soilMax: 55, tempOptimal: 18, humidOptimal: 55, descripcion: "Zonas altas y secas" }
        },
        notas: "Grano andino de alta proteína. Muy resistente al frío y a la sequía. Requiere suelos bien drenados."
    },

    // === AROMÁTICAS ===
    albahaca: {
        nombre: "Albahaca",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 25, humidOptimal: 65, descripcion: "Herbácea muy cultivada" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 20, humidOptimal: 60, descripcion: "Valles templados" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 26, humidOptimal: 70, descripcion: "Buena adaptación" }
        },
        notas: "Hierba aromática usada en gastronomía y medicina"
    },

    oregano: {
        nombre: "Orégano",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 24, humidOptimal: 60, descripcion: "Climas secos costeros" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 18, humidOptimal: 55, descripcion: "Valles interandinos" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 22, humidOptimal: 65, descripcion: "Microclimas amazónicos" }
        },
        notas: "Planta aromática perenne, medicinal y culinaria"
    },

    // === MEDICINALES ===
    hierba_buena: {
        nombre: "Hierba Buena",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 24, humidOptimal: 65, descripcion: "Cultivada en huertos familiares" },
            sierra: { soilOptimal: 60, soilMin: 45, soilMax: 75, tempOptimal: 18, humidOptimal: 60, descripcion: "Común en valles interandinos" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 22, humidOptimal: 70, descripcion: "Buena adaptación a zonas húmedas" }
        },
        notas: "Usada como planta medicinal y aromática"
    },

    // (NUEVA) Planta añadida: Cannabis (Medicinal)
    cannabis_medicinal: {
        nombre: "Cannabis (Marihuana Medicinal segun Robles)",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 26, humidOptimal: 60, descripcion: "Cultivo controlado, requiere ventilación" },
            sierra: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 22, humidOptimal: 50, descripcion: "Ideal para invernaderos controlados (Tumbaco, Cayambe)" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 24, humidOptimal: 65, descripcion: "Alto riesgo de hongos, requiere control estricto" }
        },
        notas: "Cultivo regulado en Ecuador (MAG) para fines medicinales e industriales (cáñamo). Requiere licencia y control estricto de humedad para evitar moho."
    },

    // === ORNAMENTALES ===
    rosa: {
        nombre: "Rosa",
        regiones: {
            costa: { soilOptimal: 55, soilMin: 40, soilMax: 70, tempOptimal: 22, humidOptimal: 65, descripcion: "Producción limitada" },
            sierra: { soilOptimal: 65, soilMin: 50, soilMax: 80, tempOptimal: 16, humidOptimal: 60, descripcion: "Zona principal de exportación de rosas" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 20, humidOptimal: 70, descripcion: "Producción artesanal" }
        },
        notas: "Flor de exportación, Ecuador es líder mundial"
    },

    // === CACTÁCEAS ===
    cactus: {
        nombre: "Cactus",
        regiones: {
            costa: { soilOptimal: 40, soilMin: 25, soilMax: 55, tempOptimal: 28, humidOptimal: 40, descripcion: "Climas áridos costeros" },
            sierra: { soilOptimal: 45, soilMin: 30, soilMax: 60, tempOptimal: 18, humidOptimal: 45, descripcion: "Altiplano seco" },
            oriente: { soilOptimal: 50, soilMin: 35, soilMax: 65, tempOptimal: 24, humidOptimal: 60, descripcion: "Adaptación en suelos pedregosos amazónicos" }
        },
        notas: "Gran variedad de especies nativas, adaptadas a sequía"
    }
};

// ===== FUNCIONES DE SELECCIÓN DE PLANTAS =====

// Se activa al cambiar el <select> de planta o región.
function selectPlantEcuador() {
    // Obtiene los elementos del DOM.
    const plantSelect = document.getElementById('plantSelect');
    const regionSelect = document.getElementById('regionSelect');
    const customInput = document.getElementById('customPlantInput');
    
    if (!plantSelect || !regionSelect) return;
    
    // Obtiene los valores seleccionados.
    const selectedPlant = plantSelect.value;
    const selectedRegion = regionSelect.value || 'costa'; // Usa 'costa' como región por defecto.
    
    // Si el usuario elige "Personalizado", muestra los inputs y detiene la función.
    if (selectedPlant === 'custom') {
        if (customInput) customInput.style.display = 'block';
        return;
    }
    
    // Si elige una planta, oculta los inputs personalizados.
    if (customInput) customInput.style.display = 'none';
    
    // Verifica que la planta seleccionada exista en la base de datos.
    if (selectedPlant && plantasEcuador[selectedPlant]) {
        // Obtiene los datos de la planta y la región seleccionadas.
        const plantData = plantasEcuador[selectedPlant];
        const regionData = plantData.regiones[selectedRegion];
        
        // ¡Importante! Actualiza la variable global 'plantParameters' con los datos cargados.
        Object.assign(plantParameters, regionData);
        
        // Lista de IDs de los inputs de parámetros en la UI.
        const inputs = ['soilOptimal', 'soilMin', 'soilMax', 'tempOptimal', 'humidOptimal'];
        // Actualiza los valores de los inputs en la UI para que coincidan con la planta.
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input && regionData[id] !== undefined) {
                input.value = regionData[id];
            }
        });
        
        // Actualiza la tarjeta de información de la planta en la UI.
        updatePlantInfoDisplay(plantData, regionData, selectedRegion);
        
        // Formatea los nombres para la notificación.
        const plantName = plantData.nombre;
        const regionName = selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1);
        
        // Muestra una notificación de éxito.
        showToastAlert(`${plantName} configurada para región ${regionName}`, 'success');
    }
}

// Actualiza la tarjeta de información (UI) con los detalles de la planta seleccionada.
function updatePlantInfoDisplay(plantData, regionData, region) {
    const infoDisplay = document.getElementById('plantInfoDisplay');
    if (infoDisplay) {
        // Formatea el nombre de la región (ej. "Costa").
        const regionName = region.charAt(0).toUpperCase() + region.slice(1);
        
        // Inserta el HTML con la información de la planta en la tarjeta.
        infoDisplay.innerHTML = `
            <div class="plant-info-card">
                <h4>🌱 ${plantData.nombre} - Región ${regionName}</h4>
                <div class="plant-description">
                    <p><strong>Características:</strong> ${regionData.descripcion}</p>
                    <p><strong>Notas adicionales:</strong> ${plantData.notas}</p>
                </div>
                <div class="plant-parameters">
                    <h5>Parámetros Ideales:</h5>
                    <div class="param-grid">
                        <div class="param-item">
                            <span class="param-icon">💧</span>
                            <span class="param-label">Humedad Suelo:</span>
                            <span class="param-value">${regionData.soilMin}% - ${regionData.soilMax}%</span>
                        </div>
                        <div class="param-item">
                            <span class="param-icon">🌡️</span>
                            <span class="param-label">Temperatura:</span>
                            <span class="param-value">${regionData.tempOptimal}°C</span>
                        </div>
                        <div class="param-item">
                            <span class="param-icon">🌫️</span>
                            <span class="param-label">Humedad Aire:</span>
                            <span class="param-value">${regionData.humidOptimal}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Crea y muestra una ventana modal (pop-up) con la lista de todas las plantas.
function showPlantGlossary() {
    // Crea el fondo oscuro (overlay).
    const glossaryModal = document.createElement('div');
    glossaryModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Crea el contenedor blanco del contenido.
    const glossaryContent = document.createElement('div');
    glossaryContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    // Empieza a construir el HTML interno del glosario.
    let glossaryHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: var(--primary-green);">🇪🇨 Glosario de Plantas del Ecuador</h2>
            <p style="color: var(--text-secondary);">Guía completa de cultivos por regiones</p>
        </div>
        <div class="glossary-content">
    `;
    
    // Itera sobre cada planta en la base de datos (plantasEcuador).
    Object.entries(plantasEcuador).forEach(([key, planta]) => {
        glossaryHTML += `
            <div style="margin: 20px 0; padding: 15px; background: #F1F8E9; border-radius: 10px; border-left: 4px solid var(--primary-green);">
                <h4 style="color: var(--primary-green); margin-bottom: 10px;">${planta.nombre}</h4>
                <p style="font-style: italic; color: #666; margin-bottom: 15px;">${planta.notas}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
        `;
        
        // Itera sobre las regiones (costa, sierra, oriente) de CADA planta.
        Object.entries(planta.regiones).forEach(([region, datos]) => {
            const regionName = region.charAt(0).toUpperCase() + region.slice(1);
            // Añade el HTML para los parámetros de esa región.
            glossaryHTML += `
                <div style="background: white; padding: 10px; border-radius: 8px; border-left: 4px solid var(--info);">
                    <strong>${regionName}:</strong><br>
                    <small>Suelo: ${datos.soilMin}-${datos.soilMax}% | Temp: ${datos.tempOptimal}°C | Hum: ${datos.humidOptimal}%</small><br>
                    <small style="color: #666;">${datos.descripcion}</small>
                </div>
            `;
        });
        
        // Cierra los divs de la planta.
        glossaryHTML += `
                </div>
            </div>
        `;
    });
    
    // Añade el botón de "Cerrar" al final.
    glossaryHTML += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button id="closeGlossaryBtn" class="btn">
                Cerrar Glosario
            </button>
        </div>
    `;
    
    // Inserta el HTML en los contenedores.
    glossaryContent.innerHTML = glossaryHTML;
    glossaryModal.appendChild(glossaryContent);
    // Muestra el modal en la página.
    document.body.appendChild(glossaryModal);
    
    // Añade el evento de clic al botón de cerrar.
    const closeBtn = document.getElementById('closeGlossaryBtn');
    closeBtn.onclick = function() {
        glossaryModal.style.animation = 'fadeOut 0.3s ease'; // Aplica animación de salida.
        // Espera a que termine la animación (300ms) y luego elimina el modal.
        setTimeout(() => {
            if (glossaryModal.parentNode) {
                glossaryModal.parentNode.removeChild(glossaryModal);
            }
        }, 300);
    };
    
    // Cierra el modal si el usuario hace clic en el fondo oscuro.
    glossaryModal.onclick = function(e) {
        if (e.target === glossaryModal) {
            closeBtn.click(); // Simula un clic en el botón de cerrar.
        }
    };
}

console.log('✅ plants.js cargado correctamente');
