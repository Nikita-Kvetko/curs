document.addEventListener('DOMContentLoaded', function() {
    const sliderTrack = document.querySelector('.slider-track');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let promoProducts = [];
    let currentSlide = 0;
    let slidesCount = 0;
    let autoSlideInterval;

    async function loadPromoProducts() {
        try {
            const allProducts = await apiRequest('products');
            promoProducts = allProducts.filter(product => product.discount > 0);

            if (promoProducts.length < 4) {
                const regularProducts = allProducts.filter(product => product.discount === 0);
                promoProducts = [...promoProducts, ...regularProducts.slice(0, 4 - promoProducts.length)];
            }
            
            initSlider();
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            loadDemoProducts();
        }
    }

    function loadDemoProducts() {
        promoProducts = [
            {
                id: 3078,
                name: "Рочда KPP1600.1",
                price: 7159,
                discount: 30,
                images: ["promo1.jpg"],
                description: "Стильная и функциональная мебель по выгодной цене"
            },
            {
                id: 3008,
                name: "Грыд шкаф верхний гормонительный глубокий стекло",
                price: 7159,
                discount: 30,
                images: ["promo2.jpg"],
                description: "Практичный шкаф с стеклянными элементами"
            },
            {
                id: 3079,
                name: "Комод Престиж",
                price: 8990,
                discount: 30,
                images: ["promo3.jpg"],
                description: "Вместительный комод с современным дизайном"
            },
            {
                id: 3015,
                name: "Стол обеденный Модерн",
                price: 12500,
                discount: 30,
                images: ["promo4.jpg"],
                description: "Прочный обеденный стол для всей семьи"
            }
        ];
        
        initSlider();
    }

    function initSlider() {
        slidesCount = Math.ceil(promoProducts.length / 4);
        createSlides();
        createDots();
        updateSlider();
        startAutoSlide();

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        sliderTrack.addEventListener('mouseenter', stopAutoSlide);
        sliderTrack.addEventListener('mouseleave', startAutoSlide);
    }

    function createSlides() {
        sliderTrack.innerHTML = '';
        
        for (let i = 0; i < slidesCount; i++) {
            const slide = document.createElement('div');
            slide.className = 'slide';

            for (let j = 0; j < 4; j++) {
                const productIndex = i * 4 + j;
                if (productIndex < promoProducts.length) {
                    const product = promoProducts[productIndex];
                    slide.appendChild(createProductCard(product));
                }
            }
            
            sliderTrack.appendChild(slide);
        }
    }

    function createProductCard(product) {
        const discountPrice = product.discount > 0 
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;
        
        const productCard = document.createElement('div');
        productCard.className = 'promo-product';
        productCard.innerHTML = `
            <div class="promo-product-image">
                <img src="../img/${product.images[0]}" alt="${product.name}">
                ${product.discount > 0 ? `<div class="promo-product-badge">-${product.discount}%</div>` : ''}
            </div>
            <div class="promo-product-info">
                <div class="promo-product-code">Код: ${product.id}</div>
                <h3 class="promo-product-title">${product.name}</h3>
                <div class="promo-product-price">
                    <span class="current-price">${discountPrice.toLocaleString('ru-RU')} руб.</span>
                    <div>
                        ${product.discount > 0 ? `
                            <span class="old-price">${product.price.toLocaleString('ru-RU')} руб.</span>
                            <span class="discount">-${product.discount}%</span>
                        ` : ''}
                    </div>
                </div>
                <div class="promo-product-actions">
                    <button class="buy-btn" onclick="addToCart(${product.id})">КУПИТЬ</button>
                    <button class="add-to-fav" onclick="toggleFavorite(event, ${product.id})">❤️</button>
                </div>
            </div>
        `;
        
        return productCard;
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < slidesCount; i++) {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlider() {
        sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

        document.querySelectorAll('.slider-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === slidesCount - 1;
    }

    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlider();
    }

    function nextSlide() {
        if (currentSlide < slidesCount - 1) {
            currentSlide++;
            updateSlider();
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            if (currentSlide === slidesCount - 1) {
                goToSlide(0);
            } else {
                nextSlide();
            }
        }, 5000); 
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    loadPromoProducts();
});