// ===== SISTEMA DE NAVEGACIÓN SIN RECARGAR (SPA) =====

// Muestra una "página" (un div) y oculta las demás.
function showPage(pageName) {
    console.log('Cambiando a página:', pageName);
    
    // Busca todos los elementos con la clase 'page-content'.
    const allPages = document.querySelectorAll('.page-content');
    // Oculta todas las páginas quitando la clase 'active'.
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Busca todos los botones de navegación.
    const allNavItems = document.querySelectorAll('.nav-item');
    // Quita la clase 'active' a todos los botones del menú.
    allNavItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Busca la página específica que queremos mostrar (ej. id="page-monitoring").
    const selectedPage = document.getElementById(`page-${pageName}`);
    // Muestra la página seleccionada añadiendo la clase 'active'.
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Obtiene una lista de los botones de navegación.
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    
    // Resalta el botón del menú correspondiente a la página.
    if (pageName === 'monitoring') {
        navItems[0]?.classList.add('active'); // Activa el primer botón (Monitoreo).
    } else if (pageName === 'charts') {
        navItems[1]?.classList.add('active'); // Activa el segundo botón (Gráficas).
        
        // Lógica especial: Si vamos a la página de gráficas, las actualiza.
        if (chartsInitialized && shouldUpdateCharts && sensorsConnected) {
            setTimeout(() => {
                updateCharts();
            }, 100);
        }
    } else if (pageName === 'arduino') {
        navItems[2]?.classList.add('active'); // Activa el tercer botón (Arduino).
    }
    
    // Guarda la página actual en la memoria del navegador para recordarla.
    localStorage.setItem('currentPage', pageName);
}

// Se ejecuta cuando el HTML de la página termina de cargar.
document.addEventListener('DOMContentLoaded', function() {
    // Carga la última página visitada (o 'monitoring' si es la primera vez).
    const savedPage = localStorage.getItem('currentPage') || 'monitoring';
    // Muestra la página guardada.
    showPage(savedPage);
});

console.log('✅ navigation.js cargado correctamente');
