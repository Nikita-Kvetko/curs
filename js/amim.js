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
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    history.pushState(null, null, targetId);
                }
            });
        });

        const menu = document.querySelector(".nav-menu");
        const highlight = document.querySelector(".highlight");
        const links = menu.querySelectorAll("li a");

        let active = links[0];
        moveHighlight(active);

        links.forEach(link => {
            link.addEventListener("mouseenter", () => moveHighlight(link));
            link.addEventListener("click", (e) => {
                e.preventDefault();
                active = link;
                moveHighlight(active);

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

        function moveHighlight(element) {
            if (!element || !highlight) return;
            
            const rect = element.getBoundingClientRect();
            const containerRect = menu.getBoundingClientRect();

            highlight.style.width = rect.width + "px";
            highlight.style.transform = `translateX(${rect.left - containerRect.left}px)`;
        }

        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-menu a');
            
            let currentSection = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (pageYOffset >= sectionTop - 100) {
                    currentSection = section.getAttribute('id');
                }
            });
            
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

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
        rect.bottom >= 0
    );
}

function handleScrollAnimations() {
    document.querySelectorAll('section').forEach(section => {
        if (isElementInViewport(section)) {
            section.classList.add('visible');
        }
    });
    document.querySelectorAll('.random-product').forEach(product => {
        if (isElementInViewport(product)) {
            product.classList.add('visible');
        }
    });

    document.querySelectorAll('.advantages-block').forEach(block => {
        if (isElementInViewport(block)) {
            block.classList.add('fade-in', 'visible');
        }
    });

    document.querySelectorAll('.catalog-block').forEach(block => {
        if (isElementInViewport(block)) {
            block.classList.add('fade-in', 'visible');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    handleScrollAnimations();

    window.addEventListener('scroll', handleScrollAnimations);

    setTimeout(() => {
        document.querySelectorAll('section').forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }, 100);
});

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

document.querySelectorAll('.nav-menu li a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.color = '#384685';
        this.style.transform = 'translateY(-2px)';
    });
    
    link.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
            this.style.color = '';
            this.style.transform = '';
        }
    });
});

function moveHighlight(element) {
    if (!element || !highlight) return;
    
    const rect = element.getBoundingClientRect();
    const containerRect = menu.getBoundingClientRect();

    highlight.style.transition = 'transform 0.4s ease, width 0.4s ease';
    highlight.style.width = rect.width + "px";
    highlight.style.transform = `translateX(${rect.left - containerRect.left}px)`;
}

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