// ═══════════════════════════════════════════════════
//  FYLOX NOTIFICATION ENGINE — v2
//  - Sin XSS — usa esc() en todo el innerHTML
//  - AudioContext singleton (no se crea uno por toast)
//  - Máximo 3 toasts simultáneos + queue
//  - Auto-dismiss a los 4.5s
// ═══════════════════════════════════════════════════

const FyloxNotification = (() => {

  // ── AudioContext singleton ────────────────────────
  let _audioCtx = null;

  function _getAudioCtx() {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Reanudar si está suspendido (política autoplay de browsers)
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }

  function playSound(type) {
    try {
      const ctx = _getAudioCtx();

      const freqs = type === 'reward'
        ? [392, 523.25, 659.25]   // tres tonos ascendentes — "ganaste"
        : [523.25, 783.99];       // dos tonos — "llegó Pi"

      const oscType = type === 'reward' ? 'triangle' : 'sine';
      const gap     = type === 'reward' ? 0.10 : 0.12;
      const dur     = type === 'reward' ? 0.30 : 0.35;
      const vol     = type === 'reward' ? 0.22 : 0.28;

      freqs.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type           = oscType;
        osc.frequency.value = freq;
        const t0 = ctx.currentTime + i * gap;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.start(t0);
        osc.stop(t0 + dur);
      });

    } catch (e) {
      console.warn('[Fylox] Audio no disponible:', e.message);
    }
  }

  // ── Estilos — inyectar una sola vez ──────────────
  function _injectStyles() {
    if (document.getElementById('fylox-notif-styles')) return;
    const style = document.createElement('style');
    style.id = 'fylox-notif-styles';
    style.textContent = `
      #fylox-notif-container {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 32px);
        max-width: 390px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      }
      .fylox-notif {
        background: rgba(13,14,21,0.96);
        border: 1px solid rgba(0,212,232,0.25);
        border-radius: 16px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,212,232,0.08);
        backdrop-filter: blur(16px);
        pointer-events: all;
        animation: fyloxNotifIn 0.38s cubic-bezier(.34,1.56,.64,1) forwards;
      }
      .fylox-notif.out {
        animation: fyloxNotifOut 0.3s ease forwards;
      }
      @keyframes fyloxNotifIn {
        from { opacity:0; transform:translateY(-16px) scale(0.94); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes fyloxNotifOut {
        from { opacity:1; transform:translateY(0) scale(1); }
        to   { opacity:0; transform:translateY(-12px) scale(0.96); }
      }
      .fylox-notif-icon {
        width: 38px; height: 38px;
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; flex-shrink: 0;
        background: rgba(0,212,232,0.12);
      }
      .fylox-notif-body { flex: 1; min-width: 0; }
      .fylox-notif-title {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700; font-size: 14px;
        color: #fff; letter-spacing: -0.2px;
      }
      .fylox-notif-sub {
        font-size: 11px; color: rgba(255,255,255,0.5);
        margin-top: 2px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .fylox-notif-amt {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800; font-size: 15px;
        color: var(--c, #00D4E8); flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Contenedor ────────────────────────────────────
  function _getContainer() {
    let el = document.getElementById('fylox-notif-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fylox-notif-container';
      document.body.appendChild(el);
    }
    return el;
  }

  // ── Queue para cuando hay más de 3 toasts ─────────
  const _queue = [];
  const MAX_VISIBLE = 3;

  function _flushQueue() {
    const container = _getContainer();
    const visible   = container.querySelectorAll('.fylox-notif:not(.out)').length;
    if (visible < MAX_VISIBLE && _queue.length > 0) {
      _renderNotif(_queue.shift());
    }
  }

  // ── Render de un toast ────────────────────────────
  function _renderNotif({ icon, title, sub, amt, sound, type }) {
    _injectStyles();
    const container = _getContainer();

    if (sound) playSound(type === 'reward' ? 'reward' : 'receive');
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

    const notif    = document.createElement('div');
    notif.className = 'fylox-notif';

    // esc() en TODOS los valores que vienen de fuera
    const safeIcon  = esc(icon  || '🔔');
    const safeTitle = esc(title || '');
    const safeSub   = esc(sub   || '');
    const safeAmt   = esc(amt   || '');

    const amtColor = safeAmt.startsWith('+')
      ? 'var(--c, #00D4E8)'
      : safeAmt.startsWith('−') || safeAmt.startsWith('-')
        ? '#FF4D6A'
        : 'var(--ylw, #FFB700)';

    notif.innerHTML = `
      <div class="fylox-notif-icon">${safeIcon}</div>
      <div class="fylox-notif-body">
        <div class="fylox-notif-title">${safeTitle}</div>
        <div class="fylox-notif-sub">${safeSub}</div>
      </div>
      <div class="fylox-notif-amt" style="color:${amtColor}">${safeAmt}</div>
    `;

    container.appendChild(notif);

    setTimeout(() => {
      notif.classList.add('out');
      notif.addEventListener('animationend', () => {
        notif.remove();
        _flushQueue(); // mostrar el siguiente si hay en cola
      }, { once: true });
    }, 4500);
  }

  // ── API pública: show ─────────────────────────────
  // Uso: FyloxNotification.show({ icon, title, sub, amt, sound, type })
  // type: 'receive' | 'reward'
  function show({ icon = '🔔', title = '', sub = '', amt = '', sound = true, type = 'receive' } = {}) {
    const container = _getContainer();
    const visible   = container.querySelectorAll('.fylox-notif:not(.out)').length;

    if (visible >= MAX_VISIBLE) {
      // Encolar en vez de mostrar encima de todo
      _queue.push({ icon, title, sub, amt, sound, type });
      return;
    }

    _renderNotif({ icon, title, sub, amt, sound, type });
  }

  return { show, playSound };
})();
