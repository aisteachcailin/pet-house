import { products } from './data/products.js';
import { renderProductCards } from './components/productCard.js';

const ITEMS_PER_PAGE = 21;

let currentPage = 1;
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('catalogFilters');
    const grid = document.querySelector('[data-product-grid="catalog"]');
    const countElement = document.querySelector('[data-product-count]');
    const sortSelect = document.getElementById('catalogSort');
    const clearBtn = document.getElementById('clearFilters');
    const paginationContainer = document.querySelector('[data-pagination]');

    if (!filterForm || !grid) {
        return;
    }

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
    };

    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFilters();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterForm.reset();
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFilters();
        });
    }

    applyFilters();
});

function matchesProduct(product, criteria) {
    if (criteria.types.length > 0 && !criteria.types.includes(product.type)) {
        return false;
    }

    if (criteria.necks.length > 0 && !criteria.necks.includes(product.neck)) {
        return false;
    }

    if (criteria.purposes.length > 0 && !criteria.purposes.includes(product.purpose)) {
        return false;
    }

    if (criteria.volumes.length > 0) {
        const productVolume = parseFloat(product.volume);
        const matchesVolumeRange = criteria.volumes.some((range) => {
            const [min, max] = range.split('-').map(parseFloat);
            return productVolume >= min && productVolume <= max;
        });

        if (!matchesVolumeRange) {
            return false;
        }
    }

    if (criteria.volumeFrom || criteria.volumeTo) {
        const productVolume = parseFloat(product.volume);
        if (criteria.volumeFrom && productVolume < parseFloat(criteria.volumeFrom)) {
            return false;
        }
        if (criteria.volumeTo && productVolume > parseFloat(criteria.volumeTo)) {
            return false;
        }
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
        <button class="pagination__btn pagination__btn--prev" ${currentPage === 1 ? 'disabled' : ''}>
            <img src="/images/icons/arrow-blue.svg" alt="Назад">
        </button>
        <div class="pagination__pages">
            ${pages.map((page) => {
                if (page === 'ellipsis') {
                    return '<span class="pagination__ellipsis">...</span>';
                }
                const isActive = page === currentPage;
                return `<button class="pagination__page ${isActive ? 'pagination__page--active' : ''}" data-page="${page}">${page}</button>`;
            }).join('')}
        </div>
        <button class="pagination__btn pagination__btn--next" ${currentPage === totalPages ? 'disabled' : ''}>
            <img src="/images/icons/arrow-blue.svg" alt="Вперед">
        </button>
    `;

    const grid = document.querySelector('[data-product-grid="catalog"]');

    container.querySelectorAll('.pagination__page').forEach((btn) => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderPage(grid);
            renderPagination(container, totalItems);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    container.querySelector('.pagination__btn--prev')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(grid);
            renderPagination(container, totalItems);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    container.querySelector('.pagination__btn--next')?.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(grid);
            renderPagination(container, totalItems);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
