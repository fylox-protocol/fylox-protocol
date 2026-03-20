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
    utilityBill:'Utility Bill',
    utilityBillDue:'Due in 3 days · 8.5 π',
    transitCard:'Transit Card',
    transitCardLow:'Transit Card — Low balance',
    internetBill:'Internet Bill',
    internetBillDue:'Due in 9 days · 3.2 π',
    recentTx1:'Utility Bill',
    recentTx1Date:'Mar 18',
    recentTx2:'Received from @pioneer_user',
    recentTx2Date:'Mar 17',
    paymentConfirmedNote:'Utility Bill 8.5 π · 2 hours ago',
    receivedNote:'From @pioneer_user · Yesterday',
    transitLowNote:'Transit Card balance low',
    loadTransit:'Load 10 π to Transit Card',
    oracleFlood:'ORACLE — Flood Verification',
    floodLocation:'Flood verification Southeast Asia',
    secured:'SECURED',
    thisWeek:'this week',
    totalBalance:'TOTAL BALANCE',
    sent:'SENT',
    receivedLabel:'RECEIVED',
    earnedLabel:'EARNED',
    biometricLock:'Biometric Lock',
    biometricEnabled:'✓ Enabled',
    recoveryPhrase:'Recovery Phrase',
    recoveryBacked:'Backed up · 24 words',
    recentTransactions:'RECENT TRANSACTIONS',
    seeAll:'See all →',
    securitySettings:'Security Settings',
    pinBiometric:'PIN · Biometric',
    facePay:'Face Pay',
    coming2027:'Coming 2027',
    oracleSubtitle:'Real-world verification',
    tasksAvailable:'2 tasks available',
    agoraSubtitle:'AI governance voting',
    voteOpen:'1 vote open',
    nexusSubtitle:'Reputation multiplier',
    nexusScore:'Score: Good',
    marketplaceSubtitle:'Pi commerce',
    salesCount:'3 sales',
    monthlyEarningsTitle:'MONTHLY EARNINGS',
    vsLastMonth:'+18% vs last month',
    billsFilter:'Bills',
    earnFilter:'Earn',
    txLabel:'Tx',
    oracleRealWorld:'Real-world verification tasks · Earn Pi',
    facePayTitle:'Pay with your face.',
    facePaySubtitle:'No phone. No card. Just look at the terminal. Pi payment confirmed in 2 seconds.',
    onDeviceEncryption:'On-device encryption',
    faceDataPrivacy:'Your face data never leaves your phone',
    twoSecondPayments:'2 second payments',
    fasterThanCard:'Faster than any card or QR code',
    joinWaitlist:'Join waitlist',
    pointCamera:'Point camera at merchant QR code',
    shareQR:'Share your QR code to receive Pi',
    simulatePayment:'⚡ Simulate incoming payment',
    searchBills:'Search bills & services...',
    dueSoon:'DUE SOON',
    allServices:'ALL SERVICES',
    utilitiesFilter:'Utilities',
    insuranceFilter:'Insurance',
    telecomFilter:'Telecom',
    upToDate:'Up to date',
    waterBill:'Water Bill',
    internetProvider:'Internet Provider',
    searchMerchants:'Search merchants near you...',
    merchantsNearby:'12 Pi merchants nearby',
    nearbyResults:'NEARBY · 12 RESULTS',
    registerBusiness:'Register your business',
    registerBusinessSub:'Start accepting Pi payments. Free setup, instant verification.',
    foodRestaurant:'Food & Restaurant',
    coffeeShop:'Coffee & Bakery',
    pharmacy:'Pharmacy',
    electronics:'Electronics',
    retailStore:'Retail',
    piDay:'Pi Day 2026',
    fullMainnet:'March 14 · Full mainnet',
    remaining:'remaining',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 active tasks',
    thisMonth:'this month',
    topUpRecommended:'Top up recommended',
    thisMonthFilter:'📅 This month',
    largestFirst:'↓ Largest first',
    incomingFilter:'+ Incoming',
    oracleReward:'ORACLE Reward',
    agoraVoteReward:'AGORA Vote Reward',
    pioneerLabel:'PIONEER',
    earnedProfile:'Earned',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'Reputation Multiplier Active',
    goodReputation:'Good Reputation',
    earningsMultiplier:'1.4x earnings multiplier active',
    scoreBreakdown:'SCORE BREAKDOWN — 5 LAYERS',
    piIdentity:'Pi Identity',
    piTransactions:'Pi Transactions',
    oracleScore:'ORACLE Score',
    socialEndorsements:'Social Endorsements',
    externalData:'External Data',
    unlockMoreEarnings:'UNLOCK MORE EARNINGS',
    distanceLabel:'Distance',
    timeEst:'Time est.',
    confirmedLabel:'Confirmed',
    goToLocation:'Go to location',
    takePhoto:'Take photo',
    submitLabel:'Submit',
    urgentLabel:'Urgent',
    acceptTask:'Accept task',
    agoraTitle:'Your vote matters.',
    agoraSubline:'Literally.',
    agoraPioneers:'Pioneers. Real governance.',
    realPiVote:'Real Pi for every vote.',
    activeVote:'ACTIVE VOTE',
    votesCast:'Votes cast',
    participationLabel:'Participation',
    sentToCarlos:'Sent to @pioneer2',
    fromJohn:'From @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Transfer',
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
    utilityBill:'Factura de Servicios',
    utilityBillDue:'Vence en 3 días · 8.5 π',
    transitCard:'Tarjeta de Transporte',
    transitCardLow:'Tarjeta de Transporte — Saldo bajo',
    internetBill:'Factura de Internet',
    internetBillDue:'Vence en 9 días · 3.2 π',
    recentTx1:'Factura de Servicios',
    recentTx1Date:'18 Mar',
    recentTx2:'Recibido de @pioneer_user',
    recentTx2Date:'17 Mar',
    paymentConfirmedNote:'Factura de Servicios 8.5 π · Hace 2 horas',
    receivedNote:'De @pioneer_user · Ayer',
    transitLowNote:'Saldo bajo en Tarjeta de Transporte',
    loadTransit:'Cargar 10 π a Tarjeta de Transporte',
    oracleFlood:'ORACLE — Verificación de Inundación',
    floodLocation:'Verificación de inundación Sudeste Asiático',
    secured:'SEGURO',
    thisWeek:'esta semana',
    totalBalance:'SALDO TOTAL',
    sent:'ENVIADO',
    receivedLabel:'RECIBIDO',
    earnedLabel:'GANADO',
    biometricLock:'Bloqueo Biométrico',
    biometricEnabled:'✓ Activado',
    recoveryPhrase:'Frase de Recuperación',
    recoveryBacked:'Guardada · 24 palabras',
    recentTransactions:'TRANSACCIONES RECIENTES',
    seeAll:'Ver todo →',
    securitySettings:'Configuración de Seguridad',
    pinBiometric:'PIN · Biométrico',
    facePay:'Face Pay',
    coming2027:'Próximamente 2027',
    oracleSubtitle:'Verificación del mundo real',
    tasksAvailable:'2 tareas disponibles',
    agoraSubtitle:'Votación de gobernanza IA',
    voteOpen:'1 voto abierto',
    nexusSubtitle:'Multiplicador de reputación',
    nexusScore:'Puntuación: Buena',
    marketplaceSubtitle:'Comercio Pi',
    salesCount:'3 ventas',
    monthlyEarningsTitle:'GANANCIAS DEL MES',
    vsLastMonth:'+18% vs mes anterior',
    billsFilter:'Facturas',
    earnFilter:'Ganar',
    txLabel:'Tx',
    oracleRealWorld:'Tareas de verificación real · Gana Pi',
    facePayTitle:'Paga con tu cara.',
    facePaySubtitle:'Sin teléfono. Sin tarjeta. Solo mira el terminal. Pago Pi confirmado en 2 segundos.',
    onDeviceEncryption:'Cifrado en el dispositivo',
    faceDataPrivacy:'Tus datos faciales nunca salen de tu teléfono',
    twoSecondPayments:'Pagos en 2 segundos',
    fasterThanCard:'Más rápido que cualquier tarjeta o QR',
    joinWaitlist:'Unirse a lista de espera',
    pointCamera:'Apunta la cámara al código QR del comercio',
    shareQR:'Comparte tu QR para recibir Pi',
    simulatePayment:'⚡ Simular pago entrante',
    searchBills:'Buscar facturas y servicios...',
    dueSoon:'PRÓXIMOS VENCIMIENTOS',
    allServices:'TODOS LOS SERVICIOS',
    utilitiesFilter:'Servicios',
    insuranceFilter:'Seguros',
    telecomFilter:'Telecom',
    upToDate:'Al día',
    waterBill:'Factura de Agua',
    internetProvider:'Proveedor de Internet',
    searchMerchants:'Buscar comercios cerca de vos...',
    merchantsNearby:'12 comercios Pi cerca',
    nearbyResults:'CERCA · 12 RESULTADOS',
    registerBusiness:'Registrá tu negocio',
    registerBusinessSub:'Comenzá a aceptar pagos Pi. Configuración gratis, verificación instantánea.',
    foodRestaurant:'Comida y Restaurante',
    coffeeShop:'Café y Panadería',
    pharmacy:'Farmacia',
    electronics:'Electrónica',
    retailStore:'Comercio',
    piDay:'Pi Day 2026',
    fullMainnet:'14 Mar · Mainnet completa',
    remaining:'restante',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 tareas activas',
    thisMonth:'este mes',
    topUpRecommended:'Se recomienda recargar',
    thisMonthFilter:'📅 Este mes',
    largestFirst:'↓ Mayor primero',
    incomingFilter:'+ Entrantes',
    oracleReward:'Recompensa ORACLE',
    agoraVoteReward:'Recompensa Voto AGORA',
    pioneerLabel:'PIONERO',
    earnedProfile:'Ganado',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'Multiplicador de Reputación Activo',
    goodReputation:'Buena Reputación',
    earningsMultiplier:'Multiplicador de ganancias 1.4x activo',
    scoreBreakdown:'DESGLOSE DE PUNTUACIÓN — 5 CAPAS',
    piIdentity:'Identidad Pi',
    piTransactions:'Transacciones Pi',
    oracleScore:'Puntuación ORACLE',
    socialEndorsements:'Avales Sociales',
    externalData:'Datos Externos',
    unlockMoreEarnings:'DESBLOQUEAR MÁS GANANCIAS',
    distanceLabel:'Distancia',
    timeEst:'Tiempo est.',
    confirmedLabel:'Confirmado',
    goToLocation:'Ir a ubicación',
    takePhoto:'Tomar foto',
    submitLabel:'Enviar',
    urgentLabel:'Urgente',
    acceptTask:'Aceptar tarea',
    agoraTitle:'Tu voto importa.',
    agoraSubline:'Literalmente.',
    agoraPioneers:'Pioneers. Gobernanza real.',
    realPiVote:'Pi real por cada voto.',
    activeVote:'VOTO ACTIVO',
    votesCast:'Votos emitidos',
    participationLabel:'Participación',
    sentToCarlos:'Enviado a @pioneer2',
    fromJohn:'De @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Transferencia',
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
    utilityBill:'Utility Bill',
    utilityBillDue:'Due in 3 araw · 8.5 π',
    transitCard:'Transit Card',
    transitCardLow:'Transit Card — Mababang balanse',
    internetBill:'Internet Bill',
    internetBillDue:'Due in 9 araw · 3.2 π',
    recentTx1:'Utility Bill',
    recentTx1Date:'Mar 18',
    recentTx2:'Natanggap mula sa @pioneer_user',
    recentTx2Date:'Mar 17',
    paymentConfirmedNote:'Utility Bill 8.5 π · 2 oras na ang nakalipas',
    receivedNote:'Mula sa @pioneer_user · Kahapon',
    transitLowNote:'Mababang balanse ng Transit Card',
    loadTransit:'Mag-load ng 10 π sa Transit Card',
    oracleFlood:'ORACLE — Flood Verification',
    floodLocation:'Flood verification Southeast Asia',
    secured:'LIGTAS',
    thisWeek:'ngayong linggo',
    totalBalance:'KABUUANG BALANSE',
    sent:'NAIPADALA',
    receivedLabel:'NATANGGAP',
    earnedLabel:'NAKUHA',
    biometricLock:'Biometric Lock',
    biometricEnabled:'✓ Pinagana',
    recoveryPhrase:'Recovery Phrase',
    recoveryBacked:'Na-back up · 24 salita',
    recentTransactions:'MGA KAMAKAILANG TRANSAKSYON',
    seeAll:'Tingnan lahat →',
    securitySettings:'Mga Setting ng Seguridad',
    pinBiometric:'PIN · Biometric',
    facePay:'Face Pay',
    coming2027:'Darating 2027',
    oracleSubtitle:'Pag-verify ng totoong mundo',
    tasksAvailable:'2 gawain available',
    agoraSubtitle:'AI governance voting',
    voteOpen:'1 boto bukas',
    nexusSubtitle:'Reputation multiplier',
    nexusScore:'Score: Mabuti',
    marketplaceSubtitle:'Pi commerce',
    salesCount:'3 benta',
    monthlyEarningsTitle:'KITA NGAYONG BUWAN',
    vsLastMonth:'+18% kumpara sa nakaraang buwan',
    billsFilter:'Mga Bill',
    earnFilter:'Kumita',
    txLabel:'Tx',
    oracleRealWorld:'Mga gawain sa totoong mundo · Kumita ng Pi',
    facePayTitle:'Magbayad gamit ang mukha.',
    facePaySubtitle:'Walang telepono. Walang card. Tingnan lang ang terminal. Pi payment nakumpirma sa 2 segundo.',
    onDeviceEncryption:'On-device encryption',
    faceDataPrivacy:'Hindi umaalis ang iyong face data sa telepono',
    twoSecondPayments:'Bayad sa 2 segundo',
    fasterThanCard:'Mas mabilis kaysa card o QR',
    joinWaitlist:'Sumali sa waitlist',
    pointCamera:'Ituro ang camera sa QR code ng merchant',
    shareQR:'Ibahagi ang iyong QR para makatanggap ng Pi',
    simulatePayment:'⚡ I-simulate ang papasok na bayad',
    searchBills:'Hanapin ang mga bill at serbisyo...',
    dueSoon:'MALAPIT NA MAG-DUE',
    allServices:'LAHAT NG SERBISYO',
    utilitiesFilter:'Utilities',
    insuranceFilter:'Insurance',
    telecomFilter:'Telecom',
    upToDate:'Bayad na',
    waterBill:'Bill sa Tubig',
    internetProvider:'Internet Provider',
    searchMerchants:'Hanapin ang mga merchant malapit sa iyo...',
    merchantsNearby:'12 Pi merchant malapit',
    nearbyResults:'MALAPIT · 12 RESULTA',
    registerBusiness:'Irehistro ang iyong negosyo',
    registerBusinessSub:'Magsimulang tumanggap ng Pi payments. Libreng setup, instant verification.',
    foodRestaurant:'Pagkain at Restaurant',
    coffeeShop:'Kape at Panaderya',
    pharmacy:'Parmasya',
    electronics:'Electronics',
    retailStore:'Retail',
    piDay:'Pi Day 2026',
    fullMainnet:'Mar 14 · Buong mainnet',
    remaining:'natitira',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 aktibong gawain',
    thisMonth:'ngayong buwan',
    topUpRecommended:'Inirerekomendang mag-top up',
    thisMonthFilter:'📅 Ngayong buwan',
    largestFirst:'↓ Pinakamalaki muna',
    incomingFilter:'+ Papasok',
    oracleReward:'ORACLE Reward',
    agoraVoteReward:'AGORA Vote Reward',
    pioneerLabel:'PIONEER',
    earnedProfile:'Nakuha',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'Reputation Multiplier Active',
    goodReputation:'Magandang Reputasyon',
    earningsMultiplier:'1.4x earnings multiplier active',
    scoreBreakdown:'BREAKDOWN NG SCORE — 5 LAYER',
    piIdentity:'Pi Identity',
    piTransactions:'Pi Transactions',
    oracleScore:'ORACLE Score',
    socialEndorsements:'Social Endorsements',
    externalData:'External Data',
    unlockMoreEarnings:'I-UNLOCK ANG MAS MARAMING KITA',
    distanceLabel:'Distansya',
    timeEst:'Oras est.',
    confirmedLabel:'Nakumpirma',
    goToLocation:'Pumunta sa lokasyon',
    takePhoto:'Kumuha ng litrato',
    submitLabel:'Isumite',
    urgentLabel:'Urgent',
    acceptTask:'Tanggapin ang gawain',
    agoraTitle:'Mahalaga ang iyong boto.',
    agoraSubline:'Literal.',
    agoraPioneers:'Pioneers. Totoong governance.',
    realPiVote:'Totoong Pi sa bawat boto.',
    activeVote:'AKTIBONG BOTO',
    votesCast:'Mga boto',
    participationLabel:'Pakikilahok',
    sentToCarlos:'Naipadala sa @pioneer2',
    fromJohn:'Mula sa @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Transfer',
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
    utilityBill:'Utility Bill',
    utilityBillDue:'Due for 3 days · 8.5 π',
    transitCard:'Transit Card',
    transitCardLow:'Transit Card — Balance don finish',
    internetBill:'Internet Bill',
    internetBillDue:'Due for 9 days · 3.2 π',
    recentTx1:'Utility Bill',
    recentTx1Date:'Mar 18',
    recentTx2:'Received from @pioneer_user',
    recentTx2Date:'Mar 17',
    paymentConfirmedNote:'Utility Bill 8.5 π · 2 hours ago',
    receivedNote:'From @pioneer_user · Yesterday',
    transitLowNote:'Transit Card balance don dey low',
    loadTransit:'Load 10 π to Transit Card',
    oracleFlood:'ORACLE — Flood Verification',
    floodLocation:'Flood verification Southeast Asia',
    secured:'SECURED',
    thisWeek:'this week',
    totalBalance:'TOTAL BALANCE',
    sent:'SENT',
    receivedLabel:'RECEIVED',
    earnedLabel:'EARNED',
    biometricLock:'Biometric Lock',
    biometricEnabled:'✓ E don on',
    recoveryPhrase:'Recovery Phrase',
    recoveryBacked:'E don save · 24 words',
    recentTransactions:'RECENT TRANSACTIONS',
    seeAll:'See all →',
    securitySettings:'Security Settings',
    pinBiometric:'PIN · Biometric',
    facePay:'Face Pay',
    coming2027:'Coming 2027',
    oracleSubtitle:'Real-world check',
    tasksAvailable:'2 task dey',
    agoraSubtitle:'AI governance voting',
    voteOpen:'1 vote open',
    nexusSubtitle:'Reputation multiplier',
    nexusScore:'Score: Good',
    marketplaceSubtitle:'Pi market',
    salesCount:'3 sales',
    monthlyEarningsTitle:'MONTHLY EARNINGS',
    vsLastMonth:'+18% pass last month',
    billsFilter:'Bills',
    earnFilter:'Earn',
    txLabel:'Tx',
    oracleRealWorld:'Real-world tasks · Earn Pi',
    facePayTitle:'Pay with your face.',
    facePaySubtitle:'No phone. No card. Look at di terminal. Pi payment go confirm for 2 seconds.',
    onDeviceEncryption:'On-device encryption',
    faceDataPrivacy:'Your face data no go leave your phone',
    twoSecondPayments:'2 second payments',
    fasterThanCard:'Faster pass any card or QR',
    joinWaitlist:'Join waitlist',
    pointCamera:'Point camera to merchant QR code',
    shareQR:'Share your QR to receive Pi',
    simulatePayment:'⚡ Simulate incoming payment',
    searchBills:'Search bills & services...',
    dueSoon:'DUE SOON',
    allServices:'ALL SERVICES',
    utilitiesFilter:'Utilities',
    insuranceFilter:'Insurance',
    telecomFilter:'Telecom',
    upToDate:'E don pay',
    waterBill:'Water Bill',
    internetProvider:'Internet Provider',
    searchMerchants:'Search merchants near you...',
    merchantsNearby:'12 Pi merchants dey near',
    nearbyResults:'NEAR · 12 RESULTS',
    registerBusiness:'Register your business',
    registerBusinessSub:'Start to accept Pi payments. Free setup, instant verification.',
    foodRestaurant:'Food & Restaurant',
    coffeeShop:'Coffee & Bakery',
    pharmacy:'Pharmacy',
    electronics:'Electronics',
    retailStore:'Retail',
    piDay:'Pi Day 2026',
    fullMainnet:'March 14 · Full mainnet',
    remaining:'remaining',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 active tasks',
    thisMonth:'this month',
    topUpRecommended:'Top up recommended',
    thisMonthFilter:'📅 This month',
    largestFirst:'↓ Largest first',
    incomingFilter:'+ Incoming',
    oracleReward:'ORACLE Reward',
    agoraVoteReward:'AGORA Vote Reward',
    pioneerLabel:'PIONEER',
    earnedProfile:'Earned',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'Reputation Multiplier Active',
    goodReputation:'Good Reputation',
    earningsMultiplier:'1.4x earnings multiplier active',
    scoreBreakdown:'SCORE BREAKDOWN — 5 LAYERS',
    piIdentity:'Pi Identity',
    piTransactions:'Pi Transactions',
    oracleScore:'ORACLE Score',
    socialEndorsements:'Social Endorsements',
    externalData:'External Data',
    unlockMoreEarnings:'UNLOCK MORE EARNINGS',
    distanceLabel:'Distance',
    timeEst:'Time est.',
    confirmedLabel:'Confirmed',
    goToLocation:'Go to location',
    takePhoto:'Take photo',
    submitLabel:'Submit',
    urgentLabel:'Urgent',
    acceptTask:'Accept task',
    agoraTitle:'Your vote matters.',
    agoraSubline:'Literally.',
    agoraPioneers:'Pioneers. Real governance.',
    realPiVote:'Real Pi for every vote.',
    activeVote:'ACTIVE VOTE',
    votesCast:'Votes cast',
    participationLabel:'Participation',
    sentToCarlos:'Sent to @pioneer2',
    fromJohn:'From @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Transfer',
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
    utilityBill:'यूटिलिटी बिल',
    utilityBillDue:'3 दिन में देय · 8.5 π',
    transitCard:'ट्रांज़िट कार्ड',
    transitCardLow:'ट्रांज़िट कार्ड — कम बैलेंस',
    internetBill:'इंटरनेट बिल',
    internetBillDue:'9 दिन में देय · 3.2 π',
    recentTx1:'यूटिलिटी बिल',
    recentTx1Date:'18 मार',
    recentTx2:'@pioneer_user से प्राप्त',
    recentTx2Date:'17 मार',
    paymentConfirmedNote:'यूटिलिटी बिल 8.5 π · 2 घंटे पहले',
    receivedNote:'@pioneer_user से · कल',
    transitLowNote:'ट्रांज़िट कार्ड बैलेंस कम है',
    loadTransit:'ट्रांज़िट कार्ड में 10 π लोड करें',
    oracleFlood:'ORACLE — बाढ़ सत्यापन',
    floodLocation:'बाढ़ सत्यापन दक्षिण-पूर्व एशिया',
    secured:'सुरक्षित',
    thisWeek:'इस सप्ताह',
    totalBalance:'कुल बैलेंस',
    sent:'भेजा',
    receivedLabel:'प्राप्त',
    earnedLabel:'कमाया',
    biometricLock:'बायोमेट्रिक लॉक',
    biometricEnabled:'✓ सक्रिय',
    recoveryPhrase:'रिकवरी वाक्यांश',
    recoveryBacked:'सहेजा गया · 24 शब्द',
    recentTransactions:'हाल के लेनदेन',
    seeAll:'सभी देखें →',
    securitySettings:'सुरक्षा सेटिंग्स',
    pinBiometric:'PIN · बायोमेट्रिक',
    facePay:'Face Pay',
    coming2027:'जल्द आ रहा है 2027',
    oracleSubtitle:'वास्तविक डेटा सत्यापन',
    tasksAvailable:'2 कार्य उपलब्ध',
    agoraSubtitle:'AI शासन मतदान',
    voteOpen:'1 वोट खुला',
    nexusSubtitle:'प्रतिष्ठा गुणक',
    nexusScore:'स्कोर: अच्छा',
    marketplaceSubtitle:'Pi व्यापार',
    salesCount:'3 बिक्री',
    monthlyEarningsTitle:'मासिक आय',
    vsLastMonth:'+18% पिछले महीने से',
    billsFilter:'बिल',
    earnFilter:'कमाएं',
    txLabel:'Tx',
    oracleRealWorld:'वास्तविक सत्यापन कार्य · Pi कमाएं',
    facePayTitle:'चेहरे से भुगतान करें।',
    facePaySubtitle:'न फोन। न कार्ड। बस टर्मिनल देखें। Pi भुगतान 2 सेकंड में पुष्टि।',
    onDeviceEncryption:'डिवाइस पर एन्क्रिप्शन',
    faceDataPrivacy:'आपका चेहरा डेटा फोन नहीं छोड़ता',
    twoSecondPayments:'2 सेकंड में भुगतान',
    fasterThanCard:'किसी भी कार्ड या QR से तेज',
    joinWaitlist:'प्रतीक्षा सूची में शामिल हों',
    pointCamera:'मर्चेंट QR कोड पर कैमरा रखें',
    shareQR:'Pi प्राप्त करने के लिए QR शेयर करें',
    simulatePayment:'⚡ आने वाला भुगतान सिम्युलेट करें',
    searchBills:'बिल और सेवाएं खोजें...',
    dueSoon:'जल्द देय',
    allServices:'सभी सेवाएं',
    utilitiesFilter:'उपयोगिताएं',
    insuranceFilter:'बीमा',
    telecomFilter:'दूरसंचार',
    upToDate:'अप टू डेट',
    waterBill:'पानी का बिल',
    internetProvider:'इंटरनेट प्रदाता',
    searchMerchants:'पास के मर्चेंट खोजें...',
    merchantsNearby:'12 Pi मर्चेंट पास में',
    nearbyResults:'पास में · 12 परिणाम',
    registerBusiness:'अपना व्यवसाय पंजीकृत करें',
    registerBusinessSub:'Pi भुगतान स्वीकार करना शुरू करें। मुफ्त सेटअप, तत्काल सत्यापन।',
    foodRestaurant:'खाना और रेस्तरां',
    coffeeShop:'कैफे और बेकरी',
    pharmacy:'फार्मेसी',
    electronics:'इलेक्ट्रॉनिक्स',
    retailStore:'रिटेल',
    piDay:'Pi Day 2026',
    fullMainnet:'14 मार्च · पूर्ण Mainnet',
    remaining:'शेष',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 सक्रिय कार्य',
    thisMonth:'इस महीने',
    topUpRecommended:'रिचार्ज की सलाह दी जाती है',
    thisMonthFilter:'📅 इस महीने',
    largestFirst:'↓ सबसे बड़ा पहले',
    incomingFilter:'+ आने वाले',
    oracleReward:'ORACLE पुरस्कार',
    agoraVoteReward:'AGORA वोट पुरस्कार',
    pioneerLabel:'पायनियर',
    earnedProfile:'अर्जित',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'प्रतिष्ठा गुणक सक्रिय',
    goodReputation:'अच्छी प्रतिष्ठा',
    earningsMultiplier:'1.4x आय गुणक सक्रिय',
    scoreBreakdown:'स्कोर विश्लेषण — 5 परतें',
    piIdentity:'Pi पहचान',
    piTransactions:'Pi लेनदेन',
    oracleScore:'ORACLE स्कोर',
    socialEndorsements:'सामाजिक समर्थन',
    externalData:'बाहरी डेटा',
    unlockMoreEarnings:'अधिक आय अनलॉक करें',
    distanceLabel:'दूरी',
    timeEst:'समय अनु.',
    confirmedLabel:'पुष्टि',
    goToLocation:'स्थान पर जाएं',
    takePhoto:'फोटो लें',
    submitLabel:'जमा करें',
    urgentLabel:'अत्यावश्यक',
    acceptTask:'कार्य स्वीकार करें',
    agoraTitle:'आपका वोट मायने रखता है।',
    agoraSubline:'सच में।',
    agoraPioneers:'Pioneers. वास्तविक शासन।',
    realPiVote:'हर वोट के लिए वास्तविक Pi।',
    activeVote:'सक्रिय मतदान',
    votesCast:'वोट डाले गए',
    participationLabel:'भागीदारी',
    sentToCarlos:'@pioneer2 को भेजा',
    fromJohn:'@pioneer3 से',
    axaInsurance:'AXA Insurance',
    transferLabel:'स्थानांतरण',
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
    utilityBill:'Conta de Serviços',
    utilityBillDue:'Vence em 3 dias · 8.5 π',
    transitCard:'Cartão de Transporte',
    transitCardLow:'Cartão de Transporte — Saldo baixo',
    internetBill:'Conta de Internet',
    internetBillDue:'Vence em 9 dias · 3.2 π',
    recentTx1:'Conta de Serviços',
    recentTx1Date:'18 Mar',
    recentTx2:'Recebido de @pioneer_user',
    recentTx2Date:'17 Mar',
    paymentConfirmedNote:'Conta de Serviços 8.5 π · Há 2 horas',
    receivedNote:'De @pioneer_user · Ontem',
    transitLowNote:'Saldo baixo no Cartão de Transporte',
    loadTransit:'Carregar 10 π no Cartão de Transporte',
    oracleFlood:'ORACLE — Verificação de Enchente',
    floodLocation:'Verificação de enchente Sudeste Asiático',
    secured:'SEGURO',
    thisWeek:'esta semana',
    totalBalance:'SALDO TOTAL',
    sent:'ENVIADO',
    receivedLabel:'RECEBIDO',
    earnedLabel:'GANHO',
    biometricLock:'Bloqueio Biométrico',
    biometricEnabled:'✓ Ativado',
    recoveryPhrase:'Frase de Recuperação',
    recoveryBacked:'Salva · 24 palavras',
    recentTransactions:'TRANSAÇÕES RECENTES',
    seeAll:'Ver tudo →',
    securitySettings:'Configurações de Segurança',
    pinBiometric:'PIN · Biométrico',
    facePay:'Face Pay',
    coming2027:'Em breve 2027',
    oracleSubtitle:'Verificação do mundo real',
    tasksAvailable:'2 tarefas disponíveis',
    agoraSubtitle:'Votação de governança IA',
    voteOpen:'1 voto aberto',
    nexusSubtitle:'Multiplicador de reputação',
    nexusScore:'Pontuação: Boa',
    marketplaceSubtitle:'Comércio Pi',
    salesCount:'3 vendas',
    monthlyEarningsTitle:'GANHOS DO MÊS',
    vsLastMonth:'+18% vs mês anterior',
    billsFilter:'Contas',
    earnFilter:'Ganhar',
    txLabel:'Tx',
    oracleRealWorld:'Tarefas de verificação real · Ganhe Pi',
    facePayTitle:'Pague com o rosto.',
    facePaySubtitle:'Sem telefone. Sem cartão. Olhe para o terminal. Pagamento Pi confirmado em 2 segundos.',
    onDeviceEncryption:'Criptografia no dispositivo',
    faceDataPrivacy:'Seus dados faciais nunca saem do telefone',
    twoSecondPayments:'Pagamentos em 2 segundos',
    fasterThanCard:'Mais rápido que qualquer cartão ou QR',
    joinWaitlist:'Entrar na lista de espera',
    pointCamera:'Aponte a câmera para o QR do comerciante',
    shareQR:'Compartilhe seu QR para receber Pi',
    simulatePayment:'⚡ Simular pagamento recebido',
    searchBills:'Pesquisar contas e serviços...',
    dueSoon:'PRÓXIMOS VENCIMENTOS',
    allServices:'TODOS OS SERVIÇOS',
    utilitiesFilter:'Utilidades',
    insuranceFilter:'Seguros',
    telecomFilter:'Telecom',
    upToDate:'Em dia',
    waterBill:'Conta de Água',
    internetProvider:'Provedor de Internet',
    searchMerchants:'Pesquisar comerciantes próximos...',
    merchantsNearby:'12 comerciantes Pi por perto',
    nearbyResults:'PRÓXIMO · 12 RESULTADOS',
    registerBusiness:'Cadastre seu negócio',
    registerBusinessSub:'Comece a aceitar pagamentos Pi. Configuração grátis, verificação instantânea.',
    foodRestaurant:'Comida e Restaurante',
    coffeeShop:'Café e Padaria',
    pharmacy:'Farmácia',
    electronics:'Eletrônicos',
    retailStore:'Varejo',
    piDay:'Pi Day 2026',
    fullMainnet:'14 Mar · Mainnet completa',
    remaining:'restante',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 tarefas ativas',
    thisMonth:'este mês',
    topUpRecommended:'Recarga recomendada',
    thisMonthFilter:'📅 Este mês',
    largestFirst:'↓ Maior primeiro',
    incomingFilter:'+ Entradas',
    oracleReward:'Recompensa ORACLE',
    agoraVoteReward:'Recompensa Voto AGORA',
    pioneerLabel:'PIONEIRO',
    earnedProfile:'Ganho',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'Multiplicador de Reputação Ativo',
    goodReputation:'Boa Reputação',
    earningsMultiplier:'Multiplicador de ganhos 1.4x ativo',
    scoreBreakdown:'ANÁLISE DE PONTUAÇÃO — 5 CAMADAS',
    piIdentity:'Identidade Pi',
    piTransactions:'Transações Pi',
    oracleScore:'Pontuação ORACLE',
    socialEndorsements:'Endossos Sociais',
    externalData:'Dados Externos',
    unlockMoreEarnings:'DESBLOQUEAR MAIS GANHOS',
    distanceLabel:'Distância',
    timeEst:'Tempo est.',
    confirmedLabel:'Confirmado',
    goToLocation:'Ir ao local',
    takePhoto:'Tirar foto',
    submitLabel:'Enviar',
    urgentLabel:'Urgente',
    acceptTask:'Aceitar tarefa',
    agoraTitle:'Seu voto importa.',
    agoraSubline:'Literalmente.',
    agoraPioneers:'Pioneers. Governança real.',
    realPiVote:'Pi real para cada voto.',
    activeVote:'VOTO ATIVO',
    votesCast:'Votos emitidos',
    participationLabel:'Participação',
    sentToCarlos:'Enviado para @pioneer2',
    fromJohn:'De @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Transferência',
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
    utilityBill:'水电账单',
    utilityBillDue:'3天后到期 · 8.5 π',
    transitCard:'交通卡',
    transitCardLow:'交通卡 — 余额不足',
    internetBill:'网络账单',
    internetBillDue:'9天后到期 · 3.2 π',
    recentTx1:'水电账单',
    recentTx1Date:'3月18日',
    recentTx2:'收到来自 @pioneer_user',
    recentTx2Date:'3月17日',
    paymentConfirmedNote:'水电账单 8.5 π · 2小时前',
    receivedNote:'来自 @pioneer_user · 昨天',
    transitLowNote:'交通卡余额不足',
    loadTransit:'向交通卡充值 10 π',
    oracleFlood:'ORACLE — 洪水核查',
    floodLocation:'洪水核查 东南亚',
    secured:'已安全',
    thisWeek:'本周',
    totalBalance:'总余额',
    sent:'已发送',
    receivedLabel:'已接收',
    earnedLabel:'已赚取',
    biometricLock:'生物识别锁',
    biometricEnabled:'✓ 已启用',
    recoveryPhrase:'恢复短语',
    recoveryBacked:'已备份 · 24个词',
    recentTransactions:'最近交易',
    seeAll:'查看全部 →',
    securitySettings:'安全设置',
    pinBiometric:'PIN · 生物识别',
    facePay:'Face Pay',
    coming2027:'即将推出 2027',
    oracleSubtitle:'现实世界验证',
    tasksAvailable:'2个任务可用',
    agoraSubtitle:'AI治理投票',
    voteOpen:'1个投票开放',
    nexusSubtitle:'声誉乘数',
    nexusScore:'评分: 良好',
    marketplaceSubtitle:'Pi商业',
    salesCount:'3笔销售',
    monthlyEarningsTitle:'月度收益',
    vsLastMonth:'+18% 较上月',
    billsFilter:'账单',
    earnFilter:'赚取',
    txLabel:'交易',
    oracleRealWorld:'现实验证任务 · 赚取Pi',
    facePayTitle:'刷脸支付。',
    facePaySubtitle:'无需手机。无需卡片。只需看向终端。Pi支付2秒确认。',
    onDeviceEncryption:'设备端加密',
    faceDataPrivacy:'您的面部数据不会离开手机',
    twoSecondPayments:'2秒支付',
    fasterThanCard:'比任何卡或QR码更快',
    joinWaitlist:'加入候补名单',
    pointCamera:'将相机对准商家QR码',
    shareQR:'分享您的QR码以接收Pi',
    simulatePayment:'⚡ 模拟收款',
    searchBills:'搜索账单和服务...',
    dueSoon:'即将到期',
    allServices:'所有服务',
    utilitiesFilter:'水电',
    insuranceFilter:'保险',
    telecomFilter:'电信',
    upToDate:'已缴清',
    waterBill:'水费账单',
    internetProvider:'网络服务商',
    searchMerchants:'搜索附近商家...',
    merchantsNearby:'附近12家Pi商家',
    nearbyResults:'附近 · 12个结果',
    registerBusiness:'注册您的商家',
    registerBusinessSub:'开始接受Pi支付。免费设置，即时验证。',
    foodRestaurant:'餐饮',
    coffeeShop:'咖啡和烘焙',
    pharmacy:'药店',
    electronics:'电子产品',
    retailStore:'零售',
    piDay:'Pi Day 2026',
    fullMainnet:'3月14日 · 完整主网',
    remaining:'剩余',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3个活跃任务',
    thisMonth:'本月',
    topUpRecommended:'建议充值',
    thisMonthFilter:'📅 本月',
    largestFirst:'↓ 最大优先',
    incomingFilter:'+ 收入',
    oracleReward:'ORACLE奖励',
    agoraVoteReward:'AGORA投票奖励',
    pioneerLabel:'先驱者',
    earnedProfile:'已赚取',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'声誉乘数已激活',
    goodReputation:'良好声誉',
    earningsMultiplier:'1.4倍收益乘数已激活',
    scoreBreakdown:'评分明细 — 5层',
    piIdentity:'Pi身份',
    piTransactions:'Pi交易',
    oracleScore:'ORACLE评分',
    socialEndorsements:'社会背书',
    externalData:'外部数据',
    unlockMoreEarnings:'解锁更多收益',
    distanceLabel:'距离',
    timeEst:'预计时间',
    confirmedLabel:'已确认',
    goToLocation:'前往地点',
    takePhoto:'拍照',
    submitLabel:'提交',
    urgentLabel:'紧急',
    acceptTask:'接受任务',
    agoraTitle:'您的投票很重要。',
    agoraSubline:'真的。',
    agoraPioneers:'先驱者。真实治理。',
    realPiVote:'每票获得真实Pi。',
    activeVote:'活跃投票',
    votesCast:'已投票',
    participationLabel:'参与率',
    sentToCarlos:'已发送给@pioneer2',
    fromJohn:'来自@pioneer3',
    axaInsurance:'AXA保险',
    transferLabel:'转账',
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
    utilityBill:'Tagihan Listrik',
    utilityBillDue:'Jatuh tempo 3 hari · 8.5 π',
    transitCard:'Kartu Transit',
    transitCardLow:'Kartu Transit — Saldo rendah',
    internetBill:'Tagihan Internet',
    internetBillDue:'Jatuh tempo 9 hari · 3.2 π',
    recentTx1:'Tagihan Listrik',
    recentTx1Date:'18 Mar',
    recentTx2:'Diterima dari @pioneer_user',
    recentTx2Date:'17 Mar',
    paymentConfirmedNote:'Tagihan Listrik 8.5 π · 2 jam lalu',
    receivedNote:'Dari @pioneer_user · Kemarin',
    transitLowNote:'Saldo Kartu Transit rendah',
    loadTransit:'Isi 10 π ke Kartu Transit',
    oracleFlood:'ORACLE — Verifikasi Banjir',
    floodLocation:'Verifikasi banjir Asia Tenggara',
    secured:'AMAN',
    thisWeek:'minggu ini',
    totalBalance:'TOTAL SALDO',
    sent:'TERKIRIM',
    receivedLabel:'DITERIMA',
    earnedLabel:'DIPEROLEH',
    biometricLock:'Kunci Biometrik',
    biometricEnabled:'✓ Diaktifkan',
    recoveryPhrase:'Frasa Pemulihan',
    recoveryBacked:'Dicadangkan · 24 kata',
    recentTransactions:'TRANSAKSI TERBARU',
    seeAll:'Lihat semua →',
    securitySettings:'Pengaturan Keamanan',
    pinBiometric:'PIN · Biometrik',
    facePay:'Face Pay',
    coming2027:'Segera 2027',
    oracleSubtitle:'Verifikasi dunia nyata',
    tasksAvailable:'2 tugas tersedia',
    agoraSubtitle:'Pemungutan suara tata kelola AI',
    voteOpen:'1 suara terbuka',
    nexusSubtitle:'Pengganda reputasi',
    nexusScore:'Skor: Baik',
    marketplaceSubtitle:'Perdagangan Pi',
    salesCount:'3 penjualan',
    monthlyEarningsTitle:'PENGHASILAN BULANAN',
    vsLastMonth:'+18% vs bulan lalu',
    billsFilter:'Tagihan',
    earnFilter:'Penghasilan',
    txLabel:'Tx',
    oracleRealWorld:'Tugas verifikasi nyata · Dapatkan Pi',
    facePayTitle:'Bayar dengan wajah.',
    facePaySubtitle:'Tanpa ponsel. Tanpa kartu. Lihat saja terminal. Pembayaran Pi dikonfirmasi dalam 2 detik.',
    onDeviceEncryption:'Enkripsi di perangkat',
    faceDataPrivacy:'Data wajah Anda tidak pernah meninggalkan ponsel',
    twoSecondPayments:'Pembayaran 2 detik',
    fasterThanCard:'Lebih cepat dari kartu atau QR mana pun',
    joinWaitlist:'Bergabung dengan daftar tunggu',
    pointCamera:'Arahkan kamera ke kode QR merchant',
    shareQR:'Bagikan QR Anda untuk menerima Pi',
    simulatePayment:'⚡ Simulasi pembayaran masuk',
    searchBills:'Cari tagihan & layanan...',
    dueSoon:'SEGERA JATUH TEMPO',
    allServices:'SEMUA LAYANAN',
    utilitiesFilter:'Utilitas',
    insuranceFilter:'Asuransi',
    telecomFilter:'Telekomunikasi',
    upToDate:'Lunas',
    waterBill:'Tagihan Air',
    internetProvider:'Penyedia Internet',
    searchMerchants:'Cari merchant terdekat...',
    merchantsNearby:'12 merchant Pi terdekat',
    nearbyResults:'TERDEKAT · 12 HASIL',
    registerBusiness:'Daftarkan bisnis Anda',
    registerBusinessSub:'Mulai terima pembayaran Pi. Setup gratis, verifikasi instan.',
    foodRestaurant:'Makanan & Restoran',
    coffeeShop:'Kafe & Bakeri',
    pharmacy:'Apotek',
    electronics:'Elektronik',
    retailStore:'Ritel',
    piDay:'Pi Day 2026',
    fullMainnet:'14 Mar · Mainnet penuh',
    remaining:'tersisa',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 tugas aktif',
    thisMonth:'bulan ini',
    topUpRecommended:'Isi ulang disarankan',
    thisMonthFilter:'📅 Bulan ini',
    largestFirst:'↓ Terbesar dahulu',
    incomingFilter:'+ Masuk',
    oracleReward:'Hadiah ORACLE',
    agoraVoteReward:'Hadiah Suara AGORA',
    pioneerLabel:'PIONEER',
    earnedProfile:'Diperoleh',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'Pengganda Reputasi Aktif',
    goodReputation:'Reputasi Baik',
    earningsMultiplier:'Pengganda penghasilan 1.4x aktif',
    scoreBreakdown:'RINCIAN SKOR — 5 LAPISAN',
    piIdentity:'Identitas Pi',
    piTransactions:'Transaksi Pi',
    oracleScore:'Skor ORACLE',
    socialEndorsements:'Dukungan Sosial',
    externalData:'Data Eksternal',
    unlockMoreEarnings:'BUKA LEBIH BANYAK PENGHASILAN',
    distanceLabel:'Jarak',
    timeEst:'Estimasi waktu',
    confirmedLabel:'Dikonfirmasi',
    goToLocation:'Pergi ke lokasi',
    takePhoto:'Ambil foto',
    submitLabel:'Kirim',
    urgentLabel:'Mendesak',
    acceptTask:'Terima tugas',
    agoraTitle:'Suara Anda penting.',
    agoraSubline:'Sungguh.',
    agoraPioneers:'Pioneers. Tata kelola nyata.',
    realPiVote:'Pi nyata untuk setiap suara.',
    activeVote:'SUARA AKTIF',
    votesCast:'Suara diberikan',
    participationLabel:'Partisipasi',
    sentToCarlos:'Dikirim ke @pioneer2',
    fromJohn:'Dari @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Transfer',
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
    utilityBill:'Hoa don tien dien',
    utilityBillDue:'Han 3 ngay · 8.5 π',
    transitCard:'The giao thong',
    transitCardLow:'The giao thong — So du thap',
    internetBill:'Hoa don Internet',
    internetBillDue:'Han 9 ngay · 3.2 π',
    recentTx1:'Hoa don tien dien',
    recentTx1Date:'18 Thg 3',
    recentTx2:'Nhan tu @pioneer_user',
    recentTx2Date:'17 Thg 3',
    paymentConfirmedNote:'Hoa don tien dien 8.5 π · 2 gio truoc',
    receivedNote:'Tu @pioneer_user · Hom qua',
    transitLowNote:'So du The giao thong thap',
    loadTransit:'Nap 10 π vao The giao thong',
    oracleFlood:'ORACLE — Xac minh lu lut',
    floodLocation:'Xac minh lu lut Dong Nam A',
    secured:'AN TOAN',
    thisWeek:'tuan nay',
    totalBalance:'TONG SO DU',
    sent:'DA GUI',
    receivedLabel:'DA NHAN',
    earnedLabel:'DA KIEM',
    biometricLock:'Khoa sinh trac hoc',
    biometricEnabled:'✓ Da bat',
    recoveryPhrase:'Cum tu phuc hoi',
    recoveryBacked:'Da sao luu · 24 tu',
    recentTransactions:'GIAO DICH GAN DAY',
    seeAll:'Xem tat ca →',
    securitySettings:'Cai dat bao mat',
    pinBiometric:'PIN · Sinh trac hoc',
    facePay:'Face Pay',
    coming2027:'Sap ra mat 2027',
    oracleSubtitle:'Xac minh the gioi thuc',
    tasksAvailable:'2 nhiem vu co san',
    agoraSubtitle:'Bo phieu quan tri AI',
    voteOpen:'1 cuoc bieu quyet',
    nexusSubtitle:'He so danh tieng',
    nexusScore:'Diem: Tot',
    marketplaceSubtitle:'Thuong mai Pi',
    salesCount:'3 giao dich',
    monthlyEarningsTitle:'THU NHAP HANG THANG',
    vsLastMonth:'+18% so thang truoc',
    billsFilter:'Hoa don',
    earnFilter:'Kiem tien',
    txLabel:'Tx',
    oracleRealWorld:'Nhiem vu xac minh thuc · Kiem Pi',
    facePayTitle:'Thanh toan bang khuon mat.',
    facePaySubtitle:'Khong can dien thoai. Khong can the. Chi nhin vao terminal. Pi xac nhan trong 2 giay.',
    onDeviceEncryption:'Ma hoa tren thiet bi',
    faceDataPrivacy:'Du lieu khuon mat khong roi khoi dien thoai',
    twoSecondPayments:'Thanh toan 2 giay',
    fasterThanCard:'Nhanh hon bat ky the hoac QR nao',
    joinWaitlist:'Tham gia danh sach cho',
    pointCamera:'Huong camera vao ma QR cua thuong nhan',
    shareQR:'Chia se QR de nhan Pi',
    simulatePayment:'⚡ Gia lap thanh toan den',
    searchBills:'Tim hoa don va dich vu...',
    dueSoon:'SAP DEN HAN',
    allServices:'TAT CA DICH VU',
    utilitiesFilter:'Tien ich',
    insuranceFilter:'Bao hiem',
    telecomFilter:'Vien thong',
    upToDate:'Da thanh toan',
    waterBill:'Hoa don nuoc',
    internetProvider:'Nha cung cap Internet',
    searchMerchants:'Tim thuong nhan gan ban...',
    merchantsNearby:'12 thuong nhan Pi gan day',
    nearbyResults:'GAN DAY · 12 KET QUA',
    registerBusiness:'Dang ky doanh nghiep',
    registerBusinessSub:'Bat dau nhan thanh toan Pi. Cai dat mien phi, xac minh tuc thi.',
    foodRestaurant:'Do an & Nha hang',
    coffeeShop:'Ca phe & Banh',
    pharmacy:'Nha thuoc',
    electronics:'Dien tu',
    retailStore:'Ban le',
    piDay:'Pi Day 2026',
    fullMainnet:'14 Thg 3 · Mainnet day du',
    remaining:'con lai',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 3 nhiem vu hoat dong',
    thisMonth:'thang nay',
    topUpRecommended:'Nen nap them',
    thisMonthFilter:'📅 Thang nay',
    largestFirst:'↓ Lon nhat truoc',
    incomingFilter:'+ Nhan vao',
    oracleReward:'Phan thuong ORACLE',
    agoraVoteReward:'Phan thuong Bieu quyet AGORA',
    pioneerLabel:'PIONEER',
    earnedProfile:'Da kiem',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'He so Danh tieng Hoat dong',
    goodReputation:'Danh tieng Tot',
    earningsMultiplier:'He so thu nhap 1.4x hoat dong',
    scoreBreakdown:'PHAN TICH DIEM — 5 LOP',
    piIdentity:'Danh tinh Pi',
    piTransactions:'Giao dich Pi',
    oracleScore:'Diem ORACLE',
    socialEndorsements:'Tin Nhiem Xa Hoi',
    externalData:'Du lieu Ngoai',
    unlockMoreEarnings:'MO KHOA NHIEU THU NHAP HON',
    distanceLabel:'Khoang cach',
    timeEst:'Thoi gian uoc tinh',
    confirmedLabel:'Da xac nhan',
    goToLocation:'Den dia diem',
    takePhoto:'Chup anh',
    submitLabel:'Gui',
    urgentLabel:'Khan cap',
    acceptTask:'Chap nhan nhiem vu',
    agoraTitle:'Phieu bau cua ban quan trong.',
    agoraSubline:'That su.',
    agoraPioneers:'Pioneers. Quan tri thuc.',
    realPiVote:'Pi thuc cho moi phieu bau.',
    activeVote:'BIEU QUYET DANG DIEN RA',
    votesCast:'Phieu da bau',
    participationLabel:'Tham gia',
    sentToCarlos:'Gui den @pioneer2',
    fromJohn:'Tu @pioneer3',
    axaInsurance:'AXA Insurance',
    transferLabel:'Chuyen khoan',
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
    utilityBill:'공과금',
    utilityBillDue:'3일 후 만료 · 8.5 π',
    transitCard:'교통카드',
    transitCardLow:'교통카드 — 잔액 부족',
    internetBill:'인터넷 요금',
    internetBillDue:'9일 후 만료 · 3.2 π',
    recentTx1:'공과금',
    recentTx1Date:'3월 18일',
    recentTx2:'@pioneer_user에게 받음',
    recentTx2Date:'3월 17일',
    paymentConfirmedNote:'공과금 8.5 π · 2시간 전',
    receivedNote:'@pioneer_user · 어제',
    transitLowNote:'교통카드 잔액 부족',
    loadTransit:'교통카드에 10 π 충전',
    oracleFlood:'ORACLE — 홍수 검증',
    floodLocation:'홍수 검증 동남아시아',
    secured:'보안됨',
    thisWeek:'이번 주',
    totalBalance:'총 잔액',
    sent:'보낸',
    receivedLabel:'받은',
    earnedLabel:'획득한',
    biometricLock:'생체인식 잠금',
    biometricEnabled:'✓ 활성화됨',
    recoveryPhrase:'복구 구문',
    recoveryBacked:'백업됨 · 24단어',
    recentTransactions:'최근 거래',
    seeAll:'모두 보기 →',
    securitySettings:'보안 설정',
    pinBiometric:'PIN · 생체인식',
    facePay:'Face Pay',
    coming2027:'곧 출시 2027',
    oracleSubtitle:'실세계 데이터 검증',
    tasksAvailable:'2개 작업 가능',
    agoraSubtitle:'AI 거버넌스 투표',
    voteOpen:'1개 투표 진행중',
    nexusSubtitle:'평판 승수',
    nexusScore:'점수: 좋음',
    marketplaceSubtitle:'Pi 상거래',
    salesCount:'3건 판매',
    monthlyEarningsTitle:'월간 수익',
    vsLastMonth:'+18% 전월 대비',
    billsFilter:'청구서',
    earnFilter:'수익',
    txLabel:'거래',
    oracleRealWorld:'실세계 검증 작업 · Pi 획득',
    facePayTitle:'얼굴로 결제하세요.',
    facePaySubtitle:'핸드폰 없이. 카드 없이. 터미널만 보세요. Pi 결제 2초 확인.',
    onDeviceEncryption:'기기 내 암호화',
    faceDataPrivacy:'얼굴 데이터가 폰을 떠나지 않습니다',
    twoSecondPayments:'2초 결제',
    fasterThanCard:'어떤 카드나 QR보다 빠름',
    joinWaitlist:'대기자 명단 합류',
    pointCamera:'상인 QR 코드에 카메라를 대세요',
    shareQR:'Pi를 받으려면 QR을 공유하세요',
    simulatePayment:'⚡ 수신 결제 시뮬레이션',
    searchBills:'청구서 및 서비스 검색...',
    dueSoon:'곧 만료',
    allServices:'모든 서비스',
    utilitiesFilter:'공과금',
    insuranceFilter:'보험',
    telecomFilter:'통신',
    upToDate:'납부 완료',
    waterBill:'수도 요금',
    internetProvider:'인터넷 제공업체',
    searchMerchants:'근처 상인 검색...',
    merchantsNearby:'근처 Pi 상인 12명',
    nearbyResults:'근처 · 12개 결과',
    registerBusiness:'사업체 등록',
    registerBusinessSub:'Pi 결제 수락 시작. 무료 설정, 즉시 인증.',
    foodRestaurant:'음식 & 레스토랑',
    coffeeShop:'카페 & 베이커리',
    pharmacy:'약국',
    electronics:'전자제품',
    retailStore:'소매점',
    piDay:'Pi Day 2026',
    fullMainnet:'3월 14일 · 전체 메인넷',
    remaining:'남음',
    activeTasksLabel:'ORACLE · NEXUS · AGORA · 활성 작업 3개',
    thisMonth:'이번 달',
    topUpRecommended:'충전 권장',
    thisMonthFilter:'📅 이번 달',
    largestFirst:'↓ 가장 큰 것 먼저',
    incomingFilter:'+ 수신',
    oracleReward:'ORACLE 보상',
    agoraVoteReward:'AGORA 투표 보상',
    pioneerLabel:'파이오니어',
    earnedProfile:'획득',
    oracleProfile:'ORACLE',
    reputationMultiplierActive:'평판 승수 활성',
    goodReputation:'좋은 평판',
    earningsMultiplier:'1.4배 수익 승수 활성',
    scoreBreakdown:'점수 분석 — 5개 레이어',
    piIdentity:'Pi 신원',
    piTransactions:'Pi 거래',
    oracleScore:'ORACLE 점수',
    socialEndorsements:'사회적 보증',
    externalData:'외부 데이터',
    unlockMoreEarnings:'더 많은 수익 잠금 해제',
    distanceLabel:'거리',
    timeEst:'예상 시간',
    confirmedLabel:'확인됨',
    goToLocation:'위치로 이동',
    takePhoto:'사진 찍기',
    submitLabel:'제출',
    urgentLabel:'긴급',
    acceptTask:'작업 수락',
    agoraTitle:'당신의 투표가 중요합니다.',
    agoraSubline:'진짜로.',
    agoraPioneers:'Pioneers. 실제 거버넌스.',
    realPiVote:'모든 투표에 실제 Pi.',
    activeVote:'활성 투표',
    votesCast:'투표 수',
    participationLabel:'참여율',
    sentToCarlos:'@pioneer2에게 전송',
    fromJohn:'@pioneer3으로부터',
    axaInsurance:'AXA Insurance',
    transferLabel:'이체',
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
  // Handle placeholder translations
  document.querySelectorAll('[placeholder-i18n]').forEach(el => {
    const key = el.getAttribute('placeholder-i18n');
    if (t[key] !== undefined) el.placeholder = t[key];
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

  if (id === 's16') {
    const wb = document.getElementById('wallet-balance');
    if (wb) {
      const target = parseFloat(wb.dataset.value || '100') || 100;
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

  
};
