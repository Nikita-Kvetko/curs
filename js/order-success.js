document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderDataEncoded = urlParams.get('order');
    
    if (!orderDataEncoded) {
        window.location.href = 'cart.html';
        return;
    }
    
    try {
        const orderData = JSON.parse(decodeURIComponent(orderDataEncoded));
        displayOrderDetails(orderData);
    } catch (error) {
        console.error('Error parsing order data:', error);
        window.location.href = 'cart.html';
    }
});

async function displayOrderDetails(orderData) {
    document.getElementById('order-number').textContent = `#${generateOrderNumber()}`;
    document.getElementById('order-date').textContent = formatDate(orderData.createdAt);
    document.getElementById('order-status').textContent = getStatusText(orderData.status);
    document.getElementById('order-total').textContent = `${orderData.total} руб.`;
    document.getElementById('payment-method').textContent = getPaymentMethodText(orderData.payment.method);
    document.getElementById('delivery-method').textContent = getDeliveryMethodText(orderData.delivery.method);

    document.getElementById('customer-name').textContent = 
        `${orderData.customer.lastname} ${orderData.customer.firstname} ${orderData.customer.middlename}`.trim();
    document.getElementById('customer-phone').textContent = orderData.customer.phone;
    document.getElementById('customer-email').textContent = orderData.customer.email;
    
    const address = orderData.delivery.address;
    document.getElementById('delivery-address').textContent = 
        `г. ${address.city}, ул. ${address.street}, д. ${address.house}` +
        (address.apartment ? `, кв. ${address.apartment}` : '') +
        (address.postalCode ? `, ${address.postalCode}` : '');

    await displayOrderItems(orderData.items);
}

function generateOrderNumber() {
    return Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Ожидает подтверждения',
        'confirmed': 'Подтвержден',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
}

function getPaymentMethodText(method) {
    const methodMap = {
        'card': 'Банковская карта',
        'cash': 'Наличные при получении',
        'online': 'Онлайн-банкинг'
    };
    return methodMap[method] || method;
}

function getDeliveryMethodText(method) {
    const methodMap = {
        'courier': 'Курьерская доставка',
        'pickup': 'Самовывоз'
    };
    return methodMap[method] || method;
}

async function displayOrderItems(items) {
    try {
        const allProducts = await getAllProducts();
        const orderItemsContainer = document.getElementById('order-items');
        
        const orderItemsHTML = items.map(item => {
            const product = allProducts.find(p => p.id === item.productId.toString());
            if (!product) return '';
            
            const finalPrice = calculateProductPrice(product);
            const totalPrice = finalPrice * item.quantity;
            
            return `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="../img/${product.images[0]}" alt="${product.name}">
                    </div>
                    <div class="order-item-info">
                        <div class="order-item-name">${product.name}</div>
                        <div class="order-item-details">
                            <span>${item.quantity} шт. × ${finalPrice} руб.</span>
                            <span class="order-item-price">${totalPrice} руб.</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        orderItemsContainer.innerHTML = orderItemsHTML;
    } catch (error) {
        console.error('Error loading order items:', error);
        document.getElementById('order-items').innerHTML = 
            '<p>Не удалось загрузить информацию о товарах</p>';
    }
}

function printReceipt() {
    window.print();
}

document.addEventListener('DOMContentLoaded', function() {
    const printBtn = document.querySelector('.btn-secondary:nth-child(2)');
    const trackBtn = document.querySelector('.btn-secondary:nth-child(3)');
    
    if (printBtn) {
        printBtn.addEventListener('click', function(e) {
            e.preventDefault();
            printReceipt();
        });
    }
    
    if (trackBtn) {
        trackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Функция отслеживания заказа будет доступна после подтверждения заказа менеджером.');
        });
    }
});