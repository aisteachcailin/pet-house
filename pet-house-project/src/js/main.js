// Загрузка компонентов
function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = data;
                // После загрузки header инициализируем скролл
                if (id === 'header') {
                    initHeaderScroll();
                }
            } else {
                console.error(`Element with id "${id}" not found`);
            }
        })
        .catch(error => {
            console.error(`Error loading component ${id} from ${file}:`, error);
        });
}

// Инициализация скролла для header
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Загружаем компоненты при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header', './components/header.html');
    loadComponent('footer', './components/footer.html');
    
    console.log('ПЭТ-Хаус НН - сайт работает!');
});