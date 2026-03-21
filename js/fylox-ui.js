// ═══════════════════════════════════════════════════
//  FYLOX UI — Navegación, Tema, Motor en vivo, Toasts
// ═══════════════════════════════════════════════════

// ── TEMA ────────────────────────────────────────────

(function() {
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

// ── NAVEGACIÓN ──────────────────────────────────────

let kval = '0';

function goTo(id) {
  const curr = document.querySelector('.scr.show');
  const next = document.getElementById(id);
  if (!next || !curr || curr === next) return;

  curr.classList.remove('show');
  next.classList.add('show', 'enter');
  next.addEventListener('animationend', () => next.classList.remove('enter'), { once: true });

  const sc = next.querySelector('.sc');
  if (sc) sc.scrollTop = 0;

  if (id === 's7') {
    const amt = kval !== '0' ? kval : '0.00';
    const recip = window.SEND_TO || '@Pioneer';
    const el7amt = document.getElementById('s7amt');
    const el7to  = document.getElementById('s7to');
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

  if (id === 's10') {
    const video = document.getElementById('qr-video');
    if (video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          video.srcObject = stream;
          video.play();
          video.dataset.stream = 'active';
        })
        .catch(err => {
          console.warn('[Fylox] Cámara no disponible:', err.message);
        });
    }
  }

  // Detener cámara al salir de s10
  if (curr && curr.id === 's10') {
    const video = document.getElementById('qr-video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  }
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target = parseFloat(wb.dataset.value || '100') || 100;
      const duration = id === 's16' ? 1800 : 1200;
      const easeOut = id === 's16'
        ? t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
        : t => 1 - Math.pow(1 - t, 3);
      let startTime = null;
      if (id === 's16') wb.innerHTML = `0.00 <span style="font-size:24px;color:var(--c)">π</span>`;
      const animate = (now) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const current = (target * easeOut(progress)).toFixed(2);
        wb.innerHTML = `${current} <span style="font-size:24px;color:var(--c)">π</span>`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }

  const bnav = document.querySelector('.bnav');
  const navScreens = ['s5','s9','s10','s11','s12','s13','s14','s15','s16','s17','s18','s19','s20','s21','s22','s23','s24'];
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
  if (el) { e.preventDefault(); goTo(el.dataset.go); }
});

document.addEventListener('click', function(e) {
  const k = e.target.dataset.k;
  if (k !== undefined) {
    if (k === 'x')      { kval = kval.length > 1 ? kval.slice(0, -1) : '0'; }
    else if (k === '.') { if (!kval.includes('.')) kval += '.'; }
    else                { kval = kval === '0' ? k : kval + k; if (kval.length > 9) kval = kval.slice(0, -1); }
    const el = document.getElementById('sa');
    if (el) {
      window.KVAL = kval;
      window.SEND_AMT = kval;
      el.innerHTML = kval + ' <span style="font-size:26px;color:var(--c)">π</span>';
    }
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

// ── MOTOR EN VIVO ───────────────────────────────────

function updateTime() {
  const now = new Date();
  const t = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
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
  el.textContent = d > 0
    ? `${d}d ${h}h ${m.toString().padStart(2, '0')}m`
    : `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
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
  el.textContent = h > 0 ? `${h}h ${m}m left` : `${m}m ${s.toString().padStart(2, '0')}s left`;
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

// ── TOASTS ──────────────────────────────────────────

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
  if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove());
  }, 4200);
}
