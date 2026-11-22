// GameStore - JavaScript Principal

// === Panier AJAX ===
function addToCart(gameId) {
    fetch(SITE_URL + '/pages/cart-action.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=add&game_id=${gameId}&quantity=1`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            updateCartBadge(data.count);
            showNotification('Article ajouté au panier.', 'success');
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    })
    .catch(() => showNotification('❌ Erreur réseau', 'error'));
}

function updateCartBadge(count) {
    let badge = document.querySelector('.cart-badge');
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            document.querySelector('.cart-btn').appendChild(badge);
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}

// === Notifications toast ===
function showNotification(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);

    const style = document.createElement('style');
    style.textContent = `
        #toast-container {
            position: fixed; bottom: 30px; right: 30px;
            z-index: 9999; display: flex; flex-direction: column; gap: 10px;
        }
        .toast {
            background: #1e1e2e; border: 1px solid #2e2e4e;
            color: #e2e8f0; padding: 14px 20px;
            border-radius: 10px; font-size: 14px; font-weight: 600;
            min-width: 250px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            opacity: 0; transform: translateX(50px);
            transition: all 0.3s ease;
        }
        .toast.show { opacity: 1; transform: translateX(0); }
        .toast-success { border-left: 4px solid #22c55e; }
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-info { border-left: 4px solid #06b6d4; }
    `;
    document.head.appendChild(style);
    return div;
}

// === Quantité panier ===
function updateQuantity(cartId, action) {
    fetch(SITE_URL + '/pages/cart-action.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=${action}&cart_id=${cartId}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    });
}

// === Recherche en temps réel (autocomplete basique) ===
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            // Optionnel : implémenter l'autocomplete AJAX ici
        }, 300);
    });
}

// === Lazy loading images ===
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

// === SITE_URL pour les requêtes AJAX ===
const SITE_URL = document.querySelector('meta[name="site-url"]')?.content || '';
