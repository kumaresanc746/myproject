// --- Admin API Request helper
async function adminApiRequest(url, options = {}) {
  try {
    // Ensure headers exist
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    const token = localStorage.getItem('adminToken');
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, options);

    // Fix: handle non-JSON responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      const text = await res.text();
      console.error('Non-JSON response from server:', text);
      throw new Error('Server returned non-JSON response');
    }
  } catch (err) {
    console.error('adminApiRequest error:', err);
    throw err;
  }
}

// --- Add / Update Product
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const productId = document.getElementById('product-id').value;
  const productData = {
    name: document.getElementById('product-name').value.trim(),
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value),
    description: document.getElementById('product-description').value.trim(),
    image: document.getElementById('product-image').value.trim()
  };

  try {
    let result;

    if (productId) {
      // Update
      result = await adminApiRequest(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    } else {
      // Add
      result = await adminApiRequest('/api/admin/products/add', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
    }

    if (result.data && result.data.success) {
      alert(productId ? 'Product updated' : 'Product added');
      closeProductModal();
      loadAdminProducts();
    } else {
      alert(result.data?.message || 'Failed to save product');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to save product');
  }
});

// --- Logout admin
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
  window.location.href = 'admin-login.html';
}

// --- Close modal click outside
window.onclick = function (event) {
  const modal = document.getElementById('product-modal');
  if (event.target === modal) closeProductModal();
};

// --- Init
document.addEventListener('DOMContentLoaded', () => {
  loadAdminProducts();
});

