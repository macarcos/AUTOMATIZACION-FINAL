// ===== GLOSARIO COMPLETO DE PLANTAS DE ECUADOR =====
const plantasEcuador = {
    // === FRUTAS TROPICALES ===
    mango: {
        nombre: "Mango",
        regiones: {
            costa: { soilOptimal: 45, soilMin: 30, soilMax: 65, tempOptimal: 28, humidOptimal: 70, descripcion: "Clima cálido y húmedo" },
            sierra: { soilOptimal: 50, soilMin: 35, soilMax: 70, tempOptimal: 25, humidOptimal: 65, descripcion: "Valles temperados" },
            oriente: { soilOptimal: 40, soilMin: 25, soilMax: 60, tempOptimal: 30, humidOptimal: 75, descripcion: "Alta humedad tropical" }
        },
        notas: "Rico en vitamina C, prefiere suelos bien drenados"
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
function selectPlantEcuador() {
    const plantSelect = document.getElementById('plantSelect');
    const regionSelect = document.getElementById('regionSelect');
    const customInput = document.getElementById('customPlantInput');
    
    if (!plantSelect || !regionSelect) return;
    
    const selectedPlant = plantSelect.value;
    const selectedRegion = regionSelect.value || 'costa';
    
    if (selectedPlant === 'custom') {
        if (customInput) customInput.style.display = 'block';
        return;
    }
    
    if (customInput) customInput.style.display = 'none';
    
    if (selectedPlant && plantasEcuador[selectedPlant]) {
        const plantData = plantasEcuador[selectedPlant];
        const regionData = plantData.regiones[selectedRegion];
        
        Object.assign(plantParameters, regionData);
        
        const inputs = ['soilOptimal', 'soilMin', 'soilMax', 'tempOptimal', 'humidOptimal'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input && regionData[id] !== undefined) {
                input.value = regionData[id];
            }
        });
        
        updatePlantInfoDisplay(plantData, regionData, selectedRegion);
        
        const plantName = plantData.nombre;
        const regionName = selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1);
        
        showToastAlert(`${plantName} configurada para región ${regionName}`, 'success');
    }
}

function updatePlantInfoDisplay(plantData, regionData, region) {
    const infoDisplay = document.getElementById('plantInfoDisplay');
    if (infoDisplay) {
        const regionName = region.charAt(0).toUpperCase() + region.slice(1);
        
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

function showPlantGlossary() {
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
    
    let glossaryHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: var(--primary-green);">🇪🇨 Glosario de Plantas del Ecuador</h2>
            <p style="color: var(--text-secondary);">Guía completa de cultivos por regiones</p>
        </div>
        <div class="glossary-content">
    `;
    
    Object.entries(plantasEcuador).forEach(([key, planta]) => {
        glossaryHTML += `
            <div style="margin: 20px 0; padding: 15px; background: #F1F8E9; border-radius: 10px; border-left: 4px solid var(--primary-green);">
                <h4 style="color: var(--primary-green); margin-bottom: 10px;">${planta.nombre}</h4>
                <p style="font-style: italic; color: #666; margin-bottom: 15px;">${planta.notas}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
        `;
        
        Object.entries(planta.regiones).forEach(([region, datos]) => {
            const regionName = region.charAt(0).toUpperCase() + region.slice(1);
            glossaryHTML += `
                <div style="background: white; padding: 10px; border-radius: 8px; border-left: 4px solid var(--info);">
                    <strong>${regionName}:</strong><br>
                    <small>Suelo: ${datos.soilMin}-${datos.soilMax}% | Temp: ${datos.tempOptimal}°C | Hum: ${datos.humidOptimal}%</small><br>
                    <small style="color: #666;">${datos.descripcion}</small>
                </div>
            `;
        });
        
        glossaryHTML += `
                </div>
            </div>
        `;
    });
    
    glossaryHTML += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button id="closeGlossaryBtn" class="btn">
                Cerrar Glosario
            </button>
        </div>
    `;
    
    glossaryContent.innerHTML = glossaryHTML;
    glossaryModal.appendChild(glossaryContent);
    document.body.appendChild(glossaryModal);
    
    const closeBtn = document.getElementById('closeGlossaryBtn');
    closeBtn.onclick = function() {
        glossaryModal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (glossaryModal.parentNode) {
                glossaryModal.parentNode.removeChild(glossaryModal);
            }
        }, 300);
    };
    
    glossaryModal.onclick = function(e) {
        if (e.target === glossaryModal) {
            closeBtn.click();
        }
    };
}

console.log('✅ plants.js cargado correctamente');