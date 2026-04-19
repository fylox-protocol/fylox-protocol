// ═══════════════════════════════════════════════════
//  FYLOX HOME — v2
//  - Sin XSS — esc() en todos los datos del servidor
//  - Sin piPrice hardcodeado — usa getPiPrice()
//  - Fecha localizada con fmtDate()
//  - Sin monkey-patch de goTo — usa eventos
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

// ── Render de una fila de transacción ───────────────
function _renderTxRow(tx) {
  const isSent   = tx.type === 'sent' || tx.type === 'withdraw';
  const isReward = ['reward', 'oracle', 'agora'].includes(tx.type);

  const color     = isSent ? 'var(--red)' : 'var(--grn)';
  const bg        = isSent
    ? 'rgba(255,70,70,.07)'
    : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
  const iconColor = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';
  const sign      = isSent ? '−' : '+';

  // esc() en TODOS los valores del servidor
  const label = esc(
    isSent
      ? (tx.toName || tx.toAddress || 'Pago enviado')
      : isReward
        ? (tx.rewardSource?.toUpperCase() || 'Reward')
        : `De @${tx.fromUsername || 'Pioneer'}`
  );

  const icon = isSent
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
    : isReward
      ? `<span style="font-size:16px">⚡</span>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

  const amount = esc(String(tx.amount || 0));
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
  const isSent   = tx.type === 'sent' || tx.type === 'withdraw';
  const isReward = ['reward', 'oracle', 'agora'].includes(tx.type);

  const color  = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';
  const bg     = isSent ? 'rgba(255,70,70,.07)' : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
  const sign   = isSent ? '−' : '+';

  const label = esc(
    isSent
      ? (tx.toName || tx.toAddress || 'Pago enviado')
      : isReward
        ? (tx.rewardSource?.toUpperCase() || 'Reward')
        : `De @${tx.fromUsername || 'Pioneer'}`
  );

  const type  = isSent ? 'Enviado' : isReward ? 'Ganado' : 'Recibido';
  const date  = fmtDate(tx.createdAt);
  const usd   = fmtUSD(tx.amount || 0);
  const amount = esc(String(tx.amount || 0));

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
    const [earnRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=5'),
    ]);

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

      if (txs.length > 0 && recentList) {
        recentList.style.display = 'block';
        if (recentTitle) recentTitle.style.removeProperty('display');
        recentList.innerHTML = txs.slice(0, 3).map(_renderTxRow).join('');
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
    }

    if (txRes.status === 'fulfilled') {
      const txs    = txRes.value.transactions || [];
      const earned = txs
        .filter(t => ['reward', 'oracle', 'agora'].includes(t.type))
        .reduce((s, t) => s + (t.amount || 0), 0);

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
  const username = window._fyloxUsername || 'Pioneer';
  const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  _set('card-holder-name', fullName);
  const last4 = username.slice(-4).toUpperCase().padStart(4, '0');
  _set('card-last4', last4);
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
  const username = window._fyloxUsername || 'Pioneer';
  const qrData   = `fylox://pay?to=@${username}`;
  generateQR('qr-receive-img', qrData, 180);
  const addrEl = document.getElementById('receive-address-box');
  if (addrEl) addrEl.textContent = `@${username} · ${username}.pi`;
}
