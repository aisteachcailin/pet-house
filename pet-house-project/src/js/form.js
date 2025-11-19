// Валидация формы
function validateForm() {
    const form = document.getElementById('customForm');
    if (!form) return;

    const nameInput = document.getElementById('formName');
    const phoneInput = document.getElementById('formPhone');
    const emailInput = document.getElementById('formEmail');
    const agreeInput = document.getElementById('formAgree');

    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const emailError = document.getElementById('emailError');

    let isValid = true;

    // Валидация имени
    if (!nameInput.value.trim()) {
        nameInput.classList.add('form__input--error');
        nameError.textContent = 'Пожалуйста, укажите имя';
        isValid = false;
    } else {
        nameInput.classList.remove('form__input--error');
        nameError.textContent = '';
    }

    // Валидация телефона
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneInput.value.trim()) {
        phoneInput.classList.add('form__input--error');
        phoneError.textContent = 'Пожалуйста, укажите телефон';
        isValid = false;
    } else if (!phoneRegex.test(phoneInput.value)) {
        phoneInput.classList.add('form__input--error');
        phoneError.textContent = 'Неверный формат телефона';
        isValid = false;
    } else {
        phoneInput.classList.remove('form__input--error');
        phoneError.textContent = '';
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
        emailInput.classList.add('form__input--error');
        emailError.textContent = 'Пожалуйста, укажите почту';
        isValid = false;
    } else if (!emailRegex.test(emailInput.value)) {
        emailInput.classList.add('form__input--error');
        emailError.textContent = 'Неверный формат почты';
        isValid = false;
    } else {
        emailInput.classList.remove('form__input--error');
        emailError.textContent = '';
    }

    // Валидация согласия
    if (!agreeInput.checked) {
        isValid = false;
    }

    return isValid;
}

// Отправка формы
function submitForm(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = {
        name: document.getElementById('formName').value,
        phone: document.getElementById('formPhone').value,
        email: document.getElementById('formEmail').value,
        agree: document.getElementById('formAgree').checked
    };

    // Отправка через EmailJS или другой сервис
    // Для теста используем mailto
    const subject = encodeURIComponent('Заявка с сайта ПЭТ-Хаус НН');
    const body = encodeURIComponent(
        `Имя: ${formData.name}\nТелефон: ${formData.phone}\nEmail: ${formData.email}`
    );
    const mailtoLink = `mailto:9977qwerty@gmail.com?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;

    // Альтернативный вариант через fetch (требует бэкенд)
    // fetch('/api/send-email', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     alert('Заявка отправлена!');
    //     form.reset();
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    //     alert('Ошибка при отправке заявки');
    // });
}

// Инициализация формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('customForm');
    if (form) {
        form.addEventListener('submit', submitForm);

        // Валидация при потере фокуса
        const inputs = form.querySelectorAll('.form__input');
        inputs.forEach(input => {
            input.addEventListener('blur', validateForm);
            input.addEventListener('input', function() {
                if (this.classList.contains('form__input--error')) {
                    validateForm();
                }
            });
        });
    }
});

