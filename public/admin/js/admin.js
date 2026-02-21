/* ============================================
   Rossa Repuestos — Admin Panel JavaScript
   ============================================ */

// ========================
// Token Management
// ========================
function getToken() {
    return localStorage.getItem('adminToken') || '';
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// ========================
// API Helper Functions
// ========================
async function apiFetch(url, options = {}) {
    const token = getToken();
    const defaultHeaders = {
        Authorization: `Bearer ${token}`,
    };

    // Solo agregar Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // Token expirado, redirigir al login
        localStorage.removeItem('adminToken');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/admin/login';
        return;
    }

    return await response.json();
}

async function apiGet(url) {
    return apiFetch(url, { method: 'GET' });
}

// ========================
// Toast Notifications
// ========================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// ========================
// Logout
// ========================
function logout() {
    localStorage.removeItem('adminToken');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/admin/login';
}

// ========================
// Mobile Sidebar Toggle
// ========================
document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Cerrar sidebar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                e.target !== mobileToggle
            ) {
                sidebar.classList.remove('open');
            }
        });
    }
});
