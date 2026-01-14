// إدارة سلة المشتريات
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let deliveryEnabled = localStorage.getItem('deliveryEnabled') === 'true';
let deliveryAddress = localStorage.getItem('deliveryAddress') || '';

// عناصر DOM
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const emptyCartMessage = document.getElementById('empty-cart-message');

// عناصر التوصيل الجديدة
const deliveryOption = document.getElementById('delivery-option');
const deliveryToggle = document.getElementById('delivery-toggle');
const deliveryDetails = document.getElementById('delivery-details');
const deliveryAddressInput = document.getElementById('delivery-address');
const addressRequired = document.getElementById('address-required');
const deliveryTotal = document.getElementById('delivery-total');
const deliveryPrice = document.getElementById('delivery-price');
const finalTotal = document.getElementById('final-total');
const finalTotalPrice = document.getElementById('final-total-price');

// تهيئة خيار التوصيل
function initializeDeliveryOption() {
    if (deliveryEnabled) {
        deliveryOption.classList.add('active');
        deliveryDetails.classList.add('show');
        deliveryAddressInput.value = deliveryAddress;
    }
    updateDeliveryDisplay();
}

// تحديث عرض خيار التوصيل
function updateDeliveryDisplay() {
    if (deliveryEnabled) {
        deliveryTotal.style.display = 'flex';
        finalTotal.style.display = 'flex';
        
        const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const finalTotalValue = cartTotal + 5;
        
        finalTotalPrice.textContent = `${finalTotalValue} شيكل`;
    } else {
        deliveryTotal.style.display = 'none';
        finalTotal.style.display = 'none';
    }
}

// التحكم في خيار التوصيل
deliveryToggle.addEventListener('click', function() {
    deliveryEnabled = !deliveryEnabled;
    
    if (deliveryEnabled) {
        deliveryOption.classList.add('active');
        deliveryDetails.classList.add('show');
    } else {
        deliveryOption.classList.remove('active');
        deliveryDetails.classList.remove('show');
        addressRequired.style.display = 'none';
    }
    
    // حفظ الإعدادات
    localStorage.setItem('deliveryEnabled', deliveryEnabled);
    deliveryAddress = deliveryAddressInput.value.trim();
    localStorage.setItem('deliveryAddress', deliveryAddress);
    
    updateDeliveryDisplay();
    updateCartDisplay();
});

// تحديث العنوان عند الكتابة
deliveryAddressInput.addEventListener('input', function() {
    deliveryAddress = this.value.trim();
    localStorage.setItem('deliveryAddress', deliveryAddress);
});

// التحكم في أزرار زيادة ونقصان الكمية للوجبات
document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', function() {
        const mealId = this.getAttribute('data-meal');
        const quantityElement = document.getElementById(`quantity-${mealId}`);
        let quantity = parseInt(quantityElement.textContent);
        
        if (this.classList.contains('plus')) {
            quantity++;
        } else if (this.classList.contains('minus') && quantity > 1) {
            quantity--;
        }
        
        quantityElement.textContent = quantity;
    });
});

// إضافة إلى السلة
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const mealId = this.getAttribute('data-meal');
        const mealName = this.getAttribute('data-name');
        const mealPrice = parseInt(this.getAttribute('data-price'));
        const quantity = parseInt(document.getElementById(`quantity-${mealId}`).textContent);
        
        // إضافة المنتج إلى السلة
        addToCart(mealId, mealName, mealPrice, quantity);
        
        // إعادة تعيين الكمية إلى 1
        document.getElementById(`quantity-${mealId}`).textContent = 1;
        
        // عرض إشعار
        showNotification(`تم إضافة ${mealName} إلى السلة`);
        
        // تأثير زر إضافة إلى السلة
        const originalText = this.textContent;
        const originalBg = this.style.backgroundColor;
        this.textContent = '✓ تمت الإضافة';
        this.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            this.textContent = originalText;
            this.style.backgroundColor = originalBg;
        }, 1500);
    });
});

// وظيفة إضافة منتج إلى السلة
function addToCart(id, name, price, quantity) {
    // التحقق إذا كان المنتج موجوداً بالفعل في السلة
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        // تحديث الكمية إذا كان المنتج موجوداً
        cart[existingItemIndex].quantity += quantity;
    } else {
        // إضافة منتج جديد إلى السلة
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: quantity
        });
    }
    
    // حفظ السلة في localStorage
    saveCart();
    
    // تحديث عرض السلة
    updateCartDisplay();
}

// وظيفة حفظ السلة في localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// وظيفة تحديث عرض السلة
function updateCartDisplay() {
    // تحديث عدد العناصر في السلة
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // تحديث المجموع الكلي
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `${totalPrice} شيكل`;
    
    // تحديث خيار التوصيل
    updateDeliveryDisplay();
    
    // تحديث عرض عناصر السلة
    renderCartItems();
}

// وظيفة عرض عناصر السلة
function renderCartItems() {
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'flex';
        cartItems.innerHTML = '';
        cartItems.appendChild(emptyCartMessage);
        checkoutBtn.disabled = true;
        clearCartBtn.disabled = true;
        deliveryOption.style.display = 'none';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    checkoutBtn.disabled = false;
    clearCartBtn.disabled = false;
    deliveryOption.style.display = 'block';
    
    let cartHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-details">
                        <span class="cart-item-price">${item.price} شيكل</span>
                        <span>×</span>
                        <span>${item.quantity}</span>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="quantity-change decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-change increase" data-index="${index}">+</button>
                    </div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    
    // إضافة مستمعي الأحداث للأزرار الجديدة
    document.querySelectorAll('.quantity-change').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const isIncrease = this.classList.contains('increase');
            
            if (isIncrease) {
                cart[index].quantity++;
            } else if (cart[index].quantity > 1) {
                cart[index].quantity--;
            }
            
            saveCart();
            updateCartDisplay();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const itemName = cart[index].name;
            cart.splice(index, 1);
            saveCart();
            updateCartDisplay();
            showNotification(`تم حذف ${itemName} من السلة`);
        });
    });
}

// وظيفة إظهار إشعار
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// إتمام الطلب عبر واتساب
checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) return;
    
    // التحقق من العنوان إذا كان التوصيل مفعلاً
    if (deliveryEnabled) {
        const address = deliveryAddressInput.value.trim();
        if (!address) {
            addressRequired.style.display = 'block';
            deliveryAddressInput.focus();
            showNotification('يرجى إدخال العنوان للتوصيل');
            return;
        }
        addressRequired.style.display = 'none';
    }
    
    let message = `مرحباً، أريد طلب من "مطعم ومطبخ العائلة":%0A%0A`;
  
    message += `تفاصيل الطلب:%0A`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}%0A`;
        message += `   الكمية: ${item.quantity}%0A`;
        message += `   السعر: ${item.price * item.quantity} شيكل%0A%0A`;
    });
    
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    message += `المجموع: ${totalPrice} شيكل%0A`;
    
    // إضافة سعر التوصيل إذا كان مفعلاً
    if (deliveryEnabled) {
        message += `سعر التوصيل: 5 شيكل%0A`;
        const finalTotal = totalPrice + 5;
        message += `الإجمالي النهائي: ${finalTotal} شيكل%0A%0A`;
        message += `عنوان التوصيل: ${deliveryAddressInput.value}%0A%0A`;
    } else {
        message += `الإجمالي النهائي: ${totalPrice} شيكل%0A%0A`;
    }
    
    message += `أرجو التواصل معي لتأكيد الطلب.`;
    
    // تغيير رقم واتساب إلى الرقم الجديد
    window.open(`https://wa.me/970595170185?text=${message}`, '_blank');
});

// تفريغ السلة
clearCartBtn.addEventListener('click', function() {
    if (cart.length === 0) return;
    
    if (confirm('هل أنت متأكد من تفريغ السلة؟')) {
        cart = [];
        deliveryEnabled = false;
        deliveryAddress = '';
        localStorage.setItem('deliveryEnabled', false);
        localStorage.setItem('deliveryAddress', '');
        saveCart();
        initializeDeliveryOption();
        updateCartDisplay();
        showNotification('تم تفريغ السلة');
    }
});

// التحكم في فتح وإغلاق سلة المشتريات
cartToggle.addEventListener('click', function() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeCart.addEventListener('click', function() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

cartOverlay.addEventListener('click', function() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// تأثيرات عند التمرير
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.padding = '0.8rem 0';
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.padding = '1.5rem 0';
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    }
});

// تأثيرات للبطاقات عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // تحديث عرض السلة عند تحميل الصفحة
    updateCartDisplay();
    
    // تهيئة خيار التوصيل
    initializeDeliveryOption();
    
    // تأثيرات ظهور البطاقات
    const mealCards = document.querySelectorAll('.meal-card');
    mealCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
});