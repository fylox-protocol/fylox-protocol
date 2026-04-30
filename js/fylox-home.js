// ═══════════════════════════════════════════════════
//  FYLOX HOME — v3 PREMIUM ULTRA
//  - Saludo dinámico por hora
//  - Avatar con iniciales del username real
//  - Counter animation del saldo
//  - Activity inline (3 últimas TX)
//  - Skeleton loaders
//  - Tiempo relativo
// ═══════════════════════════════════════════════════

// ── Saludo según hora local ──────────────────────────
function _s5UpdateGreeting() {
  const greetEl = document.getElementById('s5-greeting');
  if (!greetEl) return;
  const h = new Date().getHours();
  let key, fallback;
  if (h >= 5 && h < 12)       { key = 'goodMorning';   fallback = 'Buenos días';  }
  else if (h >= 12 && h < 19) { key = 'goodAfternoon'; fallback = 'Buenas tardes'; }
  else                        { key = 'goodEvening';   fallback = 'Buenas noches'; }
  const t = (typeof LANGS !== 'undefined' && typeof currentLang !== 'undefined' && LANGS[currentLang] && LANGS[currentLang][key])
    ? LANGS[currentLang][key] : fallback;
  greetEl.textContent = t;
  greetEl.setAttribute('data-i18n', key);
}

// ── Iniciales del username (ej: jrovervulkan → JR) ────
function _s5GetInitials(username) {
  if (!username) return '··';
  const u = username.replace(/^@/, '').replace(/_/g, ' ').trim();
  // Si tiene espacio, tomar 1ra letra de cada palabra
  const parts = u.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  // Sino, primeras 2 letras
  return u.slice(0, 2).toUpperCase();
}

// ── Actualizar avatar + greeting cuando llega user ────
function _s5RefreshIdentity() {
  const username = window._fyloxUsername || 'Pioneer';
  const avatarEl = document.getElementById('s5-avatar');
  const userEl   = document.getElementById('s5-username');
  if (avatarEl) avatarEl.textContent = _s5GetInitials(username);
  if (userEl)   userEl.textContent   = '@' + username;
  _s5UpdateGreeting();
}

// ── Counter animation del saldo (0 → balance) ─────────
let _s5BalanceAnimToken = 0;
function _s5AnimateBalance(targetBalance) {
  const el = document.getElementById('home-balance');
  if (!el) return;
  const target = parseFloat(targetBalance) || 0;
  const duration = 900;
  const startTime = performance.now();
  const myToken = ++_s5BalanceAnimToken;
  
  function frame(now) {
    if (myToken !== _s5BalanceAnimToken) return; // cancelado por nueva animación
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = value.toFixed(2);
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target.toFixed(2);
  }
  requestAnimationFrame(frame);
}

// ── Tiempo relativo en español ────────────────────────
function _s5RelTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'ahora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ayer';
  if (diffD < 7) return `hace ${diffD}d`;
  // Más de una semana → fecha corta
  return d.toLocaleDateString(undefined, { day:'numeric', month:'short' });
}

// ── Render de las 3 últimas TX en el home ─────────────
async function _s5LoadRecentActivity() {
  const list = document.getElementById('s5-activity');
  if (!list) return;
  
  try {
    const data = await apiCall('GET', '/user/transactions?limit=3');
    const txs = (data && data.transactions) || [];
    
    if (txs.length === 0) {
      list.innerHTML = `
        <div style="padding:32px 16px;text-align:center;color:var(--t3)">
          <div style="font-size:32px;margin-bottom:8px;opacity:.5">📭</div>
          <div style="font-size:13px;font-weight:600;color:var(--t2);margin-bottom:3px">Sin movimientos aún</div>
          <div style="font-size:11px">Tu actividad va a aparecer acá</div>
        </div>`;
      return;
    }
    
    const myUid = window._fyloxUid || null;
    list.innerHTML = txs.map(tx => {
      const isSent = (tx.type === 'sent' || tx.type === 'app_to_user' || tx.fromUid === myUid);
      const sign  = isSent ? '−' : '+';
      const cls   = isSent ? 'sent' : 'received';
      const otherName = isSent
        ? (tx.toName || tx.toUsername || tx.toAddress || 'Pago')
        : (tx.fromUsername || tx.fromName || 'Pioneer');
      const initial = (otherName.replace(/^@/,'')[0] || '?').toUpperCase();
      const avatarBg = isSent ? 'rgba(255,107,129,.15)' : 'rgba(0,224,144,.15)';
      const avatarColor = isSent ? '#ff6b81' : '#00E090';
      const amount = parseFloat(tx.amount || 0).toFixed(2);
      const time = _s5RelTime(tx.createdAt);
      
      return `
        <div class="s5-tx" data-go="s18">
          <div class="s5-tx-avatar" style="background:${avatarBg};color:${avatarColor}">${esc(initial)}</div>
          <div class="s5-tx-info">
            <div class="s5-tx-name">${esc(otherName)}</div>
            <div class="s5-tx-time">${esc(time)}</div>
          </div>
          <div class="s5-tx-amount ${cls}">${sign}${amount} π</div>
        </div>`;
    }).join('');
    
  } catch (err) {
    console.warn('[Fylox] No se pudo cargar actividad reciente:', err.message);
    list.innerHTML = `
      <div style="padding:24px 16px;text-align:center;color:var(--t3);font-size:12px">
        No se pudo cargar la actividad
      </div>`;
  }
}

// ── Haptic feedback en chips ──────────────────────────
function _s5SetupHaptics() {
  if (!navigator.vibrate) return;
  const handler = () => navigator.vibrate(8);
  document.querySelectorAll('#s5 .s5-action, #s5 .s5-service, #s5 .s5-iconbtn').forEach(el => {
    if (el._hapticBound) return;
    el._hapticBound = true;
    el.addEventListener('click', handler);
  });
}

// ── Listener: cuando la pantalla cambia a s5 ──────────
document.addEventListener('fylox:screen', (e) => {
  if (e.detail && e.detail.id === 's5') {
    _s5UpdateGreeting();
    _s5RefreshIdentity();
    _s5LoadRecentActivity();
    _s5SetupHaptics();
  }
});

// ── Update cada vez que se actualiza el balance ───────
window._s5OnBalanceUpdate = function(newBalance) {
  _s5AnimateBalance(newBalance);
};

// ── Auto-init al cargar la página si ya estamos en s5
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    _s5UpdateGreeting();
    _s5SetupHaptics();
  }, 100);
});
