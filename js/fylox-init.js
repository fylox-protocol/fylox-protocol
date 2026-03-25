// ═══════════════════════════════════════════════════
//  FYLOX INITIALIZATION & AUTH - FULL VERSION
// ═══════════════════════════════════════════════════

window.onload = async function() {

  // 0. INTERCEPTAR ?pay= — QR universal
  const urlParams = new URLSearchParams(window.location.search);
  const payTo = urlParams.get('pay');
  if (payTo) {
    window.SEND_TO = payTo;
    const mEl = document.getElementById('s11q-merchant-name');
    if (mEl) mEl.textContent = payTo;
    window._pendingPayTo = payTo;
  }

  // 1. ANIMACIONES DE INTRO (Tu código original preservado)
  const introEl = document.getElementById('s_intro');
  const introLogo = document.getElementById('intro-logo');
  const introText = document.getElementById('intro-text');
  const introTagline = document.getElementById('intro-tagline');

  if (introEl) {
    setTimeout(() => {
      if(introLogo) {
        introLogo.style.transition = 'opacity 0.5s ease, transform 0.65s cubic-bezier(.34,1.56,.64,1)';
        introLogo.style.opacity = '1';
        introLogo.style.transform = 'scale(1)';
      }
    }, 150);
    setTimeout(() => {
      if(introText) {
        introText.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,1,.36,1)';
        introText.style.opacity = '1';
        introText.style.transform = 'translateX(0)';
      }
    }, 450);
    setTimeout(() => {
      if(introTagline) {
        introTagline.style.transition = 'opacity 0.7s ease';
        introTagline.style.opacity = '1';
      }
    }, 850);
    setTimeout(() => {
      introEl.style.transition = 'opacity 0.55s ease';
      introEl.style.opacity = '0';
      setTimeout(() => {
        introEl.style.display = 'none';
        // Decidimos qué pantalla mostrar después de la intro
        const startScreen = getToken() ? 's5' : 's0';
        const s = document.getElementById(startScreen);
        if (s) s.classList.add('show');
      }, 560);
    }, 2600);
  }

  // 2. IDIOMA Y TEMA
  const savedLang = FyloxStorage.get('fylox-lang');
  if (typeof applyLang === 'function') {
    applyLang(savedLang || (typeof detectLang === 'function' ? detectLang() : 'en'));
  }

  const savedTheme = FyloxStorage.get('fylox-theme');
  if (savedTheme === 'light') document.documentElement.classList.add('light');

  // 3. BOTÓN DE LOGIN
  const loginBtn = document.getElementById('pi-login-btn');
  if (loginBtn) {
    loginBtn.onclick = handlePiLogin;
  }
};

// ═══════════════════════════════════════════════════
//  LÓGICA DE AUTENTICACIÓN (RENDER + PI SDK)
// ═══════════════════════════════════════════════════

async function handlePiLogin() {
    if (!window.Pi) {
        alert("Abre Fylox desde el Pi Browser para conectar tu billetera.");
        return;
    }

    try {
        console.log("[Fylox] Autenticando...");
        // Autenticación con Pi SDK
        const auth = await Pi.authenticate(['payments', 'username'], onIncompletePaymentFound);
        
        // Login en tu servidor de Render
        const res = await FyloxAPI.login(auth);
        setToken(res.token);

        // Cargar datos reales desde MongoDB
        await refreshUserData();
        await loadActivity();

        // Si venía de un QR, ir a pagar. Si no, al Home.
        if (window._pendingPayTo) {
            goTo('s11');
        } else {
            goTo('s5');
        }

    } catch (err) {
        console.error("[Fylox] Login error:", err);
        alert("Error de conexión con Pi Network.");
    }
}

// ═══════════════════════════════════════════════════
//  PAGOS INCOMPLETOS
// ═══════════════════════════════════════════════════

function onIncompletePaymentFound(payment) {
    console.log("[Fylox] Pago pendiente encontrado...");
    FyloxAPI.completePayment(payment)
        .then(() => {
            if (typeof refreshUserData === 'function') refreshUserData();
        })
        .catch(err => console.error("[Fylox] Error en pago incompleto:", err));
}
