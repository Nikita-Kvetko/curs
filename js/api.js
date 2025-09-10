// Базовый URL API
const API_BASE = 'http://localhost:3000';

// Основная функция для выполнения запросов к API
async function apiRequest(endpoint, options = {}) {
    try {
        // Проверка прав администратора для защищенных endpoints
        if (endpoint.startsWith('users/') || endpoint.startsWith('products/')) {
            if (!checkAdminAccess()) {
                throw new Error('Доступ запрещен. Требуются права администратора.');
            }
        }
        
        // Выполнение fetch-запроса
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        // Проверка статуса ответа
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Получение корзины пользователя
async function getCart(userId) {
    try {
        const carts = await apiRequest('carts');
        return carts.find(cart => cart.userId === userId) || { userId, items: [] };
    } catch (error) {
        console.error('Error getting cart:', error);
        return { userId, items: [] };
    }
}

// Обновление корзины пользователя
async function updateCart(userId, items) {
    try {
        const carts = await apiRequest('carts');
        const existingCartIndex = carts.findIndex(cart => cart.userId === userId);
        
        if (existingCartIndex !== -1) {
            return await apiRequest(`carts/${carts[existingCartIndex].id}`, {
                method: 'PUT',
                body: JSON.stringify({ userId, items })
            });
        } else {
            return await apiRequest('carts', {
                method: 'POST',
                body: JSON.stringify({ userId, items })
            });
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        throw error;
    }
}

// Получение избранного пользователя
async function getFavorites(userId) {
    try {
        const favorites = await apiRequest('favorites');
        return favorites.find(fav => fav.userId === userId) || { userId, items: [] };
    } catch (error) {
        console.error('Error getting favorites:', error);
        return { userId, items: [] };
    }
}

// Обновление избранного пользователя
async function updateFavorites(userId, items) {
    try {
        const favorites = await apiRequest('favorites');
        const existingFavIndex = favorites.findIndex(fav => fav.userId === userId);
        
        if (existingFavIndex !== -1) {
            return await apiRequest(`favorites/${favorites[existingFavIndex].id}`, {
                method: 'PUT',
                body: JSON.stringify({ userId, items })
            });
        } else {
            return await apiRequest('favorites', {
                method: 'POST',
                body: JSON.stringify({ userId, items })
            });
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        throw error;
    }
}

// Получение всех товаров
async function getAllProducts() {
    try {
        return await apiRequest('products');
    } catch (error) {
        console.error('Error getting products:', error);
        return [];
    }
}

// Получение текущего пользователя из localStorage
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Расчет цены товара с учетом скидки
function calculateProductPrice(product) {
    if (product.discount > 0) {
        return Math.round(product.price * (1 - product.discount/100));
    }
    return product.price;
}

// Обновление счетчика корзины в шапке
function updateCartCountInHeader(count) {
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Обновление счетчика избранного в шапке
function updateFavCountInHeader(count) {
    const favCountElements = document.querySelectorAll('#fav-count');
    favCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Обновление счетчиков в шапке
async function updateHeaderCounts() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        const cart = await getCart(currentUser.id);
        const favorites = await getFavorites(currentUser.id);
        
        updateCartCountInHeader(cart.items.reduce((total, item) => total + item.quantity, 0));
        updateFavCountInHeader(favorites.items.length);
    } catch (error) {
        console.error('Error updating header counts:', error);
    }
}

// Проверка прав администратора
function checkAdminAccess() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}