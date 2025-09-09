const API_BASE = 'http://localhost:3000';

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function getCart(userId) {
    try {
        const carts = await apiRequest('carts');
        return carts.find(cart => cart.userId === userId) || { userId, items: [] };
    } catch (error) {
        console.error('Error getting cart:', error);
        return { userId, items: [] };
    }
}

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

async function getFavorites(userId) {
    try {
        const favorites = await apiRequest('favorites');
        return favorites.find(fav => fav.userId === userId) || { userId, items: [] };
    } catch (error) {
        console.error('Error getting favorites:', error);
        return { userId, items: [] };
    }
}

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