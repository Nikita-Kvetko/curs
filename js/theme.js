class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }
    
    applyTheme(theme) {
        this.currentTheme = theme;

        document.body.classList.remove('light', 'dark');

        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.add('light');
        }
        
        localStorage.setItem('theme', theme);

        this.updateThemeIcon(theme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
    
    updateThemeIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('img');
            if (icon) {
                icon.src = theme === 'light' ? '../img/moon.png' : '../img/sun.png';
                icon.alt = theme === 'light' ? 'Темная тема' : 'Светлая тема';
            }
        }
    }
    
    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    resetTheme() {
        this.applyTheme('light');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});