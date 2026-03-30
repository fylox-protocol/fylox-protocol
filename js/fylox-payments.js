// ── 1. FLUJO DE PAGO SEGURO (U2A: Del Pioneer a Fylox) ────────────────────────
async function initiatePiPayment(amount, recipientUsername, memoText = 'Pago en Fylox') {
  try {
    console.log(`[Fylox] Iniciando pago de ${amount} Pi para @${recipientUsername}`);

    Pi.createPayment({
      amount: parseFloat(amount),
      memo: memoText,
      // Metadata es CRÍTICO: le dice al backend a quién asignarle la plata
      metadata: { to: recipientUsername } 
    }, {
      onReadyForServerApproval: async function(paymentId) {
        console.log('[Fylox] Solicitando aprobación S2S...', paymentId);
        try {
          // SOLO mandamos el paymentId. El backend lee el monto real desde la blockchain.
          await apiCall('POST', '/api/payments/approve', { paymentId });
        } catch (err) {
          console.error('[Fylox] El backend rechazó la aprobación:', err);
          throw new Error('Aprobación S2S fallida');
        }
      },

      onReadyForServerCompletion: async function(paymentId, txid) {
        console.log('[Fylox] Solicitando completitud S2S...', paymentId, txid);
        try {
          // NO ENVIAR EL MONTO. El servidor lo verifica contra Pi Network.
          await apiCall('POST', '/api/payments/complete', { paymentId, txid });
          
          // Refrescamos la UI
          const newBalance = await fetchBalance();
          updateUIWithUser(window._fyloxUsername, newBalance);
          
          if (typeof FyloxNotification !== 'undefined') {
            FyloxNotification.show({
              icon: '✅', title: 'Pago Exitoso', sub: `Enviado a @${recipientUsername}`, sound: true
            });
          } else {
            alert(`✅ Pago exitoso a @${recipientUsername}`);
          }
        } catch (err) {
          console.error('[Fylox] Error en completitud S2S:', err);
          throw new Error('Completitud S2S fallida');
        }
      },

      onCancel: function(paymentId) {
        console.log('[Fylox] El usuario canceló el pago:', paymentId);
      },

      onError: function(error, payment) {
        console.error('[Fylox] Error en el SDK de Pi:', error, payment);
        alert('❌ Error al procesar el pago con la Pi Wallet.');
      }
    });
  } catch (error) {
    console.error('[Fylox] Error iniciando pago:', error);
  }
}

// ── 2. FLUJO DE RETIRO SEGURO (A2U: De Fylox al Pioneer) ────────────────────
async function withdrawToWallet(amountToWithdraw) {
  // ACÁ VOLAMOS EL Pi.createPayment. Es la app la que paga, no el usuario.
  const amount = parseFloat(amountToWithdraw);
  if (isNaN(amount) || amount <= 0) return alert('Monto inválido.');
  
  const btns = document.querySelectorAll('[onclick="withdrawToWallet()"]');
  btns.forEach(b => { b.disabled = true; b.innerHTML = '<span class="spinner"></span> Procesando...'; });

  try {
    console.log(`[Fylox] Solicitando retiro de ${amount} Pi al backend...`);
    
    // Le pedimos a nuestra bóveda que firme la transacción con la Developer Wallet
    await apiCall('POST', '/api/payments/withdraw', { amount });
    
    const newBalance = await fetchBalance();
    updateUIWithUser(window._fyloxUsername, newBalance);
    
    if (typeof FyloxNotification !== 'undefined') {
      FyloxNotification.show({
        icon: '💸', title: 'Retiro en proceso', sub: `${amount} π van hacia tu billetera`, sound: true
      });
    } else {
      alert(`✅ Retiro exitoso. ${amount} Pi enviados a tu billetera.`);
    }
  } catch (err) {
    console.error('[Fylox] Error solicitando retiro:', err.message);
    const msg = err.response?.data?.error || err.message;
    alert(`❌ No se pudo procesar el retiro: ${msg}`);
  } finally {
    btns.forEach(b => { b.disabled = false; b.innerHTML = 'Retirar a mi Billetera'; });
  }
}

// ── 3. MITIGACIÓN DE DDOS (Polling optimizado) ──────────────────────────────
let _balancePollTimer = null;
function startBalancePolling() {
  if (_balancePollTimer) clearInterval(_balancePollTimer);
  // Cambiamos de 30 segundos a 3 minutos (180000 ms) para proteger el backend
  _balancePollTimer = setInterval(async () => {
    try {
      const newBalance = await fetchBalance();
      if (newBalance !== window._fyloxBalance) {
        updateUIWithUser(window._fyloxUsername, newBalance);
      }
    } catch (e) {
      console.warn('[Fylox] Error actualizando balance en segundo plano:', e.message);
    }
  }, 180000); 
}
