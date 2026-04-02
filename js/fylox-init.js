// ═══════════════════════════════════════════════════
//  FYLOX INIT — v2
//  - ?pay= validado y sanitizado (anti-phishing)
//  - Pi SDK auth con manejo de errores robusto
//  - Demo mode no permite acceder a pagos reales
//  - Polling de saldo arranca solo tras auth exitosa
//  - window.onload reemplazado por DOMContentLoaded
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {

  // ── 0. Aplicar idioma y tema antes de mostrar nada ──
  try {
    const savedLang    = FyloxStorage.get('fylox-lang');
    const detectedLang = (savedLang && LANGS[savedLang]) ? savedLang : detectLang();
    applyLang(detectedLang);
  } catch (e) {
    console.warn('[Fylox] Error aplicando idioma:', e.message);
  }

  try {
    const savedTheme = FyloxStorage.get('fylox-theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      const btn = document.getElementById('dark-toggle-btn');
      if (btn) btn.classList.add('on');
    }
  } catch (e) {
    console.warn('[Fylox] Error aplicando tema:', e.message);
  }

  // ── 1. Validar parámetro ?pay= anti-phishing ────────
  //  Solo acepta formato @username o username.pi
  //  Nunca precarga el destinatario sin que el usuario
  //  haya iniciado sesión primero.
  const urlParams = new URLSearchParams(window.location.search);
  const rawPayTo  = urlParams.get('pay');

  if (rawPayTo) {
    // Validar formato: solo letras, números, _, . y @
    const PI_USERNAME_REGEX = /^@?[a-zA-Z0-9_]{2,32}(\.pi)?$/;
    if (PI_USERNAME_REGEX.test(rawPayTo.trim())) {
      // Guardar como pendiente — se aplica DESPUÉS de auth exitosa
      window._pendingPayTo = rawPayTo.trim();
    } else {
      console.warn('[Fylox] ?pay= inválido ignorado:', rawPayTo);
    }
    // Limpiar la URL para no exponer el destinatario en el historial
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // ── 2. Animación de intro ────────────────────────────
  const introEl      = document.getElementById('s_intro');
  const introLogo    = document.getElementById('intro-logo');
  const introText    = document.getElementById('intro-text');
  const introTagline = document.getElementById('intro-tagline');

  function showLoginScreen() {
    if (introEl) {
      introEl.style.transition = 'opacity 0.55s ease';
      introEl.style.opacity    = '0';
      setTimeout(() => {
        introEl.style.display = 'none';
        introEl.classList.remove('show');
        const s0 = document.getElementById('s0');
        if (s0) s0.classList.add('show');
      }, 560);
    } else {
      const s0 = document.getElementById('s0');
      if (s0) s0.classList.add('show');
    }
  }

  if (introEl) {
    if (introLogo) {
      setTimeout(() => {
        introLogo.style.transition = 'opacity 0.5s ease, transform 0.65s cubic-bezier(.34,1.56,.64,1)';
        introLogo.style.opacity    = '1';
        introLogo.style.transform  = 'scale(1)';
      }, 150);
    }
    if (introText) {
      setTimeout(() => {
        introText.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,1,.36,1)';
        introText.style.opacity    = '1';
        introText.style.transform  = 'translateX(0)';
      }, 450);
    }
    if (introTagline) {
      setTimeout(() => {
        introTagline.style.transition = 'opacity 0.7s ease';
        introTagline.style.opacity    = '1';
      }, 850);
    }
    setTimeout(showLoginScreen, 2600);
  } else {
    console.warn('[Fylox] #s_intro no encontrado — mostrando s0 directamente');
    showLoginScreen();
  }

  // ── 3. Inicializar según contexto ────────────────────
  if (window.Pi) {
    // Estamos en Pi Browser — mostrar placeholder hasta que el usuario toque
    console.log('[Fylox] Pi Browser detectado — esperando auth del usuario');
    const hb = document.getElementById('home-balance');
    if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';
    _setupPiLoginButton();
  } else {
    // Fuera del Pi Browser — modo demo restringido
    console.log('[Fylox] Modo demo — funciones de pago deshabilitadas');
    _startDemoMode();
  }

});

// ── Auth con Pi SDK ──────────────────────────────────
function _setupPiLoginButton() {
  const btn = document.getElementById('pi-login-btn');
  if (!btn) return;

  btn.addEventListener('click', async function() {
    btn.disabled     = true;
    btn.innerHTML    = '<span style="opacity:.6">Connecting…</span>';

    try {
      await _authenticateWithPi();
    } catch (err) {
      console.error('[Fylox] Auth fallida:', err);
      btn.disabled  = false;
      btn.innerHTML = '<span style="position:relative;z-index:1">Continue with Pi Network →</span>';
      FyloxNotification.show({
        icon: '⚠️', title: 'Error de conexión',
        sub: 'Intentá de nuevo', amt: '', sound: false,
      });
    }
  });
}

async function _authenticateWithPi() {
  return new Promise((resolve, reject) => {
    Pi.authenticate(
      ['username', 'payments', 'wallet_address'],
      _onIncompletePayment
    ).then(async (authResult) => {
      try {
        // Enviar accessToken al backend para verificar con Pi Platform API
        const data = await apiCall('POST', '/auth/pi', {
          accessToken: authResult.accessToken,
          user:        authResult.user,
        });

        // Guardar token JWT del backend
        setToken(data.token);

        // Actualizar UI con datos reales
        updateUIWithUser(data.username || authResult.user.username, data.balance || 0);

        // Aplicar ?pay= pendiente AHORA que el usuario está autenticado
        if (window._pendingPayTo) {
          const to = window._pendingPayTo;
          window._pendingPayTo = null;
          PaymentState.setTo(to);
          const mEl = document.getElementById('s11q-merchant-name');
          if (mEl) mEl.textContent = to;
          // Navegar directo a la pantalla de pago
          setTimeout(() => goTo('s11q'), 300);
        } else {
          goTo('s5');
        }

        // Arrancar polling de saldo
        startBalancePolling();

        resolve(data);
      } catch (err) {
        reject(err);
      }
    }).catch(reject);
  });
}

// ── Pagos incompletos — Pi SDK los detecta al iniciar ─
async function _onIncompletePayment(payment) {
  console.log('[Fylox] Pago incompleto detectado:', payment.identifier);
  try {
    // Intentar completar el pago pendiente
    await apiCall('POST', '/payments/complete', {
      paymentId: payment.identifier,
      txid:      payment.transaction?.txid,
    });
    console.log('[Fylox] Pago incompleto resuelto:', payment.identifier);
  } catch (err) {
    console.warn('[Fylox] No se pudo resolver pago incompleto:', err.message);
  }
}

// ── Modo demo ────────────────────────────────────────
//  Muestra la UI pero bloquea todas las funciones de pago real.
function _startDemoMode() {
  updateUIWithUser('Pioneer', 0.00);

  // Marcar la app como demo — fyloxSendPayment() lo verifica
  window._fyloxDemoMode = true;

  // Parchear el botón de login para mostrar aviso
  const btn = document.getElementById('pi-login-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      FyloxNotification.show({
        icon: 'ℹ️',
        title: 'Abrí en Pi Browser',
        sub:   'Los pagos reales requieren el Pi Browser',
        amt:   '',
        sound: false,
      });
    });
  }
}
