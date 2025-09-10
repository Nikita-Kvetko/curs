// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            if (this.classList.contains('nav-menuli')) {
                e.preventDefault();
            }
            
            // Плавная прокрутка к элементу
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Обновление URL с якорем
            history.pushState(null, null, targetId);
        }
    });
});

// Подсветка активного пункта навигации
const menu = document.querySelector(".nav-menu");
const highlight = document.querySelector(".highlight");
const links = menu.querySelectorAll("li a");

let active = links[0];
moveHighlight(active);

// Обработка наведения и клика по пунктам меню
links.forEach(link => {
    link.addEventListener("mouseenter", () => moveHighlight(link));
    link.addEventListener("click", (e) => {
        e.preventDefault();
        active = link;
        moveHighlight(active);

        // Прокрутка к секции при клике
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Функция перемещения подсветки меню
function moveHighlight(element) {
    if (!element || !highlight) return;
    
    const rect = element.getBoundingClientRect();
    const containerRect = menu.getBoundingClientRect();

    highlight.style.width = rect.width + "px";
    highlight.style.transform = `translateX(${rect.left - containerRect.left}px)`;
}

// Отслеживание прокрутки для активации пунктов меню
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let currentSection = '';
    
    // Определение текущей секции
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (pageYOffset >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Активация соответствующей ссылки меню
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');

            const activeLink = document.querySelector('.nav-menu a.active');
            if (activeLink) {
                moveHighlight(activeLink);
            }
        }
    });
});

// Проверка видимости элемента в viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
        rect.bottom >= 0
    );
}

// Обработка анимаций при прокрутке
function handleScrollAnimations() {
    // Анимация секций
    document.querySelectorAll('section').forEach(section => {
        if (isElementInViewport(section)) {
            section.classList.add('visible');
        }
    });
    
    // Анимация товаров
    document.querySelectorAll('.random-product').forEach(product => {
        if (isElementInViewport(product)) {
            product.classList.add('visible');
        }
    });

    // Анимация блоков преимуществ
    document.querySelectorAll('.advantages-block').forEach(block => {
        if (isElementInViewport(block)) {
            block.classList.add('fade-in', 'visible');
        }
    });

    // Анимация блоков каталога
    document.querySelectorAll('.catalog-block').forEach(block => {
        if (isElementInViewport(block)) {
            block.classList.add('fade-in', 'visible');
        }
    });
}

// Инициализация анимаций при загрузке
document.addEventListener('DOMContentLoaded', function() {
    handleScrollAnimations();
    window.addEventListener('scroll', handleScrollAnimations);

    // Задержка для первоначальной анимации
    setTimeout(() => {
        document.querySelectorAll('section').forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }, 100);
});

// Анимации кнопок при наведении
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('buy-btn') || e.target.classList.contains('add-to-fav')) {
        e.target.classList.add('pulse');
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('buy-btn') || e.target.classList.contains('add-to-fav')) {
        e.target.classList.remove('pulse');
    }
});

// Эффекты при наведении на блоки преимуществ
document.querySelectorAll('.advantages-block').forEach(block => {
    block.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
        this.style.backgroundColor = '#e8e8e8';
    });
    
    block.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.backgroundColor = '#F4F4F4';
    });
});

// Эффекты при наведении на пункты меню
document.querySelectorAll('.nav-menu li a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    link.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
            this.style.color = '';
            this.style.transform = '';
        }
    });
});

// Улучшенная функция подсветки с анимацией
function moveHighlight(element) {
    if (!element || !highlight) return;
    
    const rect = element.getBoundingClientRect();
    const containerRect = menu.getBoundingClientRect();

    highlight.style.transition = 'transform 0.4s ease, width 0.4s ease';
    highlight.style.width = rect.width + "px";
    highlight.style.transform = `translateX(${rect.left - containerRect.left}px)`;
}

// Управление модальными окнами
document.querySelectorAll('[data-modal]').forEach(button => {
    button.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.querySelector('.modal-content').style.transform = 'translateY(0)';
            }, 10);
        }
    });
});

// Закрытие модальных окон
document.querySelectorAll('.close, .modal').forEach(element => {
    element.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('close')) {
            this.style.opacity = '0';
            this.querySelector('.modal-content').style.transform = 'translateY(-50px)';
            setTimeout(() => {
                this.style.display = 'none';
            }, 300);
        }
    });
});