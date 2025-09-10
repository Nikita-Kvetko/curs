// Обработчик загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    const paginationContainer = document.getElementById('pagination');
    const preloader = document.getElementById('preloader');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 9;

    // Получение параметров из URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');

    // Получение выбранной категории из sessionStorage
    const selectedCategory = sessionStorage.getItem('selectedCategory');

    // Загрузка товаров
    async function loadProducts() {
        showPreloader();
        try {
            allProducts = await apiRequest('products');

            // Установка категории из URL или sessionStorage
            if (categoryFromUrl) {
                categoryFilter.value = categoryFromUrl;
            }
            else if (selectedCategory) {
                categoryFilter.value = selectedCategory;
                sessionStorage.removeItem('selectedCategory');
            }
            
            applyFilters();
        } catch (error) {
            console.error('Ошибка:', error);
            productsContainer.innerHTML = '<p class="error" data-i18n="products.load_error">Не удалось загрузить товары. Попробуйте позже.</p>';
        } finally {
            hidePreloader();
        }
    }

    // Управление прелоадером
    function showPreloader() {
        preloader.style.display = 'flex';
        productsContainer.innerHTML = '';
    }

    function hidePreloader() {
        preloader.style.display = 'none';
    }

    // Применение фильтров и сортировки
    function applyFilters() {
        const searchText = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortOption = sortBy.value;

        // Фильтрация товаров
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchText) || 
                                 product.description.toLowerCase().includes(searchText);
            const matchesCategory = category === '' || product.category === category;
            return matchesSearch && matchesCategory;
        });

        // Сортировка товаров
        switch(sortOption) {
            case 'price-asc':
                filteredProducts.sort((a, b) => {
                    const priceA = a.discount > 0 ? a.price * (1 - a.discount/100) : a.price;
                    const priceB = b.discount > 0 ? b.price * (1 - b.discount/100) : b.price;
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => {
                    const priceA = a.discount > 0 ? a.price * (1 - a.discount/100) : a.price;
                    const priceB = b.discount > 0 ? b.price * (1 - b.discount/100) : b.price;
                    return priceB - priceA;
                });
                break;
            default:
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        currentPage = 1;
        renderProducts();
        renderPagination();
    }

    // Отрисовка товаров
    function renderProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);
        
        if (productsToShow.length === 0) {
            productsContainer.innerHTML = '<p class="no-products" data-i18n="products.not_found">Товары не найдены</p>';
            paginationContainer.innerHTML = '';
            return;
        }
        
        productsContainer.innerHTML = productsToShow.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="../img/${product.images[0]}" alt="${product.name}" data-i18n="alt.product_image">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${calculatePrice(product)} руб.</span>
                        ${product.discount > 0 ? `
                            <span class="old-price">${product.price} руб.</span>
                            <span class="discount" data-i18n="products.discount">-${product.discount}%</span>
                        ` : ''}
                    </div>
                    <div class="product-dimensions">
                        ${product.width} × ${product.height} × ${product.depth} <span data-i18n="products.mm">мм</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})" data-i18n="button.add_to_cart">В корзину</button>
                        <button class="add-to-fav" onclick="toggleFavorite(${product.id})">❤️</button>
                    </div>
                </div>
            </div>
        `).join('');

        updateFavoriteButtons();
    }

    // Расчет цены со скидкой
    function calculatePrice(product) {
        if (product.discount > 0) {
            return Math.round(product.price * (1 - product.discount/100));
        }
        return product.price;
    }

    // Отрисовка пагинации
    function renderPagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';

        // Кнопка "Назад"
        if (currentPage > 1) {
            paginationHTML += `<button onclick="changePage(${currentPage - 1})" data-i18n="pagination.prev">←</button>`;
        }

        // Нумерация страниц
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
            }
        }

        // Кнопка "Вперед"
        if (currentPage < totalPages) {
            paginationHTML += `<button onclick="changePage(${currentPage + 1})" data-i18n="pagination.next">→</button>`;
        }
        
        paginationContainer.innerHTML = paginationHTML;
    }

    // Смена страницы
    window.changePage = function(page) {
        currentPage = page;
        renderProducts();
        renderPagination();
        window.scrollTo(0, 0);
    }
    
    // Добавление товара в корзину
    window.addToCart = async function(productId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert(window.i18n ? window.i18n.translate('cart.login_required') : 'Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
            return;
        }
        
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
            
            alert(window.i18n ? window.i18n.translate('cart.add_success') : 'Товар добавлен в корзину!');
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            alert(window.i18n ? window.i18n.translate('cart.add_error') : 'Не удалось добавить товар в корзину');
        }
    }

    // Переключение избранного
    window.toggleFavorite = async function(productId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert(window.i18n ? window.i18n.translate('favorites.login_required') : 'Пожалуйста, войдите в систему, чтобы добавить товар в избранное');
            return;
        }
        
        try {
            const favorites = await getFavorites(currentUser.id);

            const existingIndex = favorites.items.findIndex(id => id === productId);
            
            if (existingIndex !== -1) {
                favorites.items.splice(existingIndex, 1);
            } else {
                favorites.items.push(productId);
            }

            await updateFavorites(currentUser.id, favorites.items);

            updateFavoriteButtons();

            updateFavCountInHeader(favorites.items.length);
        } catch (error) {
            console.error('Ошибка при обновлении избранного:', error);
            alert(window.i18n ? window.i18n.translate('favorites.update_error') : 'Не удалось обновить избранное');
        }
    }

    // Обновление состояния кнопок избранного
    async function updateFavoriteButtons() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        try {
            const favorites = await getFavorites(currentUser.id);
            
            document.querySelectorAll('.product-card').forEach(card => {
                const productId = parseInt(card.dataset.id);
                const favButton = card.querySelector('.add-to-fav');
                
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

    // Обновление счетчика избранного в шапке
    async function updateFavCountInHeader(count) {
        const favCountElements = document.querySelectorAll('#fav-count');
        favCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    // Обновление счетчика корзины в шапке
    async function updateCartCountInHeader(count) {
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    // Обработчики событий фильтров
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    categoryFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    // Инициализация загрузки товаров
    loadProducts();

    // Обновление счетчиков в шапке
    updateHeaderCounts();
});