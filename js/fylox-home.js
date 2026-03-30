// ═══════════════════════════════════════════════════════════════════════════
//  FYLOX HOME — Carga dinámica de todas las pantallas
//  Elimina todos los valores hardcodeados, reemplaza con datos reales
// ═══════════════════════════════════════════════════════════════════════════

// ── Utilidad: set text de un elemento por ID ────────────────────────────────
function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function _setHTML(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = val;
}

// ── Formatear fecha corta ───────────────────────────────────────────────────
function _fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

// ══════════════════════════════════════════════════════════════════════════
//  S5 — HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════
async function loadHomeScreen() {
  if (!getToken()) return;

  try {
    const [earnRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=5'),
    ]);

    // ── Earn banner
    if (earnRes.status === 'fulfilled') {
      const e = earnRes.value;
      _set('home-earn-total', `+${(e.monthlyEarned || 0).toFixed(1)} π`);
      const active = (e.oracleTasksCount || 0) + (e.agoraVotesCount || 0);
      _set('home-earn-tasks', `ORACLE · NEXUS · AGORA${active > 0 ? ` · ${active} tarea${active !== 1 ? 's' : ''} activa${active !== 1 ? 's' : ''}` : ''}`);
    }

    // ── Recent transactions
    if (txRes.status === 'fulfilled') {
      const txs = txRes.value.transactions || [];
      const recentList  = document.getElementById('home-recent-list');
      const recentTitle = document.getElementById('home-recent-title');

      if (txs.length > 0 && recentList) {
        recentList.style.display = 'block';
        if (recentTitle) recentTitle.style.removeProperty('display');

        recentList.innerHTML = txs.slice(0, 3).map(tx => {
          const isSent   = tx.type === 'sent' || tx.type === 'withdraw';
          const isReward = ['reward','oracle','agora'].includes(tx.type);
          const color    = isSent ? 'var(--red)' : 'var(--grn)';
          const bg       = isSent ? 'rgba(255,70,70,.07)' : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
          const iconColor = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';
          const sign      = isSent ? '−' : '+';
          const label     = isSent
            ? (tx.toName || tx.toAddress || 'Pago enviado')
            : isReward
            ? (tx.rewardSource?.toUpperCase() || 'Reward')
            : `De @${tx.fromUsername || 'Pioneer'}`;
          const icon = isSent
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
            : isReward ? `<span style="font-size:16px">⚡</span>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

          return `<div class="tx">
            <div class="ti" style="background:${bg};color:${iconColor}">${icon}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${label}</div>
              <div style="font-size:11px;color:var(--t2);margin-top:1px">${_fmtDate(tx.createdAt)}</div>
            </div>
            <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">${sign}${tx.amount} π</div>
          </div>`;
        }).join('');
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

// ══════════════════════════════════════════════════════════════════════════
//  S16 — WALLET SCREEN
// ══════════════════════════════════════════════════════════════════════════
async function loadWalletScreen() {
  if (!getToken()) return;

  try {
    const [balRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/me'),
      apiCall('GET', '/user/transactions?limit=10'),
    ]);

    if (balRes.status === 'fulfilled') {
      const d = balRes.value;
      _set('wallet-stat-sent',     `${(d.totalSent     || 0).toFixed(1)} π`);
      _set('wallet-stat-received', `${(d.totalReceived || 0).toFixed(1)} π`);
    }

    if (txRes.status === 'fulfilled') {
      // Earned from rewards
      const txs      = txRes.value.transactions || [];
      const earned   = txs.filter(t => ['reward','oracle','agora'].includes(t.type))
                          .reduce((s, t) => s + t.amount, 0);
      _set('wallet-stat-earned', `${earned.toFixed(1)} π`);

      // Fill dynamic tx list
      const listEl = document.getElementById('wallet-tx-dynamic');
      if (listEl && txs.length > 0) {
        listEl.innerHTML = txs.slice(0, 5).map(tx => {
          const isSent   = tx.type === 'sent' || tx.type === 'withdraw';
          const isReward = ['reward','oracle','agora'].includes(tx.type);
          const color    = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';
          const bg       = isSent ? 'rgba(255,70,70,.07)' : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
          const sign     = isSent ? '−' : '+';
          const label    = isSent
            ? (tx.toName || tx.toAddress || 'Pago enviado')
            : isReward ? (tx.rewardSource?.toUpperCase() || 'Reward')
            : `De @${tx.fromUsername || 'Pioneer'}`;
          const date  = _fmtDate(tx.createdAt);
          const type  = isSent ? 'Enviado' : isReward ? 'Ganado' : 'Recibido';
          const icon  = isSent
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
            : isReward ? `<span style="font-size:16px">⚡</span>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;
          const usd = (tx.amount * (piPrice || 0.34)).toFixed(2);

          return `<div class="tx">
            <div class="ti" style="background:${bg};color:${color}">${icon}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${label}</div>
              <div style="font-size:11px;color:var(--t2);margin-top:1px">${date} · ${type}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">${sign}${tx.amount} π</div>
              <div style="font-size:10px;color:var(--t3);margin-top:1px">≈ $${usd}</div>
            </div>
          </div>`;
        }).join('');
      } else if (listEl) {
        listEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--t3);font-size:13px">Sin transacciones aún.</div>';
      }
    }
  } catch (err) {
    console.warn('[Wallet] Error:', err.message);
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  S15 — CARD SCREEN (nombre e ID de tarjeta)
// ══════════════════════════════════════════════════════════════════════════
function loadCardScreen() {
  const username = window._fyloxUsername || 'Pioneer';
  const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  _set('card-holder-name', fullName);
  // Últimos 4 del username como ID visual
  const last4 = username.slice(-4).toUpperCase().padStart(4, '0');
  _set('card-last4', last4);
}

// ══════════════════════════════════════════════════════════════════════════
//  S17 — PROFILE SCREEN
// ══════════════════════════════════════════════════════════════════════════
function loadProfileScreen() {
  const username = window._fyloxUsername || 'Pioneer';
  const fullName = username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  _set('profile-fullname', fullName);
  // profile-username and profile-earned are filled by loadUserProfile() in fylox-payments.js
}

// ══════════════════════════════════════════════════════════════════════════
//  S12 — TRANSIT CARD
// ══════════════════════════════════════════════════════════════════════════
function loadTransitScreen() {
  const username = window._fyloxUsername || 'Pioneer';
  const last4 = username.slice(-4).toUpperCase().padStart(4, '0');
  _set('transit-card-last4', last4);
  // transit-balance-label is updated when balance loads
}

// ══════════════════════════════════════════════════════════════════════════
//  HOOK goTo — enganchar todas las pantallas
// ══════════════════════════════════════════════════════════════════════════
const _origGoToFyloxHome = typeof goTo === 'function' ? goTo : null;
if (_origGoToFyloxHome) {
  goTo = function(id) {
    _origGoToFyloxHome(id);
    if (id === 's5')  loadHomeScreen();
    if (id === 's15') loadCardScreen();
    if (id === 's12') loadTransitScreen();
    if (id === 's16') loadWalletScreen();
    if (id === 's17') loadProfileScreen();
  };
}
