// ═══════════════════════════════════════════════════
//  FYLOX PAYMENTS — Pi SDK + User Data
// ═══════════════════════════════════════════════════

function updateUIWithUser(username, balance) {
  window._fyloxBalance = balance;
  window._fyloxUsername = username;
  const piid = username + '.pi';
  const balanceUSD = balance * piPrice;
  const balanceFmt = balance.toFixed(2);

  const hb = document.getElementById('home-balance');
  if (hb) hb.innerHTML = `${balanceFmt} <span style="font-size:24px;color:var(--c)">π</span>`;

  const hars = document.getElementById('home-ars');
  if (hars) hars.textContent = balanceUSD.toFixed(3);

  const hpid = document.getElementById('home-piid');
  if (hpid) hpid.textContent = piid;

  const hu = document.getElementById('home-username');
  if (hu) hu.textContent = '@' + username;

  const wb = document.getElementById('wallet-balance');
  if (wb) wb.dataset.value = balance;

  const pu = document.getElementById('profile-username');
  if (pu) pu.textContent = '@' + username;

  const ra = document.getElementById('receive-address');
  if (ra) ra.textContent = '@' + username + ' · ' + piid;

  const s3u = document.getElementById('s3-username');
  if (s3u) s3u.textContent = '@' + username + '.pi';

  const s3bu = document.getElementById('s3-back-username');
  if (s3bu) s3bu.textContent = '@' + username + '.pi';
}

function fyloxSendPayment() {
  const amt = parseFloat(document.getElementById('s7total')?.textContent.replace('π', '').trim()) || 0;
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

// ── PI LOGIN ─────────────────────────────────────────

async function piLogin() {
  const btn = document.getElementById('pi-login-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="position:relative;z-index:1">Connecting to Pi Network…</span>';
  }

  if (!window.Pi) {
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
