function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function isUserLoggedIn() {
    return !!localStorage.getItem('currentUser');
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    updateUserMenu();
    window.location.reload();
}

function updateUserMenu() {
    const currentUser = getCurrentUser();
    const loginBtn = document.querySelector('.login-btn');
    const userActions = document.querySelector('.user-actions');
    
    if (currentUser) {
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }

        createUserMenu(currentUser, userActions);
    } else {
        if (loginBtn) {
            loginBtn.style.display = 'flex';
        }

        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }
}

function createUserMenu(user, container) {
    const oldMenu = document.querySelector('.user-menu');
    if (oldMenu) {
        oldMenu.remove();
    }

    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <button class="user-menu-toggle">
            <img src="../img/user.png" alt="user"> ${user.firstname}
        </button>
        <div class="user-dropdown">
            <div class="user-info">
                <p>${user.firstname} ${user.lastname}</p>
                <p>${user.phone}</p>
            </div>
            <a href="#" class="dropdown-item">Настройки</a>
            ${user.role === 'admin' ? '<a href="admin.html" class="dropdown-item">Админ-панель</a>' : ''}
            <button class="dropdown-item logout-btn">Выйти</button>
        </div>
    `;

    if (container) {
        container.appendChild(userMenu);
    }

    const toggleBtn = userMenu.querySelector('.user-menu-toggle');
    const dropdown = userMenu.querySelector('.user-dropdown');
    const logoutBtn = userMenu.querySelector('.logout-btn');
    const settingsBtn = userMenu.querySelector('.dropdown-item');

    if (settingsBtn && settingsBtn.textContent === 'Настройки') {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById('accessibility-modal');
            if (modal) {
                modal.style.display = 'block';
            }
            if (dropdown) dropdown.classList.remove('show');
        });
    }

    if (toggleBtn && dropdown) {
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }

    document.addEventListener('click', function(e) {
        if (dropdown && !userMenu.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

async function updateHeaderCounts() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        const favorites = await getFavorites(currentUser.id);
        const favCountElements = document.querySelectorAll('#fav-count');
        favCountElements.forEach(element => {
            element.textContent = favorites.items.length;
        });

        const cart = await getCart(currentUser.id);
        const totalCartItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalCartItems;
        });
    } catch (error) {
        console.error('Ошибка при обновлении счетчиков:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateUserMenu();

    const catalogBlocks = document.querySelectorAll('.catalog-block');
    catalogBlocks.forEach(block => {
        block.addEventListener('click', function() {
            const category = this.querySelector('p').textContent;

            sessionStorage.setItem('selectedCategory', category);

            window.location.href = 'products.html';
        });
    });

    updateHeaderCounts();
});

window.updateUserMenu = updateUserMenu;