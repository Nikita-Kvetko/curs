// Ожидание полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    let currentUser = null;
    let currentItemId = null;
    let currentItemType = null;

    // Проверка прав администратора
    function checkAdminAccess() {
        currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            alert(window.i18n ? window.i18n.translate('admin.access_denied') : 'Доступ запрещен. Требуются права администратора.');
            window.location.href = 'products.html';
            return false;
        }
        return true;
    }

    // Основная функция загрузки данных админ-панели
    async function loadAdminData() {
        if (!checkAdminAccess()) return;
        
        showPreloader();
        
        try {
            await loadUsers();
            await loadProducts();
            setupEventListeners();
        } catch (error) {
            console.error('Error loading admin data:', error);
            alert(window.i18n ? window.i18n.translate('admin.load_error') : 'Не удалось загрузить данные админ-панели');
        } finally {
            hidePreloader();
        }
    }

    // Управление прелоадером
    function showPreloader() {
        preloader.style.display = 'flex';
    }

    function hidePreloader() {
        preloader.style.display = 'none';
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

                this.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });

        // Обработчики форм
        document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
        document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

        // Поиск и фильтрация
        document.getElementById('user-search').addEventListener('input', filterUsers);
        document.getElementById('product-search').addEventListener('input', filterProducts);
    }

    // Загрузка и отображение пользователей
    async function loadUsers() {
        try {
            const users = await apiRequest('users');
            window.usersData = users; 
            renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    function renderUsers(users) {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.lastname} ${user.firstname} ${user.middlename || ''}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td><span class="role-badge role-${user.role}">${getRoleText(user.role)}</span></td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editUser('${user.id}')" title="${window.i18n ? window.i18n.translate('admin.edit') : 'Редактировать'}" data-i18n="title.edit">✏️</button>
                        <button class="btn-icon btn-delete" onclick="confirmDelete('user', '${user.id}', '${user.firstname} ${user.lastname}')" title="${window.i18n ? window.i18n.translate('admin.delete') : 'Удалить'}" data-i18n="title.delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Локализация ролей пользователей
    function getRoleText(role) {
        const roles = {
            'user': window.i18n ? window.i18n.translate('form.roles.user') : 'Пользователь',
            'admin': window.i18n ? window.i18n.translate('form.roles.admin') : 'Администратор',
            'moderator': window.i18n ? window.i18n.translate('form.roles.moderator') : 'Модератор'
        };
        return roles[role] || role;
    }

    // Редактирование пользователя
    window.editUser = async function(userId) {
        try {
            const user = window.usersData.find(u => u.id === userId);
            if (!user) return;

            document.getElementById('user-modal-title').textContent = window.i18n ? window.i18n.translate('admin.users.edit_title') : 'Редактирование пользователя';
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-lastname').value = user.lastname;
            document.getElementById('user-firstname').value = user.firstname;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-phone').value = user.phone;
            document.getElementById('user-role').value = user.role;

            openModal('user-modal');
        } catch (error) {
            console.error('Error editing user:', error);
        }
    }

    // Обработка формы пользователя
    async function handleUserSubmit(e) {
        e.preventDefault();
        
        const userData = {
            lastname: document.getElementById('user-lastname').value,
            firstname: document.getElementById('user-firstname').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            role: document.getElementById('user-role').value
        };

        const userId = document.getElementById('user-id').value;

        try {
            if (userId) {
                await apiRequest(`users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify(userData)
                });
            }

            closeModal('user-modal');
            await loadUsers();
            alert(window.i18n ? window.i18n.translate('admin.users.save_success') : 'Пользователь успешно обновлен!');
        } catch (error) {
            console.error('Error saving user:', error);
            alert(window.i18n ? window.i18n.translate('admin.users.save_error') : 'Ошибка при сохранении пользователя');
        }
    }

    // Фильтрация пользователей
    function filterUsers() {
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        const filteredUsers = window.usersData.filter(user => 
            user.lastname.toLowerCase().includes(searchTerm) ||
            user.firstname.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone.toLowerCase().includes(searchTerm)
        );
        renderUsers(filteredUsers);
    }

    // Загрузка и отображение товаров
    async function loadProducts() {
        try {
            const products = await apiRequest('products');
            window.productsData = products;
            renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    function renderProducts(products) {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="../img/${product.images[0] || 'default-product.jpg'}" alt="${product.name}" data-i18n="alt.product_image"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price} руб.</td>
                <td>${product.discount || 0}%</td>
                <td>${product.width}×${product.height}×${product.depth} <span data-i18n="products.mm">мм</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editProduct('${product.id}')" title="${window.i18n ? window.i18n.translate('admin.edit') : 'Редактировать'}" data-i18n="title.edit">✏️</button>
                        <button class="btn-icon btn-delete" onclick="confirmDelete('product', '${product.id}', '${product.name}')" title="${window.i18n ? window.i18n.translate('admin.delete') : 'Удалить'}" data-i18n="title.delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Управление модальными окнами товаров
    window.openProductModal = function(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('product-modal-title');
        const form = document.getElementById('product-form');
        
        if (productId) {
            title.textContent = window.i18n ? window.i18n.translate('admin.products.edit_title') : 'Редактирование товара';
        } else {
            title.textContent = window.i18n ? window.i18n.translate('admin.products.add_title') : 'Добавление товара';
            form.reset();
            document.getElementById('product-id').value = '';
        }
        
        openModal('product-modal');
    }

    window.editProduct = async function(productId) {
        try {
            const product = window.productsData.find(p => p.id === productId);
            if (!product) return;

            document.getElementById('product-modal-title').textContent = window.i18n ? window.i18n.translate('admin.products.edit_title') : 'Редактирование товара';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-discount').value = product.discount || 0;
            document.getElementById('product-width').value = product.width;
            document.getElementById('product-height').value = product.height;
            document.getElementById('product-depth').value = product.depth;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-images').value = product.images.join(', ');

            openModal('product-modal');
        } catch (error) {
            console.error('Error editing product:', error);
        }
    }

    // Обработка формы товара
    async function handleProductSubmit(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            discount: parseInt(document.getElementById('product-discount').value) || 0,
            width: parseInt(document.getElementById('product-width').value),
            height: parseInt(document.getElementById('product-height').value),
            depth: parseInt(document.getElementById('product-depth').value),
            description: document.getElementById('product-description').value,
            images: document.getElementById('product-images').value
                .split(',')
                .map(img => img.trim())
                .filter(img => img)
        };

        const productId = document.getElementById('product-id').value;

        try {
            if (productId) {
                await apiRequest(`products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(productData)
                });
            } else {
                await apiRequest('products', {
                    method: 'POST',
                    body: JSON.stringify(productData)
                });
            }

            closeModal('product-modal');
            await loadProducts();
            alert(window.i18n ? window.i18n.translate('admin.products.save_success') : 'Товар успешно сохранен!');
        } catch (error) {
            console.error('Error saving product:', error);
            alert(window.i18n ? window.i18n.translate('admin.products.save_error') : 'Ошибка при сохранении товара');
        }
    }

    // Фильтрация товаров
    function filterProducts() {
        const searchTerm = document.getElementById('product-search').value.toLowerCase();
        const filteredProducts = window.productsData.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    }

    // Управление модальными окнами
    window.openModal = function(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    window.closeModal = function(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Подтверждение и выполнение удаления
    window.confirmDelete = function(type, id, name) {
        currentItemId = id;
        currentItemType = type;
        
        const message = window.i18n ? 
            window.i18n.translate('admin.confirm_delete', {type: type === 'user' ? window.i18n.translate('admin.user') : window.i18n.translate('admin.product'), name: name}) :
            `Вы уверены, что хотите удалить ${type === 'user' ? 'пользователя' : 'товар'} "${name}"?`;
        
        document.getElementById('confirm-message').textContent = message;
        
        document.getElementById('confirm-delete').onclick = performDelete;
        openModal('confirm-modal');
    }

    async function performDelete() {
        try {
            await apiRequest(`${currentItemType}s/${currentItemId}`, {
                method: 'DELETE'
            });

            closeModal('confirm-modal');

            if (currentItemType === 'user') {
                await loadUsers();
            } else if (currentItemType === 'product') {
                await loadProducts();
            }
            
            alert(window.i18n ? window.i18n.translate('admin.delete_success') : 'Элемент успешно удален!');
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(window.i18n ? window.i18n.translate('admin.delete_error') : 'Ошибка при удалении элемента');
        }
    }

    // Закрытие модальных окон по клику вне области
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Инициализация админ-панели
    loadAdminData();
});