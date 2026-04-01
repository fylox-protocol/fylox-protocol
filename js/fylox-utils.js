// ═══════════════════════════════════════════════════
//  FYLOX UTILS — v1 (archivo nuevo)
//  - esc()        → sanitiza strings antes de innerHTML
//  - PaymentState → reemplaza window.SEND_TO / SEND_AMT
//  - fmtDate()    → fecha localizada según idioma activo
//  - fmtPi()      → formatea montos Pi consistentemente
// ═══════════════════════════════════════════════════

// ── Sanitizador XSS ─────────────────────────────────
//  Usar SIEMPRE antes de insertar datos del servidor en innerHTML.
//  Ejemplo: el.innerHTML = `<div>${esc(username)}</div>`
function esc(str) {
  if (str === null || str === undefined) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

// ── Estado de pago encapsulado ───────────────────────
//  Reemplaza window.SEND_TO y window.SEND_AMT.
//  Ningún script externo puede mutar el destinatario
//  o el monto sin pasar por este módulo.
const PaymentState = (() => {
  let _to  = null;
  let _amt = null;

  return {
    set(to, amt) {
      // Validar formato @username o .pi address
      if (typeof to !== 'string' || to.trim() === '') {
        console.warn('[PaymentState] Destinatario inválido:', to);
        return false;
      }
      const amount = parseFloat(amt);
      if (isNaN(amount) || amount <= 0) {
        console.warn('[PaymentState] Monto inválido:', amt);
        return false;
      }
      _to  = to.trim();
      _amt = amount;
      return true;
    },

    setTo(to) {
      if (typeof to !== 'string' || to.trim() === '') return false;
      _to = to.trim();
      return true;
    },

    setAmt(amt) {
      const amount = parseFloat(amt);
      if (isNaN(amount) || amount < 0) return false;
      _amt = amount;
      return true;
    },

    get()   { return { to: _to, amt: _amt }; },
    getTo() { return _to; },
    getAmt(){ return _amt; },

    isValid() {
      return _to !== null && _amt !== null && _amt > 0;
    },

    clear() {
      _to  = null;
      _amt = null;
    },
  };
})();

// ── Fecha localizada ─────────────────────────────────
//  Usa el idioma activo de Fylox en vez de hardcodear es-AR.
const LANG_LOCALE_MAP = {
  en: 'en-US', es: 'es-AR', pt: 'pt-BR',
  zh: 'zh-CN', ko: 'ko-KR', hi: 'hi-IN',
  id: 'id-ID', vi: 'vi-VN', tl: 'fil-PH',
  ng: 'en-NG',
};

function fmtDate(dateStr) {
  try {
    const locale = LANG_LOCALE_MAP[
      typeof currentLang !== 'undefined' ? currentLang : 'en'
    ] || 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric', month: 'short',
    });
  } catch {
    return dateStr || '';
  }
}

// ── Formateador de montos Pi ─────────────────────────
function fmtPi(amount, decimals = 2) {
  const n = parseFloat(amount);
  if (isNaN(n)) return '0.00';
  return n.toFixed(decimals);
}

// ── Precio Pi unificado ──────────────────────────────
//  Fuente única de verdad para el precio de Pi.
//  fylox-ui.js actualiza este valor desde OKX.
//  Reemplaza el piPrice=40 de fylox-payments.js.
let FYLOX_PI_PRICE = 0.3400;

function getPiPrice()       { return FYLOX_PI_PRICE; }
function setPiPrice(price)  {
  const p = parseFloat(price);
  if (!isNaN(p) && p > 0) FYLOX_PI_PRICE = p;
}

function fmtUSD(piAmount) {
  return (parseFloat(piAmount) * FYLOX_PI_PRICE).toFixed(3);
}
