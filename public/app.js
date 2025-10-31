// public/app.js
const PRODUCTS = [
  { id: 'template-pack', name: 'Instagram Template Bundle', price_cents: 999, filename: 'template-pack.zip', price_label: '$9.99' },
  { id: 'guide-pdf', name: 'Business Growth Guide (PDF)', price_cents: 499, filename: 'guide.pdf', price_label: '$4.99' },
  { id: 'photo-bundle', name: 'Lifestyle Stock Photo Bundle', price_cents: 1299, filename: 'photo-bundle.zip', price_label: '$12.99' }
];

function formatPrice(cents) {
  return `$${(cents/100).toFixed(2)}`;
}

function renderProductGrid() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="card">
      <img src="https://via.placeholder.com/600x400?text=${encodeURIComponent(p.name)}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.price_label}</p>
      <button class="btn primary" onclick="addToCart('${p.id}')">Add to Cart</button>
    </div>
  `).join('');
}
function addToCart(id) {
  alert(`Added ${PRODUCTS.find(p=>p.id===id).name} to cart ✅`);
}
window.onload = renderProductGrid;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch { return []; }
}
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI(); }

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, quantity: 1 });
  saveCart(cart);
}

function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((s,i) => s + i.quantity, 0);
  const cartLinks = document.querySelectorAll('#cart-link');
  cartLinks.forEach(el => { el.textContent = `Cart (${count})`; });
  const panel = document.getElementById('cart-items');
  if (panel) {
    panel.innerHTML = '';
    cart.forEach(item => {
      const p = PRODUCTS.find(x=>x.id===item.id);
      const div = document.createElement('div');
      div.textContent = `${p.name} x ${item.quantity} — ${p.price_label || formatPrice(p.price_cents)}`;
      panel.appendChild(div);
    });
    const total = cart.reduce((s,i) => s + (PRODUCTS.find(p=>p.id===i.id).price_cents * i.quantity), 0);
    document.getElementById('cart-total').textContent = `Total: ${formatPrice(total)}`;
  }
}

async function checkout() {
  const cart = getCart();
  if (!cart.length) return alert('Cart is empty');
  try {
    const resp = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ items: cart })
    });
    const data = await resp.json();
    if (data.url) {
      // redirect to Stripe Checkout hosted page
      window.location = data.url;
    } else {
      alert('Checkout failed: ' + (data.error || 'unknown'));
    }
  } catch (err) {
    console.error(err); alert('Network error');
  }
}

async function handleSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const session_id = params.get('session_id');
  if (!session_id) return;
  document.getElementById('session-id').textContent = session_id;
  // Verify session and get files
  const res = await fetch(`/verify-session?session_id=${encodeURIComponent(session_id)}`);
  const data = await res.json();
  const downloadsDiv = document.getElementById('downloads');
  if (data.files && data.files.length) {
    data.files.forEach(file => {
      const a = document.createElement('a');
      a.href = `/download?session_id=${encodeURIComponent(session_id)}&file=${encodeURIComponent(file)}`;
      a.textContent = `Download ${file}`;
      a.className = 'btn';
      a.style.display = 'inline-block';
      a.style.margin = '6px';
      downloadsDiv.appendChild(a);
    });
  } else {
    downloadsDiv.textContent = 'No downloads found for this session.';
  }
}

document.addEventListener('click', e => {
  if (e.target.matches('.add-to-cart')) {
    addToCart(e.target.dataset.id);
  }
  if (e.target && e.target.id === 'checkout-btn') {
    checkout();
  }
});

window.addEventListener('load', () => {
  renderProductGrid();
  updateCartUI();
  if (location.pathname.endsWith('success.html')) handleSuccessPage();
});
