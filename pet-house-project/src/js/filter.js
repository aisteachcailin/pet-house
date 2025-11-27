import { products } from './data/products.js';
import { renderProductCards } from './components/productCard.js';

const ITEMS_PER_PAGE = 12;

let currentPage = 1;
let filteredProducts = [...products];

document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('catalogFilters');
    const grid = document.querySelector('[data-product-grid="catalog"]');
    const countElement = document.querySelector('[data-product-count]');
    const sortSelect = document.getElementById('catalogSort');
    const clearBtn = document.getElementById('clearFilters');
    const paginationContainer = document.querySelector('[data-pagination]');

    if (!filterForm || !grid) {
        console.error('Filter form or grid not found');
        return;
    }

    // Инициализация сворачивания/разворачивания групп фильтров
    initFilterToggles();

    const applyFilters = () => {
        const formData = new FormData(filterForm);
        const criteria = {
            types: formData.getAll('type'),
            volumes: formData.getAll('volume'),
            volumeFrom: formData.get('volumeFrom'),
            volumeTo: formData.get('volumeTo'),
            necks: formData.getAll('neck'),
            purposes: formData.getAll('purpose'),
            sort: sortSelect ? sortSelect.value : 'default'
        };

        filteredProducts = products.filter((product) => matchesProduct(product, criteria));

        if (criteria.sort !== 'default') {
            filteredProducts = filteredProducts.slice().sort((a, b) => sortProducts(a, b, criteria.sort));
        }

        currentPage = 1;
        renderPage(grid);
        updateCount(filteredProducts.length, countElement);
        renderPagination(paginationContainer, filteredProducts.length);
        scrollToProducts();
    };

    function scrollToProducts() {
    const gridTop = grid.getBoundingClientRect().top + window.pageYOffset;
    const scrollPosition = gridTop - 88; // Учитываем шапку
    
        // Прокручиваем только если товары не в зоне видимости
        if (!isElementInViewport(grid)) {
            window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }
    }

        // Проверка, находится ли элемент в зоне видимости
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Функция для инициализации переключателей
    function initFilterToggles() {
        const filterLabels = filterForm.querySelectorAll('.catalog-filters__label');
        
        filterLabels.forEach(label => {
            const group = label.parentElement;
            const checkboxes = group.querySelector('.catalog-filters__checkboxes');
            
            // Устанавливаем начальную высоту
            checkboxes.style.maxHeight = checkboxes.scrollHeight + 'px';
            group.classList.add('filter-group--expanded');
            
            label.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') return;
                
                if (group.classList.contains('filter-group--expanded')) {
                    // Сворачиваем
                    checkboxes.style.maxHeight = '0';
                    checkboxes.style.opacity = '0';
                    group.classList.remove('filter-group--expanded');
                } else {
                    // Разворачиваем
                    checkboxes.style.maxHeight = checkboxes.scrollHeight + 'px';
                    checkboxes.style.opacity = '1';
                    group.classList.add('filter-group--expanded');
                }
            });
        });
    }

    // Слушаем изменения всех чекбоксов
    const checkboxes = filterForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Слушаем изменения селекта сортировки
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }

    // Кнопка очистки
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterForm.reset();
            applyFilters();
        });
    }

    // Убираем стандартную отправку формы
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFilters();
    });

    // Первоначальная загрузка
    applyFilters();
});

function matchesProduct(product, criteria) {
    // Фильтр по типу продукции
    if (criteria.types.length > 0 && !criteria.types.includes(product.type)) {
        return false;
    }

    // Фильтр по горловине (объединенный с стандартом)
    if (criteria.necks.length > 0) {
        let matchesNeck = false;
        
        criteria.necks.forEach(neckFilter => {
            const productNeckCombined = `${product.neck} ${product.standard}`.trim();
            if (productNeckCombined.includes(neckFilter) || neckFilter.includes(productNeckCombined)) {
                matchesNeck = true;
                return;
            }
            
            if (product.neck && (neckFilter === product.neck || product.neck.includes(neckFilter))) {
                matchesNeck = true;
                return;
            }
            
            if (product.neck && product.neck.includes(';')) {
                const multipleNecks = product.neck.split(';').map(n => n.trim());
                if (multipleNecks.some(neck => neck.includes(neckFilter) || neckFilter.includes(neck))) {
                    matchesNeck = true;
                    return;
                }
            }
        });

        if (!matchesNeck) {
            return false;
        }
    }

    // Фильтр по назначению
    if (criteria.purposes.length > 0) {
        let matchesPurpose = false;
        
        criteria.purposes.forEach(filterPurpose => {
            const productPurposes = product.purpose.split(';').map(p => p.trim());
            if (productPurposes.some(productPurpose => 
                productPurpose.includes(filterPurpose) || filterPurpose.includes(productPurpose)
            )) {
                matchesPurpose = true;
                return;
            }
        });

        if (!matchesPurpose) {
            return false;
        }
    }

    // Фильтр по объему (диапазоны) - только для товаров с объемом
    if (criteria.volumes.length > 0 && product.volume) {
        const productVolume = parseFloat(product.volume.replace(' л', '').replace(',', '.'));
        const matchesVolumeRange = criteria.volumes.some((range) => {
            const [min, max] = range.split('-').map(parseFloat);
            return productVolume >= min && productVolume <= max;
        });

        if (!matchesVolumeRange) {
            return false;
        }
    }

    // Для товаров без объема (крышки, преформы) - пропускаем фильтрацию по объему
    if (criteria.volumes.length > 0 && !product.volume) {
        return false;
    }

    return true;
}

function sortProducts(a, b, sortValue) {
    if (sortValue === 'priceAsc') {
        return a.price - b.price;
    }
    if (sortValue === 'priceDesc') {
        return b.price - a.price;
    }
    return 0;
}

function updateCount(count, element) {
    if (!element) {
        return;
    }

    const suffix = getCountSuffix(count);
    element.textContent = `Найдено ${count} ${suffix}`;
}

function getCountSuffix(count) {
    const remainder10 = count % 10;
    const remainder100 = count % 100;

    if (remainder10 === 1 && remainder100 !== 11) {
        return 'позиция';
    }

    if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 10 || remainder100 >= 20)) {
        return 'позиции';
    }

    return 'позиций';
}

function renderPagination(container, totalItems) {
    if (!container) {
        return;
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                pages.push(i);
            }
            pages.push('ellipsis');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = totalPages - 3; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('ellipsis');
            pages.push(totalPages);
        }
    }

    container.innerHTML = `
        <button class="catalog-pagination__btn catalog-pagination__btn--prev btn__outline" ${currentPage === 1 ? 'disabled' : ''}>
            <img src="/images/icons/arrow-blue.svg" alt="Назад">
        </button>
        <div class="catalog-pagination__pages">
            ${pages.map((page) => {
                if (page === 'ellipsis') {
                    return '<span class="pagination__ellipsis">...</span>';
                }
                const isActive = page === currentPage;
                return `<button class="catalog-pagination__page ${isActive ? 'catalog-pagination__page--active' : ''}" data-page="${page}">${page}</button>`;
            }).join('')}
        </div>
        <button class="catalog-pagination__btn catalog-pagination__btn--next btn__outline" ${currentPage === totalPages ? 'disabled' : ''}>
            <img src="/images/icons/arrow-blue.svg" alt="Вперед">
        </button>
    `;

    const grid = document.querySelector('[data-product-grid="catalog"]');

    container.querySelectorAll('.catalog-pagination__page').forEach((btn) => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderPage(grid);
            renderPagination(container, totalItems);
            // Прокрутка к началу блока с товарами с учетом шапки (88px)
            const gridTop = grid.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: gridTop - 88, behavior: 'smooth' });
        });
    });

    container.querySelector('.catalog-pagination__btn--prev')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(grid);
            renderPagination(container, totalItems);
            const gridTop = grid.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: gridTop - 88, behavior: 'smooth' });
        }
    });

    container.querySelector('.catalog-pagination__btn--next')?.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(grid);
            renderPagination(container, totalItems);
            const gridTop = grid.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: gridTop - 88, behavior: 'smooth' });
        }
    });
}

function renderPage(grid) {
    if (!grid) {
        return;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    renderProductCards(grid, pageProducts, 'Нет товаров по заданным параметрам');
}