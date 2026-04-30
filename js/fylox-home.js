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
    el.innerHTML = value.toFixed(2) + '<span class="s5-balance-pi">π</span>';
    if (progress < 1) requestAnimationFrame(frame);
    else el.innerHTML = target.toFixed(2) + '<span class="s5-balance-pi">π</span>';
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

// ── Empty state directo (testnet, sin movimientos reales) ─
async function _s5LoadRecentActivity() {
  const list = document.getElementById('s5-activity');
  if (!list) return;
  list.innerHTML = `
    <div style="padding:32px 16px;text-align:center;color:var(--t3)">
      <div style="font-size:32px;margin-bottom:8px;opacity:.5">📭</div>
      <div style="font-size:13px;font-weight:600;color:var(--t2);margin-bottom:3px">Sin movimientos aún</div>
      <div style="font-size:11px">Tu actividad va a aparecer acá</div>
    </div>`;
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
    _s5RefreshIdentity();
    _s5SetupHaptics();
    _s5LoadRecentActivity();
  }, 100);

  // Retry cada 1s hasta que tengamos username (max 10 intentos)
  let attempts = 0;
  const retry = setInterval(() => {
    attempts++;
    if (window._fyloxUsername && window._fyloxUsername !== 'Pioneer') {
      _s5RefreshIdentity();
      _s5LoadRecentActivity();
      clearInterval(retry);
    } else if (attempts > 10) {
      clearInterval(retry);
    }
  }, 1000);
});

// ═══════════════════════════════════════════════════
//  S5 — Watchdog garantizado (solución nuclear)
//  Verifica cada 1s si los datos están actualizados
//  y los corrige si algo los sobreescribe
// ═══════════════════════════════════════════════════
setInterval(() => {
  const username = window._fyloxUsername;
  // Solo actuar si tenemos un username real (no Pioneer placeholder)
  if (!username || username === 'Pioneer') return;

  // Avatar
  const avatarEl = document.getElementById('s5-avatar');
  if (avatarEl) {
    const u = username.replace(/^@/, '').replace(/_/g, ' ').trim();
    const parts = u.split(/\s+/);
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : u.slice(0, 2).toUpperCase();
    if (avatarEl.textContent !== initials) avatarEl.textContent = initials;
  }

  // Username
  const userEl = document.getElementById('s5-username');
  const expectedUser = '@' + username;
  if (userEl && userEl.textContent !== expectedUser) {
    userEl.textContent = expectedUser;
  }

  // Greeting según hora
  const greetEl = document.getElementById('s5-greeting');
  if (greetEl) {
    const h = new Date().getHours();
    let greeting;
    if (h >= 5 && h < 12)       greeting = 'Buenos días';
    else if (h >= 12 && h < 19) greeting = 'Buenas tardes';
    else                        greeting = 'Buenas noches';
    if (greetEl.textContent !== greeting) {
      greetEl.textContent = greeting;
      greetEl.removeAttribute('data-i18n'); // evitar que i18n lo sobreescriba
    }
  }
}, 1000);

