document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    const preloader = document.getElementById('preloader');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    let cartItems = [];
    let allProducts = [];

    async function loadCart() {
        showPreloader();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showLoginPrompt();
            hidePreloader();
            return;
        }
        
        try {
            allProducts = await getAllProducts();
            const cart = await getCart(currentUser.id);
            cartItems = cart.items;
            
            renderCart();
        } catch (error) {
            console.error('Error loading cart:', error);
            showError('Не удалось загрузить корзину');
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

    function showLoginPrompt() {
        cartItemsContainer.innerHTML = `
            <div class="login-prompt">
                <h3>Для просмотра корзины необходимо войти в систему</h3>
                <a href="../pages/register.html" class="btn-primary">Войти</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        emptyCart.style.display = 'none';
    }

    function showError(message) {
        cartItemsContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="loadCart()" class="btn-primary">Попробовать снова</button>
            </div>
        `;
    }

    function renderCart() {
        if (cartItems.length === 0) {
            showEmptyCart();
            return;
        }
        
        const cartItemsHTML = cartItems.map(item => {
            const product = allProducts.find(p => p.id === item.productId.toString());
            if (!product) return '';
            
            const finalPrice = calculateProductPrice(product);
            const totalPrice = finalPrice * item.quantity;
            const totalDiscount = product.discount > 0 ? 
                (product.price - finalPrice) * item.quantity : 0;
            
            return `
                <div class="cart-item" data-product-id="${product.id}">
                    <div class="cart-item-image">
                        <img src="../img/${product.images[0]}" alt="${product.name}">
                    </div>
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${product.name}</h3>
                        <div class="cart-item-category">${product.category}</div>
                        <div class="cart-item-dimensions">
                            ${product.width} × ${product.height} × ${product.depth} мм
                        </div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="cart-item-price">
                            <span class="current-price">${finalPrice} руб.</span>
                            ${product.discount > 0 ? `
                                <span class="old-price">${product.price} руб.</span>
                                <span class="discount">-${product.discount}%</span>
                            ` : ''}
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="changeQuantity(${product.id}, ${item.quantity - 1})">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" 
                                   min="1" max="99" 
                                   onchange="updateQuantity(${product.id}, this.value)">
                            <button class="quantity-btn" onclick="changeQuantity(${product.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${product.id})">
                            Удалить
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        cartItemsContainer.innerHTML = cartItemsHTML;
        updateSummary();
        
        cartSummary.style.display = 'block';
        emptyCart.style.display = 'none';
    }

    function showEmptyCart() {
        cartItemsContainer.innerHTML = '';
        cartSummary.style.display = 'none';
        emptyCart.style.display = 'block';
    }

    function updateSummary() {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalItems = 0;
        
        cartItems.forEach(item => {
            const product = allProducts.find(p => p.id === item.productId.toString());
            if (product) {
                const finalPrice = calculateProductPrice(product);
                subtotal += finalPrice * item.quantity;
                if (product.discount > 0) {
                    totalDiscount += (product.price - finalPrice) * item.quantity;
                }
                totalItems += item.quantity;
            }
        });
        
        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('subtotal').textContent = `${subtotal} руб.`;
        document.getElementById('total-discount').textContent = `-${totalDiscount} руб.`;
        document.getElementById('total-price').textContent = `${subtotal} руб.`;
    }

    window.changeQuantity = async function(productId, newQuantity) {
        if (newQuantity < 1) return;
        
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const cart = await getCart(currentUser.id);
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity = newQuantity;
            await updateCart(currentUser.id, cart.items);
            cartItems = cart.items;
            renderCart();
            updateCartCountInHeader(cart.items.reduce((total, item) => total + item.quantity, 0));
        }
    }

    window.updateQuantity = async function(productId, value) {
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) {
            renderCart(); 
            return;
        }
        
        await changeQuantity(productId, quantity);
    }

    window.removeFromCart = async function(productId) {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const cart = await getCart(currentUser.id);
        cart.items = cart.items.filter(item => item.productId !== productId);
        
        await updateCart(currentUser.id, cart.items);
        cartItems = cart.items;
        renderCart();
        updateCartCountInHeader(cart.items.reduce((total, item) => total + item.quantity, 0));
    }

    checkoutBtn.addEventListener('click', function() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему для оформления заказа');
            return;
        }
        
        if (cartItems.length === 0) {
            alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
            return;
        }
        
        window.location.href = 'checkout.html';
    });

    loadCart();
});