document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('random-products-container');
    const preloader = document.getElementById('preloader');

    async function loadRandomProducts() {
        showPreloader();
        
        try {
            const allProducts = await apiRequest('products');
            const randomProducts = getRandomProducts(allProducts, 8);
            displayProducts(randomProducts);
            
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            productsContainer.innerHTML = `
                <div class="error-message">
                    <p>Не удалось загрузить товары. Пожалуйста, попробуйте позже.</p>
                    <button onclick="loadRandomProducts()" class="retry-btn">Попробовать снова</button>
                </div>
            `;
        } finally {
            hidePreloader();
        }
    }

    function getRandomProducts(products, count) {
        const shuffled = [...products];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    function displayProducts(products) {
        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">Товары не найдены</p>';
            return;
        }
        
        productsContainer.innerHTML = products.map(product => `
            <div class="random-product" data-id="${product.id}">
                <div class="random-product-image">
                    <img src="../img/${product.images[0]}" alt="${product.name}">
                    ${product.discount > 0 ? `<div class="random-product-badge">-${product.discount}%</div>` : ''}
                </div>
                <div class="random-product-info">
                    <div class="random-product-category">${product.category}</div>
                    <h3 class="random-product-title">${product.name}</h3>
                    <div class="random-product-dimensions">
                        ${product.width} × ${product.height} × ${product.depth} мм
                    </div>
                    <div class="random-product-price">
                        <span class="current-price">${calculatePrice(product)} руб.</span>
                        ${product.discount > 0 ? `
                            <div>
                                <span class="old-price">${product.price.toLocaleString('ru-RU')} руб.</span>
                                <span class="discount">-${product.discount}%</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="random-product-actions">
                        <button class="buy-btn" onclick="addToCart(${product.id})">В корзину</button>
                        <button class="add-to-fav" onclick="toggleFavorite(event, ${product.id})">❤️</button>
                    </div>
                </div>
            </div>
        `).join('');

        updateFavoriteButtons();
    }

    function calculatePrice(product) {
        if (product.discount > 0) {
            return Math.round(product.price * (1 - product.discount / 100)).toLocaleString('ru-RU');
        }
        return product.price.toLocaleString('ru-RU');
    }

    function showPreloader() {
        preloader.style.display = 'flex';
        productsContainer.innerHTML = '';
    }

    function hidePreloader() {
        preloader.style.display = 'none';
    }

    async function updateFavoriteButtons() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        try {
            const favorites = await getFavorites(currentUser.id);
            
            document.querySelectorAll('.random-product').forEach(productElement => {
                const productId = parseInt(productElement.dataset.id);
                const favButton = productElement.querySelector('.add-to-fav');
                
                if (favorites.items.includes(productId)) {
                    favButton.classList.add('active');
                } else {
                    favButton.classList.remove('active');
                }
            });
        } catch (error) {
            console.error('Ошибка при обновлении кнопок избранного:', error);
        }
    }

    loadRandomProducts();

    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            updateFavoriteButtons();
        }
    });
});