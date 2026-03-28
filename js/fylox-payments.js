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
  const qrData = `https://minepi.com/app/fylox-protocol?pay=@${username}`;
  generateQR('qr-receive-img', qrData, 180);
}

// ═══════════════════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════════════════
async function loadUserProfile() {
  try {
    const data = await apiCall('GET', '/user/me');
    const avatarEl = document.getElementById('profile-avatar-initial');
    if (avatarEl) avatarEl.textContent = (data.username || 'P')[0].toUpperCase();
    const txCountEl = document.getElementById('profile-tx-count');
    if (txCountEl) txCountEl.textContent = data.txCount || 0;
    const earnedEl = document.getElementById('profile-earned');
    if (earnedEl) earnedEl.textContent = (data.totalEarned || 0).toFixed(1) + ' π';
    const nexusEl = document.getElementById('profile-nexus-score');
    if (nexusEl) {
      const score = Math.min(999, Math.round(50 + (data.txCount || 0) * 8 + (data.totalEarned || 0) * 1.5));
      nexusEl.textContent = score;
      const arcEl = nexusEl.closest('svg')?.querySelector('circle:nth-child(2)');
      if (arcEl) {
        const offset = Math.round(314 - (score / 999) * 314);
        arcEl.setAttribute('stroke-dashoffset', offset);
      }
    }
  } catch (err) {
    console.warn('[Fylox] No se pudo cargar perfil:', err.message);
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

// ═══════════════════════════════════════════════════
//  POLLING DE SALDO Y NOTIFICACIONES EN TIEMPO REAL
//  Revisa cada 30s si llegaron pi nuevos
// ═══════════════════════════════════════════════════
let _lastKnownBalance  = null;
let _lastKnownTxDate   = null;
let _balancePollTimer  = null;

function startBalancePolling() {
  if (_balancePollTimer) return; // ya corriendo
  _balancePollTimer = setInterval(async () => {
    if (!getToken()) return; // no autenticado

    try {
      // 1. Verificar nuevas transacciones desde la última conocida
      const sinceParam = _lastKnownTxDate
        ? '&since=' + encodeURIComponent(_lastKnownTxDate)
        : '';
      const txData = await apiCall('GET', '/user/transactions?limit=5' + sinceParam);
      const newTxs = txData.transactions || [];

      if (newTxs.length > 0 && _lastKnownTxDate !== null) {
        // Hay transacciones nuevas desde el último check
        newTxs.forEach(tx => {
          if (tx.type === 'received') {
            FyloxNotification.show({
              icon: '📥',
              title: '+' + tx.amount + ' π recibido',
              sub: 'De ' + (tx.fromUsername || 'Pioneer'),
              amt: '+' + tx.amount + ' π',
              sound: true,
            });
          } else if (tx.type === 'reward') {
            const source = tx.rewardSource === 'oracle' ? 'Oracle' : 'Agora';
            FyloxNotification.show({
              icon: tx.rewardSource === 'oracle' ? '🌊' : '🏛️',
              title: '+' + tx.amount + ' π ganado',
              sub: 'Recompensa ' + source,
              amt: '+' + tx.amount + ' π',
              sound: true,
            });
          }
        });

        // Actualizar fecha de la tx más reciente
        _lastKnownTxDate = newTxs[0].createdAt;

        // Actualizar saldo en pantalla
        const newBalance = await fetchBalance();
        if (newBalance !== _lastKnownBalance) {
          _lastKnownBalance = newBalance;
          updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);
        }
      } else if (_lastKnownTxDate === null && newTxs.length > 0) {
        // Primera vez — solo guardar referencia, no notificar
        _lastKnownTxDate = newTxs[0].createdAt;
      } else if (_lastKnownTxDate === null) {
        _lastKnownTxDate = new Date().toISOString();
      }

    } catch (err) {
      console.warn('[Fylox] Polling error:', err.message);
    }
  }, 30000); // cada 30 segundos
  console.log('[Fylox] Balance polling iniciado ✓');
}

function stopBalancePolling() {
  if (_balancePollTimer) {
    clearInterval(_balancePollTimer);
    _balancePollTimer = null;
  }
}

function fyloxSendPayment() {
  const rawAmt = window.SEND_AMT || document.getElementById('s7total')?.textContent.replace('π','').trim() || '0';
  const amt = parseFloat(rawAmt) || 0;
  const to = window.SEND_TO || '@Pioneer';
  if (amt <= 0) return;
  if (!window.Pi) {
    const el = document.getElementById('s8msg');
    if (el) el.textContent = amt + ' π sent to ' + to;
    goTo('s8');
    return;
  }
  Pi.createPayment({
    amount: amt,
    memo: 'Fylox payment to ' + to,
    metadata: { to },
  }, {
    onReadyForServerApproval: async function(paymentId) {
      try {
        await apiCall('POST', '/payments/approve', { paymentId });
      } catch (err) {
        if (err.message && err.message.includes('ya aprobado')) {
          console.warn('[Fylox] Pago ya aprobado — continuando');
        } else {
          console.error('[Fylox] Error aprobando pago:', err.message);
        }
      }
    },
    onReadyForServerCompletion: async function(paymentId, txid) {
      try {
        await apiCall('POST', '/payments/complete', { paymentId, txid });
        const el = document.getElementById('s8msg');
        if (el) el.textContent = amt + ' π sent to ' + to;
        goTo('s8');
        const newBalance = await fetchBalance();
        _lastKnownBalance = newBalance;
        updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);
      } catch (err) {
        console.error('[Fylox] Error completando pago:', err.message);
      }
    },
    onCancel: function(paymentId) {
      console.log('[Fylox] Pago cancelado:', paymentId);
    },
    onError: function(error) {
      console.error('[Fylox] Error Pi SDK:', error);
    },
  });
}

// ═══════════════════════════════════════════════════
//  PI LOGIN
// ═══════════════════════════════════════════════════
async function piLogin() {
  const btn = document.getElementById('pi-login-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="position:relative;z-index:1">Connecting to Pi Network…</span>';
  }

  if (!window.Pi) {
    console.log('[Fylox] Demo mode login');
    updateUIWithUser('joaquin_vera', 100.00);
    _lastKnownBalance = 100.00;
    goTo('s5');
    if (window._pendingPayTo) { setTimeout(() => goTo('s11q'), 600); window._pendingPayTo = null; }
    return;
  }

  try {
    const isSandbox = new URLSearchParams(window.location.search).get('sandbox') === '1';
    Pi.init({ version: '2.0', sandbox: isSandbox });

    const auth = await Pi.authenticate(
      ['payments', 'username', 'wallet_address'],
      async function onIncompletePayment(incompletePayment) {
        if (!incompletePayment) return;
        try {
          await apiCall('POST', '/payments/complete', {
            paymentId: incompletePayment.identifier,
            txid: incompletePayment.transaction?.txid || null,
          });
        } catch (err) {
          await apiCall('POST', '/payments/cancel', { paymentId: incompletePayment.identifier }).catch(() => {});
        }
      }
    );

    window._fyloxUsername = auth.user.username;
    window._fyloxWallet   = auth.user.wallet_address || null;

    if (!window._fyloxWallet && window.Pi.Wallet) {
      try {
        const walletData = await Pi.Wallet.getUserMigratedWalletAddresses();
        if (walletData?.wallets?.length > 0) {
          window._fyloxWallet = walletData.wallets[0].publicKey;
        }
      } catch (wErr) {
        console.warn('[Fylox] No se pudo obtener wallet:', wErr.message);
      }
    }

    await authenticateWithBackend(auth.accessToken, window._fyloxWallet);
    const balance = await fetchBalance();
    _lastKnownBalance = balance;
    updateUIWithUser(auth.user.username, balance);

    // Iniciar polling de saldo y notificaciones
    startBalancePolling();

    goTo('s5');
    if (window._pendingPayTo) { setTimeout(() => goTo('s11q'), 600); window._pendingPayTo = null; }

  } catch (err) {
    console.error('[Fylox] Error de autenticacion:', err.message);
    if (btn) {
      btn.innerHTML = '<span style="position:relative;z-index:1">Error — Reintentar →</span>';
      btn.style.background = 'rgba(255,77,106,.25)';
      btn.style.color = '#FF4D6A';
      btn.disabled = false;
    }
  }
}


// ═══════════════════════════════════════════════════
//  RETIRO A BILLETERA Pi (A2U)
// ═══════════════════════════════════════════════════


// ═══════════════════════════════════════════════════
//  RETIRO A BILLETERA Pi (A2U)
// ═══════════════════════════════════════════════════

async function withdrawToWallet() {
  const balance  = window._fyloxBalance  || 0;
  const username = window._fyloxUsername || 'Pioneer';

  if (balance <= 0) {
    _withdrawShowMsg('s16-withdraw-msg', '⚠️ No tenés saldo disponible para retirar.', 'warn');
    return;
  }
  if (balance < 0.01) {
    _withdrawShowMsg('s16-withdraw-msg', '⚠️ El monto mínimo de retiro es 0.01 π', 'warn');
    return;
  }

  const btns = document.querySelectorAll('[onclick="withdrawToWallet()"]');
  btns.forEach(b => { b.disabled = true; b.innerHTML = '<span style="opacity:.7">⏳ Procesando...</span>'; });

  if (!window.Pi) {
    _withdrawShowMsg('s16-withdraw-msg',
      `✅ [Demo] Se retiraría ${balance.toFixed(2)} π a @${username}.pi`, 'ok');
    btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
    return;
  }

  try {
    Pi.createPayment(
      {
        amount:   balance,
        memo:     `Retiro Fylox → @${username}.pi`,
        metadata: {
          type:          'withdraw',
          walletAddress: window._fyloxWallet || username + '.pi',
        },
      },
      {
        onReadyForServerApproval: async function(paymentId) {
          try {
            await apiCall('POST', '/payments/approve', { paymentId });
          } catch (err) {
            if (!err.message?.includes('ya aprobado')) {
              console.error('[Fylox] Error aprobando retiro:', err.message);
            }
          }
        },

        onReadyForServerCompletion: async function(paymentId, txid) {
          try {
            await apiCall('POST', '/payments/withdraw', { paymentId, txid, amount: balance });

            const newBalance = await fetchBalance();
            _lastKnownBalance = newBalance;
            updateUIWithUser(username, newBalance);

            _withdrawShowMsg('s16-withdraw-msg',
              `✅ ${balance.toFixed(2)} π enviados a tu billetera Pi.`, 'ok');

            if (typeof FyloxNotification !== 'undefined') {
              FyloxNotification.show({
                icon:  '💸',
                title: 'Retiro exitoso',
                sub:   `${balance.toFixed(2)} π → @${username}.pi`,
                amt:   '-' + balance.toFixed(2) + ' π',
                sound: true,
              });
            }

            setTimeout(() => goTo('s5'), 2000);

          } catch (err) {
            console.error('[Fylox] Error completando retiro:', err.message);
            _withdrawShowMsg('s16-withdraw-msg',
              '❌ Error al confirmar el retiro. Contactá soporte.', 'error');
          } finally {
            btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
          }
        },

        onCancel: function(paymentId) {
          console.log('[Fylox] Retiro cancelado:', paymentId);
          _withdrawShowMsg('s16-withdraw-msg', 'Retiro cancelado.', 'warn');
          btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
        },

        onError: function(error, payment) {
          console.error('[Fylox] Error Pi SDK retiro:', error, payment);
          const msg = error?.message || String(error);
          if (msg.includes('not supported') || msg.includes('A2U')) {
            _withdrawShowMsg('s16-withdraw-msg',
              '⚠️ Los retiros A2U requieren aprobación de Pi Network. Contactá soporte.', 'warn');
          } else {
            _withdrawShowMsg('s16-withdraw-msg', '❌ Error Pi Network: ' + msg, 'error');
          }
          btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
        },
      }
    );
  } catch (err) {
    console.error('[Fylox] createPayment excepcion:', err.message);
    _withdrawShowMsg('s16-withdraw-msg', '❌ No se pudo iniciar el retiro: ' + err.message, 'error');
    btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
  }
}

// Muestra mensaje debajo del botón de retiro
function _withdrawShowMsg(elId, texto, tipo) {
  let el = document.getElementById(elId);
  if (!el) {
    el = document.createElement('div');
    el.id = elId;
    const btn = document.querySelector('[onclick="withdrawToWallet()"]');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(el, btn.nextSibling);
  }
  const estilos = {
    ok:    'background:rgba(0,224,144,.12);color:#00E090;border:1px solid rgba(0,224,144,.25)',
    warn:  'background:rgba(255,183,0,.12);color:#FFB700;border:1px solid rgba(255,183,0,.25)',
    error: 'background:rgba(255,70,70,.12);color:#FF4646;border:1px solid rgba(255,70,70,.25)',
  };
  el.style.cssText = 'font-size:13px;text-align:center;padding:10px 14px;border-radius:12px;margin-top:8px;margin-bottom:8px;' + (estilos[tipo] || estilos.warn);
  el.textContent = texto;
  el.style.display = 'block';
  if (tipo !== 'ok') setTimeout(() => { if (el) el.style.display = 'none'; }, 6000);
}
