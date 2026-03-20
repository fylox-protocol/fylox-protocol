// ═══════════════════════════════════════════════════
//  FYLOX API CLIENT
// ═══════════════════════════════════════════════════

const FYLOX_API = 'https://fylox-backend.onrender.com/api';

let _fyloxToken = null;

function getToken()   { return _fyloxToken; }
function setToken(t)  { _fyloxToken = t; }
function clearToken() { _fyloxToken = null; }

async function apiCall(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (_fyloxToken) headers['Authorization'] = 'Bearer ' + _fyloxToken;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(FYLOX_API + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  } catch (err) {
    console.error('[Fylox API]', path, err.message);
    throw err;
  }
}

// ═══════════════════════════════════════════════════
//  FYLOX LANGUAGE ENGINE
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
    scanQR:'Scan QR', card:'Card', merchants:'Merchants',
    transit:'Transit', upcoming:'Upcoming',
    enterpriseLayers:'Enterprise Layers', sendPi:'Send Pi',
    confirm:'Confirm', receiveTitle:'Receive Pi', scanToPay:'Scan to Pay',
    earnTitle:'Fylox Earn', continueBtn:'Continue', confirmSend:'Confirm & Send',
    backHome:'Back to Home', shareAddr:'Share address', copy:'Copy',
    earnSources:'Earn Sources', recentEarn:'Recent Earn', activeTask:'Active Task',
    monthlyEarnings:'Monthly Earnings', nexusScore:'NEXUS Score',
    allFilter:'All', sentFilter:'Sent', receivedFilter:'Received',
    switchAppearance:'Switch appearance', lightMode:'Light Mode',
    oracleDesc:'Real-world data verification by Pioneers',
    agoraDesc:'AI model governance by 47M Pioneers',
    nexusTitle:'NEXUS Protocol Score',
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
    scanQR:'Escanear QR', card:'Tarjeta', merchants:'Comercios',
    transit:'Transporte', upcoming:'Próximos vencimientos',
    enterpriseLayers:'Capas Empresariales', sendPi:'Enviar Pi',
    confirm:'Confirmar', receiveTitle:'Recibir Pi',
    scanToPay:'Escanear para pagar', earnTitle:'Fylox Ganar',
    continueBtn:'Continuar', confirmSend:'Confirmar y Enviar',
    backHome:'Volver al Inicio', shareAddr:'Compartir dirección', copy:'Copiar',
    earnSources:'Fuentes de ingresos', recentEarn:'Ingresos recientes',
    activeTask:'Tarea Activa', monthlyEarnings:'Ganancias del mes',
    nexusScore:'Puntuación NEXUS', allFilter:'Todos',
    sentFilter:'Enviados', receivedFilter:'Recibidos',
    switchAppearance:'Cambiar apariencia', lightMode:'Modo claro',
    oracleDesc:'Verificación de datos del mundo real por Pioneers',
    agoraDesc:'Gobernanza de IA por 47M Pioneers',
    nexusTitle:'Puntuación Protocolo NEXUS',
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
    scanQR:'I-scan ang QR', card:'Card', merchants:'Mga Manlalako',
    transit:'Transit', upcoming:'Mga Darating',
    enterpriseLayers:'Mga Enterprise Layer', sendPi:'Magpadala ng Pi',
    confirm:'Kumpirmahin', receiveTitle:'Tumanggap ng Pi',
    scanToPay:'I-scan para bayaran', earnTitle:'Fylox Kumita',
    continueBtn:'Magpatuloy', confirmSend:'Kumpirmahin at Ipadala',
    backHome:'Bumalik sa Home', shareAddr:'Ibahagi ang address', copy:'Kopyahin',
    earnSources:'Mga Pinagkukunan', recentEarn:'Kamakailang Kita',
    activeTask:'Aktibong Gawain', monthlyEarnings:'Kita ngayong Buwan',
    nexusScore:'NEXUS Score', allFilter:'Lahat',
    sentFilter:'Naipadala', receivedFilter:'Natanggap',
    switchAppearance:'Baguhin ang hitsura', lightMode:'Light Mode',
    oracleDesc:'Pag-verify ng datos sa totoong mundo ng mga Pioneer',
    agoraDesc:'Pamamahala ng AI ng 47M Pioneers',
    nexusTitle:'NEXUS Protocol Score',
  },
  ng: {
    flag:'🇳🇬', name:'Naija Pidgin',
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
    scanQR:'Scan QR', card:'Card', merchants:'Shop Shop',
    transit:'Transit', upcoming:'Upcoming',
    enterpriseLayers:'Enterprise Layers', sendPi:'Send Pi',
    confirm:'Confirm', receiveTitle:'Receive Pi', scanToPay:'Scan to Pay',
    earnTitle:'Fylox Earn', continueBtn:'Continue', confirmSend:'Confirm & Send',
    backHome:'Go Back Home', shareAddr:'Share address', copy:'Copy',
    earnSources:'Earn Sources', recentEarn:'Recent Earn', activeTask:'Active Task',
    monthlyEarnings:'Monthly Earnings', nexusScore:'NEXUS Score',
    allFilter:'All', sentFilter:'Sent', receivedFilter:'Received',
    switchAppearance:'Change how e look', lightMode:'Light Mode',
    oracleDesc:'Real-world data check by Pioneers',
    agoraDesc:'AI governance by 47M Pioneers',
    nexusTitle:'NEXUS Protocol Score',
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
    scanQR:'QR स्कैन', card:'कार्ड', merchants:'व्यापारी',
    transit:'ट्रांजिट', upcoming:'आगामी',
    enterpriseLayers:'एंटरप्राइज़ लेयर', sendPi:'Pi भेजें',
    confirm:'पुष्टि करें', receiveTitle:'Pi प्राप्त करें',
    scanToPay:'QR स्कैन करें', earnTitle:'Fylox कमाई',
    continueBtn:'जारी रखें', confirmSend:'पुष्टि करें और भेजें',
    backHome:'होम पर वापस', shareAddr:'पता शेयर करें', copy:'कॉपी करें',
    earnSources:'आय के स्रोत', recentEarn:'हाल की कमाई',
    activeTask:'सक्रिय कार्य', monthlyEarnings:'मासिक आय',
    nexusScore:'NEXUS स्कोर', allFilter:'सभी',
    sentFilter:'भेजे गए', receivedFilter:'प्राप्त',
    switchAppearance:'रूप बदलें', lightMode:'लाइट मोड',
    oracleDesc:'Pioneers द्वारा वास्तविक डेटा सत्यापन',
    agoraDesc:'47M Pioneers द्वारा AI शासन',
    nexusTitle:'NEXUS प्रोटोकॉल स्कोर',
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
    scanQR:'Escanear QR', card:'Cartão', merchants:'Comerciantes',
    transit:'Transporte', upcoming:'Próximos',
    enterpriseLayers:'Camadas Empresariais', sendPi:'Enviar Pi',
    confirm:'Confirmar', receiveTitle:'Receber Pi',
    scanToPay:'Escanear para pagar', earnTitle:'Fylox Ganhar',
    continueBtn:'Continuar', confirmSend:'Confirmar e Enviar',
    backHome:'Voltar ao Início', shareAddr:'Compartilhar endereço', copy:'Copiar',
    earnSources:'Fontes de Renda', recentEarn:'Renda Recente',
    activeTask:'Tarefa Ativa', monthlyEarnings:'Ganhos do Mês',
    nexusScore:'Pontuação NEXUS', allFilter:'Todos',
    sentFilter:'Enviados', receivedFilter:'Recebidos',
    switchAppearance:'Mudar aparência', lightMode:'Modo Claro',
    oracleDesc:'Verificação de dados do mundo real por Pioneers',
    agoraDesc:'Governança de IA por 47M Pioneers',
    nexusTitle:'Pontuação Protocolo NEXUS',
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
    scanQR:'扫描QR', card:'卡', merchants:'商家', transit:'交通',
    upcoming:'即将到期', enterpriseLayers:'企业层',
    sendPi:'发送Pi', confirm:'确认', receiveTitle:'接收Pi', scanToPay:'扫码支付',
    earnTitle:'Fylox收益', continueBtn:'继续', confirmSend:'确认发送',
    backHome:'返回首页', shareAddr:'分享地址', copy:'复制',
    earnSources:'收益来源', recentEarn:'最近收益', activeTask:'当前任务',
    monthlyEarnings:'月度收益', nexusScore:'NEXUS评分',
    allFilter:'全部', sentFilter:'已发送', receivedFilter:'已接收',
    switchAppearance:'切换外观', lightMode:'浅色模式',
    oracleDesc:'先锋者验证现实世界数据',
    agoraDesc:'47M先锋者AI治理',
    nexusTitle:'NEXUS协议评分',
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
    scanQR:'Pindai QR', card:'Kartu', merchants:'Pedagang',
    transit:'Transit', upcoming:'Akan Datang',
    enterpriseLayers:'Lapisan Enterprise', sendPi:'Kirim Pi',
    confirm:'Konfirmasi', receiveTitle:'Terima Pi',
    scanToPay:'Pindai untuk Bayar', earnTitle:'Fylox Penghasilan',
    continueBtn:'Lanjutkan', confirmSend:'Konfirmasi & Kirim',
    backHome:'Kembali ke Beranda', shareAddr:'Bagikan alamat', copy:'Salin',
    earnSources:'Sumber Penghasilan', recentEarn:'Penghasilan Terbaru',
    activeTask:'Tugas Aktif', monthlyEarnings:'Penghasilan Bulanan',
    nexusScore:'Skor NEXUS', allFilter:'Semua',
    sentFilter:'Terkirim', receivedFilter:'Diterima',
    switchAppearance:'Ubah tampilan', lightMode:'Mode Terang',
    oracleDesc:'Verifikasi data dunia nyata oleh Pioneers',
    agoraDesc:'Tata kelola AI oleh 47M Pioneers',
    nexusTitle:'Skor Protokol NEXUS',
  },
  vi: {
    flag:'🇻🇳', name:'Tieng Viet',
    home:'Trang chu', wallet:'Vi', earn:'Kiem tien', profile:'Ho so',
    balance:'So du kha dung', send:'Gui', receive:'Nhan',
    bills:'Hoa don', scan:'Quet QR', recent:'Gan day',
    settings:'Cai dat', language:'Ngon ngu',
    greeting:'Chao buoi sang,', pioneer:'Pioneer',
    history:'Lich su', addPi:'Them Pi',
    availTasks:'Nhiem vu dang hoat dong', earnMore:'Kiem them Pi',
    confirmPay:'Xac nhan thanh toan', cancel:'Huy',
    activity:'Hoat dong', notifications:'Thong bao',
    security:'Bao mat', personalInfo:'Thong tin ca nhan',
    verified:'KYC da xac minh', transactions:'Giao dich',
    earned:'Da kiem', nearby:'Gan day', openMaps:'Mo Maps →',
    acceptTask:'Chap nhan nhiem vu', submitVote:'Bo phieu & kiem',
    votes:'Phieu bau', participation:'Tham gia',
    scanQR:'Quet QR', card:'The', merchants:'Thuong nhan',
    transit:'Giao thong', upcoming:'Sap toi',
    enterpriseLayers:'Lop Doanh nghiep', sendPi:'Gui Pi',
    confirm:'Xac nhan', receiveTitle:'Nhan Pi',
    scanToPay:'Quet de thanh toan', earnTitle:'Fylox Kiem tien',
    continueBtn:'Tiep tuc', confirmSend:'Xac nhan & Gui',
    backHome:'Ve trang chu', shareAddr:'Chia se dia chi', copy:'Sao chep',
    earnSources:'Nguon thu nhap', recentEarn:'Thu nhap gan day',
    activeTask:'Nhiem vu dang hoat dong', monthlyEarnings:'Thu nhap hang thang',
    nexusScore:'Diem NEXUS', allFilter:'Tat ca',
    sentFilter:'Da gui', receivedFilter:'Da nhan',
    switchAppearance:'Doi giao dien', lightMode:'Che do sang',
    oracleDesc:'Xac minh du lieu thuc te boi Pioneers',
    agoraDesc:'Quan tri AI boi 47M Pioneers',
    nexusTitle:'Diem Giao thuc NEXUS',
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
    scanQR:'QR 스캔', card:'카드', merchants:'상인',
    transit:'교통', upcoming:'예정된 항목',
    enterpriseLayers:'엔터프라이즈 레이어', sendPi:'Pi 보내기',
    confirm:'확인', receiveTitle:'Pi 받기', scanToPay:'QR 결제',
    earnTitle:'Fylox 수익', continueBtn:'계속', confirmSend:'확인 및 전송',
    backHome:'홈으로 돌아가기', shareAddr:'주소 공유', copy:'복사',
    earnSources:'수익 출처', recentEarn:'최근 수익', activeTask:'활성 작업',
    monthlyEarnings:'이번 달 수익', nexusScore:'NEXUS 점수',
    allFilter:'전체', sentFilter:'보낸 것', receivedFilter:'받은 것',
    switchAppearance:'화면 전환', lightMode:'라이트 모드',
    oracleDesc:'파이오니어들의 실세계 데이터 검증',
    agoraDesc:'4700만 파이오니어의 AI 거버넌스',
    nexusTitle:'NEXUS 프로토콜 점수',
  },
};

let currentLang = 'en';

// ═══════════════════════════════════════════════════
//  AUTO-DETECT LANGUAGE — Silicon Valley style
//  Detects browser language, maps to supported langs,
//  falls back to English. No interruption to onboarding.
// ═══════════════════════════════════════════════════
function detectLang() {
  const supported = Object.keys(LANGS);
  const browserLangs = navigator.languages || [navigator.language || 'en'];
  for (const bl of browserLangs) {
    const code = bl.toLowerCase().split('-')[0];
    // Direct match
    if (supported.includes(code)) return code;
    // Special mappings
    const map = { 'zh': 'zh', 'fil': 'tl', 'tl': 'tl', 'ha': 'ng', 'yo': 'ng', 'ig': 'ng' };
    if (map[code]) return map[code];
  }
  return 'en';
}

const REVERSE_LOOKUP = (() => {
  const map = {};
  const keys = [
    'home','wallet','earn','profile','balance','send','receive',
    'bills','scan','recent','settings','language','greeting','pioneer',
    'history','addPi','availTasks','earnMore','confirmPay','cancel',
    'activity','notifications','security','personalInfo','verified',
    'transactions','earned','nearby','openMaps','acceptTask','submitVote',
    'votes','participation','scanQR','card','merchants','transit',
    'upcoming','enterpriseLayers','sendPi','confirm','receiveTitle',
    'scanToPay','earnTitle','continueBtn','confirmSend','backHome',
    'shareAddr','copy','earnSources','recentEarn','activeTask',
    'monthlyEarnings','nexusScore','allFilter','sentFilter',
    'receivedFilter','switchAppearance','lightMode',
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
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('.nl').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    const key = REVERSE_LOOKUP[txt];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('.ttitle').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    const key = REVERSE_LOOKUP[txt];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('.sh').forEach(el => {
    const txt = el.textContent.trim().toLowerCase();
    const key = REVERSE_LOOKUP[txt];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });
  const flagEl = document.getElementById('profile-lang-flag');
  const nameEl = document.getElementById('profile-lang-name');
  if (flagEl) flagEl.textContent = t.flag;
  if (nameEl) nameEl.textContent = t.name;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === code);
  });
  const greetEl = document.getElementById('home-greeting');
  if (greetEl) greetEl.textContent = t.greeting;
  document.title = 'Fylox — ' + t.home;
  if (navigator.vibrate) navigator.vibrate(30);
}

function setLang(code) {
  applyLang(code);
  hideLangPicker();
}

function showLangPicker() {
  const overlay = document.getElementById('lang-overlay');
  if (overlay) overlay.classList.add('show');
}

function hideLangPicker(e) {
  const overlay = document.getElementById('lang-overlay');
  if (!overlay) return;
  if (!e || e.target === overlay) {
    overlay.classList.remove('show');
  }
}

// ═══════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════

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
  if (id === 's9') {
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target = parseFloat(wb.dataset.value || '100') || 100;
      wb.dataset.value = target;

      // ── SILICON VALLEY COUNTER — spring physics + stagger ──
      const duration  = 1800;
      const delay     = 120; // ms antes de arrancar
      let startTime   = null;

      // Easing: exponential out — arranca rápido, frena suave al final
      const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

      // Fase 1: fade + slide del contenedor
      wb.style.opacity  = '0';
      wb.style.transform = 'translateY(8px)';
      wb.style.transition = 'none';
      wb.innerHTML = `0.00 <span style="font-size:24px;color:var(--c)">π</span>`;

      setTimeout(() => {
         wb.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(.22,1,.36,1)';
         wb.style.opacity   = '1';
         wb.style.transform = 'translateY(0)';

        // Fase 2: conteo numérico con easing
        const animate = (now) => {
          if (!startTime) startTime = now;
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = easeOutExpo(progress);
          const current  = (target * eased).toFixed(2);

          // Glow cyan en los últimos frames
          const glowOpacity = progress > 0.85 ? (progress - 0.85) / 0.15 : 0;
          wb.innerHTML = `<span style="
            text-shadow: 0 0 ${Math.round(glowOpacity * 32)}px rgba(0,212,232,${(glowOpacity * 0.6).toFixed(2)});
            transition: text-shadow 0.1s ease;
          ">${current}</span> <span style="font-size:24px;color:var(--c)">π</span>`;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Frame final — limpio, sin glow
            wb.innerHTML = `${target.toFixed(2)} <span style="font-size:24px;color:var(--c)">π</span>`;
            // Micro-pulse al terminar
            wb.style.transform = 'scale(1.03)';
            wb.style.transition = 'transform 0.15s cubic-bezier(.34,1.56,.64,1)';
            setTimeout(() => {
              wb.style.transform = 'scale(1)';
              wb.style.transition = 'transform 0.2s ease';
            }, 150);
          }
        };
        requestAnimationFrame(animate);
      }, delay);
    }
  }

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
  if (el) { e.preventDefault(); goTo(el.dataset.go); }
});

document.addEventListener('click', function(e) {
  const k = e.target.dataset.k;
  if (k !== undefined) {
    if (k === 'x') { kval = kval.length > 1 ? kval.slice(0,-1) : '0'; }
    else if (k === '.') { if (!kval.includes('.')) kval += '.'; }
    else { kval = kval === '0' ? k : kval + k; if (kval.length > 9) kval = kval.slice(0,-1); }
    const el = document.getElementById('sa');
    if (el) { window.KVAL = kval; window.SEND_AMT = kval; el.innerHTML = kval + ' <span style="font-size:26px;color:var(--c)">π</span>'; }
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
    { title:'Maria C. te envio Pi', sub:'Pioneer verificado · Buenos Aires' },
    { title:'Nueva tarea ORACLE cerca', sub:'Verificacion de inundacion · 1.2 km' },
    { title:'Votacion AGORA por cerrar', sub:'GPT-6 acceso bancario · 14 min' },
    { title:'Rodrigo P. pago en comercio', sub:'Cafe del Centro · Via Fylox' },
    { title:'Puntuacion NEXUS actualizada', sub:'Tarea ORACLE completada +81 pts' },
    { title:'Pago confirmado', sub:'Supermercado · NFC' },
    { title:'Tarea ORACLE confirmada', sub:'Lagos Norte · 3 verificaciones mas' },
    { title:'Nueva propuesta de voto', sub:'Anthropic · Autonomia de Claude' },
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

function updateUIWithUser(username, balance) {
  const piid = username + '.pi';
  const balanceUSD = balance * piPrice;
  const arsPerUSD = 1050;
  const balanceARS = Math.round(balanceUSD * arsPerUSD).toLocaleString('es-AR');
  const balanceFmt = balance.toFixed(2);
  const hb = document.getElementById('home-balance');
  if (hb) hb.innerHTML = `${balanceFmt} <span style="font-size:24px;color:var(--c)">π</span>`;
  const hars = document.getElementById('home-ars');
  if (hars) hars.textContent = balanceARS;
  const hpid = document.getElementById('home-piid');
  if (hpid) hpid.textContent = piid;
  const hu = document.getElementById('home-username');
  if (hu) hu.textContent = '@' + username;
  const wb = document.getElementById('wallet-balance');
  if (wb) {
    // Solo guardamos el valor — la animación lo muestra al abrir Wallet (s9)
    wb.dataset.value = balance;
  }
  const pu = document.getElementById('profile-username');
  if (pu) pu.textContent = '@' + username;
  const ra = document.getElementById('receive-address');
  if (ra) ra.textContent = '@' + username + ' · ' + piid;
  // Update s3 card username
  const s3u = document.getElementById('s3-username');
  if (s3u) s3u.textContent = '@' + username + '.pi';
  const s3bu = document.getElementById('s3-back-username');
  if (s3bu) s3bu.textContent = '@' + username + '.pi';
}

async function authenticateWithBackend(piAccessToken, walletAddress) {
  try {
    const data = await apiCall('POST', '/auth/pi', {
      accessToken: piAccessToken,
      walletAddress: walletAddress || null,
    });
    setToken(data.token);
    return data.user;
  } catch (err) {
    console.error('[Fylox] Error autenticando con backend:', err.message);
    throw err;
  }
}

async function fetchBalance() {
  try {
    const data = await apiCall('GET', '/user/balance');
    return data.balance;
  } catch (err) {
    console.warn('[Fylox] No se pudo obtener balance:', err.message);
    return 0;
  }
}

function fyloxSendPayment() {
  const amt = parseFloat(document.getElementById('s7total')?.textContent.replace('π','').trim()) || 0;
  const to = window.SEND_TO || '@Pioneer';
  if (amt <= 0) return;
  if (!window.Pi) {
    const el = document.getElementById('s8msg');
    if (el) el.textContent = amt + ' π sent to ' + to;
    goTo('s8');
    return;
  }
  Pi.createPayment({
    amount: amt,
    memo: 'Fylox payment to ' + to,
    metadata: { to },
  }, {
    onReadyForServerApproval: async function(paymentId) {
      try {
        await apiCall('POST', '/payments/approve', { paymentId });
        console.log('[Fylox] Pago aprobado');
      } catch (err) {
        // "ya aprobado" no es un error real — el pago puede continuar
        if (err.message && err.message.includes('ya aprobado')) {
          console.warn('[Fylox] Pago ya aprobado previamente — continuando');
        } else {
          console.error('[Fylox] Error aprobando pago:', err.message);
        }
      }
    },
    onReadyForServerCompletion: async function(paymentId, txid) {
      try {
        await apiCall('POST', '/payments/complete', { paymentId, txid });
        const el = document.getElementById('s8msg');
        if (el) el.textContent = amt + ' π sent to ' + to;
        goTo('s8');
        const newBalance = await fetchBalance();
        updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);
      } catch (err) {
        console.error('[Fylox] Error completando pago:', err.message);
      }
    },
    onCancel: function(paymentId) {
      console.log('[Fylox] Pago cancelado:', paymentId);
    },
    onError: function(error) {
      console.error('[Fylox] Error Pi SDK:', error);
    },
  });
}

// ═══════════════════════════════════════════════════
//  SAFE STORAGE — Pi Browser localStorage fallback
// ═══════════════════════════════════════════════════
const FyloxStorage = {
  _mem: {},
  get(key) {
    try { return localStorage.getItem(key); } catch(e) { return this._mem[key] || null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, val); } catch(e) { this._mem[key] = val; }
  }
};

// ═══════════════════════════════════════════════════
//  PI LOGIN — Called by "Continue with Pi Network" btn
//  Handles both Pi Browser (real auth) and demo mode
// ═══════════════════════════════════════════════════
async function piLogin() {
  const btn = document.getElementById('pi-login-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="position:relative;z-index:1">Connecting to Pi Network…</span>';
  }

  if (!window.Pi) {
    // Demo mode — navegador normal, no Pi Browser
    console.log('[Fylox] Demo mode login');
    updateUIWithUser('joaquin_vera', 100.00);
    goTo('s5');
    return;
  }

  try {
    const isSandbox = new URLSearchParams(window.location.search).get('sandbox') === '1';
    Pi.init({ version: '2.0', sandbox: isSandbox });
    console.log('[Fylox] Modo:', isSandbox ? 'Sandbox ✓' : 'Mainnet ✓');

    const auth = await Pi.authenticate(
      ['payments', 'username', 'wallet_address'],
      async function onIncompletePayment(incompletePayment) {
        if (!incompletePayment) return;
        console.log('[Fylox] Pago incompleto detectado:', incompletePayment.identifier);
        try {
          await apiCall('POST', '/payments/complete', {
            paymentId: incompletePayment.identifier,
            txid: incompletePayment.transaction?.txid || null,
          });
        } catch (err) {
          await apiCall('POST', '/payments/cancel', { paymentId: incompletePayment.identifier }).catch(() => {});
        }
      }
    );

    window._fyloxUsername = auth.user.username;
    window._fyloxWallet   = auth.user.wallet_address || null;

    // Si el SDK no devolvió wallet_address, la pedimos directamente
    if (!window._fyloxWallet && window.Pi.Wallet) {
      try {
        const walletData = await Pi.Wallet.getUserMigratedWalletAddresses();
        if (walletData?.wallets?.length > 0) {
          window._fyloxWallet = walletData.wallets[0].publicKey;
          console.log('[Fylox] Wallet obtenida via Wallet API:', window._fyloxWallet);
        }
      } catch (wErr) {
        console.warn('[Fylox] No se pudo obtener wallet via API:', wErr.message);
      }
    }

    await authenticateWithBackend(auth.accessToken, window._fyloxWallet);
    const balance = await fetchBalance();
    updateUIWithUser(auth.user.username, balance);
    goTo('s5');

  } catch (err) {
    console.error('[Fylox] Error de autenticacion:', err.message);
    if (btn) {
      btn.innerHTML = '<span style="position:relative;z-index:1">Error — Reintentar →</span>';
      btn.style.background = 'rgba(255,77,106,.25)';
      btn.style.color = '#FF4D6A';
      btn.disabled = false;
    }
  }
}

// ═══════════════════════════════════════════════════
//  INIT — Auto-detect language, no interruptions
// ═══════════════════════════════════════════════════
window.onload = async function() {

  // 0. INTRO SCREEN
  const introEl = document.getElementById('s_intro');
  const introLogo = document.getElementById('intro-logo');
  const introText = document.getElementById('intro-text');
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
        if (s0) { s0.classList.add('show'); }
      }, 560);
    }, 2600);
  }

  // 1. Auto-detect & apply language silently
  const detectedLang = detectLang();
  applyLang(detectedLang);
  console.log('[Fylox] Language detected:', detectedLang);

  // 2. Apply theme using safe storage (Pi Browser compatible)
  const savedTheme = FyloxStorage.get('fylox-theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
    const btn = document.getElementById('dark-toggle-btn');
    if (btn) btn.classList.add('on');
  }

  // 3. Pre-set balance as Loading if in Pi Browser, demo values otherwise
  //    Real auth happens when the user taps "Continue with Pi Network"
  if (window.Pi) {
    console.log('[Fylox] Pi Browser detectado — auth pendiente de tap del usuario');
    const hb = document.getElementById('home-balance');
    if (hb) hb.innerHTML = '<span style="font-size:20px;color:var(--t2)">—</span>';
  } else {
    console.log('[Fylox] Demo mode');
    updateUIWithUser('joaquin_vera', 100.00);
  }

  // 3. Start toast engine
  setTimeout(function fireToast() {
    const toasts = getToasts();
    showToast(toasts[toastIdx % toasts.length]);
    toastIdx++;
    setTimeout(fireToast, 6000 + Math.random() * 4000);
  }, 3500);
};
