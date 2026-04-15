// ═══════════════════════════════════════════════════
//  FYLOX REALTIME — v1
//  Polling inteligente para notificaciones instantáneas
//  - Solo corre cuando la app está visible
//  - Detecta nuevas transacciones comparando con la última conocida
//  - Dispara notificación con sonido al recibir Pi
//  - Actualiza saldo instantáneamente
// ═══════════════════════════════════════════════════

const FyloxRealtime = (() => {

  let _pollTimer      = null;
  let _lastTxId       = null;
  let _isRunning      = false;
  let _pollInterval   = 15000; // 15 segundos

  // ── Iniciar polling ──────────────────────────────
  function start() {
    if (_isRunning) return;
    _isRunning = true;

    // Guardar el ID de la última transacción conocida
    _syncLastTxId().then(() => {
      _pollTimer = setInterval(_check, _pollInterval);
      console.log('[Fylox Realtime] Polling iniciado');
    });

    // Pausar cuando la app va a segundo plano
    document.addEventListener('visibilitychange', _onVisibilityChange);
  }

  // ── Detener polling ──────────────────────────────
  function stop() {
    if (_pollTimer) {
      clearInterval(_pollTimer);
      _pollTimer = null;
    }
    _isRunning = false;
    document.removeEventListener('visibilitychange', _onVisibilityChange);
    console.log('[Fylox Realtime] Polling detenido');
  }

  // ── Pausar/reanudar según visibilidad ────────────
  function _onVisibilityChange() {
    if (document.hidden) {
      // App en segundo plano — pausar para no gastar batería
      if (_pollTimer) {
        clearInterval(_pollTimer);
        _pollTimer = null;
      }
    } else {
      // App volvió al primer plano — verificar inmediatamente
      _check();
      _pollTimer = setInterval(_check, _pollInterval);
    }
  }

  // ── Obtener el ID de la última tx conocida ───────
  async function _syncLastTxId() {
    try {
      const data = await apiCall('GET', '/user/transactions?limit=1');
      const txs  = data.transactions || [];
      if (txs.length > 0) {
        _lastTxId = txs[0]._id;
      }
    } catch (err) {
      console.warn('[Fylox Realtime] No se pudo sincronizar última tx:', err.message);
    }
  }

  // ── Check principal — se ejecuta cada 15 segundos ─
  async function _check() {
    if (!getToken()) return;

    try {
      const [txData, balData] = await Promise.allSettled([
        apiCall('GET', '/user/transactions?limit=5'),
        apiCall('GET', '/user/balance'),
      ]);

      // ── Verificar nuevas transacciones ────────────
      if (txData.status === 'fulfilled') {
        const txs = txData.value.transactions || [];

        if (txs.length > 0) {
          const latestTxId = txs[0]._id;

          // Si hay una tx nueva que no conocíamos
          if (_lastTxId && latestTxId !== _lastTxId) {
            // Encontrar todas las txs nuevas
            const newTxs = [];
            for (const tx of txs) {
              if (tx._id === _lastTxId) break;
              newTxs.push(tx);
            }

            // Notificar solo las de tipo recibido
            newTxs.forEach(tx => {
              if (tx.type === 'received' || tx.type === 'reward' ||
                  tx.type === 'oracle'   || tx.type === 'agora') {
                _notifyReceived(tx);
              }
            });
          }

          _lastTxId = latestTxId;
        }
      }

      // ── Actualizar saldo si cambió ─────────────────
      if (balData.status === 'fulfilled') {
        const newBalance = balData.value.balance || 0;
        const oldBalance = window._fyloxBalance || 0;

        if (newBalance !== oldBalance) {
          updateUIWithUser(window._fyloxUsername || 'Pioneer', newBalance);
        }
      }

    } catch (err) {
      // Silencio — no molestar al usuario con errores de red
      console.warn('[Fylox Realtime] Error en check:', err.message);
    }
  }

  // ── Notificar al usuario que recibió Pi ──────────
  function _notifyReceived(tx) {
    const isReward = ['reward', 'oracle', 'agora'].includes(tx.type);

    const icons = {
      received: '💸',
      reward:   '⚡',
      oracle:   '🌊',
      agora:    '🏛️',
    };

    const titles = {
      received: `+${fmtPi(tx.amount)} π recibido`,
      reward:   `+${fmtPi(tx.amount)} π ganado`,
      oracle:   `+${fmtPi(tx.amount)} π — ORACLE`,
      agora:    `+${fmtPi(tx.amount)} π — AGORA`,
    };

    const subs = {
      received: tx.fromUsername ? `De @${esc(tx.fromUsername)}` : 'Transferencia recibida',
      reward:   'Recompensa acreditada',
      oracle:   'Verificación confirmada',
      agora:    'Voto confirmado',
    };

    const type  = tx.type || 'received';
    const icon  = icons[type]  || '💸';
    const title = titles[type] || `+${fmtPi(tx.amount)} π`;
    const sub   = subs[type]   || '';

    // Vibración especial para pagos recibidos
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60, 40, 120]);
    }

    FyloxNotification.show({
      icon,
      title,
      sub,
      amt:   `+${fmtPi(tx.amount)} π`,
      sound: true,
      type:  isReward ? 'reward' : 'receive',
    });

    console.log(`[Fylox Realtime] 🔔 Nueva tx: ${type} +${tx.amount} π`);
  }

  // ── Forzar check inmediato ───────────────────────
  // Llamar esto después de hacer un pago para actualizar el saldo rápido
  function checkNow() {
    _check();
  }

  return { start, stop, checkNow };

})();
