// ═══════════════════════════════════════════════════
//  FYLOX API CLIENT - Production Ready
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
    console.error('[Fylox API Error]', path, err.message);
    throw err;
  }
}

// Funciones de acceso rápido
const FyloxAPI = {
    getProfile: () => apiCall('GET', '/auth/me'),
    getActivity: () => apiCall('GET', '/transactions'),
    login: (authData) => apiCall('POST', '/auth/login', { auth: authData }),
    completePayment: (payment) => apiCall('POST', '/payments/complete', { paymentDTO: payment })
};

// ═══════════════════════════════════════════════════
//  FYLOX LANGUAGE ENGINE
// ═══════════════════════════════════════════════════

