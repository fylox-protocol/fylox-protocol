// ═══════════════════════════════════════════════════
//  FYLOX I18N ENGINE
//  Detección, aplicación y persistencia de idioma
// ═══════════════════════════════════════════════════

let currentLang = 'en';

function detectLang() {
  const supported = Object.keys(LANGS);
  const browserLangs = navigator.languages || [navigator.language || 'en'];
  for (const bl of browserLangs) {
    const code = bl.toLowerCase().split('-')[0];
    if (supported.includes(code)) return code;
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
    'oracleDesc','agoraDesc','nexusTitle','secured','totalBalance',
    'sent','receivedLabel','earnedLabel','recentTransactions','seeAll',
    'securitySettings','pinBiometric','facePay','coming2027',
    'oracleSubtitle','tasksAvailable','agoraSubtitle','voteOpen',
    'nexusSubtitle','marketplaceSubtitle','salesCount','monthlyEarningsTitle',
    'vsLastMonth','billsFilter','earnFilter','txLabel','oracleRealWorld',
    'facePayTitle','onDeviceEncryption','faceDataPrivacy','twoSecondPayments',
    'fasterThanCard','joinWaitlist','pointCamera','shareQR','simulatePayment',
    'searchBills','dueSoon','allServices','utilitiesFilter','insuranceFilter',
    'telecomFilter','upToDate','waterBill','internetProvider','searchMerchants',
    'merchantsNearby','nearbyResults','registerBusiness','piDay','fullMainnet',
    'remaining','activeTasksLabel','thisMonth','topUpRecommended',
    'thisMonthFilter','largestFirst','incomingFilter','oracleReward',
    'agoraVoteReward','pioneerLabel','earnedProfile','oracleProfile',
    'reputationMultiplierActive','goodReputation','earningsMultiplier',
    'scoreBreakdown','piIdentity','piTransactions','oracleScore',
    'socialEndorsements','externalData','unlockMoreEarnings','distanceLabel',
    'timeEst','confirmedLabel','goToLocation','takePhoto','submitLabel',
    'urgentLabel','agoraTitle','agoraSubline','agoraPioneers','realPiVote',
    'activeVote','votesCast','participationLabel','transferLabel',
    'biometricLock','biometricEnabled','recoveryPhrase','recoveryBacked',
    'thisWeek','registerBusinessSub','foodRestaurant','coffeeShop',
    'pharmacy','electronics','retailStore',
    'virtualCardNfc','tapToPay','showQR','cardSettings',
    'humanitarianTask','voteYes','voteNo','voteConsent',
    'goodReputation','monthlyEarningsTitle','balanceLabel','lowBalance','topUpAmount',
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

  document.querySelectorAll('[placeholder-i18n]').forEach(el => {
    const key = el.getAttribute('placeholder-i18n');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  document.querySelectorAll('.nl').forEach(el => {
    const key = REVERSE_LOOKUP[el.textContent.trim().toLowerCase()];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll('.ttitle').forEach(el => {
    const key = REVERSE_LOOKUP[el.textContent.trim().toLowerCase()];
    if (key && t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll('.sh').forEach(el => {
    const key = REVERSE_LOOKUP[el.textContent.trim().toLowerCase()];
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
  FyloxStorage.set('fylox-lang', code);
  hideLangPicker();
}

function showLangPicker() {
  const overlay = document.getElementById('lang-overlay');
  if (overlay) overlay.classList.add('show');
}

function hideLangPicker(e) {
  const overlay = document.getElementById('lang-overlay');
  if (!overlay) return;
  if (!e || e.target === overlay) overlay.classList.remove('show');
}
