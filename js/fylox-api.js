// ═══════════════════════════════════════════════════
//  FYLOX API CLIENT — v3
//  - URL centralizada y sin placeholders
//  - JWT expirado → limpia sesión y vuelve al login
//  - Retry automático en errores de red (1 vez)
//  - Timeout de 15s por request
//  - Upload via backend firmado (no credenciales en frontend)
// ═══════════════════════════════════════════════════

const FYLOX_API = 'https://fylox-backend.onrender.com/api';

let _fyloxToken = null;

function getToken()   { return _fyloxToken; }
function setToken(t)  { _fyloxToken = t; FyloxStorage.set('fylox_token', t); }
function clearToken() { _fyloxToken = null; FyloxStorage.remove('fylox_token'); }

// Restaurar token de sesión previa al cargar
(function _restoreToken() {
  try {
    const saved = FyloxStorage.get('fylox_token');
    if (saved) _fyloxToken = saved;
  } catch(e) { /* silencio */ }
})();

// ── Manejo centralizado de sesión expirada ───────────────────────────────────
function _handleSessionExpired() {
  clearToken();
  if (typeof stopBalancePolling === 'function') stopBalancePolling();

  const hb = document.getElementById('home-balance');
  if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';

  if (typeof FyloxNotification !== 'undefined') {
    FyloxNotification.show({
      icon: '🔒',
      title: 'Sesión expirada',
      sub: 'Iniciá sesión de nuevo',
      amt: '',
      sound: false,
    });
  }

  setTimeout(() => {
    const loginBtn = document.getElementById('pi-login-btn');
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span style="position:relative;z-index:1">Continue with Pi Network →</span>';
      loginBtn.style.background = '';
      loginBtn.style.color = '';
    }
    if (typeof goTo === 'function') goTo('s0');
  }, 1500);
}

// ── Cliente HTTP central ─────────────────────────────────────────────────────
async function apiCall(method, path, body, _isRetry = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (_fyloxToken) headers['Authorization'] = 'Bearer ' + _fyloxToken;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 15000);
  opts.signal = controller.signal;

  try {
    const res  = await fetch(FYLOX_API + path, opts);
    clearTimeout(timeoutId);
    const data = await res.json();

    if (res.status === 401) {
      _handleSessionExpired();
      throw new Error(data.error || 'Sesión expirada');
    }

    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;

  } catch (err) {
    clearTimeout(timeoutId);

    if (!_isRetry && (err.name === 'TypeError' || err.name === 'AbortError')) {
      console.warn('[Fylox API] Red inestable, reintentando:', path);
      await new Promise(r => setTimeout(r, 2000));
      return apiCall(method, path, body, true);
    }

    console.error('[Fylox API]', path, err.message);
    throw err;
  }
}

// ── Upload de imagen — firmado por el backend ────────────────────────────────
//  El frontend NO tiene credenciales de Cloudinary.
//  El backend genera una firma temporal y la devuelve.
//  Docs: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
async function uploadImage(file) {
  // 1. Pedir firma al backend (el backend tiene las credenciales)
  const { signature, timestamp, cloudName, apiKey, folder } =
    await apiCall('POST', '/uploads/sign', {
      folder: 'oracle',
      type:   'image',
    });

  // 2. Subir directamente a Cloudinary con la firma
  const formData = new FormData();
  formData.append('file',       file);
  formData.append('signature',  signature);
  formData.append('timestamp',  timestamp);
  formData.append('api_key',    apiKey);
  formData.append('folder',     folder);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
