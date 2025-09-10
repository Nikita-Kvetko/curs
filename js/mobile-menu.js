class MobileMenu {
    constructor() {
        this.toggleBtn = document.querySelector('.mobile-nav-toggle');
        this.mobileNav = document.querySelector('.mobile-nav');
        this.closeBtn = document.querySelector('.mobile-nav-close');
        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(this.overlay);
        
        this.init();
    }
    
    init() {
        this.toggleBtn.addEventListener('click', () => this.toggleMenu());
        this.closeBtn.addEventListener('click', () => this.closeMenu());
        this.overlay.addEventListener('click', () => this.closeMenu());

        const mobileLinks = this.mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        window.addEventListener('resize', () => this.handleResize());
    }
    
    toggleMenu() {
        this.mobileNav.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');

        const spans = this.toggleBtn.querySelectorAll('span');
        if (this.mobileNav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
    
    closeMenu() {
        this.mobileNav.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');

        const spans = this.toggleBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
    
    handleResize() {
        if (window.innerWidth > 992) {
            this.closeMenu();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
});
const style = document.createElement('style');
style.textContent = `
    .no-scroll {
        overflow: hidden;
    }
    
    @media (max-width: 992px) {
        .main-nav,
        .top-nav {
            display: none !important;
        }
        
        .mobile-nav-toggle {
            display: flex !important;
        }
    }
    
    @media (min-width: 993px) {
        .mobile-nav,
        .mobile-nav-overlay {
            display: none !important;
        }
    }
`;
document.head.appendChild(style);