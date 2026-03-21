// ═══════════════════════════════════════════════════
//  FYLOX INIT — Arranque de la app
// ═══════════════════════════════════════════════════

window.onload = async function() {

  // 0. INTRO SCREEN
  const introEl      = document.getElementById('s_intro');
  const introLogo    = document.getElementById('intro-logo');
  const introText    = document.getElementById('intro-text');
  const introTagline = document.getElementById('intro-tagline');

  if (introEl) {
    setTimeout(() => {
      introLogo.style.transition = 'opacity 0.5s ease, transform 0.65s cubic-bezier(.34,1.56,.64,1)';
      introLogo.style.opacity = '1';
      introLogo.style.transform = 'scale(1)';
    }, 150);
    setTimeout(() => {
      introText.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,1,.36,1)';
      introText.style.opacity = '1';
      introText.style.transform = 'translateX(0)';
    }, 450);
    setTimeout(() => {
      introTagline.style.transition = 'opacity 0.7s ease';
      introTagline.style.opacity = '1';
    }, 850);
    setTimeout(() => {
      introEl.style.transition = 'opacity 0.55s ease';
      introEl.style.opacity = '0';
      setTimeout(() => {
        introEl.style.display = 'none';
        introEl.classList.remove('show');
        const s0 = document.getElementById('s0');
        if (s0) s0.classList.add('show');
      }, 560);
    }, 2600);
  }

  // 1. Idioma — persisted tiene prioridad sobre auto-detect
  const savedLang    = FyloxStorage.get('fylox-lang');
  const detectedLang = (savedLang && LANGS[savedLang]) ? savedLang : detectLang();
  applyLang(detectedLang);
  console.log('[Fylox] Language:', detectedLang, savedLang ? '(saved)' : '(detected)');

  // 2. Tema
  const savedTheme = FyloxStorage.get('fylox-theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
    const btn = document.getElementById('dark-toggle-btn');
    if (btn) btn.classList.add('on');
  }

  // 3. Balance — espera tap del usuario en Pi Browser
  if (window.Pi) {
    console.log('[Fylox] Pi Browser detectado — auth pendiente de tap del usuario');
    const hb = document.getElementById('home-balance');
    if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';
  } else {
    console.log('[Fylox] Demo mode');
    updateUIWithUser('joaquin_vera', 100.00);
  }

};
