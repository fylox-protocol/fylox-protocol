window.onload = async function() {

  // 0. INTERCEPTAR ?pay= — QR universal de otro Pioneer
  const urlParams = new URLSearchParams(window.location.search);
  const payTo = urlParams.get('pay');
  if (payTo) {
    window.SEND_TO = payTo;
    const mEl = document.getElementById('s11q-merchant-name');
    if (mEl) mEl.textContent = payTo;
    window._pendingPayTo = payTo;
  }

  const introEl      = document.getElementById('s_intro');
  const introLogo    = document.getElementById('intro-logo');
  const introText    = document.getElementById('intro-text');
  const introTagline = document.getElementById('intro-tagline');

  // FIX: Función auxiliar para mostrar s0 de forma segura
  function showLoginScreen() {
    if (introEl) {
      introEl.style.transition = 'opacity 0.55s ease';
      introEl.style.opacity = '0';
      setTimeout(() => {
        introEl.style.display = 'none';
        introEl.classList.remove('show');
        const s0 = document.getElementById('s0');
        if (s0) s0.classList.add('show');
      }, 560);
    } else {
      // No hay intro — mostrar s0 directamente
      const s0 = document.getElementById('s0');
      if (s0) s0.classList.add('show');
    }
  }

  if (introEl) {
    // FIX: Verificar que los elementos del intro existan antes de animarlos
    if (introLogo) {
      setTimeout(() => {
        introLogo.style.transition = 'opacity 0.5s ease, transform 0.65s cubic-bezier(.34,1.56,.64,1)';
        introLogo.style.opacity = '1';
        introLogo.style.transform = 'scale(1)';
      }, 150);
    }

    if (introText) {
      setTimeout(() => {
        introText.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,1,.36,1)';
        introText.style.opacity = '1';
        introText.style.transform = 'translateX(0)';
      }, 450);
    }

    if (introTagline) {
      setTimeout(() => {
        introTagline.style.transition = 'opacity 0.7s ease';
        introTagline.style.opacity = '1';
      }, 850);
    }

    // FIX: El timeout para ocultar el intro siempre se ejecuta,
    // independientemente de si los elementos hijos existen
    setTimeout(() => {
      showLoginScreen();
    }, 2600);

  } else {
    // FIX: Si no hay intro en el DOM, mostrar s0 de inmediato
    console.warn('[Fylox] #s_intro no encontrado — mostrando s0 directamente');
    showLoginScreen();
  }

  // 1. Auto-detect & apply language silently
  try {
    const savedLang   = FyloxStorage.get('fylox-lang');
    const detectedLang = (savedLang && LANGS[savedLang]) ? savedLang : detectLang();
    applyLang(detectedLang);
    console.log('[Fylox] Language:', detectedLang, savedLang ? '(saved)' : '(detected)');
  } catch (e) {
    console.warn('[Fylox] Error aplicando idioma:', e.message);
  }

  // 2. Apply theme
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

  // 3. Pre-set balance
  if (window.Pi) {
    console.log('[Fylox] Pi Browser detectado — auth pendiente de tap del usuario');
    const hb = document.getElementById('home-balance');
    if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';
  } else {
    console.log('[Fylox] Demo mode');
    updateUIWithUser(window._fyloxUsername || 'Pioneer', 0.00);
  }

};
