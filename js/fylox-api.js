// ═══════════════════════════════════════════════════
//  FYLOX API CLIENT
// ═══════════════════════════════════════════════════

const FYLOX_API = 'https://fylox-backend.onrender.com/api';

let _fyloxToken = null;

function getToken()   { return _fyloxToken; }
function setToken(t)  { _fyloxToken = t; }
function clearToken() { _fyloxToken = null; }

async function apiCall(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (_fyloxToken) headers['Authorization'] = 'Bearer ' + _fyloxToken;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(FYLOX_API + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  } catch (err) {
    console.error('[Fylox API]', path, err.message);
    throw err;
  }
}

async function authenticateWithBackend(piAccessToken, walletAddress) {
  try {
    const data = await apiCall('POST', '/auth/pi', {
      accessToken: piAccessToken,
      walletAddress: walletAddress || null,
    });
    setToken(data.token);
    return data.user;
  } catch (err) {
    console.error('[Fylox] Error autenticando con backend:', err.message);
    throw err;
  }
}

async function fetchBalance() {
  try {
    const data = await apiCall('GET', '/user/balance');
    return data.balance;
  } catch (err) {
    console.warn('[Fylox] No se pudo obtener balance:', err.message);
    return 0;
  }
}
