// Estado da aplicação
let cart = [];
let currentFilter = 'all';
let currentSort = 'default';
let filteredProducts = [...window.productsData];

// Elementos DOM
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const totalPrice = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryBtns = document.querySelectorAll('.category-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    updateCartUI();
    setupEventListeners();
});

// Salvar carrinho no localStorage
function saveCart() {
    localStorage.setItem('vipstore_cart', JSON.stringify(cart));
}

// Carregar carrinho do localStorage
function loadCart() {
    const savedCart = localStorage.getItem('vipstore_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Renderizar produtos
function renderProducts() {
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #636e72;">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3 style="margin-bottom: 10px;">Nenhum produto encontrado</h3>
                <p>Tente buscar com outras palavras-chave</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Criar card de produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    card.innerHTML = `
        <div class="product-image">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <span style="font-size: 64px;">${product.icon}</span>
        </div>
        <div class="product-info">
            <div class="product-category">${product.category.toUpperCase()}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${product.reviews.toLocaleString('pt-BR')})</span>
            </div>
            <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            <div class="product-footer">
                <button class="add-to-cart-btn" data-id="${product.id}">
                    Adicionar
                </button>
                <button class="details-btn" data-id="${product.id}">
                    Ver
                </button>
            </div>
        </div>
    `;
    
    // Event listeners
    const addBtn = card.querySelector('.add-to-cart-btn');
    const detailsBtn = card.querySelector('.details-btn');
    
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product.id);
    });
    
    detailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showProductModal(product.id);
    });
    
    return card;
}

// Adicionar ao carrinho
function addToCart(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (!product) return;
    
    cart.push(product);
    saveCart();
    updateCartUI();
    showToast(`${product.name} adicionado ao carrinho!`, 'success');
}

// Remover do carrinho
function removeFromCart(index) {
    const product = cart[index];
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast(`${product.name} removido do carrinho`, 'success');
}

// Atualizar UI do carrinho
function updateCartUI() {
    // Atualizar badge
    cartBadge.textContent = cart.length;
    cartBadge.style.display = cart.length > 0 ? 'block' : 'none';
    
    // Atualizar itens do carrinho
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">${item.icon}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    <button class="remove-item" data-index="${index}">Remover</button>
                </div>
            `;
            
            const removeBtn = cartItem.querySelector('.remove-item');
            removeBtn.addEventListener('click', () => removeFromCart(index));
            
            cartItems.appendChild(cartItem);
        });
    }
    
    // Atualizar total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalPrice.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Mostrar modal do produto
function showProductModal(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (!product) return;
    
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    modalBody.innerHTML = `
        <div class="modal-product-content">
            <div class="modal-image">${product.icon}</div>
            <div class="modal-details">
                <h2>${product.name}</h2>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">${product.rating} (${product.reviews.toLocaleString('pt-BR')} avaliações)</span>
                </div>
                <div class="modal-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <div class="modal-description">${product.description}</div>
                <div class="modal-features">
                    <h4>O que está incluso:</h4>
                    <ul>
                        ${product.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="modal-actions">
                    <button class="modal-add-cart" data-id="${product.id}">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const addBtn = modalBody.querySelector('.modal-add-cart');
    addBtn.addEventListener('click', () => {
        addToCart(product.id);
        closeProductModal();
    });
    
    productModal.classList.add('active');
    overlay.classList.add('active');
}

// Fechar modal
function closeProductModal() {
    productModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Mostrar toast
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Filtrar produtos
function filterProducts() {
    let filtered = [...window.productsData];
    
    // Filtrar por categoria
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    
    // Filtrar por busca
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Ordenar
    switch(currentSort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Manter ordem padrão (mais relevantes)
            break;
    }
    
    filteredProducts = filtered;
    renderProducts();
}

// Configurar event listeners
function setupEventListeners() {
    // Abrir/fechar carrinho
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
    });
    
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    
    overlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
        closeProductModal();
    });
    
    // Fechar modal
    closeModal.addEventListener('click', closeProductModal);
    
    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Seu carrinho está vazio!', 'error');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const items = cart.map(item => item.name).join(', ');
        
        alert(`🎉 Pedido confirmado!\n\nItens: ${items}\n\nTotal: R$ ${total.toFixed(2).replace('.', ',')}\n\nObrigado por comprar na VIP Store!`);
        
        cart = [];
        saveCart();
        updateCartUI();
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
        
        showToast('Pedido realizado com sucesso!', 'success');
    });
    
    // Busca
    searchInput.addEventListener('input', filterProducts);
    
    // Ordenação
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterProducts();
    });
    
    // Categorias
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            filterProducts();
        });
    });
    
    // Botão CTA do banner
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            window.scrollTo({
                top: document.querySelector('.main-content').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    }
}

// Animação de entrada dos produtos
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        }, index * 50);
    });
});
