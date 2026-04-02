// ═══════════════════════════════════════════════════
//  FYLOX EARN ENGINE — v2
//  - Sin XSS — esc() en Oracle, Agora y historial
//  - Sin monkey-patch — usa evento fylox:screen
//  - Timers se limpian correctamente al navegar
//  - Fecha localizada con fmtDate()
// ═══════════════════════════════════════════════════

// ─────────────────────────────────────────────────────
//  ORACLE
// ─────────────────────────────────────────────────────

let _oracleTasks     = [];
let _activeTaskId    = null;
let _oracleTimerLoop = null;

async function loadOracleTasks() {
  const container = document.getElementById('oracle-tasks-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[1, 2].map(() => `
        <div style="background:var(--cd);border-radius:16px;padding:16px;animation:pulse 1.5s ease infinite">
          <div style="height:14px;background:var(--b);border-radius:6px;width:60%;margin-bottom:10px"></div>
          <div style="height:10px;background:var(--b);border-radius:6px;width:40%"></div>
        </div>
      `).join('')}
    </div>`;

  try {
    const data  = await apiCall('GET', '/oracle/tasks');
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
        <button class="btn" style="margin-top:12px;padding:10px 20px;font-size:13px"
          onclick="loadOracleTasks()">Retry</button>
      </div>`;
  }
}

function renderOracleTasks(tasks) {
  const container = document.getElementById('oracle-tasks-container');
  if (!container) return;

  // Limpiar timer anterior antes de renderizar
  _clearOracleTimers();

  container.innerHTML = tasks.map((task, i) => {
    const msLeft      = new Date(task.expiresAt) - Date.now();
    const timeLabel   = esc(formatTimeLeft(msLeft));
    const isCompleted = task.alreadySubmitted;

    // esc() en TODOS los valores del servidor
    const title    = esc(task.title       || '');
    const location = esc(task.location    || '');
    const reward   = esc(String(task.reward || 0));
    const taskId   = esc(String(task.id   || ''));
    const confirmed = esc(String(task.confirmedBy || 0));
    const required  = esc(String(task.requiredConfirmations || 0));
    const desc      = esc(task.description || '');

    return `
      <div class="task-card ${i === 0 ? 'mb16' : ''}"
        id="oracle-task-${taskId}"
        style="${isCompleted ? 'opacity:.6' : ''}">

        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-family:var(--fd);font-weight:700;font-size:15px;line-height:1.3;margin-bottom:6px">
              ${title}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${isCompleted
                ? `<div class="pill-live" style="background:rgba(0,224,144,.1);border-color:var(--grn)">
                     <div class="pill-dot" style="background:var(--grn)"></div>
                     <span style="color:var(--grn)">Submitted</span>
                   </div>`
                : `<div class="pill-live"><div class="pill-dot"></div><span>Live</span></div>`
              }
              ${location
                ? `<div class="tag tag-c">${location}</div>`
                : ''
              }
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px">
            <div style="font-family:var(--fd);font-weight:800;font-size:22px;color:var(--c);letter-spacing:-.5px">
              +${reward} π
            </div>
            <div style="font-size:11px;color:var(--ylw);font-weight:600;margin-top:4px;font-family:var(--fm)"
              data-expires="${esc(task.expiresAt || '')}">
              ⏱ ${timeLabel}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="background:var(--earn-stat-bg);border-radius:10px;padding:8px;text-align:center">
            <div style="font-size:11px;color:var(--t3)">Confirmed</div>
            <div style="font-size:13px;font-weight:700;color:var(--c);margin-top:3px">
              ${confirmed}/${required}
            </div>
          </div>
          <div style="background:var(--earn-stat-bg);border-radius:10px;padding:8px;text-align:center">
            <div style="font-size:11px;color:var(--t3)">Reward</div>
            <div style="font-size:13px;font-weight:700;color:var(--c);margin-top:3px">
              ${reward} π
            </div>
          </div>
        </div>

        <div style="font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:14px">
          ${desc}
        </div>

        ${isCompleted
          ? `<div style="background:rgba(0,224,144,.08);border:1px solid rgba(0,224,144,.2);
               border-radius:12px;padding:12px;text-align:center;
               font-size:13px;color:var(--grn);font-weight:600">
               ✓ Response submitted — awaiting consensus
             </div>`
          : `<button class="btn bp" style="font-size:14px;padding:13px"
               onclick="startOracleTask('${taskId}')">
               Accept task →
             </button>`
        }
      </div>`;
  }).join('');

  _startOracleTimers();
}

function _clearOracleTimers() {
  if (_oracleTimerLoop) {
    clearInterval(_oracleTimerLoop);
    _oracleTimerLoop = null;
  }
}

function _startOracleTimers() {
  _clearOracleTimers();
  _oracleTimerLoop = setInterval(() => {
    document.querySelectorAll('#oracle-tasks-container [data-expires]').forEach(el => {
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
  const task    = _oracleTasks.find(t => String(t.id) === String(taskId));
  if (!task) return;

  try {
    await apiCall('POST', `/oracle/tasks/${taskId}/accept`);
  } catch (err) {
    if (!err.message?.includes('Ya completaste')) {
      console.warn('[Oracle] Accept error:', err.message);
    }
  }

  // Poblar pantalla de submit — textContent es seguro, no necesita esc()
  const titleEl  = document.getElementById('oracle-submit-title');
  const rewardEl = document.getElementById('oracle-submit-reward');
  const descEl   = document.getElementById('oracle-submit-desc');
  if (titleEl)  titleEl.textContent  = task.title       || '';
  if (rewardEl) rewardEl.textContent = `+${task.reward || 0} π`;
  if (descEl)   descEl.textContent   = task.description || '';

  goTo('s22b');

  const answerInput = document.getElementById('oracle-answer');
  const charCount   = document.getElementById('oracle-char-count');
  if (answerInput && charCount) {
    answerInput.value    = '';
    charCount.textContent = '0';
    answerInput.oninput  = () => { charCount.textContent = answerInput.value.length; };
  }
}

// ── Foto ────────────────────────────────────────────
let _oraclePhotoFile = null;

function oracleSelectPhoto() {
  const input = document.getElementById('oracle-photo-input');
  if (input) input.click();
}

function oraclePhotoChanged(input) {
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > 8 * 1024 * 1024) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Imagen muy grande',
      sub: 'Máximo 8MB por foto', amt: '', sound: false,
    });
    return;
  }

  // Validar MIME type
  if (!file.type.startsWith('image/')) {
    FyloxNotification.show({
      icon: '⚠️', title: 'Archivo no válido',
      sub: 'Solo se aceptan imágenes', amt: '', sound: false,
    });
    return;
  }

  _oraclePhotoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview     = document.getElementById('oracle-photo-preview');
    const placeholder = document.getElementById('oracle-photo-placeholder');
    const label       = document.getElementById('oracle-photo-label');
    if (preview)     { preview.src = e.target.result; preview.style.display = 'block'; }
    if (placeholder)   placeholder.style.display = 'none';
    if (label)         label.textContent = '📷 Photo attached — tap to change';
  };
  reader.readAsDataURL(file);
}

async function submitOracleTask() {
  if (!_activeTaskId) return;

  const answerEl = document.getElementById('oracle-answer');
  const answer   = answerEl?.value?.trim();
  const btn      = document.getElementById('oracle-submit-btn');

  if (!answer) { answerEl?.focus(); return; }

  if (btn) {
    btn.disabled  = true;
    btn.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite"></span>Submitting…</span>';
  }

  try {
    let photoUrl = null;
    if (_oraclePhotoFile) {
      if (btn) btn.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite"></span>Uploading photo…</span>';
      photoUrl = await uploadImage(_oraclePhotoFile);
    }

    const result = await apiCall('POST', `/oracle/tasks/${_activeTaskId}/submit`, {
      answer,
      photoUrl: photoUrl || null,
    });

    _oraclePhotoFile = null;

    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);

    if (result.consensusReached && typeof FyloxNotification !== 'undefined') {
      FyloxNotification.show({
        icon: '🌊',
        title: `+${result.reward} π ganado`,
        sub:   'Recompensa Oracle acreditada',
        amt:   `+${result.reward} π`,
        sound: true,
        type:  'reward',
      });
    }

    const msgEl = document.getElementById('oracle-success-msg');
    if (msgEl) msgEl.textContent = result.message || '';
    goTo('s22c');
    setTimeout(loadOracleTasks, 1000);

  } catch (err) {
    console.error('[Oracle] Submit error:', err.message);
    if (btn) {
      btn.disabled        = false;
      btn.innerHTML       = 'Submit verification →';
      btn.style.background = 'rgba(255,77,106,.2)';
      btn.style.color      = '#FF4D6A';
      setTimeout(() => { btn.style.background = ''; btn.style.color = ''; }, 2000);
    }
  }
}

// ─────────────────────────────────────────────────────
//  AGORA
// ─────────────────────────────────────────────────────

let _agoraProposals  = [];
let _selectedVotes   = {};
let _agoraTimerLoop  = null;

async function loadAgoraProposals() {
  const container = document.getElementById('agora-proposals-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[1, 2].map(() => `
        <div style="background:var(--cd);border-radius:16px;padding:16px;animation:pulse 1.5s ease infinite">
          <div style="height:12px;background:var(--b);border-radius:6px;width:35%;margin-bottom:12px"></div>
          <div style="height:14px;background:var(--b);border-radius:6px;width:85%;margin-bottom:8px"></div>
          <div style="height:10px;background:var(--b);border-radius:6px;width:55%"></div>
        </div>
      `).join('')}
    </div>`;

  try {
    const data      = await apiCall('GET', '/agora/proposals');
    _agoraProposals = data.proposals || [];

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
        <button class="btn" style="margin-top:12px;padding:10px 20px;font-size:13px"
          onclick="loadAgoraProposals()">Retry</button>
      </div>`;
  }
}

function renderAgoraProposals(proposals) {
  const container = document.getElementById('agora-proposals-container');
  if (!container) return;

  _clearAgoraTimers();

  container.innerHTML = proposals.map((proposal) => {
    const msLeft     = new Date(proposal.expiresAt) - Date.now();
    const timeLabel  = esc(formatTimeLeft(msLeft));
    const hasVoted   = proposal.alreadyVoted;
    const selectedOpt = _selectedVotes[proposal.id];

    // esc() en TODOS los valores del servidor
    const company    = esc(proposal.company  || '');
    const model      = esc(proposal.model    || '');
    const question   = esc(proposal.question || '');
    const reward     = esc(String(proposal.reward || 0));
    const propId     = esc(String(proposal.id || ''));
    const totalVotes = (proposal.totalVotes || 0).toLocaleString('en-US');

    const optionsHTML = (proposal.options || []).map(opt => {
      const optId    = esc(String(opt.id    || ''));
      const optLabel = esc(opt.label || '');
      const optVotes = esc(String(opt.votes || 0));
      const isSel    = selectedOpt === opt.id;

      return `<button
        class="vote-opt ${isSel ? 'vsel' : ''}"
        onclick="${hasVoted ? '' : `selVoteReal('${propId}', '${optId}', this)`}"
        style="${hasVoted && !isSel ? 'opacity:.5' : ''}"
      >
        ${hasVoted && isSel ? '✓ ' : ''}${optLabel}
        ${hasVoted ? `<span style="font-size:10px;color:var(--t3);margin-left:4px">${optVotes}</span>` : ''}
      </button>`;
    }).join('');

    return `
      <div class="vote-card mb16" id="agora-proposal-${propId}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-size:10px;font-weight:700;color:var(--grn);letter-spacing:1px;
              text-transform:uppercase;margin-bottom:6px">
              ${company} · ${model}
            </div>
            <div style="font-family:var(--fd);font-weight:700;font-size:14px;line-height:1.4">
              ${question}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:12px">
            <div style="font-family:var(--fd);font-weight:800;font-size:18px;color:var(--grn)">
              +${reward} π
            </div>
            <div class="pill-live" style="margin-top:4px">
              <div class="pill-dot"></div>
              <span data-expires="${esc(proposal.expiresAt || '')}">${timeLabel}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"
          id="vote-opts-${propId}">
          ${optionsHTML}
        </div>

        ${hasVoted
          ? `<div style="background:rgba(0,224,144,.08);border:1px solid rgba(0,224,144,.2);
               border-radius:12px;padding:12px;text-align:center;
               font-size:13px;color:var(--grn);font-weight:600">
               ✓ Vote submitted · ${reward} π earned
             </div>`
          : `<button class="btn btn-grn" style="font-size:14px;padding:13px"
               id="vote-btn-${propId}"
               onclick="submitAgoraVote('${propId}')">
               Submit vote & earn ${reward} π
             </button>`
        }

        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div style="font-size:11px;color:var(--t3)">${totalVotes} votes cast</div>
          <div style="font-size:11px;color:var(--t3)"
            data-expires="${esc(proposal.expiresAt || '')}">${timeLabel} left</div>
        </div>
      </div>`;
  }).join('');

  _startAgoraTimers();
}

function selVoteReal(proposalId, optionId, el) {
  _selectedVotes[proposalId] = optionId;
  const container = document.getElementById(`vote-opts-${proposalId}`);
  if (!container) return;
  container.querySelectorAll('.vote-opt').forEach(btn => btn.classList.remove('vsel'));
  el.classList.add('vsel');
  const btn = document.getElementById(`vote-btn-${proposalId}`);
  if (btn) btn.style.opacity = '1';
}

async function submitAgoraVote(proposalId) {
  const optionId = _selectedVotes[proposalId];
  if (!optionId) return;

  const btn = document.getElementById(`vote-btn-${proposalId}`);
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

  try {
    const result = await apiCall('POST', `/agora/proposals/${proposalId}/vote`, { optionId });

    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);

    const idx = _agoraProposals.findIndex(p => String(p.id) === String(proposalId));
    if (idx !== -1) {
      _agoraProposals[idx].alreadyVoted = true;
      _agoraProposals[idx].totalVotes   = (_agoraProposals[idx].totalVotes || 0) + 1;
      const votedOpt = _agoraProposals[idx].options?.find(o => String(o.id) === String(optionId));
      if (votedOpt) votedOpt.votes = (votedOpt.votes || 0) + 1;
    }

    renderAgoraProposals(_agoraProposals);

  } catch (err) {
    console.error('[Agora] Vote error:', err.message);
    if (btn) {
      btn.disabled        = false;
      btn.textContent     = 'Submit vote & earn π';
      btn.style.background = 'rgba(255,77,106,.2)';
      btn.style.color      = '#FF4D6A';
      setTimeout(() => { btn.style.background = ''; btn.style.color = ''; }, 2000);
    }
  }
}

function _clearAgoraTimers() {
  if (_agoraTimerLoop) {
    clearInterval(_agoraTimerLoop);
    _agoraTimerLoop = null;
  }
}

function _startAgoraTimers() {
  _clearAgoraTimers();
  _agoraTimerLoop = setInterval(() => {
    document.querySelectorAll('#agora-proposals-container [data-expires]').forEach(el => {
      const ms = new Date(el.dataset.expires) - Date.now();
      el.textContent = ms > 0 ? formatTimeLeft(ms) : 'Expired';
    });
  }, 30000);
}

// ─────────────────────────────────────────────────────
//  EARN DASHBOARD — S21
// ─────────────────────────────────────────────────────

async function loadEarnDashboard() {
  _earnSetLoading(true);

  try {
    const [statsData, txData, oracleData, agoraData] = await Promise.allSettled([
      apiCall('GET', '/user/earn-stats'),
      apiCall('GET', '/user/transactions?limit=10&type=reward'),
      apiCall('GET', '/oracle/tasks'),
      apiCall('GET', '/agora/proposals'),
    ]);

    if (statsData.status === 'fulfilled') {
      const s     = statsData.value;
      const score = s.nexusScore || 0;

      const totalEl = document.getElementById('earn-monthly-total');
      if (totalEl) totalEl.innerHTML =
        `${fmtPi(s.monthlyEarned || 0)} <span style="font-size:22px;opacity:.7">π</span>`;

      const usdEl = document.getElementById('earn-monthly-usd');
      if (usdEl) usdEl.textContent = `≈ $${fmtUSD(s.monthlyEarned || 0)} USD`;

      const nexusEl    = document.getElementById('earn-nexus-score');
      const nexusLabel = document.getElementById('earn-nexus-label');
      if (nexusEl) nexusEl.innerHTML =
        `${score} <span style="font-size:12px;font-weight:600;opacity:.7">pts</span>`;
      if (nexusLabel) {
        const label = score >= 800 ? 'Score: Excellent'
          : score >= 600 ? 'Score: Good'
          : score >= 400 ? 'Score: Fair'
          : 'Score: New';
        nexusLabel.textContent = label;
      }

      const mktEl    = document.getElementById('earn-marketplace-amount');
      const mktSales = document.getElementById('earn-marketplace-sales');
      if (mktEl)    mktEl.textContent    = `${fmtPi(s.marketplaceEarned || 0)} π`;
      if (mktSales) mktSales.textContent = `${s.salesCount || 0} sales`;
    }

    if (oracleData.status === 'fulfilled') {
      const tasks       = oracleData.value.tasks || [];
      const activeTasks = tasks.filter(t => !t.alreadySubmitted);
      const oracleTotal = activeTasks.reduce((sum, t) => sum + (t.reward || 0), 0);
      const oracleEl    = document.getElementById('earn-oracle-amount');
      const oracleCount = document.getElementById('earn-oracle-tasks');
      if (oracleEl)    oracleEl.textContent    = `${oracleTotal} π`;
      if (oracleCount) oracleCount.textContent =
        `${activeTasks.length} task${activeTasks.length !== 1 ? 's' : ''} available`;
    } else {
      const oracleEl = document.getElementById('earn-oracle-amount');
      if (oracleEl) oracleEl.textContent = '— π';
    }

    if (agoraData.status === 'fulfilled') {
      const proposals    = agoraData.value.proposals || [];
      const open         = proposals.filter(p => !p.alreadyVoted);
      const agoraTotal   = open.reduce((sum, p) => sum + (p.reward || 0), 0);
      const agoraEl      = document.getElementById('earn-agora-amount');
      const agoraCount   = document.getElementById('earn-agora-votes');
      if (agoraEl)    agoraEl.textContent    = `${agoraTotal} π`;
      if (agoraCount) agoraCount.textContent =
        `${open.length} vote${open.length !== 1 ? 's' : ''} open`;
    } else {
      const agoraEl = document.getElementById('earn-agora-amount');
      if (agoraEl) agoraEl.textContent = '— π';
    }

    if (txData.status === 'fulfilled') {
      const txs = (txData.value.transactions || [])
        .filter(t => ['reward', 'oracle', 'agora'].includes(t.type));
      renderEarnHistory(txs);
    }

  } catch (err) {
    console.warn('[Earn] Error cargando dashboard:', err.message);
  }

  _earnSetLoading(false);
}

function _earnSetLoading(loading) {
  const totalEl = document.getElementById('earn-monthly-total');
  if (totalEl && loading) {
    totalEl.innerHTML = '<span style="opacity:.4;font-size:28px">Cargando…</span>';
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
    const type   = tx.type  || 'reward';
    const icon   = icons[type]  || '⚡';
    const color  = colors[type] || 'var(--ylw)';
    const bg     = bgs[type]    || 'rgba(255,183,0,.1)';

    // esc() en valores del servidor
    const label  = esc(tx.toName || tx.rewardSource || type.toUpperCase());
    const date   = esc(fmtDate(tx.createdAt));
    const amount = esc(String(tx.amount || 0));

    return `<div class="tx">
      <div class="ti" style="background:${bg};color:${color}">${icon}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${label}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:1px">${date}</div>
      </div>
      <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">
        +${amount} π
      </div>
    </div>`;
  }).join('');
}

// ─────────────────────────────────────────────────────
//  SISTEMA DE EVENTOS — sin monkey-patch de goTo
// ─────────────────────────────────────────────────────
document.addEventListener('fylox:screen', (e) => {
  const id = e.detail?.id;
  if (!id) return;
  if (id === 's21') loadEarnDashboard();
  if (id === 's22') loadOracleTasks();
  if (id === 's24') loadAgoraProposals();

  // Limpiar timers al salir de las pantallas de earn
  const earnScreens = ['s21', 's22', 's22b', 's22c', 's24'];
  if (!earnScreens.includes(id)) {
    _clearOracleTimers();
    _clearAgoraTimers();
  }
});
