export function initContactModal() {
    loadContactModal();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupModalHandlers();
            setupContactButtons();
        });
    } else {
        setupModalHandlers();
        setupContactButtons();
    }
}

function loadContactModal() {

    if (document.getElementById('contactModal')) {
        return;
    }

    fetch('/src/components/contact-modal.html')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.text();
        })
        .then((data) => {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = data;
            document.body.appendChild(modalContainer);
            setupModalHandlers();
            
            if (typeof window.initForms === 'function') {
                window.initForms();
            }
        })
        .catch((error) => {
            console.error('Error loading contact modal:', error);
        });
}

let modalHandlersInitialized = false;
let escapeHandlerInitialized = false;

function setupModalHandlers() {
    const contactModal = document.getElementById('contactModal');
    const successPopup = document.getElementById('successPopup');
    const errorPopup = document.getElementById('errorPopup');

    if (!contactModal) {
        return;
    }

    if (!modalHandlersInitialized) {

        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                closeModal(contactModal);
            }
        });

        const closeBtn = contactModal.querySelector('.popup__close-btn');
        if (closeBtn && !closeBtn.dataset.handlerAdded) {
            closeBtn.addEventListener('click', () => {
                closeModal(contactModal);
            });
            closeBtn.dataset.handlerAdded = 'true';
        }

        modalHandlersInitialized = true;
    }

    if (!escapeHandlerInitialized) {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const activeModal = document.querySelector('.popup-overlay.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });
        escapeHandlerInitialized = true;
    }

    [successPopup, errorPopup].forEach((popup) => {
        if (!popup || popup.dataset.handlersAdded) return;

        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                closeModal(popup);
            }
        });

        const closeBtn = popup.querySelector('.popup__close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(popup);
            });
        }

        popup.dataset.handlersAdded = 'true';
    });
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

export function showContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        openModal(contactModal);
    }
}

function setupContactButtons() {

    document.addEventListener('click', (event) => {
        const target = event.target;
        const element = target.closest('a, button');
        
        if (!element) return;

        const text = element.textContent.trim();
        const href = element.getAttribute('href');
        
        if (element.id === 'contactBtn' || text === 'Связаться с нами') {
            event.preventDefault();
            showContactModal();
            return;
        }

        if (text === 'Оставить заявку' || (element.classList.contains('footer__btn') && text === 'Оставить заявку')) {
            event.preventDefault();
            showContactModal();
            return;
        }

        if (text === 'Заказать расчёт' || element.dataset.openModal || element.hasAttribute('data-open-modal')) {

            if (element.tagName === 'A' && href && !href.startsWith('#')) {
                return;
            }
            event.preventDefault();
            showContactModal();
            return;
        }

        if (text === 'Смотреть новинки' || text.includes('Смотреть новинки')) {
            event.preventDefault();
            showContactModal();
            return;
        }

        const cartBtn = target.closest('.product-card__cart');
        if (cartBtn) {
            event.preventDefault();
            event.stopPropagation();
            showContactModal();
            return;
        }
        
        const productCard = target.closest('.product-card');
        if (productCard && !cartBtn && !target.closest('.product-card__detail')) {
            event.preventDefault();
            event.stopPropagation();
            showContactModal();
            return;
        }
    });
}

