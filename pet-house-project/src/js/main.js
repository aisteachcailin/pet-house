import { renderProductCards } from './components/productCard.js';
import { topSalesProducts } from './data/products.js';

function loadComponent(id, file) {
    fetch(file)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.text();
        })
        .then((data) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = data;
                if (id === 'header') {
                    initHeaderScroll();
                }
            }
        })
        .catch((error) => {
            console.error(`Error loading component ${id} from ${file}`, error);
        });
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) {
        return;
    }

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initProductDetailToggle() {
    document.addEventListener('click', (event) => {
        const detail = event.target.closest('.product-card__detail');
        if (!detail) {
            return;
        }

        const textValue = detail.querySelector('.text-value');
        if (!textValue) {
            return;
        }

        const isExpanded = detail.classList.toggle('expanded');
        if (isExpanded) {
            detail.style.maxHeight = `${detail.scrollHeight}px`;
            textValue.style.whiteSpace = 'normal';
            textValue.style.textOverflow = 'clip';
        } else {
            detail.style.maxHeight = '';
            textValue.style.whiteSpace = 'nowrap';
            textValue.style.textOverflow = 'ellipsis';
        }
    });
}

function initTopSales() {
    const grid = document.querySelector('[data-product-grid="top-sales"]');
    if (!grid) {
        return;
    }

    renderProductCards(grid, topSalesProducts, 'Нет популярных позиций');
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', '/src/components/header.html');
    loadComponent('footer', '/src/components/footer.html');
    initProductDetailToggle();
    initTopSales();
});