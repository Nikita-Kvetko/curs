// Функция добавления товара в корзину
window.addToCart = async function(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert(window.i18n ? window.i18n.translate('cart.login_required') : 'Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
        return;
    }
    
    try {
        const cart = await getCart(currentUser.id);
        const existingItem = cart.items.find(item => item.productId == productId);
        
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
        alert(window.i18n ? window.i18n.translate('cart.add_success') : 'Товар добавлен в корзину!');
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        alert(window.i18n ? window.i18n.translate('cart.add_error') : 'Не удалось добавить товар в корзину');
    }
}

// Функция переключения состояния избранного товара
window.toggleFavorite = async function(event, productId) {
    const button = event?.currentTarget || null;
    
    if (!button) {
        console.error('Кнопка не найдена');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert(window.i18n ? window.i18n.translate('favorites.login_required') : 'Пожалуйста, войдите в систему, чтобы добавить товар в избранное');
        return;
    }
    
    try {
        const favorites = await getFavorites(currentUser.id);
        const existingIndex = favorites.items.findIndex(id => id == productId);
        
        if (existingIndex !== -1) {
            favorites.items.splice(existingIndex, 1);
            button.classList.remove('active');
        } else {
            favorites.items.push(productId);
            button.classList.add('active');
        }

        await updateFavorites(currentUser.id, favorites.items);
        
        if (button.classList.contains('active')) {
            alert(window.i18n ? window.i18n.translate('favorites.add_success') : 'Товар добавлен в избранное!');
        } else {
            alert(window.i18n ? window.i18n.translate('favorites.remove_success') : 'Товар удален из избранного!');
        }
    } catch (error) {
        console.error('Ошибка при обновлении избранного:', error);
        alert(window.i18n ? window.i18n.translate('favorites.update_error') : 'Не удалось обновить избранное');
    }
}