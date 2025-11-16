// Простой JavaScript без модулей
console.log('ПЭТ-Хаус НН - сайт работает!');

document.addEventListener('DOMContentLoaded', function() {
    // Тестовая функциональность для кнопок
    const contactBtn = document.getElementById('contactBtn');
    const heroBtn = document.querySelector('.hero__btn');
    
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            alert('Форма связи скоро будет добавлена!');
        });
    }
    
    if (heroBtn) {
        heroBtn.addEventListener('click', function() {
            alert('Оставить заявку - форма скоро будет!');
        });
    }
    
    console.log('Все скрипты загружены');
});