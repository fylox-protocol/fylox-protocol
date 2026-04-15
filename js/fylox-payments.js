// ═══════════════════════════════════════════════════
//  FYLOX PAYMENTS — v2
//  - Sin apiCall duplicado (usa fylox-api.js)
//  - Sin alert() — usa FyloxNotification
//  - Sin piPrice hardcodeado — usa getPiPrice()
//  - Sin window.SEND_TO/AMT — usa PaymentState
//  - Validación de monto antes de Pi.createPayment()
//  - Manejo de pagos pendientes (incomplete payments)
// ═══════════════════════════════════════════════════

// ── Actualizar UI con datos del usuario ─────────────
function updateUIWithUser(username, balance) {
  window._fyloxBalance  = balance;
  window._fyloxUsername = username;

  const piid       = username + '.pi';
  const balanceUSD = fmtUSD(balance);
  const balanceFmt = fmtPi(balance);

  const els = {
    'home-balance':    `${balanceFmt} <span style="font-size:24px;color:var(--c)">π</span>`,
    'home-ars':        balanceUSD,
    'home-piid':       piid,
    'home-username':   '@' + username,
    'profile-username':'@' + username,
    'receive-address': '@' + username + ' · ' + piid,
    's3-username':     '@' + username + '.pi',
    's3-back-username':'@' + username + '.pi',
  };

  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'home-balance') el.innerHTML = val;
    else el.textContent = val;
  });

  const wb = document.getElementById('wallet-balance');
  if (wb) wb.dataset.value = balance;
}

// ── Obtener saldo desde el backend ──────────────────
async function fetchBalance() {
  try {
    const res = await apiCall('GET', '/user/balance');
    return res.balance || 0;
  } catch (err) {
    console.error('[Fylox] Error obteniendo saldo:', err);
    return window._fyloxBalance || 0;
  }
}

// ── Cargar perfil completo ───────────────────────────
async function loadUserProfile() {
  try {
    const data = await apiCall('GET', '/user/me');
    if (data.username) updateUIWithUser(data.username, data.balance || 0);

    // Stats de perfil
    const earned = document.getElementById('profile-earned');
    if (earned) earned.textContent = fmtPi(data.totalEarned || 0) + ' π';

    const txCount = document.querySelector('#s17 [data-tx-count]');
    if (txCount) txCount.textContent = data.txCount || 0;
  } catch (err) {
    console.warn('[Fylox] No se pudo cargar perfil:', err.message);
  }
}

// ── 1. FLUJO DE PAGO (U2A: Pioneer → Fylox) ─────────
async function initiatePiPayment(amount, recipientUsername, memoText = 'Pago en Fylox') {
  const parsedAmount = parseFloat(amount);

  // Validaciones antes de llamar al SDK
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Monto inválido',
      sub: 'Ingresá un monto mayor a 0', amt: '', sound: false,
    });
    return;
  }

  if (!recipientUsername || recipientUsername.trim() === '') {
    FyloxNotification.show({
      icon: '⚠️', title: 'Destinatario inválido',
      sub: 'No se especificó a quién enviar', amt: '', sound: false,
    });
    return;
  }

  const balance = window._fyloxBalance || 0;
  if (parsedAmount > balance) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Saldo insuficiente',
      sub: `Tenés ${fmtPi(balance)} π disponibles`, amt: '', sound: false,
    });
    return;
  }

  // Deshabilitar botón durante el proceso
  const confirmBtn = document.querySelector('.scr.show .btn.bp');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Procesando…';
  }

  try {
    Pi.createPayment({
      amount:   parsedAmount,
      memo:     memoText,
      metadata: { to: recipientUsername },
    }, {
      onReadyForServerApproval: async function(paymentId) {
        try {
          await apiCall('POST', '/payments/approve', { paymentId });
        } catch (err) {
          console.error('[Fylox] Aprobación S2S fallida:', err);
          // Registrar el paymentId pendiente para reintentar
          FyloxStorage.set('fylox_pending_payment', paymentId);
          throw err;
        }
      },

      onReadyForServerCompletion: async function(paymentId, txid) {
        try {
          await apiCall('POST', '/payments/complete', { paymentId, txid });

          // Limpiar pago pendiente si existía
          FyloxStorage.remove('fylox_pending_payment');

          const newBalance = await fetchBalance();
          updateUIWithUser(window._fyloxUsername, newBalance);
          PaymentState.clear();

          FyloxNotification.show({
            icon: '✅',
            title: 'Pago enviado',
            sub:   'a @' + recipientUsername,
            amt:   '−' + fmtPi(parsedAmount) + ' π',
            sound: true,
            type:  'receive',
          });
          FyloxRealtime.checkNow();
          goTo('s8');

        } catch (err) {
          console.error('[Fylox] Completitud S2S fallida:', err);
          FyloxNotification.show({
            icon: '❌', title: 'Error al completar',
            sub: 'Contactá soporte con tu ID de pago', amt: '', sound: false,
          });
        }
      },

      onCancel: function(paymentId) {
        console.log('[Fylox] Pago cancelado:', paymentId);
        FyloxNotification.show({
          icon: '↩️', title: 'Pago cancelado',
          sub: 'No se realizó ningún cobro', amt: '', sound: false,
        });
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Confirmar pago';
        }
      },

      onError: function(error, payment) {
        console.error('[Fylox] Error Pi SDK:', error, payment);
        FyloxNotification.show({
          icon: '❌', title: 'Error en el pago',
          sub: 'Intentá de nuevo en unos segundos', amt: '', sound: false,
        });
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Confirmar pago';
        }
      },
    });

  } catch (err) {
    console.error('[Fylox] Error iniciando pago:', err);
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirmar pago';
    }
  }
}

// ── Función llamada desde el botón de confirmar pago ─
function fyloxSendPayment() {
  const { to, amt } = PaymentState.get();

  if (!PaymentState.isValid()) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Datos de pago incompletos',
      sub: 'Volvé a escanear el QR', amt: '', sound: false,
    });
    return;
  }

  initiatePiPayment(amt, to);
}

// ── 2. FLUJO DE RETIRO (A2U: Fylox → Pioneer) ───────
async function withdrawToWallet(amountToWithdraw) {
  const amount = parseFloat(amountToWithdraw);
  if (isNaN(amount) || amount <= 0) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Monto inválido',
      sub: 'Ingresá un monto válido', amt: '', sound: false,
    });
    return;
  }

  const btns = document.querySelectorAll('[onclick*="withdrawToWallet"]');
  btns.forEach(b => { b.disabled = true; b.textContent = 'Procesando…'; });

  try {
    await apiCall('POST', '/payments/withdraw', { amount });
    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername, newBalance);

    FyloxNotification.show({
      icon: '✅',
      title: 'Retiro exitoso',
      sub:   fmtPi(amount) + ' π enviados a tu billetera',
      amt:   '+' + fmtPi(amount) + ' π',
      sound: true,
      type:  'receive',
    });

  } catch (err) {
    console.error('[Fylox] Error en retiro:', err.message);
    FyloxNotification.show({
      icon: '❌', title: 'Error en el retiro',
      sub: err.message || 'Intentá de nuevo', amt: '', sound: false,
    });
  } finally {
    btns.forEach(b => { b.disabled = false; b.textContent = 'Retirar a mi Billetera'; });
  }
}

// ── 3. POLLING DE SALDO ──────────────────────────────
let _balancePollTimer = null;

function startBalancePolling() {
  if (_balancePollTimer) clearInterval(_balancePollTimer);
  _balancePollTimer = setInterval(async () => {
    if (!getToken()) return;
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

function stopBalancePolling() {
  if (_balancePollTimer) {
    clearInterval(_balancePollTimer);
    _balancePollTimer = null;
  }
}
