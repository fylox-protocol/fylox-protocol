// ═══════════════════════════════════════════════════
//  FYLOX HOME — v3
//  - Sin XSS — esc() en todos los datos del servidor
//  - Sin piPrice hardcodeado — usa getPiPrice()
//  - Fecha localizada con fmtDate()
//  - Sin monkey-patch de goTo — usa eventos
//  - FIX: loadHomeScreen ahora actualiza saldo en s5
//  - FIX: tipos de transacción del nuevo backend (user_to_user, received, etc.)
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

// ── Helper para clasificar tipo de transacción ──────
// Soporta tanto los tipos viejos (sent/received) como los nuevos del backend (user_to_user/received/etc.)
function _classifyTx(tx, currentUid) {
  // SENT: el usuario actual envió
  // - 'user_to_user' (nuevo backend, perspectiva del sender)
  // - 'sent' (legacy)
  // - 'withdraw' / 'app_to_user' invertido (no aplica acá)
  // - 'user_to_app' (pago a la pool de Fylox)
  if (
    tx.type === 'sent' ||
    tx.type === 'user_to_user' ||
    tx.type === 'user_to_app' ||
    tx.type === 'withdraw'
  ) {
    return 'sent';
  }

  // RECEIVED: el usuario actual recibió
  // - 'received' (nuevo backend)
  // - 'app_to_user' (retiro acreditado, lo recibe el user)
  if (tx.type === 'received' || tx.type === 'app_to_user') {
    return 'received';
  }

  // REWARD: tareas / recompensas
  if (['reward', 'oracle', 'agora'].includes(tx.type)) {
    return 'reward';
  }

  return 'received'; // default seguro
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

  // esc() en TODOS los valores del servidor
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
  if (!getToken()) return;

  try {
    // ⚡ Cargar TODO en paralelo: balance + earn + tx
    const [meRes, earnRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/me'),
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=5'),
    ]);

    // ── ★ Refrescar saldo del usuario en el s5 ★
    if (meRes.status === 'fulfilled' && meRes.value) {
      const data = meRes.value;
      const balance = parseFloat(data.balance) || 0;
      const username = data.username || window._fyloxUsername || 'Pioneer';

      // Actualizar window state
      window._fyloxBalance = balance;
      window._fyloxUsername = username;
      
      // Si existe la función global updateUIWithUser, usarla (es la canónica)
      if (typeof updateUIWithUser === 'function') {
        updateUIWithUser(username, balance);
      } else {
        // Fallback manual: actualizar directamente los IDs del s5
        const balanceFmt = fmtPi(balance);
        const balanceUSD = fmtUSD(balance);
        _set('home-balance-int', balanceFmt.split('.')[0]);
        _set('home-balance-dec', '.' + (balanceFmt.split('.')[1] || '00'));
        _set('home-ars',         balanceUSD);
        _set('home-piid',        username + '.pi');
        _set('home-username',    '@' + username);
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

      // Soporta ambos contenedores (legacy + premium)
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
  if (!getToken()) return;

  try {
    const [balRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/me'),
      apiCall('GET', '/user/transactions?limit=10'),
    ]);

    if (balRes.status === 'fulfilled') {
      const d = balRes.value;
      _set('wallet-stat-sent',     `${fmtPi(d.totalSent     || 0)} π`);
      _set('wallet-stat-received', `${fmtPi(d.totalReceived || 0)} π`);

      // Refrescar también el saldo principal
      if (typeof updateUIWithUser === 'function' && d.username) {
        updateUIWithUser(d.username, parseFloat(d.balance) || 0);
      }
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
    || FyloxStorage.get('fylox_username') 
    || 'Pioneer';
    
  if (username === 'Pioneer') {
    setTimeout(loadCardScreen, 500);
    return;
  }
  
  const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const last4    = username.slice(-4).toUpperCase().padStart(4, '0');
  
  const nameEl  = document.getElementById('card-holder-name');
  const last4El = document.getElementById('card-last4');
  
  if (nameEl)  nameEl.textContent  = fullName;
  if (last4El) last4El.textContent = last4;
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

function loadReceiveScreen() {
  const username = window._fyloxUsername 
    || FyloxStorage.get('fylox_username') 
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

// ═══════════════════════════════════════════════════
//  S15 CARD — Observer que actualiza al mostrar
// ═══════════════════════════════════════════════════
(function() {
  const s15 = document.getElementById('s15');
  if (!s15) return;
  
  const obs = new MutationObserver(() => {
    if (s15.classList.contains('show')) {
      const username = window._fyloxUsername 
        || FyloxStorage.get('fylox_username');
      
      if (!username) return;
      
      const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const last4    = username.slice(-4).toUpperCase().padStart(4, '0');
      
      const nameEl  = document.getElementById('card-holder-name');
      const last4El = document.getElementById('card-last4');
      
      if (nameEl)  nameEl.textContent  = fullName;
      if (last4El) last4El.textContent = last4;
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
      // Llamar loadHomeScreen para refrescar saldo + tx + earn
      if (typeof loadHomeScreen === 'function') {
        loadHomeScreen();
      }
    }
  });
  
  obs.observe(s5, { attributes: true, attributeFilter: ['class'] });
})();
