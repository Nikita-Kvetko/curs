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

    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');

    const selectedCategory = sessionStorage.getItem('selectedCategory');

    async function loadProducts() {
        showPreloader();
        try {
            allProducts = await apiRequest('products');

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
            productsContainer.innerHTML = '<p class="error">Не удалось загрузить товары. Попробуйте позже.</p>';
        } finally {
            hidePreloader();
        }
    }

    function showPreloader() {
        preloader.style.display = 'flex';
        productsContainer.innerHTML = '';
    }

    function hidePreloader() {
        preloader.style.display = 'none';
    }

    function applyFilters() {
        const searchText = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortOption = sortBy.value;

        filteredProducts = allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchText) || 
                                 product.description.toLowerCase().includes(searchText);
            const matchesCategory = category === '' || product.category === category;
            return matchesSearch && matchesCategory;
        });

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

    function renderProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);
        
        if (productsToShow.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">Товары не найдены</p>';
            paginationContainer.innerHTML = '';
            return;
        }
        
        productsContainer.innerHTML = productsToShow.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="../img/${product.images[0]}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${calculatePrice(product)} руб.</span>
                        ${product.discount > 0 ? `
                            <span class="old-price">${product.price} руб.</span>
                            <span class="discount">-${product.discount}%</span>
                        ` : ''}
                    </div>
                    <div class="product-dimensions">
                        ${product.width} × ${product.height} × ${product.depth} мм
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})">В корзину</button>
                        <button class="add-to-fav" onclick="toggleFavorite(${product.id})">❤️</button>
                    </div>
                </div>
            </div>
        `).join('');

        updateFavoriteButtons();
    }

    function calculatePrice(product) {
        if (product.discount > 0) {
            return Math.round(product.price * (1 - product.discount/100));
        }
        return product.price;
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';

        if (currentPage > 1) {
            paginationHTML += `<button onclick="changePage(${currentPage - 1})">←</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
            }
        }

        if (currentPage < totalPages) {
            paginationHTML += `<button onclick="changePage(${currentPage + 1})">→</button>`;
        }
        
        paginationContainer.innerHTML = paginationHTML;
    }

    window.changePage = function(page) {
        currentPage = page;
        renderProducts();
        renderPagination();
        window.scrollTo(0, 0);
    }
    
    window.addToCart = async function(productId) {

        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
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
            
            alert('Товар добавлен в корзину!');
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            alert('Не удалось добавить товар в корзину');
        }
    }

    window.toggleFavorite = async function(productId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему, чтобы добавить товар в избранное');
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
            alert('Не удалось обновить избранное');
        }
    }

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

    async function updateFavCountInHeader(count) {
        const favCountElements = document.querySelectorAll('#fav-count');
        favCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    async function updateCartCountInHeader(count) {
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    categoryFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    loadProducts();

    updateHeaderCounts();
});