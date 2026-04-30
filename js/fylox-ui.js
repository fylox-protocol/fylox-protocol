// ═══════════════════════════════════════════════════
//  FYLOX UI — v2
//  - goTo() corregida (código estaba fuera del scope)
//  - window.SEND_TO/AMT reemplazados por PaymentState
//  - dispatchEvent('fylox:screen') — activa todos los módulos
//  - fetchPiPrice usa setPiPrice() de fylox-utils.js
//  - Sin monkey-patches encadenados
//  - Contador de Pioneers solo desde la API
// ═══════════════════════════════════════════════════

// ── Tema — restaurar al cargar ───────────────────────
(function() {
  try {
    const saved = FyloxStorage.get('fylox-theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      const btn = document.getElementById('dark-toggle-btn');
      if (btn) btn.classList.add('on');
    }
  } catch(e) { /* Pi Browser puede bloquear localStorage en carga */ }
})();

function toggleDark() {
  const html   = document.documentElement;
  const isDark = !html.classList.contains('light');
  html.classList.toggle('light', isDark);
  FyloxStorage.set('fylox-theme', isDark ? 'light' : 'dark');
  const btn   = document.getElementById('dark-toggle-btn');
  const label = document.getElementById('dark-label');
  if (btn)   btn.classList.toggle('on', isDark);
  if (label) label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
}

// ═══════════════════════════════════════════════════
//  NAVEGACIÓN
// ═══════════════════════════════════════════════════

let kval = '0';

function goTo(id) {
  const curr = document.querySelector('.scr.show');
  const next = document.getElementById(id);
  if (!next || !curr || curr === next) return;

  // 1. Cambiar pantalla
  curr.classList.remove('show');
  next.classList.add('show', 'enter');
  next.addEventListener('animationend', () => next.classList.remove('enter'), { once: true });

  // 3. Reset scroll
  const sc = next.querySelector('.sc');
  if (sc) sc.scrollTop = 0;

  // 4. Bottom nav
  const bnav       = document.querySelector('.bnav');
  const navScreens = ['s5','s9','s11','s12','s14','s15','s16','s17','s18','s19','s20','s21','s22','s23','s24'];
  if (bnav) {
    bnav.style.display = navScreens.includes(id) ? 'flex' : 'none';
    document.querySelectorAll('.bnav .bi').forEach(btn => {
      const ni   = btn.querySelector('.ni');
      const nl   = btn.querySelector('.nl');
      const dest = btn.dataset.go;
      if (!ni || !nl || !dest) return;
      ni.classList.toggle('on', dest === id);
      nl.classList.toggle('on', dest === id);
    });
  }

  // 5. Pantallas con lógica especial — dentro de goTo
  if (id === 's7') {
    const amt   = kval !== '0' ? kval : '0.00';
    const recip = PaymentState.getTo() || '@Pioneer';
    const el7amt   = document.getElementById('s7amt');
    const el7to    = document.getElementById('s7to');
    const el7total = document.getElementById('s7total');
    if (el7amt)   el7amt.innerHTML  = `${esc(amt)} <span style="font-size:26px;color:var(--c)">π</span>`;
    if (el7to)    el7to.textContent  = recip;
    if (el7total) el7total.textContent = amt + ' π';
    PaymentState.setAmt(amt);
  }

  if (id === 's8') {
    const el8 = document.getElementById('s8msg');
    const { to, amt } = PaymentState.get();
    if (el8) el8.textContent = `${fmtPi(amt || 0)} π sent to ${to || '@Pioneer'}`;
  }

if (curr && curr.id === 's10') {
  const video = document.getElementById('qr-video');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
  if (window._qrScanLoop) {
    cancelAnimationFrame(window._qrScanLoop);
    window._qrScanLoop = null;
  }
  // Reset de estado visual
  curr.classList.remove('detected', 'invalid');
  const statusDot = document.getElementById('s10-status-dot');
  const statusEl = document.getElementById('qr-status');
  const statusPill = document.getElementById('s10-status-pill');
  if (statusDot)  { statusDot.style.background = ''; statusDot.style.boxShadow = ''; statusDot.style.animation = ''; }
  if (statusEl)   statusEl.innerHTML = '<span data-i18n="searchingQR">Buscando código QR…</span>';
  if (statusPill) { statusPill.style.borderColor = ''; statusPill.style.background = ''; }
}

  // 7. Activar cámara QR al entrar a s10
  if (id === 's10') {
  const video  = document.getElementById('qr-video');
  const canvas = document.getElementById('qr-canvas');
  const status = document.getElementById('qr-status');

  if (!video || !canvas) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    if (status) status.innerHTML = '<span style="color:#ff6b81">Cámara no soportada en este browser</span>';
    return;
  }

  // Intentar con cámara trasera, fallback a cualquier cámara
  const constraints = [
    { video: { facingMode: { exact: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: { facingMode: 'environment' } },
    { video: true },
  ];

  async function tryCamera(index) {
    if (status) status.textContent = `Intentando cámara ${index}...`;
    if (index >= constraints.length) {
      if (status) status.innerHTML = '<span style="color:#ff6b81">No se pudo acceder a la cámara</span>';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints[index]);
      video.srcObject = stream;
      await video.play();

      const ctx      = canvas.getContext('2d');
      let detected   = false;
      let frameCount = 0;

      function scanFrame() {
        if (detected) return;
        if (video.readyState >= 2 && video.videoWidth > 0) {
          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          frameCount++;
  // status queda con el texto i18n "Buscando código QR…" sin sobrescribir

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            detected = true;
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

            const raw      = code.data;
            let merchant   = '';
            let amount     = '0';

            try {
              if (raw.startsWith('fylox://pay?')) {
                const url = new URL(raw.replace('fylox://', 'https://x/'));
                merchant  = url.searchParams.get('to')     || '';
                amount    = url.searchParams.get('amount') || '0';
              } else {
                merchant = raw.slice(0, 50);
              }
            } catch {
              merchant = raw.slice(0, 50);
            }

            if (!merchant) {
              detected = false;
              window._qrScanLoop = requestAnimationFrame(scanFrame);
              return;
            }

            PaymentState.setTo(merchant);
            if (amount !== '0') {
            PaymentState.setAmt(amount);
            kval = amount;
            } else {
            kval = '0';
            }

           const mEl = document.getElementById('s11q-merchant-name');
           if (mEl) mEl.textContent = merchant;
           const aEl = document.getElementById('sa');
           if (aEl) aEl.innerHTML = `${esc(kval)} <span style="font-size:26px;color:var(--c)">π</span>`;

         // ── Feedback premium de detección ──
           const s10El = document.getElementById('s10');
           if (s10El) s10El.classList.add('detected');

        // Cambiar status pill a verde con check
           const statusDot = document.getElementById('s10-status-dot');
           const statusEl = document.getElementById('qr-status');
           const statusPill = document.getElementById('s10-status-pill');
           if (statusDot)  { statusDot.style.background = 'var(--grn)'; statusDot.style.boxShadow = '0 0 12px var(--grn)'; statusDot.style.animation = 'none'; }
           if (statusEl)   statusEl.innerHTML = '✓ Código detectado';
           if (statusPill) { statusPill.style.borderColor = 'rgba(0,224,144,.4)'; statusPill.style.background = 'rgba(0,224,144,.12)'; }

        // Beep sutil de confirmación
        try {
           const ctx = new (window.AudioContext || window.webkitAudioContext)();
           const osc = ctx.createOscillator();
           const gain = ctx.createGain();
           osc.type = 'sine';
           osc.frequency.setValueAtTime(880, ctx.currentTime);
           osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
           gain.gain.setValueAtTime(0.18, ctx.currentTime);
           gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
           osc.connect(gain); gain.connect(ctx.destination);
           osc.start(); osc.stop(ctx.currentTime + 0.18);
           } catch(e) {}

        // Esperar 650ms antes de saltar (para que el usuario vea el efecto)
           setTimeout(() => {
           stream.getTracks().forEach(t => t.stop());
           video.srcObject = null;
           if (s10El) s10El.classList.remove('detected'); // limpiar para próxima vez
           goTo('s11q');
           }, 650);
           return;
          }
        }
        window._qrScanLoop = requestAnimationFrame(scanFrame);
      }

      window._qrScanLoop = requestAnimationFrame(scanFrame);

    } catch (err) {
      if (status) status.textContent = `Error ${index}: ${err.name} - ${err.message}`;
      console.warn(`[Fylox] Cámara constraint ${index} falló:`, err.message);
      setTimeout(() => tryCamera(index + 1), 500);
    }
  }

  tryCamera(0);
}
  

  // 8. Animación de balance en s9
  if (id === 's9') {
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target    = parseFloat(wb.dataset.value) || window._fyloxBalance || 0;
      let startTime   = null;
      const duration  = 1200;
      const animate   = (now) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = (target * ease).toFixed(2);
        wb.innerHTML   = `${current} <span style="font-size:24px;color:var(--c)">π</span>`;
        if (progress < 1) requestAnimationFrame(animate);
        else wb.innerHTML = `${target.toFixed(2)} <span style="font-size:24px;color:var(--c)">π</span>`;
      };
      requestAnimationFrame(animate);
    }
  }

  // 9. Animación de balance en s16
  if (id === 's16') {
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target   = parseFloat(wb.dataset.value) || window._fyloxBalance || 0;
      let startTime  = null;
      const duration = 1800;
      const easeOut  = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      wb.innerHTML   = `0.00 <span style="font-size:24px;color:var(--c)">π</span>`;
      const animate  = (now) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const current  = (target * easeOut(progress)).toFixed(2);
        wb.innerHTML   = `${current} <span style="font-size:24px;color:var(--c)">π</span>`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }

  // 10. Reset keypad al entrar a s11q
  if (id === 's11q') {
    kval = '0';
    const saEl = document.getElementById('sa');
    if (saEl) saEl.innerHTML = '0.00 <span style="font-size:26px;color:var(--c)">π</span>';
  }

  // 11. QR del comercio al entrar a s14
  if (id === 's14') {
    const name = window._currentMerchant    || 'Merchant';
    const pi   = window._currentMerchantPi  || '@merchant';
    const icon = window._currentMerchantIcon || '🏪';
    document.querySelectorAll('#s14 .sc [style*="font-size:52px"]').forEach(el => el.textContent = icon);
    document.querySelectorAll('#s14 .sc [style*="font-size:22px"]').forEach(el => el.textContent = name);
    const qrData = `fylox://pay?to=${encodeURIComponent(pi)}&name=${encodeURIComponent(name)}`;
    generateQR('qr-merchant-img', qrData, 160);
    // PaymentState en vez de window.SEND_TO
    PaymentState.setTo(pi);
    const mEl = document.getElementById('s11q-merchant-name');
    if (mEl) mEl.textContent = name;
  }

  // 12. Vibración de navegación
  if (navigator.vibrate) navigator.vibrate(20);
  window.scrollTo(0, 0);
  // Sticky blur header al hacer scroll
  const scEl   = next.querySelector('.sc');
  const tnavEl = next.querySelector('.tnav');
  if (scEl && tnavEl) {
    scEl.addEventListener('scroll', () => {
      tnavEl.classList.toggle('scrolled', scEl.scrollTop > 10);
    }, { passive: true });
  }

  // 13. Disparar evento para que todos los módulos reaccionen
  //     Reemplaza los 4 monkey-patches encadenados
  document.dispatchEvent(new CustomEvent('fylox:screen', { detail: { id } }));
}

// ── Click delegado — navegación ──────────────────────
document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-go]');
  if (!el) return;
  e.preventDefault();
  if (el.dataset.go === 's14' && el.dataset.merchant) {
    window._currentMerchant     = el.dataset.merchant;
    window._currentMerchantPi   = el.dataset.merchantPi;
    window._currentMerchantIcon = el.dataset.merchantIcon || '🏪';
  }
  goTo(el.dataset.go);
});

// ── Keypad ───────────────────────────────────────────
document.addEventListener('click', function(e) {
  const k = e.target.dataset.k;
  if (k === undefined) return;

  if (k === 'x') {
    kval = kval.length > 1 ? kval.slice(0, -1) : '0';
  } else if (k === '.') {
    if (!kval.includes('.')) kval += '.';
  } else {
    kval = kval === '0' ? k : kval + k;
    if (kval.length > 9) kval = kval.slice(0, -1);
  }

  // Actualizar display
  const activeSa = document.querySelector('.scr.show #sa') ||
                   document.querySelector('.scr.show #sa-send');
  if (activeSa) {
    activeSa.innerHTML = `${esc(kval)} <span style="font-size:26px;color:var(--c)">π</span>`;
  }

  // PaymentState en vez de window.SEND_AMT / window.KVAL
  PaymentState.setAmt(kval);
});

function selVote(el) {
  document.querySelectorAll('.vote-opt').forEach(b => b.classList.remove('vsel'));
  el.classList.add('vsel');
  if (navigator.vibrate) navigator.vibrate(40);
}

function filterTx(el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
}

// ═══════════════════════════════════════════════════
//  LIVE ENGINE
// ═══════════════════════════════════════════════════

function updateTime() {
  const now = new Date();
  const t   = now.getHours().toString().padStart(2, '0') + ':' +
              now.getMinutes().toString().padStart(2, '0');
  document.querySelectorAll('.stime').forEach(el => el.textContent = t);
}
updateTime();
setInterval(updateTime, 10000);
// ── Precio de Pi — vía backend (evita CORS) ──────────
async function fetchPiPrice() {
  try {
    const res = await fetch('https://fylox-backend.onrender.com/api/price/pi');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.price || data.price <= 0) throw new Error('Precio inválido');

    const newPrice  = parseFloat(data.price);
    const prevPrice = getPiPrice();
    const isUp      = newPrice >= prevPrice;

    setPiPrice(newPrice);

    const el = document.getElementById('pi-price');
    if (el) {
      el.textContent = '$' + newPrice.toFixed(4);
      el.classList.remove('price-up', 'price-down');
      void el.offsetWidth;
      el.classList.add(isUp ? 'price-up' : 'price-down');
    }

    const balanceEl = document.getElementById('home-ars');
    if (balanceEl && window._fyloxBalance) {
      balanceEl.textContent = fmtUSD(window._fyloxBalance);
    }
  } catch (err) {
    console.warn('[Fylox] No se pudo obtener precio de Pi desde backend:', err.message);
  }
}

fetchPiPrice();
setInterval(fetchPiPrice, 60000);

// ── Contador de Pioneers — solo desde API ────────────
//  Eliminado el contador falso y aleatorio.
//  Se actualiza cuando la API devuelve el dato real.
function updatePioneers(count) {
  const el = document.getElementById('agora-pioneers');
  if (!el || !count) return;
  el.textContent = Number(count).toLocaleString('en-US');
  el.classList.remove('live-num');
  void el.offsetWidth;
  el.classList.add('live-num');
}

// ── Timers de votación ───────────────────────────────
let voteMs = (2 * 24 * 60 + 14 * 60) * 60 * 1000;

function updateVoteTimer() {
  voteMs = Math.max(0, voteMs - 1000);
  const el = document.getElementById('agora-vote-timer');
  if (!el) return;
  const d = Math.floor(voteMs / 86400000);
  const h = Math.floor((voteMs % 86400000) / 3600000);
  const m = Math.floor((voteMs % 3600000) / 60000);
  const s = Math.floor((voteMs % 60000) / 1000);
  el.textContent = d > 0
    ? `${d}d ${h}h ${m.toString().padStart(2, '0')}m`
    : `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}
setInterval(updateVoteTimer, 1000);

// ═══════════════════════════════════════════════════
//  TOASTS DEMO (pantalla de inicio)
// ═══════════════════════════════════════════════════

const TOAST_I18N = {
  en: [
    { title:'Maria C. sent you Pi',          sub:'Verified Pioneer · Buenos Aires' },
    { title:'New ORACLE task nearby',         sub:'Flood verification · 1.2 km away' },
    { title:'AGORA vote is closing',          sub:'GPT-6 Banking access · 14 min left' },
    { title:'Rodrigo P. paid at merchant',    sub:'Cafe del Centro · Via Fylox' },
    { title:'NEXUS score updated',            sub:'ORACLE task completed +81 pts' },
    { title:'Payment confirmed',              sub:'Supermercado · NFC' },
    { title:'ORACLE task confirmed',          sub:'Lagos Norte · 3 more verifications' },
    { title:'New vote proposal live',         sub:'Anthropic · Claude autonomy' },
  ],
  es: [
    { title:'Maria C. te envió Pi',           sub:'Pioneer verificado · Buenos Aires' },
    { title:'Nueva tarea ORACLE cerca',       sub:'Verificación de inundación · 1.2 km' },
    { title:'Votación AGORA por cerrar',      sub:'GPT-6 acceso bancario · 14 min' },
    { title:'Rodrigo P. pagó en comercio',    sub:'Café del Centro · Vía Fylox' },
    { title:'Puntuación NEXUS actualizada',   sub:'Tarea ORACLE completada +81 pts' },
    { title:'Pago confirmado',                sub:'Supermercado · NFC' },
    { title:'Tarea ORACLE confirmada',        sub:'Lagos Norte · 3 verificaciones más' },
    { title:'Nueva propuesta de voto',        sub:'Anthropic · Autonomía de Claude' },
  ],
  tl: [
    { title:'Nagpadala si Maria C. ng Pi',    sub:'Verified Pioneer · Buenos Aires' },
    { title:'Bagong ORACLE task malapit',     sub:'Flood verification · 1.2 km ang layo' },
    { title:'Magsasara na ang AGORA vote',    sub:'GPT-6 Banking access · 14 min na lang' },
    { title:'Nagbayad si Rodrigo P.',         sub:'Cafe del Centro · Sa Fylox' },
    { title:'Na-update ang NEXUS score',      sub:'ORACLE task kumpleto +81 pts' },
    { title:'Nakumpirma ang bayad',           sub:'Supermercado · NFC' },
    { title:'ORACLE task nakumpirma',         sub:'Lagos Norte · 3 verification pa' },
    { title:'Bagong vote proposal live',      sub:'Anthropic · Claude autonomy' },
  ],
  ng: [
    { title:'Maria C. don send you Pi',       sub:'Verified Pioneer · Buenos Aires' },
    { title:'New ORACLE task dey near',       sub:'Flood verification · 1.2 km away' },
    { title:'AGORA vote go close soon',       sub:'GPT-6 Banking access · 14 min remain' },
    { title:'Rodrigo P. pay for shop',        sub:'Cafe del Centro · Via Fylox' },
    { title:'NEXUS score don update',         sub:'ORACLE task complete +81 pts' },
    { title:'Payment don confirm',            sub:'Supermercado · NFC' },
    { title:'ORACLE task don confirm',        sub:'Lagos Norte · 3 more check remain' },
    { title:'New vote proposal don come out', sub:'Anthropic · Claude autonomy' },
  ],
  hi: [
    { title:'Maria C. ने आपको Pi भेजा',       sub:'Verified Pioneer · Buenos Aires' },
    { title:'नया ORACLE कार्य पास में',        sub:'बाढ़ सत्यापन · 1.2 km दूर' },
    { title:'AGORA मतदान बंद हो रहा है',      sub:'GPT-6 बैंकिंग · 14 मिनट बाकी' },
    { title:'Rodrigo P. ने दुकान पर भुगतान', sub:'Cafe del Centro · Fylox से' },
    { title:'NEXUS स्कोर अपडेट हुआ',          sub:'ORACLE कार्य पूरा +81 pts' },
    { title:'भुगतान की पुष्टि हुई',           sub:'Supermercado · NFC' },
    { title:'ORACLE कार्य की पुष्टि हुई',     sub:'Lagos Norte · 3 और सत्यापन' },
    { title:'नया मतदान प्रस्ताव लाइव',        sub:'Anthropic · Claude स्वायत्तता' },
  ],
  pt: [
    { title:'Maria C. enviou Pi para você',   sub:'Pioneer verificado · Buenos Aires' },
    { title:'Nova tarefa ORACLE próxima',     sub:'Verificação de enchente · 1.2 km' },
    { title:'Votação AGORA está encerrando',  sub:'GPT-6 acesso bancário · 14 min' },
    { title:'Rodrigo P. pagou no comerciante',sub:'Cafe del Centro · Via Fylox' },
    { title:'Pontuação NEXUS atualizada',     sub:'Tarefa ORACLE completa +81 pts' },
    { title:'Pagamento confirmado',           sub:'Supermercado · NFC' },
    { title:'Tarefa ORACLE confirmada',       sub:'Lagos Norte · 3 verificações' },
    { title:'Nova proposta de voto ao vivo',  sub:'Anthropic · Autonomia do Claude' },
  ],
  zh: [
    { title:'Maria C. 向您发送了Pi',          sub:'已认证Pioneer · 布宜诺斯艾利斯' },
    { title:'附近有新ORACLE任务',             sub:'洪水核查 · 1.2公里外' },
    { title:'AGORA投票即将关闭',             sub:'GPT-6银行访问 · 还剩14分钟' },
    { title:'Rodrigo P. 在商家付款',          sub:'Cafe del Centro · 通过Fylox' },
    { title:'NEXUS评分已更新',               sub:'ORACLE任务完成 +81分' },
    { title:'付款已确认',                    sub:'超市 · NFC' },
    { title:'ORACLE任务已确认',              sub:'拉各斯北部 · 还需3次验证' },
    { title:'新投票提案已上线',              sub:'Anthropic · Claude自主性' },
  ],
  id: [
    { title:'Maria C. mengirimkan Pi',        sub:'Pioneer Terverifikasi · Buenos Aires' },
    { title:'Tugas ORACLE baru di dekat',     sub:'Verifikasi banjir · 1.2 km' },
    { title:'Voting AGORA akan ditutup',      sub:'Akses perbankan GPT-6 · 14 menit' },
    { title:'Rodrigo P. bayar di merchant',   sub:'Cafe del Centro · Via Fylox' },
    { title:'Skor NEXUS diperbarui',          sub:'Tugas ORACLE selesai +81 pts' },
    { title:'Pembayaran dikonfirmasi',        sub:'Supermercado · NFC' },
    { title:'Tugas ORACLE dikonfirmasi',      sub:'Lagos Norte · 3 verifikasi lagi' },
    { title:'Proposal voting baru live',      sub:'Anthropic · Otonomi Claude' },
  ],
  vi: [
    { title:'Maria C. đã gửi Pi cho bạn',    sub:'Pioneer đã xác minh · Buenos Aires' },
    { title:'Có nhiệm vụ ORACLE mới',        sub:'Xác minh lũ lụt · cách 1.2 km' },
    { title:'Bỏ phiếu AGORA sắp đóng',      sub:'Truy cập ngân hàng GPT-6 · 14 phút' },
    { title:'Rodrigo P. đã thanh toán',      sub:'Cafe del Centro · Qua Fylox' },
    { title:'Điểm NEXUS đã cập nhật',        sub:'Hoàn thành ORACLE +81 điểm' },
    { title:'Thanh toán đã xác nhận',        sub:'Supermercado · NFC' },
    { title:'Nhiệm vụ ORACLE đã xác nhận',   sub:'Lagos Norte · còn 3 xác minh' },
    { title:'Đề xuất bỏ phiếu mới',         sub:'Anthropic · Quyền tự chủ Claude' },
  ],
  ko: [
    { title:'Maria C.가 Pi를 보냈습니다',     sub:'인증된 파이오니어 · 부에노스아이레스' },
    { title:'근처에 새 ORACLE 작업',          sub:'홍수 검증 · 1.2km 거리' },
    { title:'AGORA 투표가 마감됩니다',        sub:'GPT-6 뱅킹 접근 · 14분 남음' },
    { title:'Rodrigo P.가 상점에서 결제',     sub:'Cafe del Centro · Fylox 경유' },
    { title:'NEXUS 점수 업데이트됨',          sub:'ORACLE 작업 완료 +81점' },
    { title:'결제 확인됨',                   sub:'Supermercado · NFC' },
    { title:'ORACLE 작업 확인됨',            sub:'Lagos Norte · 검증 3개 더 필요' },
    { title:'새 투표 제안 공개',             sub:'Anthropic · Claude 자율성' },
  ],
};

const TOAST_META = [
  { icon:'💸', bg:'rgba(0,212,232,.12)',  amt:'+2.5 π' },
  { icon:'🔭', bg:'rgba(0,212,232,.12)',  amt:'+8 π'   },
  { icon:'🏛️', bg:'rgba(0,224,144,.12)', amt:'+4 π'   },
  { icon:'⚡', bg:'rgba(255,183,0,.12)', amt:'−18 π'  },
  { icon:'📦', bg:'rgba(139,92,246,.12)',amt:'763 pts' },
  { icon:'✅', bg:'rgba(0,224,144,.12)', amt:'−4.2 π' },
  { icon:'🌊', bg:'rgba(0,212,232,.12)', amt:'+12.5 π' },
  { icon:'🏛️', bg:'rgba(0,224,144,.12)', amt:'+6 π'   },
];

let toastIdx = 0;

function _getToasts() {
  const lang  = typeof currentLang !== 'undefined' ? currentLang : 'en';
  const texts = TOAST_I18N[lang] || TOAST_I18N['en'];
  return TOAST_META.map((m, i) => ({ ...m, ...texts[i] }));
}

function showToast(data) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t         = document.createElement('div');
  t.className     = 'toast';
  const amtColor  = data.amt.startsWith('+')
    ? 'var(--c)'
    : data.amt.startsWith('−') ? '#ff6b81' : 'var(--ylw)';

  // esc() — estos datos vienen de TOAST_I18N (estático) pero igual aplicamos
  t.innerHTML = `
    <div class="toast-icon" style="background:${data.bg}">${esc(data.icon)}</div>
    <div class="toast-body">
      <div class="toast-title">${esc(data.title)}</div>
      <div class="toast-sub">${esc(data.sub)}</div>
    </div>
    <div class="toast-amt" style="color:${amtColor}">${esc(data.amt)}</div>
  `;
  container.appendChild(t);
  if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove());
  }, 4200);
}

// ═══════════════════════════════════════════════════
//  QR GENERATOR
// ═══════════════════════════════════════════════════
function generateQR(elementId, data, size) {
  const el = document.getElementById(elementId);
  if (!el || typeof QRCode === 'undefined') return;
  el.innerHTML = '';
  new QRCode(el, {
    text:         data,
    width:        size || 180,
    height:       size || 180,
    colorDark:    '#060608',
    colorLight:   '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

// ═══════════════════════════════════════════════════
//  TRANSACCIONES
// ═══════════════════════════════════════════════════
let _txFilter = 'all';
let _txData   = [];

async function loadTransactions() {
  const list = document.getElementById('tx-list');
  if (!list) return;

  list.innerHTML = `
    <div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">
      <div style="width:24px;height:24px;border:2px solid var(--c);
        border-top-color:transparent;border-radius:50%;
        animation:spin .8s linear infinite;margin:0 auto 8px"></div>
      Cargando actividad...
    </div>`;

  try {
    const data = await apiCall('GET', '/user/transactions?limit=50');
    _txData    = data.transactions || [];
    renderTransactions(_txFilter);
  } catch (err) {
    console.warn('[Fylox] No se pudo cargar historial:', err.message);
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudo cargar el historial.</div>';
  }
}

function renderTransactions(filter) {
  _txFilter   = filter;
  const list  = document.getElementById('tx-list');
  if (!list) return;

  let txs = [..._txData];
  if (filter === 'sent')     txs = txs.filter(t => t.type === 'sent');
  if (filter === 'received') txs = txs.filter(t => t.type === 'received');

  if (txs.length === 0) {
    list.innerHTML = `<div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
      No hay transacciones aún.<br>
      <span style="font-size:11px;color:var(--t3)">Tus pagos aparecerán aquí.</span>
    </div>`;
    return;
  }

  list.innerHTML = txs.map(tx => {
    const isSent  = tx.type === 'sent';
    const color   = isSent ? 'var(--red)' : 'var(--grn)';
    const bgColor = isSent ? 'rgba(255,70,70,.07)' : 'rgba(0,224,144,.07)';
    const sign    = isSent ? '−' : '+';

    // esc() en valores del servidor
    const label  = esc(isSent
      ? (tx.toName || tx.toAddress || 'Pago enviado')
      : ('De @' + (tx.fromUsername || 'Pioneer')));
    const date   = esc(fmtDate(tx.createdAt));
    const amount = esc(String(tx.amount || 0));

    const arrow = isSent
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

    return `<div class="tx">
      <div class="ti" style="background:${bgColor};color:${color}">${arrow}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${label}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:1px">${date}</div>
      </div>
      <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">
        ${sign}${amount} π
      </div>
    </div>`;
  }).join('');
}

function filterTxLive(el, type) {
  document.querySelectorAll('#s18 .fpill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  renderTransactions(type);
}

// ═══════════════════════════════════════════════════
//  MERCHANTS — carga desde API (sin mapa)
// ═══════════════════════════════════════════════════
async function loadMerchants() {
  const list = document.getElementById('merchant-list');
  if (!list) return;
  list.innerHTML = `
    <div style="padding:20px;text-align:center;color:var(--t2);font-size:13px">
      <div style="width:24px;height:24px;border:2px solid var(--c);
        border-top-color:transparent;border-radius:50%;
        animation:spin .8s linear infinite;margin:0 auto 8px"></div>
      Cargando comercios...
    </div>`;
  try {
    const data = await apiCall('GET', '/merchants');
    if (typeof FyloxMap !== 'undefined') {
      FyloxMap.renderMerchantsWithDistance(data.merchants || []);
    }
  } catch (err) {
    console.warn('[Fylox] No se pudieron cargar comercios:', err.message);
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>';
  }
}

// ── Notificaciones UI ────────────────────────────────
window.clearNotifications = function() {
  const list = document.getElementById('notifications-list');
  if (!list) return;
  list.style.opacity = '0';
  setTimeout(() => {
    list.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--t3)">
        <div style="font-size:50px;margin-bottom:12px">📭</div>
        <div style="font-weight:600;font-size:18px;color:var(--t1);margin-bottom:6px">All caught up</div>
        <div style="font-size:14px">No new notifications.</div>
      </div>`;
    list.style.opacity = '1';
  }, 300);
};

// ═══════════════════════════════════════════════════
//  S10 — FLASH TOGGLE + PASTE QR
// ═══════════════════════════════════════════════════
async function toggleFlash() {
  const btn = document.getElementById('s10-flash-btn');
  const video = document.getElementById('qr-video');
  if (!video || !video.srcObject) return;

  const track = video.srcObject.getVideoTracks()[0];
  if (!track) return;

  const caps = track.getCapabilities ? track.getCapabilities() : {};
  if (!caps.torch) {
    if (window.FyloxNotification) {
      FyloxNotification.show({
        icon: '⚠️', title: 'Flash no disponible',
        sub: 'Tu cámara no soporta linterna', amt: '', sound: false,
      });
    }
    return;
  }

  try {
    const isOn = btn.classList.contains('on');
    await track.applyConstraints({ advanced: [{ torch: !isOn }] });
    btn.classList.toggle('on');
    if (navigator.vibrate) navigator.vibrate(20);
  } catch (e) {
    console.warn('[Fylox] Flash error:', e);
  }
}

async function pasteQRCode() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text || text.trim().length < 3) {
      FyloxNotification.show({
        icon: '⚠️', title: 'Portapapeles vacío',
        sub: 'Copiá un código primero', amt: '', sound: false,
      });
      return;
    }

    let merchant = '', amount = '0';
    try {
      if (text.startsWith('fylox://pay?')) {
        const url = new URL(text.replace('fylox://', 'https://x/'));
        merchant = url.searchParams.get('to') || '';
        amount   = url.searchParams.get('amount') || '0';
      } else if (text.startsWith('@') || /^[a-z0-9_]{2,32}$/i.test(text.trim())) {
        merchant = text.trim().replace(/^@/, '');
      } else {
        merchant = text.slice(0, 50);
      }
    } catch { merchant = text.slice(0, 50); }

    if (!merchant) {
      FyloxNotification.show({
        icon: '⚠️', title: 'Código inválido',
        sub: 'No es un código Fylox válido', amt: '', sound: false,
      });
      return;
    }

    PaymentState.setTo(merchant);
    if (amount !== '0') { PaymentState.setAmt(amount); kval = amount; }
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    goTo('s11q');
  } catch (e) {
    FyloxNotification.show({
      icon: '⚠️', title: 'No se pudo leer',
      sub: 'Permitir acceso al portapapeles', amt: '', sound: false,
    });
  }
}
