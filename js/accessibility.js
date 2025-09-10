// Ожидание полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', function() {
    // ПОИСК ЭЛЕМЕНТОВ В DOM
    const accessibilityBtn = document.getElementById('accessibility-btn'); // Кнопка открытия модального окна
    const modal = document.getElementById('accessibility-modal'); // Модальное окно
    const closeBtn = document.querySelector('.close'); // Кнопка закрытия модального окна
    const resetBtn = document.getElementById('reset-accessibility'); // Кнопка сброса настроек

    // ПОИСК ГРУПП ЭЛЕМЕНТОВ
    const fontSizeBtns = document.querySelectorAll('.font-size-btn'); // Все кнопки изменения размера шрифта
    const colorSchemeBtns = document.querySelectorAll('.color-scheme-btn'); // Все кнопки изменения цветовой схемы
    const imagesToggle = document.getElementById('images-toggle'); // Переключатель отображения изображений

    // ЗАГРУЗКА СОХРАНЕННЫХ НАСТРОЕК
    loadAccessibilitySettings();

    // ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ОТКРЫТИЯ/ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА
    
    // Открытие модального окна при клике на кнопку доступности
    if (accessibilityBtn && modal) {
        accessibilityBtn.addEventListener('click', function() {
            modal.style.display = 'block'; 
        });
    }

    // Закрытие модального окна при клике на кнопку закрытия
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none'; 
        });
    }

    // Закрытие модального окна при клике вне его области
    window.addEventListener('click', function(event) {
        if (event.target === modal) { 
            modal.style.display = 'none'; 
        }
    });

    // ОБРАБОТЧИКИ ДЛЯ КНОПОК ИЗМЕНЕНИЯ РАЗМЕРА ШРИФТА
    fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.getAttribute('data-size'); 
            setFontSize(size);

            // УДАЛЕНИЕ класса active со всех кнопок и ДОБАВЛЕНИЕ текущей
            fontSizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ОБРАБОТЧИКИ ДЛЯ КНОПОК ИЗМЕНЕНИЯ ЦВЕТОВОЙ СХЕМЫ
    colorSchemeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const scheme = this.getAttribute('data-scheme'); 
            setColorScheme(scheme); 

            // УДАЛЕНИЕ класса active со всех кнопок и ДОБАВЛЕНИЕ текущей
            colorSchemeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ОБРАБОТЧИК ДЛЯ ПЕРЕКЛЮЧАТЕЛЯ ИЗОБРАЖЕНИЙ
    if (imagesToggle) {
        imagesToggle.addEventListener('change', function() {
            setImagesVisibility(this.checked); 
        });
    }

    // ОБРАБОТЧИК ДЛЯ КНОПКИ СБРОСА НАСТРОЕК
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetAccessibilitySettings(); 
        });
    }

    // ФУНКЦИЯ УСТАНОВКИ РАЗМЕРА ШРИФТА
    function setFontSize(size) {
        // УДАЛЕНИЕ всех классов размеров шрифта
        document.body.classList.remove('font-normal', 'font-large', 'font-x-large');

        // ДОБАВЛЕНИЕ нового класса размера шрифта и общего класса доступности
        document.body.classList.add(`font-${size}`);
        document.body.classList.add('accessibility-mode');

        // СОХРАНЕНИЕ настройки в localStorage
        localStorage.setItem('fontSize', size);
    }
    
    // ФУНКЦИЯ УСТАНОВКИ ЦВЕТОВОЙ СХЕМЫ
    function setColorScheme(scheme) {
        // УДАЛЕНИЕ всех классов цветовых схем
        document.body.classList.remove(
            'color-black-white', 
            'color-black-green', 
            'color-white-black', 
            'color-beige-brown', 
            'color-blue-darkblue'
        );

        // ДОБАВЛЕНИЕ нового класса цветовой схемы и общего класса доступности
        document.body.classList.add(`color-${scheme}`);
        document.body.classList.add('accessibility-mode');

        localStorage.setItem('colorScheme', scheme);
    }
    
    // ФУНКЦИЯ УПРАВЛЕНИЯ ВИДИМОСТЬЮ ИЗОБРАЖЕНИЙ
    function setImagesVisibility(visible) {
        // ДОБАВЛЕНИЕ или УДАЛЕНИЕ класса для скрытия изображений
        if (visible) {
            document.body.classList.remove('images-disabled');
        } else {
            document.body.classList.add('images-disabled');
        }

        localStorage.setItem('imagesVisible', visible);
    }
    
    // ФУНКЦИЯ ЗАГРУЗКИ СОХРАНЕННЫХ НАСТРОЕК
    function loadAccessibilitySettings() {
        // ЗАГРУЗКА размера шрифта
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize) {
            setFontSize(fontSize); 
            document.querySelector(`.font-size-btn[data-size="${fontSize}"]`)?.classList.add('active');
        }

        // ЗАГРУЗКА цветовой схемы
        const colorScheme = localStorage.getItem('colorScheme'); 
        if (colorScheme) {
            setColorScheme(colorScheme); 
            document.querySelector(`.color-scheme-btn[data-scheme="${colorScheme}"]`)?.classList.add('active');
        }

        // ЗАГРУЗКА настройки изображений
        const imagesVisible = localStorage.getItem('imagesVisible'); 
        if (imagesVisible !== null) {
            const showImages = imagesVisible === 'true'; 
            if (imagesToggle) imagesToggle.checked = showImages; 
            setImagesVisibility(showImages);
        }
    }
    
    // ФУНКЦИЯ СБРОСА ВСЕХ НАСТРОЕК
    function resetAccessibilitySettings() {
        // УДАЛЕНИЕ всех классов доступности
        document.body.classList.remove(
            'accessibility-mode',
            'font-normal', 'font-large', 'font-x-large',
            'color-black-white', 'color-black-green', 'color-white-black',
            'color-beige-brown', 'color-blue-darkblue',
            'images-disabled'
        );

        // СБРОС переключателя изображений
        if (imagesToggle) imagesToggle.checked = true;
        
        // ВЫЗОВ внешних функций сброса 
        if (typeof themeManager !== 'undefined') {
            themeManager.resetTheme(); 
        }
        
        if (typeof i18n !== 'undefined') {
            i18n.loadLanguage('ru'); 
        }

        // СБРОС активных состояний кнопок
        fontSizeBtns.forEach(btn => btn.classList.remove('active')); 
        colorSchemeBtns.forEach(btn => btn.classList.remove('active')); 

        // УДАЛЕНИЕ всех сохраненных настроек из localStorage
        localStorage.removeItem('fontSize');
        localStorage.removeItem('colorScheme');
        localStorage.removeItem('imagesVisible');

        // ЗАКРЫТИЕ модального окна
        modal.style.display = 'none';
    }

    // ЭКСПОРТ функций в глобальную область видимости
    window.setFontSize = setFontSize;
    window.setColorScheme = setColorScheme;
    window.setImagesVisibility = setImagesVisibility;
    window.resetAccessibilitySettings = resetAccessibilitySettings;
});