'use strict';

// ── 0. CONFIGURACIÓN Y UTILIDADES BASE ──────────────────────────────────────
const piPrice = 40; // Precio de referencia para la UI (ajustalo si lo traes de una API)

// Función central para hablar con tu Backend (Render)
async function apiCall(method, endpoint, body = null) {
  const token = localStorage.getItem('fylox_token'); // Asumo que guardás el JWT acá
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  // Asegurate de que esta URL base coincida con tu backend en desarrollo/producción
  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001' 
    : 'https://TU_BACKEND_EN_RENDER.onrender.com'; // <-- CAMBIA ESTO AL SUBIR A PRODUCCIÓN

  const response = await fetch(`${baseUrl}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición al servidor');
  }
  return data;
}

// Función para pedirle el saldo real a la bóveda
async function fetchBalance() {
  try {
    // Ajustá la ruta '/api/user/balance' a la ruta real de tu backend si es distinta
    const res = await apiCall('GET', '/api/user/balance'); 
    return res.balance || 0;
  } catch (error) {
    console.error('[Fylox] Error obteniendo saldo:', error);
    return window._fyloxBalance || 0; // Fallback al último saldo conocido
  }
}

// Tu función original de UI (Intacta para que no se rompa tu diseño)
function updateUIWithUser(username, balance) {
  window._fyloxBalance = balance;
  window._fyloxUsername = username;
  const piid = username + '.pi';
  const balanceUSD = balance * piPrice;
  const balanceFmt = balance.toFixed(2);
  
  const hb = document.getElementById('home-balance');
  if (hb) hb.innerHTML = `${balanceFmt} <span style="font-size:24px;color:var(--c)">π</span>`;
  const hars = document.getElementById('home-ars');
  if (hars) hars.textContent = balanceUSD.toFixed(3);
  const hpid = document.getElementById('home-piid');
  if (hpid) hpid.textContent = piid;
  const hu = document.getElementById('home-username');
  if (hu) hu.textContent = '@' + username;
  const wb = document.getElementById('wallet-balance');
  if (wb) wb.dataset.value = balance;
  const pu = document.getElementById('profile-username');
  if (pu) pu.textContent = '@' + username;
  const ra = document.getElementById('receive-address');
  if (ra) ra.textContent = '@' + username + ' · ' + piid;
  const s3u = document.getElementById('s3-username');
  if (s3u) s3u.textContent = '@' + username + '.pi';
  const s3bu = document.getElementById('s3-back-username');
  if (s3bu) s3bu.textContent = '@' + username + '.pi';
}


// ── 1. FLUJO DE PAGO SEGURO (U2A: Del Pioneer a Fylox) ────────────────────────
async function initiatePiPayment(amount, recipientUsername, memoText = 'Pago en Fylox') {
  try {
    console.log(`[Fylox] Iniciando pago de ${amount} Pi para @${recipientUsername}`);

    Pi.createPayment({
      amount: parseFloat(amount),
      memo: memoText,
      metadata: { to: recipientUsername } 
    }, {
      onReadyForServerApproval: async function(paymentId) {
        console.log('[Fylox] Solicitando aprobación S2S...', paymentId);
        try {
          await apiCall('POST', '/api/payments/approve', { paymentId });
        } catch (err) {
          console.error('[Fylox] Aprobación rechazada:', err);
          throw new Error('Aprobación S2S fallida');
        }
      },
      onReadyForServerCompletion: async function(paymentId, txid) {
        console.log('[Fylox] Solicitando completitud S2S...', paymentId, txid);
        try {
          await apiCall('POST', '/api/payments/complete', { paymentId, txid });
          const newBalance = await fetchBalance();
          updateUIWithUser(window._fyloxUsername, newBalance);
          alert(`✅ Pago exitoso a @${recipientUsername}`);
        } catch (err) {
          console.error('[Fylox] Completitud fallida:', err);
          throw new Error('Completitud S2S fallida');
        }
      },
      onCancel: function(paymentId) {
        console.log('[Fylox] Pago cancelado:', paymentId);
      },
      onError: function(error, payment) {
        console.error('[Fylox] Error Pi SDK:', error, payment);
        alert('❌ Error al procesar el pago.');
      }
    });
  } catch (error) {
    console.error('[Fylox] Error iniciando pago:', error);
  }
}

// ── 2. FLUJO DE RETIRO SEGURO (A2U: De Fylox al Pioneer) ────────────────────
async function withdrawToWallet(amountToWithdraw) {
  const amount = parseFloat(amountToWithdraw);
  if (isNaN(amount) || amount <= 0) return alert('Monto inválido.');
  
  const btns = document.querySelectorAll('[onclick="withdrawToWallet()"]');
  btns.forEach(b => { b.disabled = true; b.innerHTML = '<span class="spinner"></span> Procesando...'; });

  try {
    console.log(`[Fylox] Solicitando retiro de ${amount} Pi...`);
    await apiCall('POST', '/api/payments/withdraw', { amount });
    
    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername, newBalance);
    alert(`✅ Retiro exitoso. ${amount} Pi enviados a tu billetera.`);
  } catch (err) {
    console.error('[Fylox] Error en retiro:', err.message);
    alert(`❌ No se pudo procesar: ${err.message}`);
  } finally {
    btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
  }
}

// ── 3. MITIGACIÓN DE DDOS (Polling optimizado) ──────────────────────────────
let _balancePollTimer = null;
function startBalancePolling() {
  if (_balancePollTimer) clearInterval(_balancePollTimer);
  _balancePollTimer = setInterval(async () => {
    try {
      const newBalance = await fetchBalance();
      if (newBalance !== window._fyloxBalance) {
        updateUIWithUser(window._fyloxUsername, newBalance);
      }
    } catch (e) {
      console.warn('[Fylox] Error polling:', e.message);
    }
  }, 180000); // 3 minutos
}
