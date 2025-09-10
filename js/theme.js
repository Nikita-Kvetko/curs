// Класс для управления темами оформления
class ThemeManager {
    constructor() {
        // Получение текущей темы из localStorage или установка светлой по умолчанию
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    // Инициализация менеджера тем
    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }
    
    // Применение выбранной темы
    applyTheme(theme) {
        this.currentTheme = theme;

        // Удаление предыдущих классов тем
        document.body.classList.remove('light', 'dark');

        // Добавление класса текущей темы
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.add('light');
        }
        
        // Сохранение темы в localStorage
        localStorage.setItem('theme', theme);

        // Обновление иконки темы
        this.updateThemeIcon(theme);
    }
    
    // Переключение между темами
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
    
    // Обновление иконки переключателя темы
    updateThemeIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('img');
            if (icon) {
                // Установка соответствующей иконки
                icon.src = theme === 'light' ? '../img/moon.png' : '../img/sun.png';
                icon.alt = theme === 'light' ? 'Темная тема' : 'Светлая тема';
            }
        }
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    // Сброс темы к значениям по умолчанию
    resetTheme() {
        this.applyTheme('light');
    }
}

// Инициализация менеджера тем после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});