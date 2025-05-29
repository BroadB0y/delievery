// Данные меню
const menuData = [
    {
        id: 1,
        title: "Филадельфия",
        price: 350,
        description: "Лосось, сливочный сыр, огурец, рис, нори",
        image: "img/roll1.jpg"
    },
    {
        id: 2,
        title: "Калифорния",
        price: 320,
        description: "Краб, авокадо, огурец, икра тобико, рис, нори",
        image: "img/roll2.jpg"
    },
    {
        id: 3,
        title: "Унаги",
        price: 380,
        description: "Угорь, сливочный сыр, огурец, соус унаги, рис, нори",
        image: "img/roll3.jpg"
    },
    {
        id: 4,
        title: "Темпура",
        price: 360,
        description: "Креветка в темпуре, огурец, авокадо, соус спайси",
        image: "img/roll4.jpg"
    },
    {
        id: 5,
        title: "Гункан с икрой",
        price: 290,
        description: "Икра тобико, сливочный сыр, рис, нори",
        image: "img/sushi1.jpg"
    },
    {
        id: 6,
        title: "Сет 'Сакура'",
        price: 1200,
        description: "24 кусочка: Филадельфия, Калифорния, с лососем, с угрем",
        image: "img/set1.jpg"
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Элементы DOM
const cartCount = document.querySelector('.cart-count');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    updateCart();
    setupEventListeners();
});

// Инициализация меню
function initMenu() {
    const menuItemsContainer = document.querySelector('.menu-items');
    if (!menuItemsContainer) return;

    menuData.forEach((item, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.style.animationDelay = `${index * 0.1}s`;
        
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="menu-item-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="price">${item.price} ₽</div>
                <button class="add-to-cart" data-id="${item.id}">В корзину</button>
            </div>
        `;
        
        menuItemsContainer.appendChild(menuItem);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Делегирование событий для кнопок "В корзину"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            addToCart(itemId);
            
            // Анимация кнопки
            e.target.textContent = 'Добавлено!';
            e.target.style.backgroundColor = '#4ECDC4';
            
            setTimeout(() => {
                e.target.textContent = 'В корзину';
                e.target.style.backgroundColor = '';
            }, 1000);
        }
    });

    // Открытие/закрытие корзины
    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', checkout);

    // Анимация номера телефона
    const phone = document.querySelector('.phone a');
    if (phone) {
        phone.addEventListener('mouseenter', () => phone.classList.add('shake'));
        phone.addEventListener('mouseleave', () => phone.classList.remove('shake'));
    }

    // Анимация при прокрутке
    window.addEventListener('scroll', animateOnScroll);
    setTimeout(animateOnScroll, 500);
}

// Добавление в корзину
function addToCart(itemId) {
    const item = menuData.find(item => item.id === itemId);
    if (!item) return;

    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCart();
    saveCartToLocalStorage();
}

// Удаление из корзины
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
    saveCartToLocalStorage();
}

// Обновление количества
function updateQuantity(itemId, newQuantity) {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;
    
    if (newQuantity < 1) {
        removeFromCart(itemId);
    } else {
        item.quantity = newQuantity;
    }
    
    updateCart();
    saveCartToLocalStorage();
}

// Обновление отображения корзины
function updateCart() {
    // Обновляем счетчик
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalCount;
    
    // Обновляем содержимое корзины
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">${item.price} ₽</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Обновляем итоговую сумму
    if (cartTotal) {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = totalPrice + ' ₽';
    }
    
    // Добавляем обработчики для элементов корзины
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === itemId);
            if (item) updateQuantity(itemId, item.quantity - 1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === itemId);
            if (item) updateQuantity(itemId, item.quantity + 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            removeFromCart(itemId);
        });
    });
}

// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Открытие/закрытие корзины
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) return;
    
    alert(`Заказ оформлен! Сумма: ${cartTotal.textContent}`);
    cart = [];
    updateCart();
    saveCartToLocalStorage();
    toggleCart();
}

// Анимация при прокрутке
function animateOnScroll() {
    const items = document.querySelectorAll('.menu-item, .info-card');
    
    items.forEach(item => {
        const itemPosition = item.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (itemPosition < screenPosition) {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }
    });
}