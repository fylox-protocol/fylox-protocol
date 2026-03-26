// ═══════════════════════════════════════════════════
//  FYLOX API CLIENT — v2
//  - JWT expirado → limpia sesión y vuelve al login
//  - Retry automático en errores de red (1 vez)
//  - Timeout de 15s por request
// ═══════════════════════════════════════════════════

const FYLOX_API = 'https://fylox-backend.onrender.com/api';

let _fyloxToken = null;

function getToken()   { return _fyloxToken; }
function setToken(t)  { _fyloxToken = t; }
function clearToken() { _fyloxToken = null; }

// Manejo centralizado de sesión expirada
function _handleSessionExpired() {
  clearToken();
  stopBalancePolling?.();

  // Limpiar UI
  const hb = document.getElementById('home-balance');
  if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';

  // Mostrar toast de aviso
  if (typeof FyloxNotification !== 'undefined') {
    FyloxNotification.show({
      icon: '🔒',
      title: 'Sesión expirada',
      sub: 'Iniciá sesión de nuevo',
      amt: '',
      sound: false,
    });
  }

  // Volver al login después de 1.5s para que el Pioneer vea el toast
  setTimeout(() => {
    const loginBtn = document.getElementById('pi-login-btn');
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span style="position:relative;z-index:1">Continue with Pi Network →</span>';
      loginBtn.style.background = '';
      loginBtn.style.color = '';
    }
    goTo?.('s0');
  }, 1500);
}

async function apiCall(method, path, body, _isRetry = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (_fyloxToken) headers['Authorization'] = 'Bearer ' + _fyloxToken;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  // Timeout de 15 segundos
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 15000);
  opts.signal = controller.signal;

  try {
    const res  = await fetch(FYLOX_API + path, opts);
    clearTimeout(timeoutId);
    const data = await res.json();

    // JWT expirado o inválido → volver al login
    if (res.status === 401) {
      _handleSessionExpired();
      throw new Error(data.error || 'Sesión expirada');
    }

    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;

  } catch (err) {
    clearTimeout(timeoutId);

    // Retry automático en errores de red (solo una vez)
    if (!_isRetry && (err.name === 'TypeError' || err.name === 'AbortError')) {
      console.warn('[Fylox API] Red inestable, reintentando:', path);
      await new Promise(r => setTimeout(r, 2000));
      return apiCall(method, path, body, true);
    }

    console.error('[Fylox API]', path, err.message);
    throw err;
  }
}

// Upload de imagen a Cloudinary (sin pasar por nuestro backend)
async function uploadImage(file) {
  const CLOUD_NAME   = 'fylox';
  const UPLOAD_PRESET = 'oracle_tasks';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'oracle');

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData, signal: controller.signal }
    );
    clearTimeout(timeoutId);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Error subiendo imagen');
    return data.secure_url;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[Fylox] Upload error:', err.message);
    throw err;
  }
}
