// ═══════════════════════════════════════════════════
//  FYLOX PAYMENTS — v3
//  - Validación completa antes de avanzar a s7
//  - PaymentState se llena correctamente desde s6
//  - USD calculado dinámicamente con piPrice
//  - Bloqueo de auto-pago, saldo insuficiente, monto inválido
// ═══════════════════════════════════════════════════

// ── Actualizar UI con datos del usuario ─────────────
function updateUIWithUser(username, balance) {
  window._fyloxBalance  = balance;
  window._fyloxUsername = username;
  FyloxStorage.set('fylox_username', username);
  
  const piid       = username + '.pi';
  const balanceUSD = fmtUSD(balance);
  const balanceFmt = fmtPi(balance);

  const els = {
    'home-balance-int': balanceFmt.split('.')[0],
    'home-balance-dec': '.' + (balanceFmt.split('.')[1] || '00'),
    'home-ars':        balanceUSD,
    'home-piid':       piid,
    'home-username':   '@' + username,
    'profile-username':'@' + username,
    'receive-address': '@' + username + ' · ' + piid,
    's3-username':     '@' + username + '.pi',
    's3-back-username':'@' + username + '.pi',
    'card-holder-name': username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    'card-last4':       username.slice(-4).toUpperCase().padStart(4, '0'),
  };
  

  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'home-balance') el.innerHTML = val;
    else el.textContent = val;
  });

  const wb = document.getElementById('wallet-balance');
  if (wb) wb.dataset.value = balance;
  // Regenerar QR de Receive con el username correcto
  const qrEl = document.getElementById('qr-receive-img');
  if (qrEl) {
    qrEl.innerHTML = '';
    if (typeof generateQR === 'function') {
      generateQR('qr-receive-img', `fylox://pay?to=@${username}`, 180);
    }
  }
  const addrBox = document.getElementById('receive-address');
  if (addrBox) addrBox.textContent = `@${username} · ${username}.pi`;
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

    const earned = document.getElementById('profile-earned');
    if (earned) earned.textContent = fmtPi(data.totalEarned || 0) + ' π';

    const txCount = document.querySelector('#s17 [data-tx-count]');
    if (txCount) txCount.textContent = data.txCount || 0;
  } catch (err) {
    console.warn('[Fylox] No se pudo cargar perfil:', err.message);
  }
}

// ═══════════════════════════════════════════════════
// ── VALIDACIÓN DE PAGO ANTES DE AVANZAR A s7 ────────
// ═══════════════════════════════════════════════════
function fyloxValidateAndContinue() {
  // 1. Leer destinatario del input
  const inputEl = document.getElementById('send-to-input');
  let recipient = (inputEl && inputEl.value || '').trim();
  // Quitar @ si lo puso, quitar .pi si lo puso
  recipient = recipient.replace(/^@/, '').replace(/\.pi$/i, '').toLowerCase();

  // 2. Leer monto del teclado (variable global kval del index.html)
  let amountStr = (typeof kval !== 'undefined' ? kval : '0') || '0';
  // Limpiar trailing dot ("5." → "5")
  if (amountStr.endsWith('.')) amountStr = amountStr.slice(0, -1);
  const amount = parseFloat(amountStr);

  // ── Validación 1: Destinatario vacío ──
  if (!recipient || recipient.length < 2) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Destinatario inválido',
      sub: 'Ingresá un usuario Pi válido', amt: '', sound: false,
    });
    return;
  }

  // ── Validación 2: Solo letras, números y guiones bajos ──
  if (!/^[a-z0-9_]+$/i.test(recipient)) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Usuario inválido',
      sub: 'Solo letras, números y guiones bajos', amt: '', sound: false,
    });
    return;
  }

  // ── Validación 3: Auto-pago ──
  const myUsername = (window._fyloxUsername || '').toLowerCase();
  if (myUsername && recipient.toLowerCase() === myUsername) {
    FyloxNotification.show({
      icon: '⚠️', title: 'No podés enviarte Pi a vos mismo',
      sub: 'Elegí otro destinatario', amt: '', sound: false,
    });
    return;
  }

  // ── Validación 4: Monto válido ──
  if (isNaN(amount) || amount <= 0) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Monto inválido',
      sub: 'Ingresá un monto mayor a 0', amt: '', sound: false,
    });
    return;
  }

  // ── Validación 5: Máximo 7 decimales (Pi Network limit) ──
  const decimals = (amountStr.split('.')[1] || '').length;
  if (decimals > 7) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Demasiados decimales',
      sub: 'Pi Network soporta máximo 7 decimales', amt: '', sound: false,
    });
    return;
  }

  // ── Validación 6: Saldo suficiente ──
  const balance = window._fyloxBalance || 0;
  if (amount > balance) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Saldo insuficiente',
      sub: `Tenés ${fmtPi(balance)} π disponibles`, amt: '', sound: false,
    });
    return;
  }

  // ── Validación 7: Monto razonable (anti-typo) ──
  if (amount > 1000000) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Monto demasiado alto',
      sub: 'Verificá el monto antes de enviar', amt: '', sound: false,
    });
    return;
  }

  // ✅ Todas las validaciones pasaron — guardar en PaymentState
  PaymentState.set({ to: recipient, amt: amount });
  window.SEND_TO = '@' + recipient;

  // Pintar pantalla s7 con datos correctos
  const piPrice = (typeof getPiPrice === 'function') ? getPiPrice() : 0.4;
  const usdValue = (amount * piPrice).toFixed(2);

  const s7amt = document.getElementById('s7amt');
  const s7total = document.getElementById('s7total');
  const s7to = document.getElementById('s7to');
  const s7usd = document.getElementById('s7usd');

  if (s7amt) s7amt.innerHTML = fmtPi(amount) + ' <span style="font-size:26px;color:var(--c)">π</span>';
  if (s7total) s7total.textContent = fmtPi(amount) + ' π';
  if (s7to) s7to.textContent = '@' + recipient + '.pi';
  if (s7usd) s7usd.textContent = '≈ $' + usdValue + ' USD';

  goTo('s7');
}

// ── 1. FLUJO DE PAGO (U2A: Pioneer → Fylox) ─────────
async function initiatePiPayment(amount, recipientUsername, memoText = 'Pago en Fylox') {
  const parsedAmount = parseFloat(amount);

  // Validaciones defensivas (ya validadas en s6)
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
          FyloxStorage.set('fylox_pending_payment', paymentId);
          throw err;
        }
      },

      onReadyForServerCompletion: async function(paymentId, txid) {
        try {
          await apiCall('POST', '/payments/complete', { paymentId, txid });

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
      sub: 'Volvé a iniciar el envío', amt: '', sound: false,
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
