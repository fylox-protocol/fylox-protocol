// ═══════════════════════════════════════════════════
//  FYLOX HOME — v4
//  - iOS-safe: pinta saldo directamente sin depender
//    de updateUIWithUser (cross-file binding).
//  - Sin XSS — esc() en todos los datos del servidor
//  - Soporta tipos viejos y nuevos del backend
// ═══════════════════════════════════════════════════

// ── Utilidades internas ──────────────────────────────
function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _setHTML(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = val;
}

// ── Helper: pintar saldo en s5 (función inline, sin deps) ──
function _paintHomeBalance(username, balance) {
  const safeBalance = parseFloat(balance) || 0;
  const safeUser    = username || 'Pioneer';

  // Persistir state global
  window._fyloxBalance  = safeBalance;
  window._fyloxUsername = safeUser;
  if (typeof FyloxStorage !== 'undefined' && FyloxStorage.set) {
    try { FyloxStorage.set('fylox_username', safeUser); } catch (e) {}
  }

  // Formato del balance
  let balanceFmt;
  if (typeof fmtPi === 'function') {
    balanceFmt = fmtPi(safeBalance);
  } else {
    balanceFmt = safeBalance.toFixed(2);
  }

  const parts   = balanceFmt.split('.');
  const intPart = parts[0] || '0';
  const decPart = '.' + (parts[1] || '00');

  // USD format
  let usdStr = '0.00';
  if (typeof fmtUSD === 'function') {
    usdStr = fmtUSD(safeBalance);
  }

  // Pintar IDs CRÍTICOS del s5
  _set('home-balance-int', intPart);
  _set('home-balance-dec', decPart);
  _set('home-ars',         '≈ ' + usdStr + ' USD');
  _set('home-piid',        safeUser + '.pi');
  _set('home-username',    '@' + safeUser);

  // Compatibilidad con HTML viejo (un solo span)
  _set('home-balance', balanceFmt);

  // Profile y otros lugares donde aparece
  _set('profile-username', '@' + safeUser);
  _set('s3-username',      '@' + safeUser + '.pi');
  _set('s3-back-username', '@' + safeUser + '.pi');
  _set('receive-address',  '@' + safeUser + ' · ' + safeUser + '.pi');
  _set('card-holder-name', safeUser.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  _set('card-last4',       safeUser.slice(-4).toUpperCase().padStart(4, '0'));

  // Wallet balance dataset
  const wb = document.getElementById('wallet-balance');
  if (wb) wb.dataset.value = safeBalance;
}

// ── Helper para clasificar tipo de transacción ──────
function _classifyTx(tx) {
  if (
    tx.type === 'sent' ||
    tx.type === 'user_to_user' ||
    tx.type === 'user_to_app' ||
    tx.type === 'withdraw'
  ) {
    return 'sent';
  }
  if (tx.type === 'received' || tx.type === 'app_to_user') {
    return 'received';
  }
  if (['reward', 'oracle', 'agora'].includes(tx.type)) {
    return 'reward';
  }
  return 'received';
}

// ── Render de una fila de transacción ───────────────
function _renderTxRow(tx) {
  const kind = _classifyTx(tx);
  const isSent   = kind === 'sent';
  const isReward = kind === 'reward';

  const color     = isSent ? 'var(--red)' : 'var(--grn)';
  const bg        = isSent
    ? 'rgba(255,70,70,.07)'
    : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
  const iconColor = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';
  const sign      = isSent ? '−' : '+';

  const label = esc(
    isSent
      ? (tx.toUsername ? `A @${tx.toUsername}` : (tx.toName || tx.toAddress || 'Pago enviado'))
      : isReward
        ? (tx.rewardSource?.toUpperCase() || 'Reward')
        : `De @${tx.fromUsername || 'Pioneer'}`
  );

  const icon = isSent
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
    : isReward
      ? `<span style="font-size:16px">⚡</span>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

  const amount = esc(fmtPi(parseFloat(tx.amount?.toString() || tx.amount || 0)));
  const date   = fmtDate(tx.createdAt);

  return `<div class="tx">
    <div class="ti" style="background:${bg};color:${iconColor}">${icon}</div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:600">${label}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:1px">${esc(date)}</div>
    </div>
    <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">${sign}${amount} π</div>
  </div>`;
}

// ── Render de fila para wallet (con USD) ────────────
function _renderWalletTxRow(tx) {
  const kind = _classifyTx(tx);
  const isSent   = kind === 'sent';
  const isReward = kind === 'reward';

  const color  = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';
  const bg     = isSent ? 'rgba(255,70,70,.07)' : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
  const sign   = isSent ? '−' : '+';

  const label = esc(
    isSent
      ? (tx.toUsername ? `A @${tx.toUsername}` : (tx.toName || tx.toAddress || 'Pago enviado'))
      : isReward
        ? (tx.rewardSource?.toUpperCase() || 'Reward')
        : `De @${tx.fromUsername || 'Pioneer'}`
  );

  const type  = isSent ? 'Enviado' : isReward ? 'Ganado' : 'Recibido';
  const date  = fmtDate(tx.createdAt);
  const usd   = fmtUSD(tx.amount || 0);
  const amount = esc(fmtPi(parseFloat(tx.amount?.toString() || tx.amount || 0)));

  const icon = isSent
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
    : isReward
      ? `<span style="font-size:16px">⚡</span>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

  return `<div class="tx">
    <div class="ti" style="background:${bg};color:${color}">${icon}</div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:600">${label}</div>
      <div style="font-size:11px;color:var(--t2);margin-top:1px">${esc(date)} · ${esc(type)}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">${sign}${amount} π</div>
      <div style="font-size:10px;color:var(--t3);margin-top:1px">≈ $${esc(usd)}</div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════
//  S5 — HOME SCREEN
// ══════════════════════════════════════════════════════
async function loadHomeScreen() {
  if (typeof getToken !== 'function' || !getToken()) return;

  try {
    // ⚡ Cargar TODO en paralelo: balance + earn + tx
    const [meRes, earnRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/me'),
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=5'),
    ]);

    // ── ★ Pintar saldo del usuario en el s5 (DIRECTO, sin updateUIWithUser) ★
    if (meRes.status === 'fulfilled' && meRes.value) {
      const data = meRes.value;
      
      // Soportar Decimal128 serializado, number plain, o string
      let balance = 0;
      if (data.balance != null) {
        try {
          balance = parseFloat(
            typeof data.balance === 'object' && data.balance.$numberDecimal
              ? data.balance.$numberDecimal
              : data.balance.toString()
          );
        } catch (e) {
          balance = 0;
        }
      }
      
      const username = data.username || window._fyloxUsername || 'Pioneer';
      
      // Pintar directamente (no depende de updateUIWithUser de otro archivo)
      _paintHomeBalance(username, balance);
      
      // Si existe updateUIWithUser, también la llamamos para pintar otros lugares (QR, etc.)
      if (typeof updateUIWithUser === 'function') {
        try { updateUIWithUser(username, balance); } catch (e) {
          console.warn('[Home] updateUIWithUser falló:', e.message);
        }
      }
    }

    // ── Earn banner
    if (earnRes.status === 'fulfilled') {
      const e      = earnRes.value;
      const active = (e.oracleTasksCount || 0) + (e.agoraVotesCount || 0);
      _set('home-earn-total', `+${fmtPi(e.monthlyEarned || 0)} π`);
      _set('home-earn-tasks',
        `ORACLE · NEXUS · AGORA${active > 0
          ? ` · ${active} tarea${active !== 1 ? 's' : ''} activa${active !== 1 ? 's' : ''}`
          : ''}`
      );
    }

    // ── Transacciones recientes
    if (txRes.status === 'fulfilled') {
      const txs         = txRes.value.transactions || [];
      const recentList  = document.getElementById('home-recent-list');
      const recentTitle = document.getElementById('home-recent-title');
      const homeActivity = document.getElementById('home-activity');

      const targetList = recentList || homeActivity;

      if (txs.length > 0 && targetList) {
        targetList.style.display = 'block';
        if (recentTitle) recentTitle.style.removeProperty('display');
        targetList.innerHTML = txs.slice(0, 3).map(_renderTxRow).join('');
      } else if (targetList) {
        targetList.innerHTML = '<div style="padding:18px;text-align:center;color:var(--t3);font-size:12px">Sin movimientos aún</div>';
      }
    }

    // ── Upcoming: vacío hasta que haya bills API
    const upcomingList  = document.getElementById('home-upcoming-list');
    const upcomingTitle = document.getElementById('home-upcoming-title');
    if (upcomingList)  upcomingList.innerHTML = '';
    if (upcomingTitle) upcomingTitle.style.display = 'none';

  } catch (err) {
    console.warn('[Home] Error:', err.message);
  }
}

// ══════════════════════════════════════════════════════
//  S16 — WALLET SCREEN
// ══════════════════════════════════════════════════════
async function loadWalletScreen() {
  if (typeof getToken !== 'function' || !getToken()) return;

  try {
    const [balRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/me'),
      apiCall('GET', '/user/transactions?limit=10'),
    ]);

    if (balRes.status === 'fulfilled') {
      const d = balRes.value;
      _set('wallet-stat-sent',     `${fmtPi(d.totalSent     || 0)} π`);
      _set('wallet-stat-received', `${fmtPi(d.totalReceived || 0)} π`);

      // También pintar saldo principal acá por si entra directo a s16
      let balance = 0;
      if (d.balance != null) {
        try {
          balance = parseFloat(
            typeof d.balance === 'object' && d.balance.$numberDecimal
              ? d.balance.$numberDecimal
              : d.balance.toString()
          );
        } catch (e) { balance = 0; }
      }
      if (d.username) _paintHomeBalance(d.username, balance);
    }

    if (txRes.status === 'fulfilled') {
      const txs    = txRes.value.transactions || [];
      const earned = txs
        .filter(t => ['reward', 'oracle', 'agora'].includes(t.type))
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

      _set('wallet-stat-earned', `${fmtPi(earned)} π`);

      const listEl = document.getElementById('wallet-tx-dynamic');
      if (listEl) {
        listEl.innerHTML = txs.length > 0
          ? txs.slice(0, 5).map(_renderWalletTxRow).join('')
          : '<div style="padding:24px;text-align:center;color:var(--t3);font-size:13px">Sin transacciones aún.</div>';
      }
    }

  } catch (err) {
    console.warn('[Wallet] Error:', err.message);
  }
}

// ══════════════════════════════════════════════════════
//  S15 — CARD SCREEN
// ══════════════════════════════════════════════════════
function loadCardScreen() {
  const username = window._fyloxUsername 
    || (typeof FyloxStorage !== 'undefined' ? FyloxStorage.get('fylox_username') : null)
    || 'Pioneer';
    
  if (username === 'Pioneer') {
    setTimeout(loadCardScreen, 500);
    return;
  }
  
  const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const last4    = username.slice(-4).toUpperCase().padStart(4, '0');
  
  _set('card-holder-name', fullName);
  _set('card-last4',       last4);
}

// ══════════════════════════════════════════════════════
//  S17 — PROFILE SCREEN
// ══════════════════════════════════════════════════════
function loadProfileScreen() {
  const username = window._fyloxUsername || 'Pioneer';
  const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  _set('profile-fullname', fullName);
}

// ══════════════════════════════════════════════════════
//  S12 — TRANSIT CARD
// ══════════════════════════════════════════════════════
function loadTransitScreen() {
  const username = window._fyloxUsername || 'Pioneer';
  const last4    = username.slice(-4).toUpperCase().padStart(4, '0');
  _set('transit-card-last4', last4);
}

function loadReceiveScreen() {
  const username = window._fyloxUsername 
    || (typeof FyloxStorage !== 'undefined' ? FyloxStorage.get('fylox_username') : null)
    || 'Pioneer';

  const qrEl = document.getElementById('qr-receive-img');
  if (qrEl) {
    qrEl.innerHTML = '';
    if (typeof generateQR === 'function') {
      generateQR('qr-receive-img', `fylox://pay?to=@${username}`, 180);
    }
  }

  const addrEl = document.getElementById('receive-address');
  if (addrEl) addrEl.textContent = `@${username} · ${username}.pi`;
}

// ══════════════════════════════════════════════════════
//  SISTEMA DE EVENTOS 
// ══════════════════════════════════════════════════════
document.addEventListener('fylox:screen', (e) => {
  const id = e.detail?.id;
  if (!id) return;
  if (id === 's5')  loadHomeScreen();
  if (id === 's15') loadCardScreen();
  if (id === 's12') loadTransitScreen();
  if (id === 's16') loadWalletScreen();
  if (id === 's17') loadProfileScreen();
  if (id === 's9')  loadReceiveScreen();
});

// ═══════════════════════════════════════════════════
//  S15 CARD — Observer que actualiza al mostrar
// ═══════════════════════════════════════════════════
(function() {
  const s15 = document.getElementById('s15');
  if (!s15) return;
  
  const obs = new MutationObserver(() => {
    if (s15.classList.contains('show')) {
      const username = window._fyloxUsername 
        || (typeof FyloxStorage !== 'undefined' ? FyloxStorage.get('fylox_username') : null);
      
      if (!username) return;
      
      const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const last4    = username.slice(-4).toUpperCase().padStart(4, '0');
      
      _set('card-holder-name', fullName);
      _set('card-last4',       last4);
    }
  });
  
  obs.observe(s15, { attributes: true, attributeFilter: ['class'] });
})();

// ═══════════════════════════════════════════════════
//  S5 HOME — Observer que recarga cada vez que entra
// ═══════════════════════════════════════════════════
(function() {
  const s5 = document.getElementById('s5');
  if (!s5) return;
  
  const obs = new MutationObserver(() => {
    if (s5.classList.contains('show')) {
      if (typeof loadHomeScreen === 'function') {
        loadHomeScreen();
      }
    }
  });
  
  obs.observe(s5, { attributes: true, attributeFilter: ['class'] });
})();
