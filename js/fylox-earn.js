// ═══════════════════════════════════════════════════
//  FYLOX EARN ENGINE — Oracle & Agora live data
//  Connects s22 (Oracle) and s24 (Agora) to backend
// ═══════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
//  ORACLE
// ─────────────────────────────────────────────────────────────────────────────

let _oracleTasks      = [];
let _activeTaskId     = null;
let _oracleTimerLoop  = null;

async function loadOracleTasks() {
  const container = document.getElementById('oracle-tasks-container');
  if (!container) return;

  // Show skeleton while loading
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[1,2].map(() => `
        <div style="background:var(--cd);border-radius:16px;padding:16px;animation:pulse 1.5s ease infinite">
          <div style="height:14px;background:var(--b);border-radius:6px;width:60%;margin-bottom:10px"></div>
          <div style="height:10px;background:var(--b);border-radius:6px;width:40%"></div>
        </div>
      `).join('')}
    </div>`;

  try {
    const data = await apiCall('GET', '/oracle/tasks');
    _oracleTasks = data.tasks || [];

    if (_oracleTasks.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px 0;color:var(--t3)">
          <div style="font-size:32px;margin-bottom:10px">🔭</div>
          <div style="font-size:14px">No active tasks right now</div>
          <div style="font-size:12px;margin-top:4px">Check back soon</div>
        </div>`;
      return;
    }

    renderOracleTasks(_oracleTasks);

  } catch (err) {
    console.error('[Oracle] Error loading tasks:', err.message);
    container.innerHTML = `
      <div style="text-align:center;padding:24px 0;color:var(--t3)">
        <div style="font-size:12px">Could not load tasks. Tap to retry.</div>
        <button class="btn" style="margin-top:12px;padding:10px 20px;font-size:13px" onclick="loadOracleTasks()">Retry</button>
      </div>`;
  }
}

function renderOracleTasks(tasks) {
  const container = document.getElementById('oracle-tasks-container');
  if (!container) return;

  container.innerHTML = tasks.map((task, i) => {
    const msLeft      = new Date(task.expiresAt) - Date.now();
    const timeLabel   = formatTimeLeft(msLeft);
    const isCompleted = task.alreadySubmitted;
    const isFirst     = i === 0;

    return `
      <div class="task-card ${isFirst ? 'mb16' : ''}" id="oracle-task-${task.id}" style="${isCompleted ? 'opacity:.6' : ''}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-family:var(--fd);font-weight:700;font-size:15px;line-height:1.3;margin-bottom:6px">${task.title}</div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${isCompleted
                ? `<div class="pill-live" style="background:rgba(0,224,144,.1);border-color:var(--grn)"><div class="pill-dot" style="background:var(--grn)"></div><span style="color:var(--grn)">Submitted</span></div>`
                : `<div class="pill-live"><div class="pill-dot"></div><span>Live</span></div>`
              }
              ${task.location ? `<div class="tag tag-c">${task.location}</div>` : ''}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px">
            <div style="font-family:var(--fd);font-weight:800;font-size:22px;color:var(--c);letter-spacing:-.5px">+${task.reward} π</div>
            <div style="font-size:11px;color:var(--ylw);font-weight:600;margin-top:4px;font-family:var(--fm)" data-expires="${task.expiresAt}">⏱ ${timeLabel}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="background:var(--earn-stat-bg);border-radius:10px;padding:8px;text-align:center">
            <div style="font-size:11px;color:var(--t3)">Confirmed</div>
            <div style="font-size:13px;font-weight:700;color:var(--c);margin-top:3px">${task.confirmedBy}/${task.requiredConfirmations}</div>
          </div>
          <div style="background:var(--earn-stat-bg);border-radius:10px;padding:8px;text-align:center">
            <div style="font-size:11px;color:var(--t3)">Reward</div>
            <div style="font-size:13px;font-weight:700;color:var(--c);margin-top:3px">${task.reward} π</div>
          </div>
        </div>

        <div style="font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:14px">${task.description}</div>

        ${isCompleted
          ? `<div style="background:rgba(0,224,144,.08);border:1px solid rgba(0,224,144,.2);border-radius:12px;padding:12px;text-align:center;font-size:13px;color:var(--grn);font-weight:600">✓ Response submitted — awaiting consensus</div>`
          : `<button class="btn bp" style="font-size:14px;padding:13px" onclick="startOracleTask('${task.id}')">Accept task →</button>`
        }
      </div>`;
  }).join('');

  // Start countdown timers
  startOracleTimers();
}

function startOracleTimers() {
  if (_oracleTimerLoop) clearInterval(_oracleTimerLoop);
  _oracleTimerLoop = setInterval(() => {
    document.querySelectorAll('[data-expires]').forEach(el => {
      const ms = new Date(el.dataset.expires) - Date.now();
      el.textContent = ms > 0 ? `⏱ ${formatTimeLeft(ms)}` : '⏱ Expired';
    });
  }, 30000);
}

function formatTimeLeft(ms) {
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0)  return `${h}h ${m}m`;
  return `${m}m`;
}

async function startOracleTask(taskId) {
  _activeTaskId = taskId;
  const task = _oracleTasks.find(t => t.id === taskId);
  if (!task) return;

  try {
    await apiCall('POST', `/oracle/tasks/${taskId}/accept`);
  } catch (err) {
    // Already accepted is fine — continue to submission screen
    if (!err.message?.includes('Ya completaste')) {
      console.warn('[Oracle] Accept error:', err.message);
    }
  }

  // Populate submission screen
  const titleEl = document.getElementById('oracle-submit-title');
  const rewardEl = document.getElementById('oracle-submit-reward');
  const descEl  = document.getElementById('oracle-submit-desc');
  if (titleEl)  titleEl.textContent = task.title;
  if (rewardEl) rewardEl.textContent = `+${task.reward} π`;
  if (descEl)   descEl.textContent   = task.description;

  goTo('s22b');

  // Wire up char counter
  const answerInput = document.getElementById('oracle-answer');
  const charCount   = document.getElementById('oracle-char-count');
  if (answerInput && charCount) {
    answerInput.value = '';
    charCount.textContent = '0';
    answerInput.oninput = () => {
      charCount.textContent = answerInput.value.length;
    };
  }
}

// ── Foto seleccionada por el Pioneer ─────────────────────────────────────────
let _oraclePhotoFile = null;
let _oraclePhotoUrl  = null;

function oracleSelectPhoto() {
  const input = document.getElementById('oracle-photo-input');
  if (input) input.click();
}

function oraclePhotoChanged(input) {
  const file = input.files?.[0];
  if (!file) return;

  // Validar tamaño máximo 8MB
  if (file.size > 8 * 1024 * 1024) {
    alert('La imagen no puede superar 8MB.');
    return;
  }

  _oraclePhotoFile = file;
  _oraclePhotoUrl  = null;

  // Preview inmediato
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('oracle-photo-preview');
    const placeholder = document.getElementById('oracle-photo-placeholder');
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    const label = document.getElementById('oracle-photo-label');
    if (label) label.textContent = '📷 Photo attached — tap to change';
  };
  reader.readAsDataURL(file);
}

async function submitOracleTask() {
  if (!_activeTaskId) return;

  const answerEl = document.getElementById('oracle-answer');
  const answer   = answerEl?.value?.trim();
  const btn      = document.getElementById('oracle-submit-btn');

  if (!answer) {
    answerEl?.focus();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite"></span>Submitting…</span>';
  }

  try {
    // Subir foto si hay una seleccionada
    let photoUrl = null;
    if (_oraclePhotoFile) {
      if (btn) btn.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite"></span>Uploading photo…</span>';
      photoUrl = await uploadImage(_oraclePhotoFile);
      _oraclePhotoUrl = photoUrl;
    }

    const result = await apiCall('POST', `/oracle/tasks/${_activeTaskId}/submit`, {
      answer,
      photoUrl: photoUrl || null,
    });

    // Limpiar foto para próxima tarea
    _oraclePhotoFile = null;
    _oraclePhotoUrl  = null;

    // Actualizar saldo
    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);

    // Notificación si hay recompensa inmediata
    if (result.consensusReached && typeof FyloxNotification !== 'undefined') {
      FyloxNotification.show({
        icon: '🌊',
        title: '+' + result.reward + ' π ganado',
        sub: 'Recompensa Oracle acreditada',
        amt: '+' + result.reward + ' π',
        sound: true,
        type: 'reward',
      });
    }

    const msgEl = document.getElementById('oracle-success-msg');
    if (msgEl) msgEl.textContent = result.message;
    goTo('s22c');

    setTimeout(loadOracleTasks, 1000);

  } catch (err) {
    console.error('[Oracle] Submit error:', err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Submit verification →';
      btn.style.background = 'rgba(255,77,106,.2)';
      btn.style.color = '#FF4D6A';
      setTimeout(() => { btn.style.background = ''; btn.style.color = ''; }, 2000);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  AGORA
// ─────────────────────────────────────────────────────────────────────────────

let _agoraProposals   = [];
let _selectedVotes    = {};  // proposalId → optionId
let _agoraTimerLoop   = null;

async function loadAgoraProposals() {
  const container = document.getElementById('agora-proposals-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[1,2].map(() => `
        <div style="background:var(--cd);border-radius:16px;padding:16px;animation:pulse 1.5s ease infinite">
          <div style="height:12px;background:var(--b);border-radius:6px;width:35%;margin-bottom:12px"></div>
          <div style="height:14px;background:var(--b);border-radius:6px;width:85%;margin-bottom:8px"></div>
          <div style="height:10px;background:var(--b);border-radius:6px;width:55%"></div>
        </div>
      `).join('')}
    </div>`;

  try {
    const data = await apiCall('GET', '/agora/proposals');
    _agoraProposals = data.proposals || [];

    // Update stats from real data
    const totalVotesEl = document.getElementById('agora-total-votes');
    if (totalVotesEl) {
      const sum = _agoraProposals.reduce((acc, p) => acc + (p.totalVotes || 0), 0);
      totalVotesEl.textContent = sum.toLocaleString('en-US');
    }

    if (_agoraProposals.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px 0;color:var(--t3)">
          <div style="font-size:32px;margin-bottom:10px">🏛️</div>
          <div style="font-size:14px">No active proposals</div>
          <div style="font-size:12px;margin-top:4px">Check back soon</div>
        </div>`;
      return;
    }

    renderAgoraProposals(_agoraProposals);

  } catch (err) {
    console.error('[Agora] Error loading proposals:', err.message);
    container.innerHTML = `
      <div style="text-align:center;padding:24px 0;color:var(--t3)">
        <div style="font-size:12px">Could not load proposals. Tap to retry.</div>
        <button class="btn" style="margin-top:12px;padding:10px 20px;font-size:13px" onclick="loadAgoraProposals()">Retry</button>
      </div>`;
  }
}

function renderAgoraProposals(proposals) {
  const container = document.getElementById('agora-proposals-container');
  if (!container) return;

  container.innerHTML = proposals.map((proposal, i) => {
    const msLeft      = new Date(proposal.expiresAt) - Date.now();
    const timeLabel   = formatTimeLeft(msLeft);
    const hasVoted    = proposal.alreadyVoted;
    const selectedOpt = _selectedVotes[proposal.id];

    return `
      <div class="vote-card mb16" id="agora-proposal-${proposal.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-size:10px;font-weight:700;color:var(--grn);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">${proposal.company} · ${proposal.model}</div>
            <div style="font-family:var(--fd);font-weight:700;font-size:14px;line-height:1.4">${proposal.question}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px">
            <div style="font-family:var(--fd);font-weight:800;font-size:18px;color:var(--grn)">+${proposal.reward} π</div>
            <div class="pill-live" style="margin-top:4px">
              <div class="pill-dot"></div>
              <span data-expires="${proposal.expiresAt}">${timeLabel}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px" id="vote-opts-${proposal.id}">
          ${proposal.options.map(opt => `
            <button
              class="vote-opt ${selectedOpt === opt.id ? 'vsel' : ''}"
              onclick="${hasVoted ? '' : `selVoteReal('${proposal.id}', '${opt.id}', this)`}"
              style="${hasVoted && opt.id !== selectedOpt ? 'opacity:.5' : ''}"
            >
              ${hasVoted && opt.id === selectedOpt ? '✓ ' : ''}${opt.label}
              ${hasVoted ? `<span style="font-size:10px;color:var(--t3);margin-left:4px">${opt.votes || 0}</span>` : ''}
            </button>
          `).join('')}
        </div>

        ${hasVoted
          ? `<div style="background:rgba(0,224,144,.08);border:1px solid rgba(0,224,144,.2);border-radius:12px;padding:12px;text-align:center;font-size:13px;color:var(--grn);font-weight:600">✓ Vote submitted · ${proposal.reward} π earned</div>`
          : `<button
              class="btn btn-grn"
              style="font-size:14px;padding:13px"
              id="vote-btn-${proposal.id}"
              onclick="submitAgoraVote('${proposal.id}')"
            >Submit vote & earn ${proposal.reward} π</button>`
        }

        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div style="font-size:11px;color:var(--t3)">${proposal.totalVotes.toLocaleString('en-US')} votes cast</div>
          <div style="font-size:11px;color:var(--t3)" data-expires="${proposal.expiresAt}">${timeLabel} left</div>
        </div>
      </div>`;
  }).join('');

  // Start countdown timers
  startAgoraTimers();
}

function selVoteReal(proposalId, optionId, el) {
  _selectedVotes[proposalId] = optionId;

  // Visual selection feedback
  const container = document.getElementById(`vote-opts-${proposalId}`);
  if (!container) return;
  container.querySelectorAll('.vote-opt').forEach(btn => {
    btn.classList.remove('vsel');
  });
  el.classList.add('vsel');

  // Enable submit button
  const btn = document.getElementById(`vote-btn-${proposalId}`);
  if (btn) btn.style.opacity = '1';
}

async function submitAgoraVote(proposalId) {
  const optionId = _selectedVotes[proposalId];
  if (!optionId) return;

  const btn = document.getElementById(`vote-btn-${proposalId}`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting…';
  }

  try {
    const result = await apiCall('POST', `/agora/proposals/${proposalId}/vote`, { optionId });

    // Update balance
    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);

    // Mark proposal as voted locally and re-render
    const idx = _agoraProposals.findIndex(p => p.id === proposalId);
    if (idx !== -1) {
      _agoraProposals[idx].alreadyVoted = true;
      _agoraProposals[idx].totalVotes  += 1;
      const votedOpt = _agoraProposals[idx].options.find(o => o.id === optionId);
      if (votedOpt) votedOpt.votes = (votedOpt.votes || 0) + 1;
    }

    renderAgoraProposals(_agoraProposals);

  } catch (err) {
    console.error('[Agora] Vote error:', err.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = `Submit vote & earn π`;
      btn.style.background = 'rgba(255,77,106,.2)';
      btn.style.color = '#FF4D6A';
      setTimeout(() => {
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }
  }
}

function startAgoraTimers() {
  if (_agoraTimerLoop) clearInterval(_agoraTimerLoop);
  _agoraTimerLoop = setInterval(() => {
    document.querySelectorAll('#agora-proposals-container [data-expires]').forEach(el => {
      const ms = new Date(el.dataset.expires) - Date.now();
      el.textContent = ms > 0 ? formatTimeLeft(ms) : 'Expired';
    });
  }, 30000);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOOK INTO goTo — load data when screens open
// ─────────────────────────────────────────────────────────────────────────────

const _origGoTo = goTo;
goTo = function(id) {
  _origGoTo(id);
  if (id === 's22') loadOracleTasks();
  if (id === 's24') loadAgoraProposals();
};

// ─────────────────────────────────────────────────────────────────────────────
//  S21 EARN DASHBOARD — carga todo desde la API al abrir
// ─────────────────────────────────────────────────────────────────────────────

async function loadEarnDashboard() {
  // Mostrar ceros mientras carga
  _earnSetLoading(true);

  try {
    // Llamadas en paralelo para velocidad
    const [statsData, txData, oracleData, agoraData] = await Promise.allSettled([
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=10&type=reward'),
      apiCall('GET', '/oracle/tasks'),
      apiCall('GET', '/agora/proposals'),
    ]);

    // ── 1. Stats del usuario (monthly total, nexus score, marketplace)
    if (statsData.status === 'fulfilled') {
      const s = statsData.value;

      // Total mensual
      const totalEl = document.getElementById('earn-monthly-total');
      if (totalEl) totalEl.innerHTML = `${(s.monthlyEarned || 0).toFixed(2)} <span style="font-size:22px;opacity:.7">π</span>`;

      // USD
      const usdEl = document.getElementById('earn-monthly-usd');
      if (usdEl) usdEl.textContent = `≈ $${((s.monthlyEarned || 0) * (piPrice || 0.34)).toFixed(2)} USD`;

      // Nexus
      const nexusEl    = document.getElementById('earn-nexus-score');
      const nexusLabel = document.getElementById('earn-nexus-label');
      const score      = s.nexusScore || 0;
      if (nexusEl) nexusEl.innerHTML = `${score} <span style="font-size:12px;font-weight:600;opacity:.7">pts</span>`;
      if (nexusLabel) {
        const label = score >= 800 ? 'Score: Excellent' : score >= 600 ? 'Score: Good' : score >= 400 ? 'Score: Fair' : 'Score: New';
        nexusLabel.textContent = label;
      }

      // Marketplace
      const mktEl    = document.getElementById('earn-marketplace-amount');
      const mktSales = document.getElementById('earn-marketplace-sales');
      if (mktEl) mktEl.textContent = `${(s.marketplaceEarned || 0).toFixed(1)} π`;
      if (mktSales) mktSales.textContent = `${s.salesCount || 0} sales`;
    }

    // ── 2. Oracle — suma de recompensas disponibles + cantidad de tareas
    if (oracleData.status === 'fulfilled') {
      const tasks       = oracleData.value.tasks || [];
      const activeTasks = tasks.filter(t => !t.alreadySubmitted);
      const oracleTotal = activeTasks.reduce((sum, t) => sum + (t.reward || 0), 0);

      const oracleEl    = document.getElementById('earn-oracle-amount');
      const oracleCount = document.getElementById('earn-oracle-tasks');
      if (oracleEl) oracleEl.textContent = `${oracleTotal} π`;
      if (oracleCount) oracleCount.textContent = `${activeTasks.length} task${activeTasks.length !== 1 ? 's' : ''} available`;
    } else {
      const oracleEl = document.getElementById('earn-oracle-amount');
      if (oracleEl) oracleEl.textContent = '— π';
    }

    // ── 3. Agora — recompensas disponibles + votos abiertos
    if (agoraData.status === 'fulfilled') {
      const proposals    = agoraData.value.proposals || [];
      const openProposals = proposals.filter(p => !p.alreadyVoted);
      const agoraTotal   = openProposals.reduce((sum, p) => sum + (p.reward || 0), 0);

      const agoraEl    = document.getElementById('earn-agora-amount');
      const agoraCount = document.getElementById('earn-agora-votes');
      if (agoraEl) agoraEl.textContent = `${agoraTotal} π`;
      if (agoraCount) agoraCount.textContent = `${openProposals.length} vote${openProposals.length !== 1 ? 's' : ''} open`;
    } else {
      const agoraEl = document.getElementById('earn-agora-amount');
      if (agoraEl) agoraEl.textContent = '— π';
    }

    // ── 4. Historial reciente de rewards
    if (txData.status === 'fulfilled') {
      const txs = (txData.value.transactions || []).filter(t =>
        t.type === 'reward' || t.type === 'oracle' || t.type === 'agora'
      );
      renderEarnHistory(txs);
    }

  } catch (err) {
    console.warn('[Earn] Error cargando dashboard:', err.message);
  }

  _earnSetLoading(false);
}

function _earnSetLoading(loading) {
  if (loading) {
    const totalEl = document.getElementById('earn-monthly-total');
    if (totalEl) totalEl.innerHTML = '<span style="opacity:.4;font-size:28px">Cargando…</span>';
  }
}

function renderEarnHistory(txs) {
  const list = document.getElementById('earn-recent-list');
  if (!list) return;

  if (!txs || txs.length === 0) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--t3);font-size:13px">Sin actividad reciente.</div>';
    return;
  }

  const icons  = { oracle: '🔭', agora: '🏛️', reward: '⚡' };
  const colors = { oracle: 'var(--c)', agora: 'var(--grn)', reward: 'var(--ylw)' };
  const bgs    = { oracle: 'rgba(0,212,232,.1)', agora: 'rgba(0,224,144,.1)', reward: 'rgba(255,183,0,.1)' };

  list.innerHTML = txs.slice(0, 6).map(tx => {
    const type  = tx.type || 'reward';
    const icon  = icons[type]  || '⚡';
    const color = colors[type] || 'var(--ylw)';
    const bg    = bgs[type]    || 'rgba(255,183,0,.1)';
    const label = tx.toName || tx.rewardSource || type.toUpperCase();
    const date  = new Date(tx.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

    return `<div class="tx">
      <div class="ti" style="background:${bg};color:${color}">${icon}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${label}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:1px">${date}</div>
      </div>
      <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">+${tx.amount} π</div>
    </div>`;
  }).join('');
}

// Hook into goTo — sobreescribir el wrapper existente
const _origGoToEarn = goTo;
goTo = function(id) {
  _origGoToEarn(id);
  if (id === 's21') loadEarnDashboard();
};
