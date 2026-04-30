// ═══════════════════════════════════════════════════
//  FYLOX INIT — v7 FINAL
//  - Sin toasts de debug
//  - Login con Pi SDK funcionando
//  - Payload correcto para /auth/pi
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {

  try {
    const savedLang    = FyloxStorage.get('fylox-lang');
    const detectedLang = (savedLang && LANGS[savedLang]) ? savedLang : detectLang();
    applyLang(detectedLang);
  } catch (e) {}

  try {
    const savedTheme = FyloxStorage.get('fylox-theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      const btn = document.getElementById('dark-toggle-btn');
      if (btn) btn.classList.add('on');
    }
  } catch (e) {}

  const urlParams = new URLSearchParams(window.location.search);
  const rawPayTo  = urlParams.get('pay');
  if (rawPayTo) {
    const PI_USERNAME_REGEX = /^@?[a-zA-Z0-9_]{2,32}(\.pi)?$/;
    if (PI_USERNAME_REGEX.test(rawPayTo.trim())) {
      window._pendingPayTo = rawPayTo.trim();
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }

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
    showLoginScreen();
  }

  if (window.Pi) {
  try {
    Pi.init({ version: "2.0", sandbox: false });
  } catch (e) {
    console.error('[Fylox] Pi.init() falló:', e);
  }
  const hb = document.getElementById('home-balance');
  if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';
  _setupPiLoginButton();

  // ── Auto-restore de sesión si ya hay JWT ──────────────
  if (typeof getToken === 'function' && getToken()) {
    if (typeof loadUserProfile === 'function') {
      loadUserProfile().then(() => {
        if (typeof startBalancePolling === 'function') startBalancePolling();
      }).catch(err => {
        console.warn('[Fylox] No se pudo restaurar sesión:', err.message);
      });
    }
  }
} else {
  _startDemoMode();
}
});

function _setupPiLoginButton() {
  const btn = document.getElementById('pi-login-btn');
  if (!btn) return;

  btn.addEventListener('click', async function() {
    if (btn.disabled) return;
    btn.disabled  = true;
    btn.innerHTML = '<span style="opacity:.6">Conectando…</span>';

    try {
      await _authenticateWithPi();
    } catch (err) {
      btn.disabled  = false;
      btn.innerHTML = '<span style="position:relative;z-index:1">Continuar con Pi Network →</span>';
      FyloxNotification.show({
        icon: '⚠️', title: 'Error de conexión',
        sub: err.message || 'Intentá de nuevo', amt: '', sound: false,
      });
    }
  });
}

function piLogin() {
  if (!window.Pi || window._fyloxDemoMode) {
    FyloxNotification.show({
      icon: 'ℹ️', title: 'Abrí en Pi Browser',
      sub: 'Los pagos reales requieren el Pi Browser',
      amt: '', sound: false,
    });
    return;
  }

  const btn = document.getElementById('pi-login-btn');
  if (!btn || btn.disabled) return;

  btn.disabled  = true;
  btn.innerHTML = '<span style="opacity:.6">Conectando…</span>';

  _authenticateWithPi().catch(err => {
    btn.disabled  = false;
    btn.innerHTML = '<span style="position:relative;z-index:1">Continuar con Pi Network →</span>';
    FyloxNotification.show({
      icon: '⚠️', title: 'Error de conexión',
      sub: err.message || 'Intentá de nuevo', amt: '', sound: false,
    });
  });
}

async function _authenticateWithPi() {
  return new Promise((resolve, reject) => {
    Pi.authenticate(
      ['username', 'payments', 'wallet_address'],
      _onIncompletePayment
    ).then(async (authResult) => {
      try {
        const payload = { accessToken: authResult.accessToken };
        if (authResult.user?.wallet_address) {
          payload.walletAddress = authResult.user.wallet_address;
        }

        const data = await apiCall('POST', '/auth/pi', payload);

        setToken(data.token);
        updateUIWithUser(
          data.user?.username || authResult.user.username,
          data.balance || 0
        );

        if (window._pendingPayTo) {
          const to             = window._pendingPayTo;
          window._pendingPayTo = null;
          PaymentState.setTo(to);
          const mEl = document.getElementById('s11q-merchant-name');
          if (mEl) mEl.textContent = to;
          setTimeout(() => goTo('s11q'), 300);
        } else {
          goTo('s5');
        }

        startBalancePolling();
        FyloxRealtime.start();
        resolve(data);

      } catch (err) {
        reject(err);
      }
    }).catch(reject);
  });
}

async function _onIncompletePayment(payment) {
  try {
    await apiCall('POST', '/payments/complete', {
      paymentId: payment.identifier,
      txid:      payment.transaction?.txid,
    });
  } catch (err) {
    console.warn('[Fylox] No se pudo resolver pago incompleto:', err.message);
  }
}

function _startDemoMode() {
  window._fyloxDemoMode = true;
  updateUIWithUser('Pioneer', 0.00);

  const btn = document.getElementById('pi-login-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      FyloxNotification.show({
        icon: 'ℹ️', title: 'Abrí en Pi Browser',
        sub: 'Los pagos reales requieren el Pi Browser',
        amt: '', sound: false,
      });
    });
  }
}
