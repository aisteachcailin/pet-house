import { renderProductCards } from './components/productCard.js';
import { topSalesProducts } from './data/products.js';
import { initContactModal, showContactModal } from './components/modal.js';
import Swiper from 'swiper';
import 'swiper/css';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

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

        const isTextOverflowing = textValue.scrollWidth > textValue.clientWidth;
        if (!isTextOverflowing && !detail.classList.contains('expanded')) {
            return;
        }

        const isExpanded = detail.classList.contains('expanded');
        
        if (isExpanded) {
            textValue.style.maxHeight = textValue.scrollHeight + 'px';
            textValue.offsetHeight; 
            textValue.style.maxHeight = '1.2em';
            
            setTimeout(() => {
                detail.classList.remove('expanded');
                textValue.style.whiteSpace = 'nowrap';
                textValue.style.textOverflow = 'ellipsis';
                textValue.style.maxHeight = '';
            }, 300);
        } else {
            detail.classList.add('expanded');
            textValue.style.whiteSpace = 'normal';
            textValue.style.textOverflow = 'clip';
            textValue.style.maxHeight = '1.2em';
            textValue.offsetHeight; 
            textValue.style.maxHeight = textValue.scrollHeight + 'px';
            
            setTimeout(() => {
                textValue.style.maxHeight = 'none';
            }, 300);
        }
    });
}

function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 88;
                const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: targetTop - headerHeight, behavior: 'smooth' });
            }
            return;
        }
        
        if (href.includes('company') && href.includes('#pictures-slider')) {
            if (link.textContent.includes('Подробнее о ГК') || link.textContent.includes('Подробнее')) {
                e.preventDefault();
                const urlParts = href.split('#');
                const baseUrl = urlParts[0];
                const anchor = urlParts[1];
                
                window.location.href = baseUrl;
                
                setTimeout(() => {
                    const slider = document.getElementById(anchor) || document.querySelector('.pictures-slider');
                    if (slider) {
                        const header = document.querySelector('.header');
                        const headerHeight = header ? header.offsetHeight : 88;
                        const sliderTop = slider.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({ top: sliderTop - headerHeight, behavior: 'smooth' });
                    }
                }, 300);
            }
        }
    });
    
    if (window.location.pathname.includes('company') && window.location.hash === '#pictures-slider') {
        setTimeout(() => {
            const slider = document.getElementById('pictures-slider') || document.querySelector('.pictures-slider');
            if (slider) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 88;
                const sliderTop = slider.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: sliderTop - headerHeight, behavior: 'smooth' });
            }
        }, 300);
    }
}

function initCategoryTags() {
    const categoryMap = {
        'Пивоварение': 'Пиво, газированные напитки',
        'Лимонады': 'Лимонады, соки, вода',
        'Молоко': 'Молоко',
        'Незамерзающая жидкость': 'Химия, удобрения, вода',
        'Соки': 'Лимонады, соки, вода',
        'Косметика': 'Косметика, другая тара',
        'Химия': 'Химия, удобрения, вода',
        'Масла': 'Масла, соусы',
        'Удобрения': 'Химия, удобрения, вода',
        'Соусы': 'Масла, соусы',
        'Электроды': 'БАДы, сыпучие и гранулированные продукты',
        'БАДы, сыпучие и гранулированные продукты': 'БАДы, сыпучие и гранулированные продукты',
        'Упаковка для электродов': 'БАДы, сыпучие и гранулированные продукты',
        'Упаковки для соусов': 'Масла, соусы',
        'Упаковка для БАДов, сыпучих и гранулированных продуктов': 'БАДы, сыпучие и гранулированные продукты'
    };

    document.querySelectorAll('.business__tag').forEach((tag) => {
        tag.addEventListener('click', () => {
            const category = tag.textContent.trim();
            const purpose = categoryMap[category];
            if (purpose) {
                const url = `/src/pages/catalog.html?purpose=${encodeURIComponent(purpose)}`;
                window.location.href = url;
            }
        });
    });

    document.querySelectorAll('.new-products__items .glass-block').forEach((tag) => {
        tag.addEventListener('click', () => {
            const category = tag.textContent.trim();
            const purpose = categoryMap[category];
            if (purpose) {
                const url = `/src/pages/catalog.html?purpose=${encodeURIComponent(purpose)}`;
                window.location.href = url;
            }
        });
    });
}

function initTopSales() {
    const grid = document.querySelector('[data-product-grid="top-sales"]');
    if (!grid) {
        return;
    }

    renderProductCards(grid, topSalesProducts, 'Нет популярных позиций');
}

function initPicturesSlider() {
    const sliders = document.querySelectorAll('[data-slider="pictures"]');

    sliders.forEach((slider) => {
        const slidesDesktop = parseFloat(slider.dataset.slidesDesktop) || 3;
        const slidesTablet = parseFloat(slider.dataset.slidesTablet) || 2;
        const slidesMobile = parseFloat(slider.dataset.slidesMobile) || 1.2;
        const spaceDesktop = parseFloat(slider.dataset.spaceDesktop) || 60;
        const spaceTablet = parseFloat(slider.dataset.spaceTablet) || 20;
        const spaceMobile = parseFloat(slider.dataset.spaceMobile) || 16;

        new Swiper(slider, {
            slidesPerView: slidesDesktop,
            spaceBetween: spaceDesktop,
            grabCursor: true,
            watchOverflow: true,
            breakpoints: {
                320: {
                    slidesPerView: slidesMobile,
                    spaceBetween: spaceMobile,
                },
                768: {
                    slidesPerView: slidesTablet,
                    spaceBetween: spaceTablet,
                },
                1200: {
                    slidesPerView: slidesDesktop,
                    spaceBetween: spaceDesktop,
                },
            },
        });
    });
}

function initProductionFilters() {
    const filterMap = {
        'Для пищевой промышленности': 'Пищевая промышленность',
        'Для косметики': 'Косметика, другая тара',
        'Для продуктов химической и иной промышленности': 'Химия, удобрения, вода'
    };

    document.querySelectorAll('[data-filter-link]').forEach((item) => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4')?.textContent.trim();
            const filter = filterMap[title] || 'Пищевая промышленность';
            const url = `/src/pages/catalog.html?purpose=${encodeURIComponent(filter)}`;
            window.location.href = url;
        });
    });
}

function initFancyboxGallery() {

    Fancybox.bind("[data-fancybox]", {
        Thumbs: {
            type: "modern",
        },
        Toolbar: {
            display: {
                left: ["infobar"],
                middle: [
                    "zoomIn",
                    "zoomOut",
                    "toggle1to1",
                    "rotateCCW",
                    "rotateCW",
                    "flipX",
                    "flipY",
                ],
                right: [
                    "slideshow",
                    "fullscreen",
                    "download",
                    "thumbs",
                    "close",
                ],
            },
        },
        Images: {
            zoom: true,
            wheel: "slide",
        },
        Carousel: {
            infinite: true,
            transition: "slide",
            friction: 0.3,
        },
        l10n: {
            CLOSE: "Закрыть",
            NEXT: "Вперед",
            PREV: "Назад",
            MODAL: "Вы можете закрыть это модальное окно с помощью клавиши ESC",
            ERROR: "Что-то пошло не так. Пожалуйста, попробуйте позже",
            IMAGE_ERROR: "Изображение не найдено",
            ELEMENT_NOT_FOUND: "HTML элемент не найден",
            AJAX_NOT_FOUND: "Ошибка загрузки AJAX : Не найдено",
            AJAX_FORBIDDEN: "Ошибка загрузки AJAX : Запрещено",
            IFRAME_ERROR: "Ошибка загрузки страницы",
            TOGGLE_ZOOM: "Переключить уровень масштабирования",
            TOGGLE_THUMBS: "Переключить миниатюры",
            TOGGLE_SLIDESHOW: "Переключить слайдшоу",
            TOGGLE_FULLSCREEN: "Переключить полноэкранный режим",
            DOWNLOAD: "Скачать",
        },
    });
}


document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', '/src/components/header.html');
    loadComponent('footer', '/src/components/footer.html');
    initContactModal();
    initProductDetailToggle();
    initTopSales();
    initPicturesSlider();
    initSmoothScroll();
    initCategoryTags();
    initProductionFilters();
    initFancyboxGallery();
});