document.addEventListener('DOMContentLoaded', function() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyFavorites = document.getElementById('empty-favorites');
    const preloader = document.getElementById('preloader');
    
    let favoriteItems = [];
    let allProducts = [];

    async function loadFavorites() {
        showPreloader();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showLoginPrompt();
            hidePreloader();
            return;
        }
        
        try {
            allProducts = await getAllProducts();
            const favorites = await getFavorites(currentUser.id);
            favoriteItems = favorites.items;
            
            renderFavorites();
        } catch (error) {
            console.error('Error loading favorites:', error);
            showError('Не удалось загрузить избранное');
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
        favoritesGrid.innerHTML = `
            <div class="login-prompt">
                <h3>Для просмотра избранного необходимо войти в систему</h3>
                <a href="../pages/register.html" class="btn-primary">Войти</a>
            </div>
        `;
        emptyFavorites.style.display = 'none';
    }

    function showError(message) {
        favoritesGrid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="loadFavorites()" class="btn-primary">Попробовать снова</button>
            </div>
        `;
    }

    function renderFavorites() {
        if (favoriteItems.length === 0) {
            showEmptyFavorites();
            return;
        }
        
        const favoriteProducts = allProducts.filter(product => 
            favoriteItems.includes(parseInt(product.id))
        );
        
        const favoritesHTML = favoriteProducts.map(product => {
            const finalPrice = calculateProductPrice(product);
            
            return `
                <div class="favorite-item" data-product-id="${product.id}">
                    <div class="favorite-item-image">
                        <img src="../img/${product.images[0]}" alt="${product.name}">
                        <button class="remove-favorite" onclick="removeFromFavorites(${product.id})">
                            ❌
                        </button>
                    </div>
                    <div class="favorite-item-info">
                        <h3 class="favorite-item-title">${product.name}</h3>
                        <div class="favorite-item-category">${product.category}</div>
                        <div class="favorite-item-price">
                            <span class="current-price">${finalPrice} руб.</span>
                            ${product.discount > 0 ? `
                                <span class="old-price">${product.price} руб.</span>
                                <span class="discount">-${product.discount}%</span>
                            ` : ''}
                        </div>
                        <div class="favorite-item-dimensions">
                            ${product.width} × ${product.height} × ${product.depth} мм
                        </div>
                        <div class="favorite-item-actions">
                            <button class="add-to-cart-btn" onclick="addToCartFromFavorites(${product.id})">
                                В корзину
                            </button>
                            <button class="view-details-btn" onclick="viewProductDetails(${product.id})">
                                Подробнее
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        favoritesGrid.innerHTML = favoritesHTML;
        emptyFavorites.style.display = 'none';
    }

    function showEmptyFavorites() {
        favoritesGrid.innerHTML = '';
        emptyFavorites.style.display = 'block';
    }

    window.removeFromFavorites = async function(productId) {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const favorites = await getFavorites(currentUser.id);
        favorites.items = favorites.items.filter(id => id !== productId);
        
        await updateFavorites(currentUser.id, favorites.items);
        favoriteItems = favorites.items;
        renderFavorites();
        updateFavCountInHeader(favorites.items.length);
    }

    window.addToCartFromFavorites = async function(productId) {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        try {
            const cart = await getCart(currentUser.id);
            const existingItem = cart.items.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.items.push({
                    productId: productId,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                });
            }

            await updateCart(currentUser.id, cart.items);
            updateCartCountInHeader(cart.items.reduce((total, item) => total + item.quantity, 0));
            
            alert('Товар добавлен в корзину!');
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            alert('Не удалось добавить товар в корзину');
        }
    }

    window.viewProductDetails = function(productId) {
        window.location.href = `product-details.html?id=${productId}`;
    }

    loadFavorites();
});