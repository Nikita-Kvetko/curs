document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const passwordTypeRadios = document.querySelectorAll('input[name="password-type"]');
    const manualPasswordFields = document.querySelectorAll('.manual-password');
    const generateNicknameBtn = document.getElementById('generate-nickname');
    const nicknameInput = document.getElementById('reg-nickname');
    const registerBtn = document.getElementById('register-btn');
    const regForm = document.getElementById('register-form');

    if (!loginTab || !registerTab || !loginForm || !registerForm || !regForm) {
        console.error('Не найдены основные элементы формы');
        return;
    }

    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));
    
    function switchTab(tab) {
        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    passwordTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'manual') {
                manualPasswordFields.forEach(field => {
                    field.style.display = 'block';

                    const input = field.querySelector('input');
                    if (input) input.setAttribute('required', 'true');
                });
            } else {
                manualPasswordFields.forEach(field => {
                    field.style.display = 'none';

                    const input = field.querySelector('input');
                    if (input) {
                        input.removeAttribute('required');
                        input.value = '';
                        clearError(input);
                    }
                });
            }
            validateForm();
        });
    });

    let nicknameAttempts = 0;
    const maxNicknameAttempts = 5;
    
    if (generateNicknameBtn && nicknameInput) {
        generateNicknameBtn.addEventListener('click', generateNickname);
    }
    
    function generateNickname() {
        if (!nicknameInput) return;
        
        nicknameAttempts++;
        
        if (nicknameAttempts > maxNicknameAttempts) {
            nicknameInput.removeAttribute('readonly');
            if (generateNicknameBtn) generateNicknameBtn.style.display = 'none';
            return;
        }
        
        const firstname = document.getElementById('reg-firstname')?.value || 'User';
        const lastname = document.getElementById('reg-lastname')?.value || '';
        
        const randomNum = Math.floor(Math.random() * 1000);
        const nickname = `${firstname}${lastname ? '_' + lastname : ''}${randomNum}`;
        
        nicknameInput.value = nickname;
        validateField(nicknameInput);
    }

    const requiredFields = regForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('input', function() {
            validateField(this);
            validateForm();
        });
        
        field.addEventListener('blur', function() {
            validateField(this);
            validateForm();
        });
    });

    const regPassword = document.getElementById('reg-password');
    const regPasswordConfirm = document.getElementById('reg-password-confirm');
    
    if (regPassword) {
        regPassword.addEventListener('input', function() {
            updatePasswordStrengthIndicator(this.value);
            validateField(this);
            if (regPasswordConfirm && regPasswordConfirm.value) {
                validateField(regPasswordConfirm);
            }
            validateForm();
        });
    }
    
    if (regPasswordConfirm) {
        regPasswordConfirm.addEventListener('input', function() {
            validateField(this);
            validateForm();
        });
    }

    const regAgreement = document.getElementById('reg-agreement');
    if (regAgreement) {
        regAgreement.addEventListener('change', function() {
            validateForm();
        });
    }

    function validateField(field) {
        if (!field) return false;
        
        const errorElement = field.parentElement ? field.parentElement.querySelector('.error-message') : null;
        let isValid = true;
        let errorMessage = '';
        
        if (errorElement) {
            clearError(field);
        }
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }
        
        if (isValid && field.type === 'email') {
            isValid = validateEmail(field.value);
            if (!isValid) errorMessage = 'Введите корректный email';
        }
        
        if (isValid && field.id === 'reg-phone') {
            isValid = validatePhone(field.value);
            if (!isValid) errorMessage = 'Введите корректный номер телефона РБ';
        }
        
        if (isValid && field.id === 'reg-birthdate') {
            isValid = validateBirthdate(field.value);
            if (!isValid) errorMessage = 'Вам должно быть не менее 16 лет';
        }
        
        if (isValid && field.id === 'reg-password') {
            isValid = validatePassword(field.value);
            if (!isValid) errorMessage = 'Пароль должен содержать минимум 8 символов, но не более 20; должен включать в себя хотя бы: одну заглавную букву, одну строчную букву, одну цифру и один специальный символ';
        }
        
        if (isValid && field.id === 'reg-password-confirm') {
            const password = document.getElementById('reg-password');
            isValid = field.value === (password ? password.value : '');
            if (!isValid) errorMessage = 'Пароли не совпадают';
        }
        
        if (!isValid && errorElement) {
            showError(field, errorMessage);
        }
        
        return isValid;
    }

    function validateForm() {
        let isValid = true;

        requiredFields.forEach(field => {

            const isManualPassword = document.querySelector('input[name="password-type"]:checked').value === 'manual';
            const isPasswordField = field.id === 'reg-password' || field.id === 'reg-password-confirm';
            
            if (!isManualPassword && isPasswordField) {
                return; 
            }
            
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (document.querySelector('input[name="password-type"]:checked').value === 'manual') {
            const password = document.getElementById('reg-password');
            const passwordConfirm = document.getElementById('reg-password-confirm');
            
            if (password && !validateField(password)) {
                isValid = false;
            }
            
            if (passwordConfirm && !validateField(passwordConfirm)) {
                isValid = false;
            }

            if (password && passwordConfirm && password.value !== passwordConfirm.value) {
                isValid = false;
                showError(passwordConfirm, 'Пароли не совпадают');
            }
        }

        const agreement = document.getElementById('reg-agreement');
        if (agreement) {
            if (!agreement.checked) {
                isValid = false;
                const errorElement = agreement.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.textContent = 'Необходимо принять соглашение';
                }
            } else {
                const errorElement = agreement.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
        }

        const nickname = document.getElementById('reg-nickname');
        if (nickname) {
            if (!nickname.value.trim()) {
                isValid = false;
                const errorElement = nickname.parentElement.querySelector('.error-message');
                if (errorElement && !errorElement.textContent) {
                    showError(nickname, 'Никнейм обязателен для заполнения');
                }
            }
        }
        
        if (registerBtn) {
            registerBtn.disabled = !isValid;
        }
        
        return isValid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {

        const cleanedPhone = phone.replace(/[^\d+]/g, '');

        const re = /^\+375(17|25|29|33|44|15|16|24)\d{7}$/;

        return re.test(cleanedPhone) && cleanedPhone.length === 13;
    }
    
    function validateBirthdate(date) {
        const birthdate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        
        return age >= 16;
    }
    
    function validatePassword(password) {

        if (!password && document.querySelector('input[name="password-type"]:checked').value === 'manual') {
            return false;
        }

        if (document.querySelector('input[name="password-type"]:checked').value === 'auto') {
            return true;
        }

        const commonPasswords = [
            'password', '123456', '12345678', '123456789', 'admin', '1234567',
            '1234567890', 'qwerty', 'abc123', 'password1', '12345', '1234',
            '111111', '123123', 'qwerty123', '1q2w3e4r', '123456a', '000000'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            return false;
        }
        
        return isPasswordStrong(password);
    }

    function isPasswordStrong(password) {
        const minLength = 8;
        const maxLength = 20;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return password.length >= minLength && 
               password.length <= maxLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar;
    }

    function checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8 && password.length <= 20,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        return requirements;
    }

    function updatePasswordStrengthIndicator(password) {
        const indicator = document.getElementById('password-strength-indicator');
        if (!indicator) return;
        
        const requirements = checkPasswordStrength(password);
        const metRequirements = Object.values(requirements).filter(Boolean).length;
        const totalRequirements = Object.keys(requirements).length;

        indicator.innerHTML = '';
        
        Object.entries(requirements).forEach(([key, met]) => {
            const requirementElement = document.createElement('div');
            requirementElement.className = `password-requirement ${met ? 'met' : 'not-met'}`;
            
            let text = '';
            switch(key) {
                case 'length': text = '8-20 символов'; break;
                case 'uppercase': text = 'Заглавная буква'; break;
                case 'lowercase': text = 'Строчная буква'; break;
                case 'number': text = 'Цифра'; break;
                case 'special': text = 'Спецсимвол'; break;
            }
            
            requirementElement.textContent = text;
            indicator.appendChild(requirementElement);
        });

        const passwordField = document.getElementById('reg-password');
        if (passwordField) {
            if (metRequirements === totalRequirements) {
                passwordField.style.borderColor = '#28a745'; // зеленый
            } else if (metRequirements >= totalRequirements / 2) {
                passwordField.style.borderColor = '#ffc107'; // желтый
            } else {
                passwordField.style.borderColor = '#dc3545'; // красный
            }
        }
    }

    function showError(field, message) {
        const errorElement = field.parentElement ? field.parentElement.querySelector('.error-message') : null;
        if (errorElement) {
            field.style.borderColor = '#dc3545';
            errorElement.textContent = message;
        }
    }

    function clearError(field) {
        const errorElement = field.parentElement ? field.parentElement.querySelector('.error-message') : null;
        if (errorElement) {
            field.style.borderColor = '#ddd';
            errorElement.textContent = '';
        }
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('login-phone').value;
        const password = document.getElementById('login-password').value;

        authenticateUser(phone, password);
    });
    
    regForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const passwordType = document.querySelector('input[name="password-type"]:checked').value;
        let passwordValue;
        
        if (passwordType === 'auto') {
            passwordValue = generatePassword();
        } else {
            passwordValue = document.getElementById('reg-password').value;
        }
        
        const userData = {
            phone: document.getElementById('reg-phone').value,
            email: document.getElementById('reg-email').value,
            birthdate: document.getElementById('reg-birthdate').value,
            password: passwordValue,
            lastname: document.getElementById('reg-lastname').value,
            firstname: document.getElementById('reg-firstname').value,
            middlename: document.getElementById('reg-middlename').value,
            nickname: document.getElementById('reg-nickname').value,
            agreement: document.getElementById('reg-agreement').checked
        };

        registerUser(userData);
    });

    function generatePassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
        let password = "";

        password += getRandomChar("abcdefghijklmnopqrstuvwxyz");
        password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        password += getRandomChar("0123456789");
        password += getRandomChar("!@#$%^&*()_+-=[]{}|;:,.<>?");
        
        for (let i = 4; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
    
    function getRandomChar(charSet) {
        return charSet.charAt(Math.floor(Math.random() * charSet.length));
    }

    function authenticateUser(phone, password) {
        fetch('http://localhost:3000/users')
            .then(response => response.json())
            .then(users => {
                const user = users.find(u => u.phone === phone && u.password === password);
                if (user) {
                    alert('Вход выполнен успешно!');

                    localStorage.setItem('currentUser', JSON.stringify(user));

                    window.location.href = '../index.html';
                } else {
                    alert('Неверный телефон или пароль');
                }
            })
            .catch(error => {
                console.error('Ошибка при авторизации:', error);
                alert('Произошла ошибка при авторизации');
            });
    }
    
    function registerUser(userData) {
        userData.role = "user";

        fetch('http://localhost:3000/users')
            .then(response => response.json())
            .then(users => {
                const phoneExists = users.some(u => u.phone === userData.phone);
                const emailExists = users.some(u => u.email === userData.email);
                
                if (phoneExists) {
                    alert('Пользователь с таким телефоном уже существует');
                    return;
                }
                
                if (emailExists) {
                    alert('Пользователь с таким email уже существует');
                    return;
                }

                fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                })
                .then(response => response.json())
                .then(data => {
                    alert('Регистрация прошла успешно! Ваша роль: ' + data.role);
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    window.location.href = '../index.html';
                })
                .catch(error => {
                    console.error('Ошибка при регистрации:', error);
                    alert('Произошла ошибка при регистрации');
                });
            })
            .catch(error => {
                console.error('Ошибка при проверке пользователя:', error);
                alert('Произошла ошибка при регистрации');
            });
    }

    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (!value.startsWith('375') && value.length > 0) {
                value = '375' + value;
            }

            if (value.length > 12) {
                value = value.substring(0, 12);
            }

            let formattedValue = '+';
            for (let i = 0; i < value.length; i++) {
                if (i === 3) formattedValue += ' (';
                if (i === 5) formattedValue += ') ';
                if (i === 8) formattedValue += '-';
                if (i === 10) formattedValue += '-';
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });

        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    if (generateNicknameBtn && nicknameInput) {
        generateNickname();
    }
});