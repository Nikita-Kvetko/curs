document.addEventListener('DOMContentLoaded', function() {
    updateUserMenu();
});

function updateUserMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
            ${user.role === 'admin' ? '<a href="../admin/dashboard.html" class="dropdown-item">Админ-панель</a>' : ''}
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
            localStorage.removeItem('currentUser');
            updateUserMenu();
            window.location.reload();
        });
    }

    document.addEventListener('click', function(e) {
        if (dropdown && !userMenu.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

window.updateUserMenu = updateUserMenu;