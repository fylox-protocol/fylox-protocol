// ═══════════════════════════════════════════════════════════════════════════
//  FYLOX HOME — Carga dinámica de s5 (Home)
//  Reemplaza todos los valores hardcodeados con datos reales del Pioneer
// ═══════════════════════════════════════════════════════════════════════════

async function loadHomeScreen() {
  if (!getToken()) return; // no autenticado

  try {
    // Llamadas en paralelo
    const [earnRes, txRes] = await Promise.allSettled([
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=5'),
    ]);

    // ── 1. EARN BANNER ──────────────────────────────────────────────────────
    const earnEl   = document.getElementById('home-earn-total');
    const tasksEl  = document.getElementById('home-earn-tasks');

    if (earnRes.status === 'fulfilled') {
      const e = earnRes.value;
      const total = (e.monthlyEarned || 0).toFixed(1);
      if (earnEl) earnEl.textContent = `+${total} π`;

      // Contar tareas/votos disponibles
      let partes = [];
      if (e.oracleEarned > 0 || e.oracleTasksCount > 0) partes.push('ORACLE');
      partes.push('NEXUS');
      if (e.agoraEarned > 0  || e.agoraVotesCount  > 0) partes.push('AGORA');
      const activeTasks = (e.oracleTasksCount || 0) + (e.agoraVotesCount || 0);
      const label = partes.join(' · ') + (activeTasks > 0 ? ` · ${activeTasks} active task${activeTasks !== 1 ? 's' : ''}` : '');
      if (tasksEl) tasksEl.textContent = label;
    } else {
      if (earnEl)  earnEl.textContent  = '0 π';
      if (tasksEl) tasksEl.textContent = 'ORACLE · NEXUS · AGORA';
    }

    // ── 2. RECENT TRANSACTIONS ──────────────────────────────────────────────
    const recentList  = document.getElementById('home-recent-list');
    const recentTitle = document.getElementById('home-recent-title');

    if (txRes.status === 'fulfilled') {
      const txs = txRes.value.transactions || [];

      if (txs.length > 0 && recentList) {
        recentList.style.display = 'block';
        if (recentTitle) recentTitle.style.display = '';

        recentList.innerHTML = txs.slice(0, 3).map(tx => {
          const isSent   = tx.type === 'sent' || tx.type === 'withdraw';
          const isReward = tx.type === 'reward' || tx.type === 'oracle' || tx.type === 'agora';
          const color    = isSent  ? 'var(--red)' : 'var(--grn)';
          const bg       = isSent  ? 'rgba(255,70,70,.07)' : isReward ? 'rgba(255,183,0,.1)' : 'rgba(0,224,144,.1)';
          const sign     = isSent  ? '−' : '+';
          const iconColor = isSent ? 'var(--red)' : isReward ? 'var(--ylw)' : 'var(--grn)';

          const icon = isSent
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
            : isReward
            ? `<span style="font-size:16px">⚡</span>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

          const label = isSent
            ? (tx.toName || tx.toAddress || 'Pago enviado')
            : isReward
            ? (tx.toName || tx.rewardSource?.toUpperCase() || 'Reward')
            : `De @${tx.fromUsername || 'Pioneer'}`;

          const date = new Date(tx.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

          return `<div class="tx">
            <div class="ti" style="background:${bg};color:${iconColor}">${icon}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${label}</div>
              <div style="font-size:11px;color:var(--t2);margin-top:1px">${date}</div>
            </div>
            <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">${sign}${tx.amount} π</div>
          </div>`;
        }).join('');
      }
    }

    // ── 3. UPCOMING — Basado en las transacciones recientes del Pioneer ─────
    // Por ahora: si no hay txs pendientes, no mostrar nada (sin datos hardcodeados)
    const upcomingList  = document.getElementById('home-upcoming-list');
    const upcomingTitle = document.getElementById('home-upcoming-title');

    // Ocultar upcoming hardcodeado — en el futuro se llenará desde bills API
    if (upcomingList)  upcomingList.innerHTML  = '';
    if (upcomingTitle) upcomingTitle.style.display = 'none';

  } catch (err) {
    console.warn('[Home] Error cargando datos:', err.message);
  }
}

// ── Llamar cuando el Pioneer llega a s5 ──────────────────────────────────────
// Se engancha al polling existente — también se llama en piLogin() que ya
// llama a updateUIWithUser(), así que sólo necesitamos engancharnos al goTo

const _origGoToHome = typeof goTo === 'function' ? goTo : null;
if (_origGoToHome) {
  goTo = function(id) {
    _origGoToHome(id);
    if (id === 's5') loadHomeScreen();
  };
}
