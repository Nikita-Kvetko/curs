document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    const orderItemsContainer = document.getElementById('order-items');
    const preloader = document.getElementById('preloader');
    
    let cartItems = [];
    let allProducts = [];
    let deliveryPrice = 500;
    let isFormValid = false;

    const validationRules = {
        lastname: {
            pattern: /^[а-яА-ЯёЁa-zA-Z\- ]{2,50}$/,
            message: 'Фамилия должна содержать 2-50 букв, дефисы или пробелы'
        },
        firstname: {
            pattern: /^[а-яА-ЯёЁa-zA-Z\- ]{2,50}$/,
            message: 'Имя должно содержать 2-50 букв, дефисы или пробелы'
        },
        middlename: {
            pattern: /^[а-яА-ЯёЁa-zA-Z\- ]{0,50}$/,
            message: 'Отчество должно содержать до 50 букв, дефисы или пробелы',
            optional: true
        },
        phone: {
            pattern: /^(\+375|80)(25|29|33|44|17)\d{7}$/,
            message: 'Введите корректный белорусский номер (+375 XX XXXXXXX или 80 XX XXXXXXX)'
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Введите корректный email адрес'
        },
        city: {
            pattern: /^[а-яА-ЯёЁa-zA-Z\- ]{2,50}$/,
            message: 'Город должен содержать 2-50 букв, дефисы или пробелы'
        },
        street: {
            pattern: /^[а-яА-ЯёЁa-zA-Z0-9\-\. ]{2,100}$/,
            message: 'Улица должна содержать 2-100 символов (буквы, цифры, точки, дефисы)'
        },
        house: {
            pattern: /^[а-яА-ЯёЁa-zA-Z0-9\-\\/ ]{1,10}$/,
            message: 'Дом должен содержать 1-10 символов (буквы, цифры, дефисы, слэши)'
        },
        apartment: {
            pattern: /^[а-яА-ЯёЁa-zA-Z0-9\- ]{0,10}$/,
            message: 'Квартира должна содержать до 10 символов',
            optional: true
        },
        postalCode: {
            pattern: /^\d{6}$/,
            message: 'Почтовый индекс должен содержать 6 цифр',
            optional: true
        }
    };

    async function loadCheckoutData() {
        showPreloader();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            allProducts = await getAllProducts();
            const cart = await getCart(currentUser.id);
            cartItems = cart.items;
            
            if (cartItems.length === 0) {
                window.location.href = 'cart.html';
                return;
            }
            
            renderOrderSummary();
            updateSummary();
            prefillUserData(currentUser);
            setupEventListeners();
            setupValidation();

            setTimeout(validateForm, 100);
        } catch (error) {
            console.error('Error loading checkout data:', error);
            showError('Не удалось загрузить данные для оформления заказа');
        } finally {
            hidePreloader();
        }
    }

    function showPreloader() {
        preloader.style.display = 'flex';
    }

    function hidePreloader() {
        preloader.style.display = 'none';
    }

    function showError(message) {
        orderItemsContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="loadCheckoutData()" class="btn-primary">Попробовать снова</button>
            </div>
        `;
    }

    function renderOrderSummary() {
        const orderItemsHTML = cartItems.map(item => {
            const product = allProducts.find(p => p.id === item.productId.toString());
            if (!product) return '';
            
            const finalPrice = calculateProductPrice(product);
            const totalPrice = finalPrice * item.quantity;
            
            return `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="../img/${product.images[0]}" alt="${product.name}">
                    </div>
                    <div class="order-item-info">
                        <div class="order-item-name">${product.name}</div>
                        <div class="order-item-details">
                            <span>${item.quantity} × ${finalPrice} руб.</span>
                            <span class="order-item-price">${totalPrice} руб.</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        orderItemsContainer.innerHTML = orderItemsHTML;
    }

    function updateSummary() {
        let subtotal = 0;
        let totalDiscount = 0;
        
        cartItems.forEach(item => {
            const product = allProducts.find(p => p.id === item.productId.toString());
            if (product) {
                const finalPrice = calculateProductPrice(product);
                subtotal += finalPrice * item.quantity;
                if (product.discount > 0) {
                    totalDiscount += (product.price - finalPrice) * item.quantity;
                }
            }
        });
        
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
        const deliveryCost = deliveryMethod === 'pickup' ? 0 : deliveryPrice;
        
        const total = subtotal + deliveryCost;
        
        document.getElementById('summary-subtotal').textContent = `${subtotal} руб.`;
        document.getElementById('summary-discount').textContent = `-${totalDiscount} руб.`;
        document.getElementById('summary-delivery').textContent = `${deliveryCost} руб.`;
        document.getElementById('summary-total').textContent = `${total} руб.`;
    }

    function prefillUserData(user) {
        if (user.lastname) {
            document.getElementById('lastname').value = user.lastname;
            validateField({target: document.getElementById('lastname')});
        }
        if (user.firstname) {
            document.getElementById('firstname').value = user.firstname;
            validateField({target: document.getElementById('firstname')});
        }
        if (user.middlename) {
            document.getElementById('middlename').value = user.middlename;
            validateField({target: document.getElementById('middlename')});
        }
        if (user.phone) {
            document.getElementById('phone').value = user.phone;
            validateField({target: document.getElementById('phone')});
        }
        if (user.email) {
            document.getElementById('email').value = user.email;
            validateField({target: document.getElementById('email')});
        }
    }

    function setupEventListeners() {
        document.querySelectorAll('input[name="delivery"]').forEach(radio => {
            radio.addEventListener('change', function() {
                updateSummary();
                validateForm();
            });
        });

        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', validateForm);
        });

        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/[^\d+]/g, '');

            if (value.startsWith('80') && value.length === 2) {
                value = '+375' + value.substring(2);
            }
            else if (value.startsWith('375') && !value.startsWith('+375')) {
                value = '+' + value;
            }

            if (value.startsWith('+375') && value.length > 13) {
                value = value.substring(0, 13);
            }
            
            this.value = value;
            validateField(e);
            validateForm();
        });
        
        phoneInput.addEventListener('blur', function(e) {
            let value = this.value.replace(/[^\d+]/g, '');
            
            if (value.startsWith('+375') && value.length === 13) {
                const code = value.substring(0, 4);
                const operator = value.substring(4, 6);
                const part1 = value.substring(6, 9);
                const part2 = value.substring(9, 11);
                const part3 = value.substring(11, 13);
                
                this.value = `${code} (${operator}) ${part1}-${part2}-${part3}`;
            }
            
            validateField(e);
            validateForm();
        });

        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', function(e) {
                validateField(e);
                validateForm();
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
                validateForm();
            });
        });
    }

    function setupValidation() {
        checkoutForm.addEventListener('input', validateForm);
        checkoutForm.addEventListener('change', validateForm);
    }

    function validateField(e) {
        const field = e.target;
        const fieldName = field.name;
        const rules = validationRules[fieldName];
        
        if (!rules) return true;
        
        let value = field.value.trim();

        if (fieldName === 'phone') {
            value = value.replace(/[^\d+]/g, '');

            if (value.startsWith('80')) {
                value = '+375' + value.substring(2);
            }
        }

        if (rules.optional && !value) {
            clearFieldError(field);
            return true;
        }

        if (!rules.optional && !value) {
            showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        }

        if (!rules.pattern.test(value)) {
            showFieldError(field, rules.message);
            return false;
        }

        if (fieldName === 'email' && value.length > 100) {
            showFieldError(field, 'Email не должен превышать 100 символов');
            return false;
        }
        
        if (fieldName === 'postalCode' && value && !rules.pattern.test(value)) {
            showFieldError(field, rules.message);
            return false;
        }
        
        clearFieldError(field);
        return true;
    }

    function showFieldError(field, message) {
        clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);

        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', field.id + '-error');
        errorDiv.id = field.id + '-error';
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    function validateForm() {
        let isValid = true;

        Object.keys(validationRules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const rules = validationRules[fieldName];
                let value = field.value.trim();

                if (fieldName === 'phone') {
                    value = value.replace(/[^\d+]/g, '');

                    if (value.startsWith('80')) {
                        value = '+375' + value.substring(2);
                    }
                }

                if (rules.optional && !value) {
                    return;
                }

                if (!rules.optional && !value) {
                    isValid = false;
                    return;
                }

                if (value && !rules.pattern.test(value)) {
                    isValid = false;
                    return;
                }
            }
        });

        const deliverySelected = document.querySelector('input[name="delivery"]:checked');
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        
        if (!deliverySelected || !paymentSelected) {
            isValid = false;
        }
        
        isFormValid = isValid;
        updateSubmitButton();
        
        return isValid;
    }

    function updateSubmitButton() {
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled = !isFormValid;
            if (!isFormValid) {
                submitBtn.title = 'Заполните все обязательные поля корректно';
            } else {
                submitBtn.removeAttribute('title');
            }
        }
    }

    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let allFieldsValid = true;
        Object.keys(validationRules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const event = new Event('blur');
                field.dispatchEvent(event);
                
                if (field.classList.contains('error')) {
                    allFieldsValid = false;
                }
            }
        });

        const deliverySelected = document.querySelector('input[name="delivery"]:checked');
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        
        if (!allFieldsValid || !deliverySelected || !paymentSelected) {
            const firstError = document.querySelector('.error') || 
                              document.querySelector('input[name="delivery"]:not(:checked)') ||
                              document.querySelector('input[name="payment"]:not(:checked)');
            
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            
            alert('Пожалуйста, исправьте ошибки в форме перед отправкой.');
            return;
        }
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему для оформления заказа');
            return;
        }
        
        const formData = new FormData(checkoutForm);

        let phone = formData.get('phone').trim();
        phone = phone.replace(/[^\d+]/g, '');
        if (phone.startsWith('80')) {
            phone = '+375' + phone.substring(2);
        }
        
        const orderData = {
            userId: currentUser.id,
            customer: {
                lastname: formData.get('lastname').trim(),
                firstname: formData.get('firstname').trim(),
                middlename: formData.get('middlename').trim(),
                phone: phone,
                email: formData.get('email').trim()
            },
            delivery: {
                method: formData.get('delivery'),
                address: {
                    city: formData.get('city').trim(),
                    street: formData.get('street').trim(),
                    house: formData.get('house').trim(),
                    apartment: formData.get('apartment').trim(),
                    postalCode: formData.get('postalCode').trim()
                },
                cost: formData.get('delivery') === 'pickup' ? 0 : deliveryPrice
            },
            payment: {
                method: formData.get('payment')
            },
            items: cartItems,
            comment: formData.get('comment').trim(),
            total: calculateOrderTotal(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        try {
            showPreloader();
            await createOrder(orderData);

            await updateCart(currentUser.id, []);
            updateCartCountInHeader(0);

            window.location.href = '../pages/order-success.html?order=' + encodeURIComponent(JSON.stringify(orderData));
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
        } finally {
            hidePreloader();
        }
    });

    function calculateOrderTotal() {
        let subtotal = 0;
        cartItems.forEach(item => {
            const product = allProducts.find(p => p.id === item.productId.toString());
            if (product) {
                const finalPrice = calculateProductPrice(product);
                subtotal += finalPrice * item.quantity;
            }
        });
        
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
        const deliveryCost = deliveryMethod === 'pickup' ? 0 : deliveryPrice;
        
        return subtotal + deliveryCost;
    }

    async function createOrder(orderData) {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    window.goBackToCart = function() {
        window.location.href = 'cart.html';
    }

    loadCheckoutData();
});