// ===== SISTEMA DE NAVEGACIÓN SIN RECARGAR (SPA) =====

function showPage(pageName) {
    console.log('Cambiando a página:', pageName);
    
    // Ocultar todas las páginas
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Remover active de todos los botones de navegación
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar la página seleccionada
    const selectedPage = document.getElementById(`page-${pageName}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Activar el botón de navegación correspondiente
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    if (pageName === 'monitoring') {
        navItems[0]?.classList.add('active');
    } else if (pageName === 'charts') {
        navItems[1]?.classList.add('active');
        // Si cambiamos a gráficas, actualizar si hay datos
        if (chartsInitialized && shouldUpdateCharts && sensorsConnected) {
            setTimeout(() => {
                updateCharts();
            }, 100);
        }
    } else if (pageName === 'arduino') {
        navItems[2]?.classList.add('active');
    }
    
    // Guardar página actual en localStorage
    localStorage.setItem('currentPage', pageName);
}

// Restaurar página al cargar
document.addEventListener('DOMContentLoaded', function() {
    const savedPage = localStorage.getItem('currentPage') || 'monitoring';
    showPage(savedPage);
});

console.log('✅ navigation.js cargado correctamente');