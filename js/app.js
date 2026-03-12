
// ═══════════════════════════════════════════════════

//  FYLOX LANGUAGE ENGINE

// ═══════════════════════════════════════════════════

const LANGS = {

  en: {

    flag:'🇺🇸', name:'English',

    home:'Home', wallet:'Wallet', earn:'Earn', profile:'Profile',

    balance:'Available Balance', send:'Send', receive:'Receive',

    bills:'Bills', scan:'Scan QR', recent:'Recent',

    settings:'Settings', language:'Language',

    greeting:'Good morning,', pioneer:'Pioneer',

    history:'History', addPi:'Add Pi',

    availTasks:'Active Task', earnMore:'Earn more Pi',

    confirmPay:'Confirm Payment', cancel:'Cancel',

    activity:'Activity', notifications:'Notifications',

    security:'Security', personalInfo:'Personal Information',

    verified:'KYC Verified', transactions:'Transactions',

    earned:'Earned', nearby:'Nearby', openMaps:'Open in Maps →',

    acceptTask:'Accept task', submitVote:'Submit vote & earn',

    votes:'Votes cast', participation:'Participation',


    // New keys

    scanQR:'Scan QR',

    card:'Card',

    merchants:'Merchants',

    transit:'Transit',

    upcoming:'Upcoming',

    addPi:'Add Pi',

    enterpriseLayers:'Enterprise Layers',

    sendPi:'Send Pi',

    confirm:'Confirm',

    receiveTitle:'Receive Pi',

    scanToPay:'Scan to Pay',

    earnTitle:'Fylox Earn',

    continueBtn:'Continue',

    confirmSend:'Confirm & Send',

    backHome:'Back to Home',

    shareAddr:'Share address',

    copy:'Copy',

    earnSources:'Earn Sources',

    recentEarn:'Recent Earn',

    activeTask:'Active Task',

    availTasks:'Available Tasks',

    monthlyEarnings:'Monthly Earnings',

    nexusScore:'NEXUS Score',

    allFilter:'All',

    sentFilter:'Sent',

    receivedFilter:'Received',

    personalInfo:'Personal Information',

    switchAppearance:'Switch appearance',

    lightMode:'Light Mode',

  },

  es: {

    flag:'🇪🇸', name:'Español',

    home:'Inicio', wallet:'Billetera', earn:'Ganar', profile:'Perfil',

    balance:'Saldo Disponible', send:'Enviar', receive:'Recibir',

    bills:'Facturas', scan:'Escanear QR', recent:'Reciente',

    settings:'Configuración', language:'Idioma',

    greeting:'Buen día,', pioneer:'Pionero',

    history:'Historial', addPi:'Agregar Pi',

    availTasks:'Tarea Activa', earnMore:'Ganar más Pi',

    confirmPay:'Confirmar Pago', cancel:'Cancelar',

    activity:'Actividad', notifications:'Notificaciones',

    security:'Seguridad', personalInfo:'Información Personal',

    verified:'KYC Verificado', transactions:'Transacciones',

    earned:'Ganado', nearby:'Cerca', openMaps:'Abrir en Mapas →',

    acceptTask:'Aceptar tarea', submitVote:'Votar y ganar',

    votes:'Votos emitidos', participation:'Participación',


    // New keys

    scanQR:'Escanear QR',

    card:'Tarjeta',

    merchants:'Comercios',

    transit:'Transporte',

    upcoming:'Próximos vencimientos',

    addPi:'Agregar Pi',

    enterpriseLayers:'Capas Empresariales',

    sendPi:'Enviar Pi',

    confirm:'Confirmar',

    receiveTitle:'Recibir Pi',

    scanToPay:'Escanear para pagar',

    earnTitle:'Fylox Ganar',

    continueBtn:'Continuar',

    confirmSend:'Confirmar y Enviar',

    backHome:'Volver al Inicio',

    shareAddr:'Compartir dirección',

    copy:'Copiar',

    earnSources:'Fuentes de ingresos',

    recentEarn:'Ingresos recientes',

    activeTask:'Tarea Activa',

    availTasks:'Tareas Disponibles',

    monthlyEarnings:'Ganancias del mes',

    nexusScore:'Puntuación NEXUS',

    allFilter:'Todos',

    sentFilter:'Enviados',

    receivedFilter:'Recibidos',

    personalInfo:'Información Personal',

    switchAppearance:'Cambiar apariencia',

    lightMode:'Modo claro',

  },

  tl: {

    flag:'🇵🇭', name:'Filipino',

    home:'Home', wallet:'Pitaka', earn:'Kumita', profile:'Profile',

    balance:'Magagamit na Balanse', send:'Magpadala', receive:'Tumanggap',

    bills:'Mga Bill', scan:'I-scan ang QR', recent:'Kamakailan',

    settings:'Mga Setting', language:'Wika',

    greeting:'Magandang umaga,', pioneer:'Pioneer',

    history:'Kasaysayan', addPi:'Magdagdag ng Pi',

    availTasks:'Aktibong Gawain', earnMore:'Kumita pa ng Pi',

    confirmPay:'Kumpirmahin ang Bayad', cancel:'Kanselahin',

    activity:'Aktibidad', notifications:'Mga Abiso',

    security:'Seguridad', personalInfo:'Personal na Impormasyon',

    verified:'Na-verify ang KYC', transactions:'Mga Transaksyon',

    earned:'Nakuha', nearby:'Malapit', openMaps:'Buksan sa Maps →',

    acceptTask:'Tanggapin ang gawain', submitVote:'Bumoto at kumita',

    votes:'Mga boto', participation:'Pakikilahok',


    // New keys

    scanQR:'I-scan ang QR',

    card:'Card',

    merchants:'Mga Manlalako',

    transit:'Transit',

    upcoming:'Mga Darating',

    addPi:'Magdagdag ng Pi',

    enterpriseLayers:'Mga Enterprise Layer',

    sendPi:'Magpadala ng Pi',

    confirm:'Kumpirmahin',

    receiveTitle:'Tumanggap ng Pi',

    scanToPay:'I-scan para bayaran',

    earnTitle:'Fylox Kumita',

    continueBtn:'Magpatuloy',

    confirmSend:'Kumpirmahin at Ipadala',

    backHome:'Bumalik sa Home',

    shareAddr:'Ibahagi ang address',

    copy:'Kopyahin',

    earnSources:'Mga Pinagkukunan',

    recentEarn:'Kamakailang Kita',

    activeTask:'Aktibong Gawain',

    availTasks:'Mga Available na Gawain',

    monthlyEarnings:'Kita ngayong Buwan',

    nexusScore:'NEXUS Score',

    allFilter:'Lahat',

    sentFilter:'Naipadala',

    receivedFilter:'Natanggap',

    personalInfo:'Personal na Impormasyon',

    switchAppearance:'Baguhin ang hitsura',

    lightMode:'Light Mode',

  },

  ng: {

    flag:'🇳🇬', name:'Naijá Pidgin',

    home:'Home', wallet:'Wallet', earn:'Make Money', profile:'Profile',

    balance:'Money Wey Dey', send:'Send', receive:'Receive',

    bills:'Bills', scan:'Scan QR', recent:'Recent',

    settings:'Settings', language:'Language',

    greeting:'Good morning,', pioneer:'Pioneer',

    history:'History', addPi:'Add Pi',

    availTasks:'Active Task', earnMore:'Earn more Pi',

    confirmPay:'Confirm Payment', cancel:'Cancel',

    activity:'Activity', notifications:'Notification',

    security:'Security', personalInfo:'Personal Info',

    verified:'KYC Don Verify', transactions:'Transactions',

    earned:'Earned', nearby:'Near', openMaps:'Open Maps →',

    acceptTask:'Accept task', submitVote:'Vote & earn',

    votes:'Votes', participation:'Participation',


    // New keys

    scanQR:'Scan QR',

    card:'Card',

    merchants:'Shop Shop',

    transit:'Transit',

    upcoming:'Upcoming',

    addPi:'Add Pi',

    enterpriseLayers:'Enterprise Layers',

    sendPi:'Send Pi',

    confirm:'Confirm',

    receiveTitle:'Receive Pi',

    scanToPay:'Scan to Pay',

    earnTitle:'Fylox Earn',

    continueBtn:'Continue',

    confirmSend:'Confirm & Send',

    backHome:'Go Back Home',

    shareAddr:'Share address',

    copy:'Copy',

    earnSources:'Earn Sources',

    recentEarn:'Recent Earn',

    activeTask:'Active Task',

    availTasks:'Available Tasks',

    monthlyEarnings:'Monthly Earnings',

    nexusScore:'NEXUS Score',

    allFilter:'All',

    sentFilter:'Sent',

    receivedFilter:'Received',

    personalInfo:'Personal Info',

    switchAppearance:'Change how e look',

    lightMode:'Light Mode',

  },

  hi: {

    flag:'🇮🇳', name:'हिंदी',

    home:'होम', wallet:'वॉलेट', earn:'कमाएं', profile:'प्रोफ़ाइल',

    balance:'उपलब्ध बैलेंस', send:'भेजें', receive:'प्राप्त करें',

    bills:'बिल', scan:'QR स्कैन करें', recent:'हाल का',

    settings:'सेटिंग्स', language:'भाषा',

    greeting:'सुप्रभात,', pioneer:'पायनियर',

    history:'इतिहास', addPi:'Pi जोड़ें',

    availTasks:'सक्रिय कार्य', earnMore:'अधिक Pi कमाएं',

    confirmPay:'भुगतान की पुष्टि करें', cancel:'रद्द करें',

    activity:'गतिविधि', notifications:'सूचनाएं',

    security:'सुरक्षा', personalInfo:'व्यक्तिगत जानकारी',

    verified:'KYC सत्यापित', transactions:'लेनदेन',

    earned:'अर्जित', nearby:'पास में', openMaps:'मैप्स खोलें →',

    acceptTask:'कार्य स्वीकार करें', submitVote:'वोट करें और कमाएं',

    votes:'वोट', participation:'भागीदारी',


    // New keys

    scanQR:'QR स्कैन',

    card:'कार्ड',

    merchants:'व्यापारी',

    transit:'ट्रांजिट',

    upcoming:'आगामी',

    addPi:'Pi जोड़ें',

    enterpriseLayers:'एंटरप्राइज़ लेयर',

    sendPi:'Pi भेजें',

    confirm:'पुष्टि करें',

    receiveTitle:'Pi प्राप्त करें',

    scanToPay:'QR स्कैन करें',

    earnTitle:'Fylox कमाई',

    continueBtn:'जारी रखें',

    confirmSend:'पुष्टि करें और भेजें',

    backHome:'होम पर वापस',

    shareAddr:'पता शेयर करें',

    copy:'कॉपी करें',

    earnSources:'आय के स्रोत',

    recentEarn:'हाल की कमाई',

    activeTask:'सक्रिय कार्य',

    availTasks:'उपलब्ध कार्य',

    monthlyEarnings:'मासिक आय',

    nexusScore:'NEXUS स्कोर',

    allFilter:'सभी',

    sentFilter:'भेजे गए',

    receivedFilter:'प्राप्त',

    personalInfo:'व्यक्तिगत जानकारी',

    switchAppearance:'रूप बदलें',

    lightMode:'लाइट मोड',

  },

  pt: {

    flag:'🇧🇷', name:'Português',

    home:'Início', wallet:'Carteira', earn:'Ganhar', profile:'Perfil',

    balance:'Saldo Disponível', send:'Enviar', receive:'Receber',

    bills:'Contas', scan:'Escanear QR', recent:'Recente',

    settings:'Configurações', language:'Idioma',

    greeting:'Bom dia,', pioneer:'Pioneiro',

    history:'Histórico', addPi:'Adicionar Pi',

    availTasks:'Tarefa Ativa', earnMore:'Ganhe mais Pi',

    confirmPay:'Confirmar Pagamento', cancel:'Cancelar',

    activity:'Atividade', notifications:'Notificações',

    security:'Segurança', personalInfo:'Informações Pessoais',

    verified:'KYC Verificado', transactions:'Transações',

    earned:'Ganho', nearby:'Próximo', openMaps:'Abrir no Maps →',

    acceptTask:'Aceitar tarefa', submitVote:'Votar e ganhar',

    votes:'Votos', participation:'Participação',


    // New keys

    scanQR:'Escanear QR',

    card:'Cartão',

    merchants:'Comerciantes',

    transit:'Transporte',

    upcoming:'Próximos',

    addPi:'Adicionar Pi',

    enterpriseLayers:'Camadas Empresariais',

    sendPi:'Enviar Pi',

    confirm:'Confirmar',

    receiveTitle:'Receber Pi',

    scanToPay:'Escanear para pagar',

    earnTitle:'Fylox Ganhar',

    continueBtn:'Continuar',

    confirmSend:'Confirmar e Enviar',

    backHome:'Voltar ao Início',

    shareAddr:'Compartilhar endereço',

    copy:'Copiar',

    earnSources:'Fontes de Renda',

    recentEarn:'Renda Recente',

    activeTask:'Tarefa Ativa',

    availTasks:'Tarefas Disponíveis',

    monthlyEarnings:'Ganhos do Mês',

    nexusScore:'Pontuação NEXUS',

    allFilter:'Todos',

    sentFilter:'Enviados',

    receivedFilter:'Recebidos',

    personalInfo:'Informações Pessoais',

    switchAppearance:'Mudar aparência',

    lightMode:'Modo Claro',

  },

  zh: {

    flag:'🇨🇳', name:'中文',

    home:'首页', wallet:'钱包', earn:'赚取', profile:'我的',

    balance:'可用余额', send:'发送', receive:'接收',

    bills:'账单', scan:'扫描QR', recent:'最近',

    settings:'设置', language:'语言',

    greeting:'早上好，', pioneer:'先驱者',

    history:'历史', addPi:'添加Pi',

    availTasks:'当前任务', earnMore:'赚取更多Pi',

    confirmPay:'确认付款', cancel:'取消',

    activity:'活动', notifications:'通知',

    security:'安全', personalInfo:'个人信息',

    verified:'KYC已验证', transactions:'交易',

    earned:'已赚取', nearby:'附近', openMaps:'打开地图 →',

    acceptTask:'接受任务', submitVote:'投票并赚取',

    votes:'投票数', participation:'参与率',

    // New keys

    scanQR:'扫描QR', card:'卡', merchants:'商家', transit:'交通',

    upcoming:'即将到期', addPi:'添加Pi', enterpriseLayers:'企业层',

    sendPi:'发送Pi', confirm:'确认', receiveTitle:'接收Pi', scanToPay:'扫码支付',

    earnTitle:'Fylox收益', continueBtn:'继续', confirmSend:'确认发送',

    backHome:'返回首页', shareAddr:'分享地址', copy:'复制',

    earnSources:'收益来源', recentEarn:'最近收益', activeTask:'当前任务',

    availTasks:'可用任务', monthlyEarnings:'月度收益', nexusScore:'NEXUS评分',

    allFilter:'全部', sentFilter:'已发送', receivedFilter:'已接收',

    personalInfo:'个人信息', switchAppearance:'切换外观', lightMode:'浅色模式',

  },

  id: {

    flag:'🇮🇩', name:'Indonesia',

    home:'Beranda', wallet:'Dompet', earn:'Penghasilan', profile:'Profil',

    balance:'Saldo Tersedia', send:'Kirim', receive:'Terima',

    bills:'Tagihan', scan:'Pindai QR', recent:'Terbaru',

    settings:'Pengaturan', language:'Bahasa',

    greeting:'Selamat pagi,', pioneer:'Pioneer',

    history:'Riwayat', addPi:'Tambah Pi',

    availTasks:'Tugas Aktif', earnMore:'Dapatkan lebih banyak Pi',

    confirmPay:'Konfirmasi Pembayaran', cancel:'Batal',

    activity:'Aktivitas', notifications:'Notifikasi',

    security:'Keamanan', personalInfo:'Informasi Pribadi',

    verified:'KYC Terverifikasi', transactions:'Transaksi',

    earned:'Diperoleh', nearby:'Terdekat', openMaps:'Buka Maps →',

    acceptTask:'Terima tugas', submitVote:'Voting & dapatkan',

    votes:'Suara', participation:'Partisipasi',


    // New keys

    scanQR:'Pindai QR',

    card:'Kartu',

    merchants:'Pedagang',

    transit:'Transit',

    upcoming:'Akan Datang',

    addPi:'Tambah Pi',

    enterpriseLayers:'Lapisan Enterprise',

    sendPi:'Kirim Pi',

    confirm:'Konfirmasi',

    receiveTitle:'Terima Pi',

    scanToPay:'Pindai untuk Bayar',

    earnTitle:'Fylox Penghasilan',

    continueBtn:'Lanjutkan',

    confirmSend:'Konfirmasi & Kirim',

    backHome:'Kembali ke Beranda',

    shareAddr:'Bagikan alamat',

    copy:'Salin',

    earnSources:'Sumber Penghasilan',

    recentEarn:'Penghasilan Terbaru',

    activeTask:'Tugas Aktif',

    availTasks:'Tugas Tersedia',

    monthlyEarnings:'Penghasilan Bulanan',

    nexusScore:'Skor NEXUS',

    allFilter:'Semua',

    sentFilter:'Terkirim',

    receivedFilter:'Diterima',

    personalInfo:'Informasi Pribadi',

    switchAppearance:'Ubah tampilan',

    lightMode:'Mode Terang',

  },

  vi: {

    flag:'🇻🇳', name:'Tiếng Việt',

    home:'Trang chủ', wallet:'Ví', earn:'Kiếm tiền', profile:'Hồ sơ',

    balance:'Số dư khả dụng', send:'Gửi', receive:'Nhận',

    bills:'Hóa đơn', scan:'Quét QR', recent:'Gần đây',

    settings:'Cài đặt', language:'Ngôn ngữ',

    greeting:'Chào buổi sáng,', pioneer:'Pioneer',

    history:'Lịch sử', addPi:'Thêm Pi',

    availTasks:'Nhiệm vụ đang hoạt động', earnMore:'Kiếm thêm Pi',

    confirmPay:'Xác nhận thanh toán', cancel:'Hủy',

    activity:'Hoạt động', notifications:'Thông báo',

    security:'Bảo mật', personalInfo:'Thông tin cá nhân',

    verified:'KYC đã xác minh', transactions:'Giao dịch',

    earned:'Đã kiếm', nearby:'Gần đây', openMaps:'Mở Maps →',

    acceptTask:'Chấp nhận nhiệm vụ', submitVote:'Bỏ phiếu & kiếm',

    votes:'Phiếu bầu', participation:'Tham gia',


    // New keys

    scanQR:'Quét QR',

    card:'Thẻ',

    merchants:'Thương nhân',

    transit:'Giao thông',

    upcoming:'Sắp tới',

    addPi:'Thêm Pi',

    enterpriseLayers:'Lớp Doanh nghiệp',

    sendPi:'Gửi Pi',

    confirm:'Xác nhận',

    receiveTitle:'Nhận Pi',

    scanToPay:'Quét để thanh toán',

    earnTitle:'Fylox Kiếm tiền',

    continueBtn:'Tiếp tục',

    confirmSend:'Xác nhận & Gửi',

    backHome:'Về trang chủ',

    shareAddr:'Chia sẻ địa chỉ',

    copy:'Sao chép',

    earnSources:'Nguồn thu nhập',

    recentEarn:'Thu nhập gần đây',

    activeTask:'Nhiệm vụ đang hoạt động',

    availTasks:'Nhiệm vụ có sẵn',

    monthlyEarnings:'Thu nhập hàng tháng',

    nexusScore:'Điểm NEXUS',

    allFilter:'Tất cả',

    sentFilter:'Đã gửi',

    receivedFilter:'Đã nhận',

    personalInfo:'Thông tin cá nhân',

    switchAppearance:'Đổi giao diện',

    lightMode:'Chế độ sáng',

  },

  ko: {

    flag:'🇰🇷', name:'한국어',

    home:'홈', wallet:'지갑', earn:'수익', profile:'프로필',

    balance:'사용 가능 잔액', send:'보내기', receive:'받기',

    bills:'청구서', scan:'QR 스캔', recent:'최근',

    settings:'설정', language:'언어',

    greeting:'좋은 아침,', pioneer:'파이오니어',

    history:'내역', addPi:'Pi 추가',

    availTasks:'활성 작업', earnMore:'더 많은 Pi 얻기',

    confirmPay:'결제 확인', cancel:'취소',

    activity:'활동', notifications:'알림',

    security:'보안', personalInfo:'개인 정보',

    verified:'KYC 인증 완료', transactions:'거래',

    earned:'획득', nearby:'근처', openMaps:'지도 열기 →',

    acceptTask:'작업 수락', submitVote:'투표하고 수익 얻기',

    votes:'투표 수', participation:'참여율',


    // New keys

    scanQR:'QR 스캔',

    card:'카드',

    merchants:'상인',

    transit:'교통',

    upcoming:'예정된 항목',

    addPi:'Pi 추가',

    enterpriseLayers:'엔터프라이즈 레이어',

    sendPi:'Pi 보내기',

    confirm:'확인',

    receiveTitle:'Pi 받기',

    scanToPay:'QR 결제',

    earnTitle:'Fylox 수익',

    continueBtn:'계속',

    confirmSend:'확인 및 전송',

    backHome:'홈으로 돌아가기',

    shareAddr:'주소 공유',

    copy:'복사',

    earnSources:'수익 출처',

    recentEarn:'최근 수익',

    activeTask:'활성 작업',

    availTasks:'가능한 작업',

    monthlyEarnings:'이번 달 수익',

    nexusScore:'NEXUS 점수',

    allFilter:'전체',

    sentFilter:'보낸 것',

    receivedFilter:'받은 것',

    personalInfo:'개인 정보',

    switchAppearance:'화면 전환',

    lightMode:'라이트 모드',

  },

};


let currentLang = 'en';


// Key element IDs mapped to translation keys

const I18N_MAP = {

  // Bottom nav labels

  'nl-home-s5':    'home',

  'nl-wallet-s5':  'wallet',

  'nl-earn-s5':    'earn',

  'nl-profile-s5': 'profile',

  // Profile screen

  'profile-lang-name': null, // handled separately

};


// Pre-build reverse lookup: any translated value → its key
// Works across ALL 10 languages — no hardcoded strings needed
const REVERSE_LOOKUP = (() => {
  const map = {};
  const keys = [
    'home','wallet','earn','profile',
    'balance','send','receive','bills','scan','recent',
    'settings','language','greeting','pioneer',
    'history','addPi','availTasks','earnMore',
    'confirmPay','cancel','activity','notifications',
    'security','personalInfo','verified','transactions',
    'earned','nearby','openMaps','acceptTask','submitVote',
    'votes','participation','scanQR','card','merchants',
    'transit','upcoming','enterpriseLayers','sendPi',
    'confirm','receiveTitle','scanToPay','earnTitle',
    'continueBtn','confirmSend','backHome','shareAddr',
    'copy','earnSources','recentEarn','activeTask',
    'monthlyEarnings','nexusScore','allFilter',
    'sentFilter','receivedFilter','switchAppearance','lightMode',
  ];
  Object.values(LANGS).forEach(langObj => {
    keys.forEach(key => {
      const val = langObj[key];
      if (val) map[val.toLowerCase()] = key;
    });
  });
  return map;
})();

function applyLang(code) {
  const t = LANGS[code];
  if (!t) return;
  currentLang = code;

  // 1. data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // 2. Bottom nav labels — reverse lookup works from ANY source language
  document.querySelectorAll('.nl').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    const key = REVERSE_LOOKUP[txt];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });

  // 3. Screen titles (.ttitle) — reverse lookup, all 10 languages
  document.querySelectorAll('.ttitle').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    const key = REVERSE_LOOKUP[txt];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });

  // 4. Section headers (.sh)
  document.querySelectorAll('.sh').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    const key = REVERSE_LOOKUP[txt];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });

  // 5. Profile: language flag + name
  const flagEl = document.getElementById('profile-lang-flag');
  const nameEl = document.getElementById('profile-lang-name');
  if (flagEl) flagEl.textContent = t.flag;
  if (nameEl) nameEl.textContent = t.name;

  // 6. Active lang button highlight
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === code);
  });

  // 7. Home greeting
  const greetEl = document.getElementById('home-greeting');
  if (greetEl) greetEl.textContent = t.greeting;

  // 8. Document title (Pi Browser tab)
  document.title = 'Fylox — ' + t.home;

  if (navigator.vibrate) navigator.vibrate(30);
}

function setLang(code) {

  applyLang(code);

  // If coming from language screen, go to onboarding

  const curr = document.querySelector('.scr.show');

  if (curr && curr.id === 's_lang') {

    goTo('s1');

  }

  hideLangPicker();

}


function showLangPicker() {

  document.getElementById('lang-overlay').classList.add('show');

}


function hideLangPicker(e) {

  if (!e || e.target === document.getElementById('lang-overlay')) {

    document.getElementById('lang-overlay').classList.remove('show');

  }

}


// Show language screen on very first load

setTimeout(() => {

  const curr = document.querySelector('.scr.show');

  if (curr && curr.id === 's0') {

    goTo('s_lang');

  }

}, 2800);


// ═══════════════════════════════════════════════════

//  FYLOX LIVE ENGINE v6

// ═══════════════════════════════════════════════════


// ─── Keypad ───────────────────────────────────────

let kval = '0';

document.addEventListener('click', function(e) {

  const k = e.target.dataset.k;

  if (k !== undefined) {

    if (k === 'x') { kval = kval.length > 1 ? kval.slice(0,-1) : '0'; }

    else if (k === '.') { if (!kval.includes('.')) kval += '.'; }

    else { kval = kval === '0' ? k : kval + k; if (kval.length > 9) kval = kval.slice(0,-1); }

    const el = document.getElementById('sa');

    if (el) {window.KVAL = kval; el.innerHTML = kval + ' <span style="font-size:26px;color:var(--c)">π</span>';

  }

});


// ─── Vote selection ───────────────────────────────

function selVote(el, group) {

  document.querySelectorAll('.vote-opt').forEach(b => b.classList.remove('vsel'));

  el.classList.add('vsel');

  if (navigator.vibrate) navigator.vibrate(40);

}


// ─── Navigation ───────────────────────────────────

function goTo(id) {

  const curr = document.querySelector('.scr.show');

  const next = document.getElementById(id);

  if (!next || !curr || curr === next) return;

  curr.classList.remove('show');

  next.classList.add('show');

  next.classList.add('enter');

  next.addEventListener('animationend', () => next.classList.remove('enter'), {once: true});

  const sc = next.querySelector('.sc');

  if (sc) sc.scrollTop = 0;
  
  // Populate s7 with real values
if (id === 's7') {
  const saEl = document.getElementById('sa');
const rawAmt = saEl ? saEl.textContent.replace('π','').trim() : '0';
const amt = rawAmt === '0' || rawAmt === '' ? '0.00' : rawAmt;
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

  if (navigator.vibrate) navigator.vibrate(20);

}


document.addEventListener('click', function(e) {

  const el = e.target.closest('[data-go]');

  if (el) { e.preventDefault(); goTo(el.dataset.go); }

});


// ─── Live Clock ───────────────────────────────────

function updateTime() {

  const now = new Date();

  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  document.querySelectorAll('.stime').forEach(el => el.textContent = t);

}

updateTime();

setInterval(updateTime, 10000);


// ─── Toast System ─────────────────────────────────

// Toast messages keyed by language — title + sub for each notification type

const TOAST_I18N = {

  en: [

    { title:'María C. sent you Pi',        sub:'Verified Pioneer · Buenos Aires'        },

    { title:'New ORACLE task nearby',       sub:'Flood verification · 1.2 km away'       },

    { title:'AGORA vote is closing',        sub:'GPT-6 Banking access · 14 min left'     },

    { title:'Rodrigo P. paid at merchant',  sub:'Café del Centro · Via Fylox'            },

    { title:'NEXUS score updated',          sub:'ORACLE task completed +81 pts'          },

    { title:'Payment confirmed',            sub:'Supermercado Carrefour · NFC'           },

    { title:'ORACLE task confirmed',        sub:'Lagos Norte · 3 more verifications'     },

    { title:'New vote proposal live',       sub:'Anthropic · Claude autonomy'            },

  ],

  es: [

    { title:'María C. te envió Pi',         sub:'Pioneer verificado · Buenos Aires'      },

    { title:'Nueva tarea ORACLE cerca',     sub:'Verificación de inundación · 1.2 km'    },

    { title:'Votación AGORA por cerrar',    sub:'GPT-6 acceso bancario · 14 min'         },

    { title:'Rodrigo P. pagó en comercio',  sub:'Café del Centro · Vía Fylox'            },

    { title:'Puntuación NEXUS actualizada', sub:'Tarea ORACLE completada +81 pts'        },

    { title:'Pago confirmado',              sub:'Supermercado Carrefour · NFC'           },

    { title:'Tarea ORACLE confirmada',      sub:'Lagos Norte · 3 verificaciones más'     },

    { title:'Nueva propuesta de voto',      sub:'Anthropic · Autonomía de Claude'        },

  ],

  tl: [

    { title:'Nagpadala si María ng Pi',     sub:'Verified Pioneer · Buenos Aires'        },

    { title:'Bagong ORACLE task malapit',   sub:'Flood verification · 1.2 km ang layo'   },

    { title:'AGORA vote malapit nang matapos', sub:'GPT-6 Banking access · 14 min na lang' },

    { title:'Nagbayad si Rodrigo sa tindahan', sub:'Café del Centro · Via Fylox'         },

    { title:'Na-update ang NEXUS score',    sub:'ORACLE task tapos na +81 pts'           },

    { title:'Nakumpirma ang bayad',         sub:'Supermercado Carrefour · NFC'           },

    { title:'ORACLE task nakumpirma',       sub:'Lagos Norte · 3 pa na verification'     },

    { title:'Bagong boto proposal',         sub:'Anthropic · Claude autonomy'            },

  ],

  ng: [

    { title:'María C. don send you Pi',     sub:'Verified Pioneer · Buenos Aires'        },

    { title:'New ORACLE task dey near',     sub:'Flood check · 1.2 km comot'             },

    { title:'AGORA vote wan close',         sub:'GPT-6 Bank access · 14 min remain'      },

    { title:'Rodrigo don pay for shop',     sub:'Café del Centro · Fylox way'            },

    { title:'NEXUS score don update',       sub:'ORACLE task finish +81 pts'             },

    { title:'Payment don confirm',          sub:'Supermercado Carrefour · NFC'           },

    { title:'ORACLE task don confirm',      sub:'Lagos Norte · 3 more check remain'      },

    { title:'New vote proposal don land',   sub:'Anthropic · Claude autonomy'            },

  ],

  hi: [

    { title:'María C. ने Pi भेजा',          sub:'सत्यापित पायनियर · ब्यूनस आयर्स'         },

    { title:'नया ORACLE टास्क पास में',     sub:'बाढ़ सत्यापन · 1.2 किमी दूर'            },

    { title:'AGORA वोट बंद होने वाली है',   sub:'GPT-6 बैंकिंग · 14 मिनट शेष'            },

    { title:'Rodrigo ने दुकान पर भुगतान किया', sub:'Café del Centro · Fylox के जरिए'    },

    { title:'NEXUS स्कोर अपडेट हुआ',        sub:'ORACLE टास्क पूरा +81 pts'              },

    { title:'भुगतान की पुष्टि हुई',          sub:'Supermercado Carrefour · NFC'           },

    { title:'ORACLE टास्क पुष्टि हुई',       sub:'Lagos Norte · 3 और सत्यापन बाकी'        },

    { title:'नया वोट प्रस्ताव लाइव है',      sub:'Anthropic · Claude स्वायत्तता'           },

  ],

  pt: [

    { title:'María C. te enviou Pi',        sub:'Pioneer verificado · Buenos Aires'      },

    { title:'Nova tarefa ORACLE próxima',   sub:'Verificação de enchente · 1.2 km'       },

    { title:'Votação AGORA encerrando',     sub:'Acesso bancário GPT-6 · 14 min'         },

    { title:'Rodrigo pagou no comércio',    sub:'Café del Centro · Via Fylox'            },

    { title:'Pontuação NEXUS atualizada',   sub:'Tarefa ORACLE concluída +81 pts'        },

    { title:'Pagamento confirmado',         sub:'Supermercado Carrefour · NFC'           },

    { title:'Tarefa ORACLE confirmada',     sub:'Lagos Norte · 3 verificações restantes' },

    { title:'Nova proposta de voto ao vivo',sub:'Anthropic · Autonomia do Claude'        },

  ],

  zh: [

    { title:'María C. 向你发送了Pi',         sub:'认证先驱者 · 布宜诺斯艾利斯'               },

    { title:'附近有新ORACLE任务',            sub:'洪水核实 · 1.2公里外'                      },

    { title:'AGORA投票即将结束',             sub:'GPT-6银行访问 · 剩余14分钟'                },

    { title:'Rodrigo在商家付款',             sub:'中心咖啡馆 · 通过Fylox'                   },

    { title:'NEXUS评分已更新',              sub:'ORACLE任务完成 +81分'                      },

    { title:'付款已确认',                    sub:'家乐福超市 · NFC'                          },

    { title:'ORACLE任务已确认',             sub:'拉各斯北 · 还需3次验证'                     },

    { title:'新投票提案上线',                sub:'Anthropic · Claude自主性'                 },

  ],

  id: [

    { title:'María C. mengirim Pi',         sub:'Pioneer Terverifikasi · Buenos Aires'   },

    { title:'Tugas ORACLE baru di dekat',   sub:'Verifikasi banjir · 1,2 km'             },

    { title:'Voting AGORA akan berakhir',   sub:'Akses perbankan GPT-6 · 14 mnt'         },

    { title:'Rodrigo bayar di pedagang',    sub:'Café del Centro · Via Fylox'            },

    { title:'Skor NEXUS diperbarui',        sub:'Tugas ORACLE selesai +81 pts'           },

    { title:'Pembayaran dikonfirmasi',      sub:'Supermercado Carrefour · NFC'           },

    { title:'Tugas ORACLE dikonfirmasi',    sub:'Lagos Norte · 3 verifikasi lagi'        },

    { title:'Proposal voting baru',         sub:'Anthropic · Otonomi Claude'             },

  ],

  vi: [

    { title:'María C. gửi Pi cho bạn',      sub:'Pioneer đã xác minh · Buenos Aires'    },

    { title:'Có nhiệm vụ ORACLE gần đây',   sub:'Xác minh lũ lụt · cách 1,2 km'         },

    { title:'Bỏ phiếu AGORA sắp kết thúc', sub:'GPT-6 quyền ngân hàng · còn 14 phút'   },

    { title:'Rodrigo thanh toán tại cửa hàng', sub:'Café del Centro · Qua Fylox'        },

    { title:'Điểm NEXUS đã được cập nhật',  sub:'Hoàn thành nhiệm vụ ORACLE +81 pts'    },

    { title:'Đã xác nhận thanh toán',       sub:'Supermercado Carrefour · NFC'           },

    { title:'Nhiệm vụ ORACLE đã xác nhận',  sub:'Lagos Norte · còn 3 xác minh nữa'      },

    { title:'Đề xuất bỏ phiếu mới',         sub:'Anthropic · Quyền tự chủ Claude'        },

  ],

  ko: [

    { title:'María C.가 Pi를 보냈습니다',    sub:'인증된 파이오니어 · 부에노스아이레스'       },

    { title:'근처에 새 ORACLE 작업',         sub:'홍수 확인 · 1.2km 거리'                   },

    { title:'AGORA 투표 마감 임박',          sub:'GPT-6 금융 접근 · 14분 남음'              },

    { title:'Rodrigo가 상점에서 결제',        sub:'Café del Centro · Fylox 경유'            },

    { title:'NEXUS 점수 업데이트됨',         sub:'ORACLE 작업 완료 +81점'                   },

    { title:'결제 확인됨',                    sub:'Supermercado Carrefour · NFC'            },

    { title:'ORACLE 작업 확인됨',            sub:'Lagos Norte · 확인 3개 더 필요'           },

    { title:'새 투표 제안 시작',              sub:'Anthropic · Claude 자율성'               },

  ],

};


const TOAST_META = [

  { icon:'💸', bg:'rgba(0,212,232,.12)', amt:'+2.5 π'  },

  { icon:'🔭', bg:'rgba(0,212,232,.12)', amt:'+8 π'    },

  { icon:'🏛️', bg:'rgba(0,224,144,.12)', amt:'+4 π'    },

  { icon:'⚡', bg:'rgba(255,183,0,.12)', amt:'−18 π'   },

  { icon:'📦', bg:'rgba(139,92,246,.12)', amt:'763 pts' },

  { icon:'✅', bg:'rgba(0,224,144,.12)', amt:'−4.2 π'  },

  { icon:'🌊', bg:'rgba(0,212,232,.12)', amt:'+12.5 π' },

  { icon:'🏛️', bg:'rgba(0,224,144,.12)', amt:'+6 π'    },

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


// Start toasts after 4s, then every 18-28s

setTimeout(() => {

  const t = getToasts(); showToast(t[toastIdx++ % t.length]);

  setInterval(() => {

    const t = getToasts(); showToast(t[toastIdx++ % t.length]);

  }, 18000 + Math.random() * 10000);

}, 4000);


// ─── π Price Ticker ───────────────────────────────

let piPrice = 0.3400;

function updatePiPrice() {

  const delta = (Math.random() - 0.48) * 0.0015;

  const isUp = delta > 0;

  piPrice = Math.max(0.30, Math.min(0.42, piPrice + delta));

  const el = document.getElementById('pi-price');

  if (el) {

    el.textContent = '$' + piPrice.toFixed(4);

    el.classList.remove('price-up','price-down');

    void el.offsetWidth;

    el.classList.add(isUp ? 'price-up' : 'price-down');

  }

}

setInterval(updatePiPrice, 3800);


// ─── AGORA Pioneer Counter ─────────────────────────

let pioneers = 47293841;

function updatePioneers() {

  const add = Math.floor(Math.random() * 4) + 1;

  pioneers += add;

  const el = document.getElementById('agora-pioneers');

  if (el) {

    el.textContent = pioneers.toLocaleString('en-US');

    el.classList.remove('live-num');

    void el.offsetWidth;

    el.classList.add('live-num');

  }

}

setInterval(updatePioneers, 2800);


// ─── AGORA Vote Timer ─────────────────────────────

let voteMs = (2 * 24 * 60 + 14 * 60) * 60 * 1000; // 2d 14h in ms

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


// ─── ORACLE Task Timer (1h 23m counting down) ─────

let oracleMs = (1 * 60 + 23) * 60 * 1000;

function updateOracleTimer() {

  oracleMs = Math.max(0, oracleMs - 1000);

  const el = document.getElementById('oracle-task-timer');

  if (!el) return;

  const h = Math.floor(oracleMs / 3600000);

  const m = Math.floor((oracleMs % 3600000) / 60000);

  const s = Math.floor((oracleMs % 60000) / 1000);

  if (oracleMs < 300000) el.style.color = '#ff6b81'; // red last 5min

  el.textContent = h > 0 ? `⏱ ${h}h ${m}m left` : `⏱ ${m}m ${s.toString().padStart(2,'0')}s left`;

}

setInterval(updateOracleTimer, 1000);


// ─── ORACLE Confirmed Counter (3/7 → 4/7 → ...) ──

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


// ─── Pi Network SDK (dApp) ────────────────────────

// ─── Pi Network SDK — Real user & balance ────────

const FYLOX_DEMO = {

  username: 'joaquin_vera',

  piid: 'joaquin.pi',

  balance: 100.00,

  balanceARS: 50000

};


function updateUIWithUser(username, piid, balance) {

  const piPerUSD = piPrice;

  const arsPerUSD = 1050; // approx ARS/USD

  const balanceUSD = balance * piPerUSD;

  const balanceARS = Math.round(balanceUSD * arsPerUSD).toLocaleString('es-AR');

  const balanceFmt = balance.toFixed(2);


  // Home

  const hb = document.getElementById('home-balance');

  if (hb) hb.innerHTML = `${balanceFmt} <span style="font-size:24px;color:var(--c)">π</span>`;

  const hars = document.getElementById('home-ars');

  if (hars) hars.textContent = balanceARS;

  const hpid = document.getElementById('home-piid');

  if (hpid) hpid.textContent = piid;

  const hu = document.getElementById('home-username');

  if (hu) hu.textContent = '@' + username;


  // Wallet

  const wb = document.getElementById('wallet-balance');

  if (wb) wb.innerHTML = `${balanceFmt} <span style="font-size:24px;color:var(--c)">π</span>`;


  // Profile

  const pu = document.getElementById('profile-username');

  if (pu) pu.textContent = '@' + username;


  // Receive address

  const ra = document.getElementById('receive-address');

  if (ra) ra.textContent = '@' + username + ' · ' + piid;

}


window.onload = function() {

  if (window.Pi) {

    // ── RUNNING IN PI BROWSER ──────────────────────

    Pi.init({ version: "2.0", sandbox: false });

    console.log('[Fylox] Pi Browser detected ✅');


    // Show loading state on balance

    const hb = document.getElementById('home-balance');

    if (hb) hb.innerHTML = `<span style="font-size:20px;color:var(--t2)">Loading...</span>`;


    Pi.authenticate(

      ['payments', 'username', 'wallet_address'],

      function(incompletePayment) {

        // Handle any incomplete payment from previous session

        if (incompletePayment) {

          console.log('[Fylox] Incomplete payment found:', incompletePayment.identifier);

        }

      }

    ).then(function(auth) {

      const username = auth.user.username;

      const piid = username + '.pi';

      console.log('[Fylox] Authenticated:', username);


      // Fetch real balance from Pi Platform API via our backend

      fetch('/api/balance?uid=' + auth.user.uid, {

        headers: { 'Authorization': 'Bearer ' + auth.accessToken }

      })

      .then(r => r.json())

      .then(data => {

        const balance = data.balance || FYLOX_DEMO.balance;

        updateUIWithUser(username, piid, balance);

        console.log('[Fylox] Balance loaded:', balance, 'π');

      })

      .catch(() => {

        // Fallback: show auth'd username with demo balance

        updateUIWithUser(username, piid, FYLOX_DEMO.balance);

      });


      // Update toast notifications with real username

      // Update the "received Pi" toast text in all languages

      Object.keys(TOAST_I18N).forEach(lang => {

        if (TOAST_I18N[lang][0]) TOAST_I18N[lang][0].title = username + (lang === 'es' ? ' te envió Pi' : lang === 'ko' ? '가 Pi를 보냈습니다' : ' sent you Pi');

      });


    }).catch(function(err) {

      console.log('[Fylox] Auth error:', err);

      updateUIWithUser(FYLOX_DEMO.username, FYLOX_DEMO.piid, FYLOX_DEMO.balance);

    });


  } else {

    // ── DEMO MODE (browser / investor preview) ────

    console.log('[Fylox] Demo mode — no Pi Browser');

    updateUIWithUser(FYLOX_DEMO.username, FYLOX_DEMO.piid, FYLOX_DEMO.balance);

  }

};


// ─── Pi Day Countdown ─────────────────────────────

function updatePiDayCountdown() {

  const target = new Date('2026-03-14T00:00:00');

  const now = new Date();

  const diff = target - now;

  const el = document.getElementById('piday-countdown');

  if (!el) return;

  if (diff <= 0) { el.textContent = 'LIVE 🎉'; return; }

  const d = Math.floor(diff / 86400000);

  const h = Math.floor((diff % 86400000) / 3600000);

  const m = Math.floor((diff % 3600000) / 60000);

  el.textContent = d > 0 ? d + 'd ' + String(h).padStart(2,'0') + 'h' : String(h).padStart(2,'0') + 'h ' + String(m).padStart(2,'0') + 'm';

}

updatePiDayCountdown();

setInterval(updatePiDayCountdown, 60000);


// ─── Light / Dark Mode Toggle ─────────────────────

// Uses CSS variable overrides — works inside iframe + Pi Browser

let isLight = false;

const LIGHT_VARS = {

  '--bg':'#F0F2F5','--bg2':'#FFFFFF','--bg3':'#E8EBF0',

  '--b':'rgba(0,0,0,.1)','--cb':'rgba(0,212,232,.35)',

  '--t1':'#090B10','--t2':'#4A5568','--t3':'#8896A8',

  '--cd':'rgba(0,212,232,.12)',

  '--grid-line':'rgba(0,0,0,.04)',

  '--toast-bg':'rgba(255,255,255,.98)',

  '--toast-border':'rgba(0,0,0,.1)',

  '--toast-shadow':'rgba(0,0,0,.12)',

  '--toast-title':'#090B10',

  '--toast-sub':'#4A5568',

  '--earn-card-ylw':'linear-gradient(135deg,rgba(255,183,0,.1),rgba(255,200,50,.08))',

  '--earn-card-cyan':'linear-gradient(135deg,rgba(0,212,232,.1),rgba(0,180,220,.08))',

  '--earn-card-grn':'linear-gradient(135deg,rgba(0,224,144,.1),rgba(0,200,120,.08))',

  '--earn-card-purple':'linear-gradient(135deg,rgba(139,92,246,.1),rgba(100,60,200,.08))',

  '--earn-stat-bg':'rgba(0,0,0,.06)',

  '--earn-label-ylw':'rgba(160,110,0,.9)',

};

const DARK_VARS = {

  '--bg':'#060608','--bg2':'#0D0E14','--bg3':'#12131C',

  '--b':'rgba(255,255,255,.07)','--cb':'rgba(0,212,232,.2)',

  '--t1':'#F5F5FF','--t2':'rgba(245,245,255,.55)','--t3':'rgba(245,245,255,.3)',

  '--cd':'rgba(0,212,232,.08)',

  '--grid-line':'rgba(255,255,255,.03)',

  '--toast-bg':'rgba(18,18,26,.97)',

  '--toast-border':'rgba(255,255,255,.12)',

  '--toast-shadow':'rgba(0,0,0,.55)',

  '--toast-title':'#F5F5FF',

  '--toast-sub':'rgba(245,245,255,.55)',

  '--earn-card-ylw':'linear-gradient(135deg,#0C0A00,#1A1400)',

  '--earn-card-cyan':'linear-gradient(135deg,#050E1A,#0A1624)',

  '--earn-card-grn':'linear-gradient(135deg,#050E0A,#091A10)',

  '--earn-card-purple':'linear-gradient(135deg,#0D0518,#170A28)',

  '--earn-stat-bg':'rgba(0,0,0,.3)',

  '--earn-label-ylw':'rgba(255,183,0,.6)',

};

function toggleDark() {

  isLight = !isLight;

  const root = document.documentElement;

  // Apply CSS vars for the color tokens

  const vars = isLight ? LIGHT_VARS : DARK_VARS;

  for (const [k,v] of Object.entries(vars)) root.style.setProperty(k, v);

  // Toggle CSS class — this drives all structural overrides via html.light selectors

  root.classList.toggle('light', isLight);

  const btn = document.getElementById('dark-toggle-btn');

  const label = document.getElementById('dark-label');

  if (btn) btn.classList.toggle('on', isLight);

  if (label) label.textContent = isLight ? 'Dark Mode' : 'Light Mode';

  if (navigator.vibrate) navigator.vibrate(30);

}


// ─── Demo Modal ────────────────────────────────────

function showDemoInfo() {

  document.getElementById('demo-modal').classList.add('show');

}

function hideDemoModal(e) {

  if (!e || e.target === document.getElementById('demo-modal')) {

    document.getElementById('demo-modal').classList.remove('show');

  }

}


// ─── Activity Filters ─────────────────────────────

function filterTx(el) {

  document.querySelectorAll('.fpill').forEach(p => p.classList.remove('on'));

  el.classList.add('on');

  if (navigator.vibrate) navigator.vibrate(20);

}

function toggleFilterChip(el) {

  el.classList.toggle('on');

  if (navigator.vibrate) navigator.vibrate(20);

}


