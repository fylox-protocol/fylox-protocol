(function() {
  // Use FyloxStorage wrapper — safe in Pi Browser environment
  try {
    const saved = localStorage.getItem('fylox-theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      const btn = document.getElementById('dark-toggle-btn');
      if (btn) btn.classList.add('on');
    }
  } catch(e) { /* Pi Browser may restrict localStorage on load */ }
})();

function toggleDark() {
  const html = document.documentElement;
  const isDark = !html.classList.contains('light');
  if (isDark) {
    html.classList.add('light');
    FyloxStorage.set('fylox-theme', 'light');
  } else {
    html.classList.remove('light');
    FyloxStorage.set('fylox-theme', 'dark');
  }
  const btn = document.getElementById('dark-toggle-btn');
  if (btn) btn.classList.toggle('on', !isDark);
  const label = document.getElementById('dark-label');
  if (label) label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
}

// ═══════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════

let kval = '0';

function goTo(id) {
  const curr = document.querySelector('.scr.show');
  const next = document.getElementById(id);
  if (!next || !curr || curr === next) return;
  curr.classList.remove('show');
  next.classList.add('show','enter');
  next.addEventListener('animationend', () => next.classList.remove('enter'), {once:true});
  const sc = next.querySelector('.sc');
  if (sc) sc.scrollTop = 0;

  if (id === 's7') {
    const amt = kval !== '0' ? kval : '0.00';
    const recip = window.SEND_TO || '@Pioneer';
    const el7amt = document.getElementById('s7amt');
    const el7to = document.getElementById('s7to');
    const el7total = document.getElementById('s7total');
    if (el7amt) el7amt.innerHTML = amt + ' <span style="font-size:26px;color:var(--c)">π</span>';
    if (el7to) el7to.textContent = recip;
    if (el7total) el7total.textContent = amt + ' π';
    window.SEND_AMT = amt;
  }
  if (id === 's8') {
    const el8 = document.getElementById('s8msg');
    if (el8) el8.textContent = (window.SEND_AMT || '0') + ' π sent to ' + (window.SEND_TO || '@Pioneer');
  }

  // Detener cámara al salir de s10
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
  }

  // Activar cámara y escaneo QR al entrar a s10
  if (id === 's10') {
    const video  = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const status = document.getElementById('qr-status');
    if (video && canvas && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          video.srcObject = stream;
          video.play();
          const ctx = canvas.getContext('2d');
          let detected = false;
          function scanFrame() {
            if (detected) return;
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width  = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });
              if (code) {
                detected = true;
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                // Parsear el QR — formato esperado: fylox://pay?to=@merchant&amount=5.00
                // o cualquier string — lo mandamos a s11q con los datos
                const raw = code.data;
                let merchant = 'Merchant Name';
                let amount   = '0';
                try {
                  if (raw.startsWith('fylox://')) {
                    const url    = new URL(raw.replace('fylox://', 'https://x/'));
                    merchant     = url.searchParams.get('to')     || merchant;
                    amount       = url.searchParams.get('amount') || amount;
                  } else {
                    merchant = raw.slice(0, 30);
                  }
                } catch(e) {
                  merchant = raw.slice(0, 30);
                }
                // Precarga los datos en la pantalla de pago manual
                window.SEND_TO  = merchant;
                window.SEND_AMT = amount;
                kval = amount !== '0' ? amount : '0';
                // Actualizar UI de s11q
                const mEl = document.getElementById('s11q-merchant-name');
                if (mEl) mEl.textContent = merchant;
                const aEl = document.getElementById('sa');
                if (aEl) aEl.innerHTML = kval + ' <span style="font-size:26px;color:var(--c)">π</span>';
                // Parar cámara y navegar
                video.srcObject.getTracks().forEach(t => t.stop());
                video.srcObject = null;
                goTo('s11q');
                return;
              }
            }
            window._qrScanLoop = requestAnimationFrame(scanFrame);
          }
          video.addEventListener('loadeddata', () => {
            window._qrScanLoop = requestAnimationFrame(scanFrame);
          });
        })
        .catch(err => {
          console.warn('[Fylox] Cámara no disponible:', err.message);
          if (status) status.innerHTML = '<span style="color:#ff6b81">Cámara no disponible</span>';
        });
    }
  }

if (id === 's9') {
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target = parseFloat(wb.dataset.value) || window._fyloxBalance || 0;
      wb.dataset.value = target;
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = (start + (target - start) * ease).toFixed(2);
        wb.innerHTML = current + ' <span style="font-size:24px;color:var(--c)">π</span>';
        if (progress < 1) requestAnimationFrame(animate);
        else wb.innerHTML = target.toFixed(2) + ' <span style="font-size:24px;color:var(--c)">π</span>';
      };
      requestAnimationFrame(animate);
    }
  }

  // Generar QR dinámico del comercio al entrar a s14
  // Reset keypad al entrar a s11q
  if (id === 's11q') {
    kval = '0';
    const saEl = document.getElementById('sa');
    if (saEl) saEl.innerHTML = '0.00 <span style="font-size:26px;color:var(--c)">π</span>';
  }

  if (id === 's14') {
    const name  = window._currentMerchant   || 'Merchant';
    const pi    = window._currentMerchantPi  || '@merchant';
    const icon  = window._currentMerchantIcon || '🏪';
    // Actualizar UI de s14 con el comercio seleccionado
    const nameEl = document.querySelector('#s14 .fd-800');
    const iconEl = document.querySelector('#s14 .font-size-52');
    // Buscar por contenido más robusto
    document.querySelectorAll('#s14 .sc [style*="font-size:52px"]').forEach(el => el.textContent = icon);
    document.querySelectorAll('#s14 .sc [style*="font-size:22px"]').forEach(el => el.textContent = name);
    // Generar QR real del comercio
    const qrData = `fylox://pay?to=${pi}&name=${encodeURIComponent(name)}`;
    generateQR('qr-merchant-img', qrData, 160);
    // Precargar comercio en pantalla de pago
    window.SEND_TO = pi;
    const mEl = document.getElementById('s11q-merchant-name');
    if (mEl) mEl.textContent = name;
  }

  if (id === 's16') {
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target = parseFloat(wb.dataset.value) || window._fyloxBalance || 0;
      const duration = 1800;
      let startTime = null;
      const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      wb.innerHTML = `0.00 <span style="font-size:24px;color:var(--c)">π</span>`;
      const animate = (now) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const current = (target * easeOutExpo(progress)).toFixed(2);
        wb.innerHTML = `${current} <span style="font-size:24px;color:var(--c)">π</span>`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }

  // Cargar comercios desde API al entrar a s13
  if (id === 's13') loadMerchants();

  // Cargar historial real al entrar a s18
  if (id === 's18') loadTransactions();

  // Cargar perfil real al entrar a s17
  if (id === 's17') loadUserProfile();

  const bnav = document.querySelector('.bnav');
  const navScreens = ['s5','s9','s10','s11','s12','s14','s15','s16','s17','s18','s19','s20','s21','s22','s23','s24'];
  if (bnav) bnav.style.display = navScreens.includes(id) ? 'flex' : 'none';

  document.querySelectorAll('.bnav .bi').forEach(btn => {
    const ni = btn.querySelector('.ni');
    const nl = btn.querySelector('.nl');
    if (!ni || !nl) return;
    const dest = btn.dataset.go;
    if (!dest) return;
    ni.classList.toggle('on', dest === id);
    nl.classList.toggle('on', dest === id);
  });

  if (navigator.vibrate) navigator.vibrate(20);
}

document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-go]');
  if (!el) return;
  e.preventDefault();
  // Si el click es en un comercio que va a s14, guardar sus datos
  if (el.dataset.go === 's14' && el.dataset.merchant) {
    window._currentMerchant     = el.dataset.merchant;
    window._currentMerchantPi   = el.dataset.merchantPi;
    window._currentMerchantIcon = el.dataset.merchantIcon || '🏪';
  }
  goTo(el.dataset.go);
});

document.addEventListener('click', function(e) {
  const k = e.target.dataset.k;
  if (k !== undefined) {
    if (k === 'x') { kval = kval.length > 1 ? kval.slice(0,-1) : '0'; }
    else if (k === '.') { if (!kval.includes('.')) kval += '.'; }
    else { kval = kval === '0' ? k : kval + k; if (kval.length > 9) kval = kval.slice(0,-1); }
    // Actualizar el display de la pantalla activa
    const activeSa = document.querySelector('.scr.show #sa') || document.querySelector('.scr.show #sa-send');
    if (activeSa) { window.KVAL = kval; window.SEND_AMT = kval; activeSa.innerHTML = kval + ' <span style="font-size:26px;color:var(--c)">π</span>'; }
  }
});

function selVote(el, group) {
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
  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  document.querySelectorAll('.stime').forEach(el => el.textContent = t);
}
updateTime();
setInterval(updateTime, 10000);

let piPrice = 0.3400;
let piPriceBase = 0.3400;

async function fetchPiPrice() {
  try {
    const res = await fetch('https://www.okx.com/api/v5/market/ticker?instId=PI-USDT');
    const data = await res.json();
    if (data?.data?.[0]?.last) {
      const newPrice = parseFloat(data.data[0].last);
      const isUp = newPrice >= piPriceBase;
      piPriceBase = newPrice;
      piPrice = newPrice;
      const el = document.getElementById('pi-price');
      if (el) {
        el.textContent = '$' + piPrice.toFixed(4);
        el.classList.remove('price-up', 'price-down');
        void el.offsetWidth;
        el.classList.add(isUp ? 'price-up' : 'price-down');
      }
      const balanceEl = document.getElementById('home-ars');
      if (balanceEl && window._fyloxBalance) {
        balanceEl.textContent = (window._fyloxBalance * piPrice).toFixed(3);
      }
    }
  } catch (err) {
    console.warn('[Fylox] No se pudo obtener precio de Pi:', err.message);
  }
}

// Precio real de OKX al cargar y cada 60 segundos
fetchPiPrice();
setInterval(fetchPiPrice, 60000);

let pioneers = 47293841;

function updatePioneers() {
  pioneers += Math.floor(Math.random() * 4) + 1;
  const el = document.getElementById('agora-pioneers');
  if (el) {
    el.textContent = pioneers.toLocaleString('en-US');
    el.classList.remove('live-num');
    void el.offsetWidth;
    el.classList.add('live-num');
  }
}
setInterval(updatePioneers, 2800);

let voteMs = (2 * 24 * 60 + 14 * 60) * 60 * 1000;

function updateVoteTimer() {
  voteMs = Math.max(0, voteMs - 1000);
  const el = document.getElementById('agora-vote-timer');
  if (!el) return;
  const d = Math.floor(voteMs / 86400000);
  const h = Math.floor((voteMs % 86400000) / 3600000);
  const m = Math.floor((voteMs % 3600000) / 60000);
  const s = Math.floor((voteMs % 60000) / 1000);
  el.textContent = d > 0 ? `${d}d ${h}h ${m.toString().padStart(2,'0')}m` : `${h}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
}
setInterval(updateVoteTimer, 1000);

let oracleMs = (1 * 60 + 23) * 60 * 1000;

function updateOracleTimer() {
  oracleMs = Math.max(0, oracleMs - 1000);
  const el = document.getElementById('oracle-task-timer');
  if (!el) return;
  const h = Math.floor(oracleMs / 3600000);
  const m = Math.floor((oracleMs % 3600000) / 60000);
  const s = Math.floor((oracleMs % 60000) / 1000);
  if (oracleMs < 300000) el.style.color = '#ff6b81';
  el.textContent = h > 0 ? `${h}h ${m}m left` : `${m}m ${s.toString().padStart(2,'0')}s left`;
}
setInterval(updateOracleTimer, 1000);

let oracleConfirmed = 3;

function updateOracleConfirmed() {
  if (oracleConfirmed < 7) {
    oracleConfirmed++;
    const el = document.getElementById('oracle-confirmed');
    if (el) {
      el.textContent = oracleConfirmed + '/7';
      el.classList.remove('live-num');
      void el.offsetWidth;
      el.classList.add('live-num');
      if (oracleConfirmed === 7) el.style.color = 'var(--grn)';
    }
  }
}
setInterval(updateOracleConfirmed, 12000);

// ═══════════════════════════════════════════════════
//  TOASTS
// ═══════════════════════════════════════════════════

const TOAST_I18N = {
  en: [
    { title:'Maria C. sent you Pi', sub:'Verified Pioneer · Buenos Aires' },
    { title:'New ORACLE task nearby', sub:'Flood verification · 1.2 km away' },
    { title:'AGORA vote is closing', sub:'GPT-6 Banking access · 14 min left' },
    { title:'Rodrigo P. paid at merchant', sub:'Cafe del Centro · Via Fylox' },
    { title:'NEXUS score updated', sub:'ORACLE task completed +81 pts' },
    { title:'Payment confirmed', sub:'Supermercado · NFC' },
    { title:'ORACLE task confirmed', sub:'Lagos Norte · 3 more verifications' },
    { title:'New vote proposal live', sub:'Anthropic · Claude autonomy' },
  ],
  es: [
    { title:'Maria C. te envió Pi', sub:'Pioneer verificado · Buenos Aires' },
    { title:'Nueva tarea ORACLE cerca', sub:'Verificación de inundación · 1.2 km' },
    { title:'Votación AGORA por cerrar', sub:'GPT-6 acceso bancario · 14 min' },
    { title:'Rodrigo P. pagó en comercio', sub:'Café del Centro · Vía Fylox' },
    { title:'Puntuación NEXUS actualizada', sub:'Tarea ORACLE completada +81 pts' },
    { title:'Pago confirmado', sub:'Supermercado · NFC' },
    { title:'Tarea ORACLE confirmada', sub:'Lagos Norte · 3 verificaciones más' },
    { title:'Nueva propuesta de voto', sub:'Anthropic · Autonomía de Claude' },
  ],
  tl: [
    { title:'Nagpadala si Maria C. ng Pi', sub:'Verified Pioneer · Buenos Aires' },
    { title:'Bagong ORACLE task malapit', sub:'Flood verification · 1.2 km ang layo' },
    { title:'Magsasara na ang AGORA vote', sub:'GPT-6 Banking access · 14 min na lang' },
    { title:'Nagbayad si Rodrigo P. sa merchant', sub:'Cafe del Centro · Sa Fylox' },
    { title:'Na-update ang NEXUS score', sub:'ORACLE task kumpleto +81 pts' },
    { title:'Nakumpirma ang bayad', sub:'Supermercado · NFC' },
    { title:'ORACLE task nakumpirma', sub:'Lagos Norte · 3 verification pa' },
    { title:'Bagong vote proposal live', sub:'Anthropic · Claude autonomy' },
  ],
  ng: [
    { title:'Maria C. don send you Pi', sub:'Verified Pioneer · Buenos Aires' },
    { title:'New ORACLE task dey near', sub:'Flood verification · 1.2 km away' },
    { title:'AGORA vote go close soon', sub:'GPT-6 Banking access · 14 min remain' },
    { title:'Rodrigo P. pay for shop', sub:'Cafe del Centro · Via Fylox' },
    { title:'NEXUS score don update', sub:'ORACLE task complete +81 pts' },
    { title:'Payment don confirm', sub:'Supermercado · NFC' },
    { title:'ORACLE task don confirm', sub:'Lagos Norte · 3 more check remain' },
    { title:'New vote proposal don come out', sub:'Anthropic · Claude autonomy' },
  ],
  hi: [
    { title:'Maria C. ने आपको Pi भेजा', sub:'Verified Pioneer · Buenos Aires' },
    { title:'नया ORACLE कार्य पास में', sub:'बाढ़ सत्यापन · 1.2 km दूर' },
    { title:'AGORA मतदान बंद हो रहा है', sub:'GPT-6 बैंकिंग एक्सेस · 14 मिनट बाकी' },
    { title:'Rodrigo P. ने दुकान पर भुगतान किया', sub:'Cafe del Centro · Fylox से' },
    { title:'NEXUS स्कोर अपडेट हुआ', sub:'ORACLE कार्य पूरा +81 pts' },
    { title:'भुगतान की पुष्टि हुई', sub:'Supermercado · NFC' },
    { title:'ORACLE कार्य की पुष्टि हुई', sub:'Lagos Norte · 3 और सत्यापन' },
    { title:'नया मतदान प्रस्ताव लाइव', sub:'Anthropic · Claude स्वायत्तता' },
  ],
  pt: [
    { title:'Maria C. enviou Pi para você', sub:'Pioneer verificado · Buenos Aires' },
    { title:'Nova tarefa ORACLE próxima', sub:'Verificação de enchente · 1.2 km' },
    { title:'Votação AGORA está encerrando', sub:'GPT-6 acesso bancário · 14 min' },
    { title:'Rodrigo P. pagou no comerciante', sub:'Cafe del Centro · Via Fylox' },
    { title:'Pontuação NEXUS atualizada', sub:'Tarefa ORACLE completa +81 pts' },
    { title:'Pagamento confirmado', sub:'Supermercado · NFC' },
    { title:'Tarefa ORACLE confirmada', sub:'Lagos Norte · 3 verificações restantes' },
    { title:'Nova proposta de voto ao vivo', sub:'Anthropic · Autonomia do Claude' },
  ],
  zh: [
    { title:'Maria C. 向您发送了Pi', sub:'已认证Pioneer · 布宜诺斯艾利斯' },
    { title:'附近有新ORACLE任务', sub:'洪水核查 · 1.2公里外' },
    { title:'AGORA投票即将关闭', sub:'GPT-6银行访问 · 还剩14分钟' },
    { title:'Rodrigo P. 在商家付款', sub:'Cafe del Centro · 通过Fylox' },
    { title:'NEXUS评分已更新', sub:'ORACLE任务完成 +81分' },
    { title:'付款已确认', sub:'超市 · NFC' },
    { title:'ORACLE任务已确认', sub:'拉各斯北部 · 还需3次验证' },
    { title:'新投票提案已上线', sub:'Anthropic · Claude自主性' },
  ],
  id: [
    { title:'Maria C. mengirimkan Pi', sub:'Pioneer Terverifikasi · Buenos Aires' },
    { title:'Tugas ORACLE baru di dekat', sub:'Verifikasi banjir · 1.2 km jauhnya' },
    { title:'Voting AGORA akan ditutup', sub:'Akses perbankan GPT-6 · 14 menit lagi' },
    { title:'Rodrigo P. bayar di merchant', sub:'Cafe del Centro · Via Fylox' },
    { title:'Skor NEXUS diperbarui', sub:'Tugas ORACLE selesai +81 pts' },
    { title:'Pembayaran dikonfirmasi', sub:'Supermercado · NFC' },
    { title:'Tugas ORACLE dikonfirmasi', sub:'Lagos Norte · 3 verifikasi lagi' },
    { title:'Proposal voting baru live', sub:'Anthropic · Otonomi Claude' },
  ],
  vi: [
    { title:'Maria C. đã gửi Pi cho bạn', sub:'Pioneer đã xác minh · Buenos Aires' },
    { title:'Có nhiệm vụ ORACLE mới gần đây', sub:'Xác minh lũ lụt · cách 1.2 km' },
    { title:'Bỏ phiếu AGORA sắp đóng', sub:'Truy cập ngân hàng GPT-6 · còn 14 phút' },
    { title:'Rodrigo P. đã thanh toán tại cửa hàng', sub:'Cafe del Centro · Qua Fylox' },
    { title:'Điểm NEXUS đã cập nhật', sub:'Hoàn thành nhiệm vụ ORACLE +81 điểm' },
    { title:'Thanh toán đã xác nhận', sub:'Supermercado · NFC' },
    { title:'Nhiệm vụ ORACLE đã xác nhận', sub:'Lagos Norte · còn 3 xác minh nữa' },
    { title:'Đề xuất bỏ phiếu mới đã ra mắt', sub:'Anthropic · Quyền tự chủ Claude' },
  ],
  ko: [
    { title:'Maria C.가 Pi를 보냈습니다', sub:'인증된 파이오니어 · 부에노스아이레스' },
    { title:'근처에 새 ORACLE 작업', sub:'홍수 검증 · 1.2km 거리' },
    { title:'AGORA 투표가 마감됩니다', sub:'GPT-6 뱅킹 접근 · 14분 남음' },
    { title:'Rodrigo P.가 상점에서 결제', sub:'Cafe del Centro · Fylox 경유' },
    { title:'NEXUS 점수 업데이트됨', sub:'ORACLE 작업 완료 +81점' },
    { title:'결제 확인됨', sub:'Supermercado · NFC' },
    { title:'ORACLE 작업 확인됨', sub:'Lagos Norte · 검증 3개 더 필요' },
    { title:'새 투표 제안 공개', sub:'Anthropic · Claude 자율성' },
  ],
};

const TOAST_META = [
  { icon:'💸', bg:'rgba(0,212,232,.12)', amt:'+2.5 π' },
  { icon:'🔭', bg:'rgba(0,212,232,.12)', amt:'+8 π' },
  { icon:'🏛️', bg:'rgba(0,224,144,.12)', amt:'+4 π' },
  { icon:'⚡', bg:'rgba(255,183,0,.12)', amt:'−18 π' },
  { icon:'📦', bg:'rgba(139,92,246,.12)', amt:'763 pts' },
  { icon:'✅', bg:'rgba(0,224,144,.12)', amt:'−4.2 π' },
  { icon:'🌊', bg:'rgba(0,212,232,.12)', amt:'+12.5 π' },
  { icon:'🏛️', bg:'rgba(0,224,144,.12)', amt:'+6 π' },
];

let toastIdx = 0;

function getToasts() {
  const lang = currentLang || 'en';
  const texts = TOAST_I18N[lang] || TOAST_I18N['en'];
  return TOAST_META.map((m, i) => ({ ...m, ...texts[i] }));
}

function showToast(data) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  const amtColor = data.amt.startsWith('+') ? 'var(--c)' : (data.amt.startsWith('−') ? '#ff6b81' : 'var(--ylw)');
  t.innerHTML = `
    <div class="toast-icon" style="background:${data.bg}">${data.icon}</div>
    <div class="toast-body">
      <div class="toast-title">${data.title}</div>
      <div class="toast-sub">${data.sub}</div>
    </div>
    <div class="toast-amt" style="color:${amtColor}">${data.amt}</div>
  `;
  container.appendChild(t);
  if (navigator.vibrate) navigator.vibrate([30,30,30]);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove());
  }, 4200);
}

// ═══════════════════════════════════════════════════
//  USER DATA
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
//  QR GENERATOR
// ═══════════════════════════════════════════════════

function generateQR(elementId, data, size) {
  const el = document.getElementById(elementId);
  if (!el || typeof QRCode === 'undefined') return;
  el.innerHTML = '';
  new QRCode(el, {
    text: data,
    width: size || 180,
    height: size || 180,
    colorDark: '#060608',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

// ── TRANSACTIONS — Historial real desde API ─────────────────────────────────

let _txFilter = 'all';
let _txData   = [];

async function loadTransactions() {
  const list = document.getElementById('tx-list');
  if (!list) return;

  list.innerHTML = `
    <div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">
      <div style="width:24px;height:24px;border:2px solid var(--c);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 8px"></div>
      Cargando actividad...
    </div>`;

  try {
    const data = await apiCall('GET', '/user/transactions?limit=50');
    _txData = data.transactions || [];
    renderTransactions(_txFilter);

    // Actualizar total enviado en s17 si existe
    const txCountEl = document.querySelector('#s17 [data-tx-count]');
    if (txCountEl) txCountEl.textContent = data.total || 0;

  } catch (err) {
    console.warn('[Fylox] No se pudo cargar historial:', err.message);
    list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudo cargar el historial.<br>Intentá de nuevo.</div>`;
  }
}

function renderTransactions(filter) {
  _txFilter = filter;
  const list = document.getElementById('tx-list');
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
    const isSent   = tx.type === 'sent';
    const color    = isSent ? 'var(--red)' : 'var(--grn)';
    const bgColor  = isSent ? 'rgba(255,70,70,.07)' : 'rgba(0,224,144,.07)';
    const sign     = isSent ? '−' : '+';
    const label    = isSent
      ? (tx.toName || tx.toAddress || 'Pago enviado')
      : ('De ' + tx.fromUsername);
    const date     = new Date(tx.createdAt).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short'
    });
    const arrow = isSent
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

    return `<div class="tx">
      <div class="ti" style="background:${bgColor};color:${color}">${arrow}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${label}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:1px">${date}</div>
      </div>
      <div style="font-size:14px;font-weight:700;color:${color};font-family:var(--fd)">${sign}${tx.amount} π</div>
    </div>`;
  }).join('');
}

function filterTxLive(el, type) {
  document.querySelectorAll('#s18 .fpill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  renderTransactions(type);
}

// ── MERCHANTS — Carga dinámica desde API ────────────────────────────────────

const CATEGORY_I18N = {
  food:        'foodRestaurant',
  coffee:      'coffeeShop',
  pharmacy:    'pharmacy',
  electronics: 'electronics',
  retail:      'retailStore',
  services:    'services',
  transport:   'transit',
  other:       'merchants',
};

async function loadMerchants() {
  const list = document.getElementById('merchant-list');
  if (!list) return;

  list.innerHTML = `
    <div style="padding:20px;text-align:center;color:var(--t2);font-size:13px">
      <div style="width:24px;height:24px;border:2px solid var(--c);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 8px"></div>
      Cargando comercios...
    </div>`;

  try {
    const data = await apiCall('GET', '/merchants');
    renderMerchants(data.merchants || []);
  } catch (err) {
    console.warn('[Fylox] No se pudieron cargar comercios:', err.message);
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>';
  }
}

function renderMerchants(merchants) {
  const list = document.getElementById('merchant-list');
  if (!list) return;

  if (merchants.length === 0) {
    list.innerHTML = `<div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">No hay comercios registrados aún.<br>¡Sé el primero!</div>`;
    return;
  }

  const t = typeof LANGS !== 'undefined' && LANGS[currentLang] ? LANGS[currentLang] : {};

  list.innerHTML = merchants.map(m => {
    const catKey   = CATEGORY_I18N[m.category] || 'merchants';
    const catLabel = t[catKey] || m.category;
    const tagClass = m.status === 'open' ? 'tag-g' : m.status === 'busy' ? 'tag-y' : 'tag-r';
    const tagKey   = m.status === 'open' ? 'openLabel' : m.status === 'busy' ? 'busyLabel' : 'closedLabel';
    const tagLabel = t[tagKey] || m.status;
    const verified = m.verified ? ' ✓' : '';
    const dist     = m.distance && m.distance !== 'Nuevo' ? `${m.distance} · ` : '';

    return `<div class="row" data-go="s14"
      data-merchant="${m.name}"
      data-merchant-pi="${m.piAddress}"
      data-merchant-icon="${m.icon}">
      <div class="ti" style="background:rgba(0,212,232,.08)">${m.icon}</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600">${m.name}${verified}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:2px">${dist}${catLabel}</div>
      </div>
      <div class="tag ${tagClass}">${tagLabel}</div>
    </div>`;
  }).join('');
}
