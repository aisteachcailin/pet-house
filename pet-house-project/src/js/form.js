document.addEventListener('DOMContentLoaded', function() {
    emailjs.init('bkNMM51XqfqT68kLx');
    new FormValidator('customForm');
});

const CONFIG = {
    emailService: {
        serviceID: 'service_pukpuk', 
        templateID: 'template_jlt7wwy',
        publicKey: 'bkNMM51XqfqT68kLx' 
    },
    patterns: {
        name: /^[а-яА-ЯёЁa-zA-Z\s\-]{2,50}$/,
        phone: /^\+7\s\d{3}\s\d{3}\s\d{2}\s-\s\d{2}$/,
        email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    messages: {
        required: 'Пожалуйста, заполните поле',
        invalidName: 'Имя должно содержать только буквы (2-50 символов)',
        invalidPhone: 'Введите телефон в формате: +7 900 900 90 - 90',
        invalidEmail: 'Введите корректный email адрес',
        agreementRequired: 'Необходимо согласие'
    }
};

class PhoneMask {
    constructor(input) {
        this.input = input;
        this.init();
    }

    init() {
        this.input.addEventListener('input', (e) => this.formatPhone(e));
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.input.addEventListener('blur', () => this.validateCompletePhone());
    }

    formatPhone(e) {
        let value = e.target.value.replace(/[^\d+]/g, '');
        
        if (value.length > 16) {
            value = value.substring(0, 16);
        }

        if (value.startsWith('+7')) {
            value = value.substring(2);
        } else if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }

        let formattedValue = '+7 ';
        for (let i = 0; i < value.length; i++) {
            if (i === 3) formattedValue += ' ';
            if (i === 6) formattedValue += ' ';
            if (i === 8) formattedValue += ' ';
            if (i === 10) formattedValue += ' - ';
            if (i >= 12) break; 
            formattedValue += value[i];
        }

        formattedValue = formattedValue.trim();
        e.target.value = formattedValue;
    }

    handleKeyDown(e) {
        if ([46, 8, 9, 27, 13].includes(e.keyCode) ||

            (e.keyCode === 65 && e.ctrlKey === true) ||

            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        
        if ((e.keyCode < 48 || e.keyCode > 57) && e.keyCode !== 187 && e.keyCode !== 107) {
            e.preventDefault();
        }
    }

    validateCompletePhone() {
        const value = this.input.value;
        if (value && !CONFIG.patterns.phone.test(value)) {
            this.input.classList.add('form__input--error');
        }
    }

    getCleanPhone() {
        return this.input.value.replace(/[^\d+]/g, '');
    }
}

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.inputs = {
            name: document.getElementById('formName'),
            phone: document.getElementById('formPhone'),
            email: document.getElementById('formEmail'),
            agree: document.getElementById('formAgree')
        };
        this.errors = {
            name: document.getElementById('nameError'),
            phone: document.getElementById('phoneError'),
            email: document.getElementById('emailError'),
            agree: document.getElementById('agreeError')
        };
        
        // Инициализируем маску телефона
        this.phoneMask = new PhoneMask(this.inputs.phone);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Скрытие ошибок при вводе
        Object.values(this.inputs).forEach(input => {
            if (input.type !== 'checkbox') {
                input.addEventListener('input', () => {
                    this.clearError(input);
                    this.updateInputState(input);
                });
            }
        });

        this.inputs.agree.addEventListener('change', () => {
            this.clearError(this.inputs.agree);
        });
    }

    setupRealTimeValidation() {
        // Валидация при потере фокуса
        Object.values(this.inputs).forEach(input => {
            if (input.type !== 'checkbox') {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            }
        });
    }

    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let message = '';

        switch(input.name) {
            case 'name':
                if (!value) {
                    isValid = false;
                    message = CONFIG.messages.required;
                } else if (!CONFIG.patterns.name.test(value)) {
                    isValid = false;
                    message = CONFIG.messages.invalidName;
                }
                break;

            case 'phone':
                if (!value) {
                    isValid = false;
                    message = CONFIG.messages.required;
                } else if (!CONFIG.patterns.phone.test(value)) {
                    isValid = false;
                    message = CONFIG.messages.invalidPhone;
                }
                break;

            case 'email':
                if (!value) {
                    isValid = false;
                    message = CONFIG.messages.required;
                } else if (!this.validateEmail(value)) {
                    isValid = false;
                    message = CONFIG.messages.invalidEmail;
                }
                break;
        }

        if (!isValid) {
            this.showError(input, message);
        } else {
            this.clearError(input);
            this.markAsSuccess(input);
        }

        return isValid;
    }

    validateEmail(email) {
        // Более строгая валидация email
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) {
            return false;
        }
        
        // Проверяем длину частей email
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        
        const localPart = parts[0];
        const domainPart = parts[1];
        
        // Локальная часть не должна быть слишком длинной
        if (localPart.length > 64) return false;
        
        // Домен должен иметь корректную структуру
        if (domainPart.length > 253) return false;
        if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainPart)) return false;
        
        return true;
    }

    validateForm() {
        let isValid = true;

        // Валидация полей ввода
        Object.values(this.inputs).forEach(input => {
            if (input.type !== 'checkbox' && !this.validateField(input)) {
                isValid = false;
            }
        });

        // Валидация чекбокса
        if (!this.inputs.agree.checked) {
            this.showError(this.inputs.agree, CONFIG.messages.agreementRequired);
            isValid = false;
        } else {
            this.clearError(this.inputs.agree);
        }

        return isValid;
    }

    showError(input, message) {
        const errorElement = this.errors[input.name];
        input.classList.add('form__input--error');
        input.classList.remove('form__input--success', 'form__input--filled');
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError(input) {
        const errorElement = this.errors[input.name];
        input.classList.remove('form__input--error');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    markAsSuccess(input) {
        input.classList.add('form__input--success', 'form__input--filled');
    }

    updateInputState(input) {
        if (input.value.trim()) {
            input.classList.add('form__input--filled');
        } else {
            input.classList.remove('form__input--filled', 'form__input--success');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const formData = {
            name: this.inputs.name.value.trim(),
            phone: this.inputs.phone.value.trim(),
            email: this.inputs.email.value.trim(),
            agree: this.inputs.agree.checked
        };

        try {
            await this.sendFormData(formData);
            this.showSuccessPopup();
            this.form.reset();
            this.clearAllErrors();
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
        }
    }

    async sendFormData(formData) {
        if (typeof emailjs !== 'undefined') {
            const templateParams = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                date: new Date().toLocaleString('ru-RU')
            };

            console.log('📧 Отправляемые данные:', templateParams);

            return await emailjs.send(
                CONFIG.emailService.serviceID,
                CONFIG.emailService.templateID,
                templateParams,
                CONFIG.emailService.publicKey
            );
        }
        
        // Резервный вариант через mailto
        const subject = encodeURIComponent('Заявка с сайта ПЭТ-Хаус НН');
        const body = encodeURIComponent(
            `Новая заявка:\n\nИмя: ${formData.name}\nТелефон: ${formData.phone}\nEmail: ${formData.email}`
        );
        window.location.href = `mailto:your-email@domain.com?subject=${subject}&body=${body}`;
        
        return Promise.resolve();
    }

    showSuccessPopup() {
        const popup = document.getElementById('successPopup');
        popup.classList.add('active');
        
        const closeBtn = popup.querySelector('.popup__close');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('active');
        });
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('active');
            }
        });
    }

    clearAllErrors() {
        Object.values(this.inputs).forEach(input => {
            this.clearError(input);
            input.classList.remove('form__input--filled', 'form__input--success');
        });
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        Object.values(this.inputs).forEach(input => {
            if (input.type !== 'checkbox') {
                input.addEventListener('input', () => {
                    this.clearError(input);
                });
                
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            }
        });

        this.inputs.agree.addEventListener('change', () => {
            this.clearError(this.inputs.agree);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const modalForm = document.getElementById('modalForm');
    if (modalForm) {
        new FormValidator('modalForm');
    }
});