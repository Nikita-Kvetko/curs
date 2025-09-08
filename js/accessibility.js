document.addEventListener('DOMContentLoaded', function() {
    const accessibilityBtn = document.getElementById('accessibility-btn');
    const modal = document.getElementById('accessibility-modal');
    const closeBtn = document.querySelector('.close');
    const resetBtn = document.getElementById('reset-accessibility');

    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    const colorSchemeBtns = document.querySelectorAll('.color-scheme-btn');
    const imagesToggle = document.getElementById('images-toggle');

    loadAccessibilitySettings();

    if (accessibilityBtn && modal) {
        accessibilityBtn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            setFontSize(size);

            fontSizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    colorSchemeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const scheme = this.getAttribute('data-scheme');
            setColorScheme(scheme);

            colorSchemeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    if (imagesToggle) {
        imagesToggle.addEventListener('change', function() {
            setImagesVisibility(this.checked);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetAccessibilitySettings();
        });
    }

    function setFontSize(size) {
        document.body.classList.remove('font-normal', 'font-large', 'font-x-large');

        document.body.classList.add(`font-${size}`);
        document.body.classList.add('accessibility-mode');

        localStorage.setItem('fontSize', size);
    }
    
    function setColorScheme(scheme) {
        document.body.classList.remove(
            'color-black-white', 
            'color-black-green', 
            'color-white-black', 
            'color-beige-brown', 
            'color-blue-darkblue'
        );

        document.body.classList.add(`color-${scheme}`);
        document.body.classList.add('accessibility-mode');

        localStorage.setItem('colorScheme', scheme);
    }
    
    function setImagesVisibility(visible) {
        if (visible) {
            document.body.classList.remove('images-disabled');
        } else {
            document.body.classList.add('images-disabled');
        }

        localStorage.setItem('imagesVisible', visible);
    }
    
    function loadAccessibilitySettings() {
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize) {
            setFontSize(fontSize);
            document.querySelector(`.font-size-btn[data-size="${fontSize}"]`)?.classList.add('active');
        }

        const colorScheme = localStorage.getItem('colorScheme');
        if (colorScheme) {
            setColorScheme(colorScheme);
            document.querySelector(`.color-scheme-btn[data-scheme="${colorScheme}"]`)?.classList.add('active');
        }

        const imagesVisible = localStorage.getItem('imagesVisible');
        if (imagesVisible !== null) {
            const showImages = imagesVisible === 'true';
            if (imagesToggle) imagesToggle.checked = showImages;
            setImagesVisibility(showImages);
        }
    }
    
    function resetAccessibilitySettings() {
        document.body.classList.remove(
            'accessibility-mode',
            'font-normal', 'font-large', 'font-x-large',
            'color-black-white', 'color-black-green', 'color-white-black',
            'color-beige-brown', 'color-blue-darkblue',
            'images-disabled'
        );

        if (imagesToggle) imagesToggle.checked = true;

        fontSizeBtns.forEach(btn => btn.classList.remove('active'));
        colorSchemeBtns.forEach(btn => btn.classList.remove('active'));

        localStorage.removeItem('fontSize');
        localStorage.removeItem('colorScheme');
        localStorage.removeItem('imagesVisible');

        modal.style.display = 'none';
    }

    window.setFontSize = setFontSize;
    window.setColorScheme = setColorScheme;
    window.setImagesVisibility = setImagesVisibility;
    window.resetAccessibilitySettings = resetAccessibilitySettings;
});