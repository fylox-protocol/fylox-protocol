// ═══════════════════════════════════════════════════
//  FYLOX NOTIFICATION ENGINE
//  Toast con sonido para pagos recibidos y recompensas
// ═══════════════════════════════════════════════════

const FyloxNotification = (() => {

  // ── SONIDO — generado con Web Audio API, sin archivos externos ─────────────
  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      if (type === 'receive') {
        // Dos tonos ascendentes — "llegó pi"
        [523.25, 783.99].forEach((freq, i) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + i * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.35);
        });

      } else if (type === 'reward') {
        // Tres tonos — "ganaste una recompensa"
        [392, 523.25, 659.25].forEach((freq, i) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
      }

      setTimeout(() => ctx.close(), 1500);
    } catch (e) {
      console.warn('[Fylox] Audio no disponible:', e.message);
    }
  }

  // ── CSS — inyectar estilos una sola vez ────────────────────────────────────
  function injectStyles() {
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
        width: 38px;
        height: 38px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
        background: rgba(0,212,232,0.12);
      }
      .fylox-notif-body {
        flex: 1;
        min-width: 0;
      }
      .fylox-notif-title {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: #fff;
        letter-spacing: -0.2px;
      }
      .fylox-notif-sub {
        font-size: 11px;
        color: rgba(255,255,255,0.5);
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fylox-notif-amt {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800;
        font-size: 15px;
        color: var(--c, #00D4E8);
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // ── CONTENEDOR ────────────────────────────────────────────────────────────
  function getContainer() {
    let el = document.getElementById('fylox-notif-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fylox-notif-container';
      document.body.appendChild(el);
    }
    return el;
  }

  // ── SHOW ──────────────────────────────────────────────────────────────────
  // Uso: FyloxNotification.show({ icon, title, sub, amt, sound, type })
  // type: 'receive' | 'reward'  (controla el sonido)
  function show({ icon = '🔔', title = '', sub = '', amt = '', sound = true, type = 'receive' } = {}) {
    injectStyles();
    const container = getContainer();

    if (sound) {
      playSound(type === 'reward' ? 'reward' : 'receive');
    }

    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

    const notif = document.createElement('div');
    notif.className = 'fylox-notif';
    const amtColor = amt.startsWith('+') ? 'var(--c, #00D4E8)' : '#FF4D6A';
    notif.innerHTML = `
      <div class="fylox-notif-icon">${icon}</div>
      <div class="fylox-notif-body">
        <div class="fylox-notif-title">${title}</div>
        <div class="fylox-notif-sub">${sub}</div>
      </div>
      <div class="fylox-notif-amt" style="color:${amtColor}">${amt}</div>
    `;

    container.appendChild(notif);

    // Auto-dismiss después de 4.5 segundos
    setTimeout(() => {
      notif.classList.add('out');
      notif.addEventListener('animationend', () => notif.remove(), { once: true });
    }, 4500);
  }

  return { show, playSound };
})();
