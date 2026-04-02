// ═══════════════════════════════════════════════════
//  FYLOX MAP ENGINE — v2
//  - Sin XSS — esc() en popups y lista de comercios
//  - Sin monkey-patch — usa evento fylox:screen
//  - Nominatim con debounce (máx 1 req/seg)
//  - Geolocalización con aviso al usuario
//  - Leaflet lazy-load
// ═══════════════════════════════════════════════════

// ── Lazy-load de Leaflet ─────────────────────────────
(function _loadLeaflet(cb) {
  if (window.L) { cb(); return; }

  const link  = document.createElement('link');
  link.rel    = 'stylesheet';
  link.href   = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  document.head.appendChild(link);

  const script    = document.createElement('script');
  script.src      = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.onload   = cb;
  script.onerror  = () => console.error('[Map] No se pudo cargar Leaflet');
  document.head.appendChild(script);
})(_onLeafletReady);

const _pendingLeafletInits = [];
let   _leafletReady        = false;

function _onLeafletReady() {
  _leafletReady = true;
  _pendingLeafletInits.forEach(fn => fn());
  _pendingLeafletInits.length = 0;
}

function _whenLeaflet(fn) {
  if (_leafletReady || window.L) fn();
  else _pendingLeafletInits.push(fn);
}

// ── Módulo principal ─────────────────────────────────
const FyloxMap = (() => {

  let _userLat         = null;
  let _userLng         = null;
  let _registerLat     = null;
  let _registerLng     = null;
  let _mainMap         = null;
  let _registerMap     = null;
  let _userMarker      = null;
  let _merchantMarkers = [];
  let _registerMarker  = null;

  // ── Debounce para Nominatim (máx 1 req/seg) ────────
  let _geocodeTimer = null;
  function _debouncedGeocode(lat, lng) {
    if (_geocodeTimer) clearTimeout(_geocodeTimer);
    _geocodeTimer = setTimeout(() => _reverseGeocode(lat, lng), 1000);
  }

  // ── Haversine ───────────────────────────────────────
  function _haversineKm(lat1, lng1, lat2, lng2) {
    const R    = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a    = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function _formatDist(km) {
    if (km < 0.05) return 'Aquí';
    if (km < 1)    return Math.round(km * 1000) + 'm';
    if (km < 10)   return km.toFixed(1) + 'km';
    return Math.round(km) + 'km';
  }

  // ── Íconos Leaflet ──────────────────────────────────
  function _userIcon() {
    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:36px;height:36px">
          <div style="position:absolute;inset:0;border-radius:50%;
            background:rgba(0,212,232,0.25);
            animation:fyloxPulse 1.8s ease-out infinite"></div>
          <div style="position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:16px;height:16px;border-radius:50%;
            background:#00D4E8;border:2.5px solid #fff;
            box-shadow:0 0 10px rgba(0,212,232,0.7)"></div>
          <div style="position:absolute;bottom:-18px;left:50%;
            transform:translateX(-50%);font-size:10px;font-weight:700;
            color:#fff;white-space:nowrap;text-shadow:0 1px 3px #000">Vos</div>
        </div>`,
      iconSize:   [36, 54],
      iconAnchor: [18, 18],
    });
  }

  function _merchantIcon(merchant) {
    const isOpen = merchant.status === 'open';
    const color  = isOpen ? '#00D4E8' : '#666';
    const bg     = isOpen ? 'rgba(0,212,232,0.18)' : 'rgba(100,100,100,0.18)';
    const dist   = merchant.distanceText || '';

    // esc() en el ícono del comercio (viene del servidor)
    const icon = esc(merchant.icon || '🏪');

    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;text-align:center">
          <div style="width:32px;height:32px;border-radius:50%;
            background:${bg};border:2px solid ${color};
            display:flex;align-items:center;justify-content:center;
            font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">
            ${icon}
          </div>
          ${dist
            ? `<div style="margin-top:2px;font-size:9px;font-weight:700;
                color:${color};text-shadow:0 1px 2px #000;white-space:nowrap">
                ${esc(dist)}
               </div>`
            : ''
          }
        </div>`,
      iconSize:   [32, dist ? 50 : 36],
      iconAnchor: [16, 16],
    });
  }

  function _registerIcon() {
    return L.divIcon({
      className: '',
      html: `
        <div style="text-align:center">
          <div style="font-size:28px;line-height:1;
            filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">📍</div>
          <div style="font-size:10px;font-weight:700;color:#8B5CF6;
            text-shadow:0 1px 2px #000;white-space:nowrap;margin-top:2px">
            Tu comercio
          </div>
        </div>`,
      iconSize:   [40, 50],
      iconAnchor: [12, 28],
    });
  }

  // ── CSS del mapa ────────────────────────────────────
  function _injectCSS() {
    if (document.getElementById('fylox-map-css')) return;
    const style      = document.createElement('style');
    style.id         = 'fylox-map-css';
    style.textContent = `
      @keyframes fyloxPulse {
        0%   { transform:scale(1);   opacity:.8; }
        70%  { transform:scale(2.2); opacity:0;  }
        100% { transform:scale(1);   opacity:0;  }
      }
      .leaflet-container {
        background: #0A0B14 !important;
        border-radius: 16px;
        font-family: inherit;
      }
      .fylox-popup .leaflet-popup-content-wrapper {
        background: rgba(13,14,21,0.95);
        border: 1px solid rgba(0,212,232,0.3);
        border-radius: 12px;
        color: #fff;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
      .fylox-popup .leaflet-popup-tip {
        background: rgba(13,14,21,0.95);
      }
      .fylox-popup .leaflet-popup-close-button {
        color: rgba(255,255,255,0.5) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Mapa principal ──────────────────────────────────
  function initMainMap(lat, lng, merchants) {
    _injectCSS();
    _whenLeaflet(() => _initMainMapLeaflet(lat, lng, merchants));
  }

  function _initMainMapLeaflet(lat, lng, merchants) {
    const container = document.getElementById('fylox-map-container');
    if (!container) return;

    container.style.height       = '260px';
    container.style.borderRadius = '16px';
    container.style.overflow     = 'hidden';
    container.style.position     = 'relative';
    container.innerHTML          = '';

    if (_mainMap) { _mainMap.remove(); _mainMap = null; }
    _merchantMarkers = [];

    _mainMap = L.map(container, {
      zoomControl:        true,
      attributionControl: false,
      tap:                true,
    }).setView([lat, lng], 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom:    19,
    }).addTo(_mainMap);

    L.control.attribution({ prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright" style="color:#00D4E8">OSM</a>')
      .addTo(_mainMap);

    _userMarker = L.marker([lat, lng], {
      icon:        _userIcon(),
      zIndexOffset: 1000,
    }).addTo(_mainMap);

    if (merchants && merchants.length > 0) {
      merchants.forEach(m => {
        if (!m.location?.coordinates) return;
        const [mLng, mLat] = m.location.coordinates;
        if (mLat === 0 && mLng === 0) return;

        const marker = L.marker([mLat, mLng], { icon: _merchantIcon(m) })
          .addTo(_mainMap);

        const isOpen  = m.status === 'open';
        const sc      = isOpen ? '#00E090' : m.status === 'busy' ? '#FFB700' : '#FF4D6A';
        const sl      = isOpen ? 'Abierto' : m.status === 'busy' ? 'Ocupado' : 'Cerrado';

        // esc() en TODOS los valores del servidor dentro del popup
        const mIcon = esc(m.icon || '🏪');
        const mName = esc(m.name || '');
        const mDist = m.distanceText ? esc(m.distanceText) : null;
        const mId   = esc(String(m._id || ''));

        marker.bindPopup(`
          <div style="min-width:140px">
            <div style="font-size:22px;margin-bottom:4px">${mIcon}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:2px">${mName}</div>
            <div style="font-size:11px;color:${sc};font-weight:600;margin-bottom:6px">${esc(sl)}</div>
            ${mDist
              ? `<div style="font-size:11px;color:#00D4E8;font-weight:700;margin-bottom:8px">
                   📍 ${mDist}
                 </div>`
              : ''
            }
            <button onclick="FyloxMap._selectFromMap('${mId}')"
              style="width:100%;padding:8px;border:none;border-radius:8px;
                background:linear-gradient(135deg,#00D4E8,#00AACC);
                color:#000;font-weight:700;font-size:12px;cursor:pointer">
              Pagar aquí →
            </button>
          </div>`, { className: 'fylox-popup' });

        _merchantMarkers.push(marker);
      });
    }
  }

  // Llamado desde el botón del popup
  function _selectFromMap(id) {
    const m = window._merchantsData?.find(x => String(x._id) === String(id));
    if (!m) return;
    window._currentMerchant     = m.name;
    window._currentMerchantPi   = m.piAddress;
    window._currentMerchantIcon = m.icon;
    goTo('s14');
  }

  // ── Mapa de registro ────────────────────────────────
  function initRegisterMap(lat, lng) {
    _injectCSS();
    _whenLeaflet(() => _initRegisterMapLeaflet(lat, lng));
  }

  function _initRegisterMapLeaflet(lat, lng) {
    const container = document.getElementById('fylox-register-map');
    if (!container) return;

    container.style.height       = '220px';
    container.style.borderRadius = '16px';
    container.style.overflow     = 'hidden';
    container.innerHTML          = '';

    if (_registerMap) { _registerMap.remove(); _registerMap = null; }

    _registerLat = lat;
    _registerLng = lng;

    _registerMap = L.map(container, {
      zoomControl:        true,
      attributionControl: false,
      tap:                true,
    }).setView([lat, lng], 17);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom:    19,
    }).addTo(_registerMap);

    _registerMarker = L.marker([lat, lng], {
      icon:     _registerIcon(),
      draggable: true,
    }).addTo(_registerMap);

    // Debounce en dragend — máximo 1 req/seg a Nominatim
    _registerMarker.on('dragend', () => {
      const pos    = _registerMarker.getLatLng();
      _registerLat = pos.lat;
      _registerLng = pos.lng;
      _debouncedGeocode(_registerLat, _registerLng);
      if (navigator.vibrate) navigator.vibrate(30);
    });

    // También en tap — con debounce
    _registerMap.on('click', (e) => {
      _registerLat = e.latlng.lat;
      _registerLng = e.latlng.lng;
      _registerMarker.setLatLng(e.latlng);
      _debouncedGeocode(_registerLat, _registerLng);
      if (navigator.vibrate) navigator.vibrate(30);
    });

    const note           = document.createElement('div');
    note.style.cssText   = `
      position:absolute;bottom:10px;left:50%;transform:translateX(-50%);
      background:rgba(13,14,21,0.85);border:1px solid rgba(139,92,246,0.4);
      border-radius:8px;padding:5px 12px;font-size:10px;color:rgba(255,255,255,0.6);
      pointer-events:none;z-index:1000;white-space:nowrap;backdrop-filter:blur(6px);
    `;
    note.textContent = 'Tocá o arrastrá el pin para mover';
    container.appendChild(note);
  }

  // ── Reverse geocoding — una sola llamada a la vez ───
  async function _reverseGeocode(lat, lng) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'es', 'User-Agent': 'Fylox/2.0 (fyloxprotocol.com)' } }
      );
      const d = await r.json();
      const a = d.address || {};

      // textContent es seguro — no necesita esc()
      const addrEl    = document.getElementById('register-address');
      const cityEl    = document.getElementById('register-city');
      const countryEl = document.getElementById('register-country');
      const street    = [a.road, a.house_number].filter(Boolean).join(' ');

      if (addrEl)    addrEl.value    = street || d.display_name?.split(',')[0] || '';
      if (cityEl)    cityEl.value    = a.city || a.town || a.village || '';
      if (countryEl) countryEl.value = a.country || '';

    } catch (e) {
      console.warn('[Map] Geocoding error:', e.message);
    }
  }

  // ── Geolocalización ─────────────────────────────────
  function locateUser(onSuccess, onError) {
    if (!navigator.geolocation) { onError?.('GPS no disponible'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        _userLat = pos.coords.latitude;
        _userLng = pos.coords.longitude;
        onSuccess?.(_userLat, _userLng, pos.coords.accuracy);
      },
      err => {
        const msgs = { 1: 'Permiso denegado.', 2: 'GPS no disponible.', 3: 'Tiempo agotado.' };
        onError?.(msgs[err.code] || 'Error de ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  // ── Cargar comercios con geo ────────────────────────
  async function loadMerchantsWithLocation() {
    const statusEl = document.getElementById('map-location-status');
    const listEl   = document.getElementById('merchant-list');

    if (listEl) listEl.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
        <div style="width:24px;height:24px;border:2px solid var(--c);
          border-top-color:transparent;border-radius:50%;
          animation:spin .8s linear infinite;margin:0 auto 10px"></div>
        Obteniendo ubicación…
      </div>`;

    locateUser(
      async (lat, lng, accuracy) => {
        if (statusEl) {
          statusEl.innerHTML    = `📍 ±${Math.round(accuracy)}m`;
          statusEl.style.color  = '#00E090';
        }
        try {
          // Coordenadas redondeadas a 3 decimales (~110m precisión)
          // para no exponer la posición exacta del usuario
          const latR = lat.toFixed(3);
          const lngR = lng.toFixed(3);
          const data = await apiCall('GET', `/merchants?lat=${latR}&lng=${lngR}&radius=50`);

          window._merchantsData = data.merchants || [];
          window._merchantsData.forEach(m => {
            if (m.location?.coordinates) {
              const [mLng, mLat] = m.location.coordinates;
              const km           = _haversineKm(lat, lng, mLat, mLng);
              m.distanceKm       = km;
              m.distanceText     = _formatDist(km);
            }
          });

          renderMerchantsWithDistance(window._merchantsData);
          requestAnimationFrame(() => initMainMap(lat, lng, window._merchantsData));

          const counterEl = document.getElementById('nearby-count');
          if (counterEl && data.total > 0) {
            counterEl.textContent = `${data.total} comercios Pi cerca tuyo`;
          }
        } catch (err) {
          initMainMap(lat, lng, []);
          if (listEl) listEl.innerHTML =
            '<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>';
        }
      },
      async (errMsg) => {
        if (statusEl) {
          statusEl.innerHTML   = `⚠️ ${esc(errMsg)}`;
          statusEl.style.color = 'var(--ylw)';
        }
        try {
          const data            = await apiCall('GET', '/merchants');
          window._merchantsData = data.merchants || [];
          renderMerchantsWithDistance(window._merchantsData);
          initMainMap(-34.6037, -58.3816, window._merchantsData);
        } catch {
          initMainMap(-34.6037, -58.3816, []);
          if (listEl) listEl.innerHTML =
            '<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>';
        }
      }
    );
  }

  // ── Render lista de comercios ───────────────────────
  function renderMerchantsWithDistance(merchants) {
    const list = document.getElementById('merchant-list');
    if (!list) return;

    if (merchants.length === 0) {
      list.innerHTML = `
        <div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
          No hay comercios cerca todavía.<br>
          <span style="font-size:11px;color:var(--t3)">¡Sé el primero en registrar el tuyo!</span>
        </div>`;
      return;
    }

    const CAT = {
      food: 'Comida', coffee: 'Café', pharmacy: 'Farmacia',
      electronics: 'Electrónica', retail: 'Retail',
      services: 'Servicios', transport: 'Transporte', other: 'Otro',
    };

    list.innerHTML = merchants.map(m => {
      const isOpen = m.status === 'open';
      const sc     = isOpen ? 'var(--grn)' : m.status === 'busy' ? 'var(--ylw)' : 'var(--red)';
      const sb     = isOpen ? 'rgba(0,224,144,.08)' : m.status === 'busy' ? 'rgba(255,183,0,.08)' : 'rgba(255,77,106,.08)';
      const sl     = isOpen ? 'Abierto' : m.status === 'busy' ? 'Ocupado' : 'Cerrado';

      // esc() en TODOS los valores del servidor
      const mName = esc(m.name      || '');
      const mIcon = esc(m.icon      || '🏪');
      const mId   = esc(String(m._id    || ''));
      const mPi   = esc(m.piAddress || '');
      const mCity = m.city ? ` · ${esc(m.city)}` : '';
      const mVer  = m.verified ? ' <span style="color:var(--c);font-size:10px">✓</span>' : '';
      const mCat  = esc(CAT[m.category] || m.category || '');
      const mDist = m.distanceText
        ? `<span style="font-size:11px;color:var(--c);font-weight:700;font-family:var(--fm)">${esc(m.distanceText)}</span>`
        : '';

      return `<div class="row" data-go="s14"
        data-merchant="${mName}"
        data-merchant-pi="${mPi}"
        data-merchant-icon="${mIcon}"
        data-merchant-id="${mId}"
        onclick="FyloxMap.onMerchantRowClick(this)">
        <div class="ti" style="background:rgba(0,212,232,.08);font-size:22px">${mIcon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600">${mName}${mVer}</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px">${mCat}${mCity}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
          <div style="padding:3px 8px;border-radius:8px;background:${sb};
            font-size:10px;font-weight:700;color:${sc}">${esc(sl)}</div>
          ${mDist}
        </div>
      </div>`;
    }).join('');
  }

  function onMerchantRowClick(el) {
    window._currentMerchant     = el.dataset.merchant;
    window._currentMerchantPi   = el.dataset.merchantPi;
    window._currentMerchantIcon = el.dataset.merchantIcon || '🏪';
  }

  function getRegisterCoords() { return { lat: _registerLat, lng: _registerLng }; }
  function getUserCoords()      { return { lat: _userLat,     lng: _userLng };     }

  return {
    loadMerchantsWithLocation,
    initMainMap,
    initRegisterMap,
    renderMerchantsWithDistance,
    onMerchantRowClick,
    getUserCoords,
    getRegisterCoords,
    _selectFromMap,
  };
})();

// ── Sistema de eventos — sin monkey-patch de goTo ────
document.addEventListener('fylox:screen', (e) => {
  const id = e.detail?.id;
  if (!id) return;

  if (id === 's13') {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => FyloxMap.loadMerchantsWithLocation())
    );
  }

  if (id === 's-register-merchant') {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const c = FyloxMap.getUserCoords();
        FyloxMap.initRegisterMap(c.lat || -34.6037, c.lng || -58.3816);
      })
    );
  }
});
