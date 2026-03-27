// ═══════════════════════════════════════════════════
//  FYLOX MAP ENGINE v4 — Leaflet.js + OpenStreetMap
//  Tiles reales de OSM, funciona en Pi Browser
//  - Mapa real con OpenStreetMap
//  - Punto azul pulsante del Pioneer
//  - Pines de comercios con distancia real
//  - Geolocalización real
// ═══════════════════════════════════════════════════

// Inyectar Leaflet CSS + JS si no están presentes
(function _loadLeaflet(cb) {
  if (window.L) { cb(); return; }

  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.onload = cb;
  document.head.appendChild(script);
})(_onLeafletReady);

// Guardamos las funciones que dependen de L para ejecutar después de que cargue
const _pendingLeafletInits = [];
function _onLeafletReady() {
  _leafletReady = true;
  _pendingLeafletInits.forEach(fn => fn());
  _pendingLeafletInits.length = 0;
}
let _leafletReady = false;

function _whenLeaflet(fn) {
  if (_leafletReady || window.L) { fn(); }
  else { _pendingLeafletInits.push(fn); }
}

const FyloxMap = (() => {

  let _userLat       = null;
  let _userLng       = null;
  let _registerLat   = null;
  let _registerLng   = null;
  let _mainMap       = null;   // instancia Leaflet del mapa principal
  let _registerMap   = null;   // instancia Leaflet del mapa de registro
  let _userMarker    = null;   // marcador del Pioneer
  let _merchantMarkers = [];   // marcadores de comercios
  let _registerMarker  = null; // marcador arrastrable en registro

  // ── Haversine ─────────────────────────────────────
  function _haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
      Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function _formatDist(km) {
    if (km < 0.05) return 'Aquí';
    if (km < 1)    return Math.round(km * 1000) + 'm';
    if (km < 10)   return km.toFixed(1) + 'km';
    return Math.round(km) + 'km';
  }

  // ── Ícono del Pioneer (punto azul pulsante via CSS) ─
  function _userIcon() {
    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:36px;height:36px">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:rgba(0,212,232,0.25);
            animation:fyloxPulse 1.8s ease-out infinite;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:16px;height:16px;border-radius:50%;
            background:#00D4E8;border:2.5px solid #fff;
            box-shadow:0 0 10px rgba(0,212,232,0.7);
          "></div>
          <div style="
            position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
            font-size:10px;font-weight:700;color:#fff;white-space:nowrap;
            text-shadow:0 1px 3px #000;
          ">Vos</div>
        </div>`,
      iconSize:   [36, 54],
      iconAnchor: [18, 18],
    });
  }

  // ── Ícono de comercio ─────────────────────────────
  function _merchantIcon(merchant) {
    const isOpen  = merchant.status === 'open';
    const color   = isOpen ? '#00D4E8' : '#666';
    const bg      = isOpen ? 'rgba(0,212,232,0.18)' : 'rgba(100,100,100,0.18)';
    const dist    = merchant.distanceText || '';
    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;text-align:center">
          <div style="
            width:32px;height:32px;border-radius:50%;
            background:${bg};border:2px solid ${color};
            display:flex;align-items:center;justify-content:center;
            font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.4);
          ">${merchant.icon || '🏪'}</div>
          ${dist ? `<div style="
            margin-top:2px;font-size:9px;font-weight:700;
            color:${color};text-shadow:0 1px 2px #000;white-space:nowrap;
          ">${dist}</div>` : ''}
        </div>`,
      iconSize:   [32, dist ? 50 : 36],
      iconAnchor: [16, 16],
    });
  }

  // ── Ícono del pin de registro ─────────────────────
  function _registerIcon() {
    return L.divIcon({
      className: '',
      html: `
        <div style="text-align:center">
          <div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">📍</div>
          <div style="font-size:10px;font-weight:700;color:#8B5CF6;
            text-shadow:0 1px 2px #000;white-space:nowrap;margin-top:2px">Tu comercio</div>
        </div>`,
      iconSize:   [40, 50],
      iconAnchor: [12, 28],
    });
  }

  // ── Inyectar CSS de animación pulse ───────────────
  function _injectCSS() {
    if (document.getElementById('fylox-map-css')) return;
    const style = document.createElement('style');
    style.id = 'fylox-map-css';
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

  // ── Inicializar mapa principal ────────────────────
  function initMainMap(lat, lng, merchants) {
    _injectCSS();
    _whenLeaflet(() => _initMainMapLeaflet(lat, lng, merchants));
  }

  function _initMainMapLeaflet(lat, lng, merchants) {
    const container = document.getElementById('fylox-map-container');
    if (!container) return;

    container.style.height  = '260px';
    container.style.borderRadius = '16px';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.innerHTML = '';

    // Destruir mapa anterior si existe
    if (_mainMap) { _mainMap.remove(); _mainMap = null; }
    _merchantMarkers = [];

    // Crear mapa Leaflet
    _mainMap = L.map(container, {
      zoomControl:        true,
      attributionControl: false,
      tap:                true,
    }).setView([lat, lng], 16);

    // Tiles OSM con estilo oscuro (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(_mainMap);

    // Atribución mínima
    L.control.attribution({ prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright" style="color:#00D4E8">OSM</a>')
      .addTo(_mainMap);

    // Marcador del Pioneer
    _userMarker = L.marker([lat, lng], { icon: _userIcon(), zIndexOffset: 1000 })
      .addTo(_mainMap);

    // Marcadores de comercios
    if (merchants && merchants.length > 0) {
      merchants.forEach(m => {
        if (!m.location?.coordinates) return;
        const [mLng, mLat] = m.location.coordinates;
        if (mLat === 0 && mLng === 0) return;

        const marker = L.marker([mLat, mLng], { icon: _merchantIcon(m) })
          .addTo(_mainMap);

        const isOpen = m.status === 'open';
        const sc     = isOpen ? '#00E090' : m.status === 'busy' ? '#FFB700' : '#FF4D6A';
        const sl     = isOpen ? 'Abierto'  : m.status === 'busy' ? 'Ocupado' : 'Cerrado';

        marker.bindPopup(`
          <div style="min-width:140px">
            <div style="font-size:22px;margin-bottom:4px">${m.icon || '🏪'}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:2px">${m.name}</div>
            <div style="font-size:11px;color:${sc};font-weight:600;margin-bottom:6px">${sl}</div>
            ${m.distanceText ? `<div style="font-size:11px;color:#00D4E8;font-weight:700;margin-bottom:8px">📍 ${m.distanceText}</div>` : ''}
            <button onclick="FyloxMap._selectFromMap('${m._id}')"
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
    const m = window._merchantsData?.find(x => x._id === id);
    if (!m) return;
    window._currentMerchant     = m.name;
    window._currentMerchantPi   = m.piAddress;
    window._currentMerchantIcon = m.icon;
    goTo('s14');
  }

  // ── Mapa de registro con pin arrastrable ──────────
  function initRegisterMap(lat, lng) {
    _injectCSS();
    _whenLeaflet(() => _initRegisterMapLeaflet(lat, lng));
  }

  function _initRegisterMapLeaflet(lat, lng) {
    const container = document.getElementById('fylox-register-map');
    if (!container) return;

    container.style.height  = '220px';
    container.style.borderRadius = '16px';
    container.style.overflow = 'hidden';
    container.innerHTML = '';

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
      maxZoom: 19,
    }).addTo(_registerMap);

    // Pin arrastrable
    _registerMarker = L.marker([lat, lng], {
      icon:      _registerIcon(),
      draggable: true,
    }).addTo(_registerMap);

    _registerMarker.on('dragend', async () => {
      const pos = _registerMarker.getLatLng();
      _registerLat = pos.lat;
      _registerLng = pos.lng;
      await _reverseGeocode(_registerLat, _registerLng);
      if (navigator.vibrate) navigator.vibrate(30);
    });

    // También permite tap para mover el pin
    _registerMap.on('click', async (e) => {
      _registerLat = e.latlng.lat;
      _registerLng = e.latlng.lng;
      _registerMarker.setLatLng(e.latlng);
      await _reverseGeocode(_registerLat, _registerLng);
      if (navigator.vibrate) navigator.vibrate(30);
    });

    // Nota de instrucción
    const note = document.createElement('div');
    note.style.cssText = `
      position:absolute;bottom:10px;left:50%;transform:translateX(-50%);
      background:rgba(13,14,21,0.85);border:1px solid rgba(139,92,246,0.4);
      border-radius:8px;padding:5px 12px;font-size:10px;color:rgba(255,255,255,0.6);
      pointer-events:none;z-index:1000;white-space:nowrap;backdrop-filter:blur(6px);
    `;
    note.textContent = 'Tocá o arrastrá el pin para mover';
    container.appendChild(note);
  }

  // ── Reverse geocoding con Nominatim ───────────────
  async function _reverseGeocode(lat, lng) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'es', 'User-Agent': 'Fylox/1.0' } }
      );
      const d = await r.json();
      const a = d.address || {};
      const addrEl    = document.getElementById('register-address');
      const cityEl    = document.getElementById('register-city');
      const countryEl = document.getElementById('register-country');
      const street    = [a.road, a.house_number].filter(Boolean).join(' ');
      if (addrEl)    addrEl.value    = street || d.display_name?.split(',')[0] || '';
      if (cityEl)    cityEl.value    = a.city || a.town || a.village || '';
      if (countryEl) countryEl.value = a.country || '';
    } catch (e) { console.warn('[Map] Geocoding:', e.message); }
  }

  // ── Geolocalización ───────────────────────────────
  function locateUser(onSuccess, onError) {
    if (!navigator.geolocation) { onError?.('No disponible'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        _userLat = pos.coords.latitude;
        _userLng = pos.coords.longitude;
        onSuccess?.(_userLat, _userLng, pos.coords.accuracy);
      },
      err => {
        const m = { 1: 'Permiso denegado.', 2: 'GPS no disponible.', 3: 'Tiempo agotado.' };
        onError?.(m[err.code] || 'Error de ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  // ── Cargar comercios con geo ──────────────────────
  async function loadMerchantsWithLocation() {
    const statusEl = document.getElementById('map-location-status');
    const listEl   = document.getElementById('merchant-list');

    if (listEl) listEl.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
        <div style="width:24px;height:24px;border:2px solid var(--c);border-top-color:transparent;
          border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px"></div>
        Obteniendo ubicación…
      </div>`;

    locateUser(
      async (lat, lng, accuracy) => {
        if (statusEl) {
          statusEl.innerHTML = `📍 ±${Math.round(accuracy)}m`;
          statusEl.style.color = '#00E090';
        }
        try {
          const data = await apiCall('GET', `/merchants?lat=${lat}&lng=${lng}&radius=50`);
          window._merchantsData = data.merchants || [];
          // Calcular distancias
          window._merchantsData.forEach(m => {
            if (m.location?.coordinates) {
              const [mLng, mLat] = m.location.coordinates;
              const km = _haversineKm(lat, lng, mLat, mLng);
              m.distanceKm   = km;
              m.distanceText = _formatDist(km);
            }
          });
          renderMerchantsWithDistance(window._merchantsData);
          requestAnimationFrame(() => initMainMap(lat, lng, window._merchantsData));

          const counterEl = document.getElementById('nearby-count');
          if (counterEl && data.total > 0)
            counterEl.textContent = `${data.total} comercios Pi cerca tuyo`;
        } catch (err) {
          initMainMap(lat, lng, []);
          if (listEl) listEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>`;
        }
      },
      async (errMsg) => {
        if (statusEl) { statusEl.innerHTML = `⚠️ ${errMsg}`; statusEl.style.color = 'var(--ylw)'; }
        try {
          const data = await apiCall('GET', '/merchants');
          window._merchantsData = data.merchants || [];
          renderMerchantsWithDistance(window._merchantsData);
          initMainMap(-34.6037, -58.3816, window._merchantsData);
        } catch (err) {
          initMainMap(-34.6037, -58.3816, []);
          if (listEl) listEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>`;
        }
      }
    );
  }

  // ── Render lista de comercios ─────────────────────
  function renderMerchantsWithDistance(merchants) {
    const list = document.getElementById('merchant-list');
    if (!list) return;

    if (merchants.length === 0) {
      list.innerHTML = `<div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
        No hay comercios cerca todavía.<br>
        <span style="font-size:11px;color:var(--t3)">¡Sé el primero en registrar el tuyo!</span>
      </div>`;
      return;
    }

    const CAT = { food:'Comida', coffee:'Café', pharmacy:'Farmacia', electronics:'Electrónica', retail:'Retail', services:'Servicios', transport:'Transporte', other:'Otro' };

    list.innerHTML = merchants.map(m => {
      const isOpen = m.status === 'open';
      const sc = isOpen ? 'var(--grn)' : m.status === 'busy' ? 'var(--ylw)' : 'var(--red)';
      const sb = isOpen ? 'rgba(0,224,144,.08)' : m.status === 'busy' ? 'rgba(255,183,0,.08)' : 'rgba(255,77,106,.08)';
      const sl = isOpen ? 'Abierto' : m.status === 'busy' ? 'Ocupado' : 'Cerrado';
      const dist = m.distanceText ? `<span style="font-size:11px;color:var(--c);font-weight:700;font-family:var(--fm)">${m.distanceText}</span>` : '';
      const city = m.city ? `<span style="color:var(--t3)"> · ${m.city}</span>` : '';
      const ver  = m.verified ? ' <span style="color:var(--c);font-size:10px">✓</span>' : '';
      return `<div class="row" data-go="s14"
        data-merchant="${m.name}" data-merchant-pi="${m.piAddress}"
        data-merchant-icon="${m.icon}" data-merchant-id="${m._id}"
        onclick="FyloxMap.onMerchantRowClick(this)">
        <div class="ti" style="background:rgba(0,212,232,.08);font-size:22px">${m.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600">${m.name}${ver}</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px">${CAT[m.category] || m.category}${city}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
          <div style="padding:3px 8px;border-radius:8px;background:${sb};font-size:10px;font-weight:700;color:${sc}">${sl}</div>
          ${dist}
        </div>
      </div>`;
    }).join('');
  }

  function onMerchantRowClick(el) {
    window._currentMerchant     = el.dataset.merchant;
    window._currentMerchantPi   = el.dataset.merchantPi;
    window._currentMerchantIcon = el.dataset.merchantIcon || '🏪';
  }

  function selectMerchant(id) {
    const m = window._merchantsData?.find(x => x._id === id);
    if (!m) return;
    window._currentMerchant     = m.name;
    window._currentMerchantPi   = m.piAddress;
    window._currentMerchantIcon = m.icon;
    goTo('s14');
  }

  function getRegisterCoords() { return { lat: _registerLat, lng: _registerLng }; }
  function getUserCoords()      { return { lat: _userLat,     lng: _userLng };     }

  return {
    loadMerchantsWithLocation,
    initMainMap,
    initRegisterMap,
    renderMerchantsWithDistance,
    selectMerchant,
    onMerchantRowClick,
    getUserCoords,
    getRegisterCoords,
    _selectFromMap,
  };
})();

// ── Hook goTo ─────────────────────────────────────
const _origGoToMap = goTo;
goTo = function(id) {
  _origGoToMap(id);
  if (id === 's13') {
    requestAnimationFrame(() => requestAnimationFrame(() => FyloxMap.loadMerchantsWithLocation()));
  }
  if (id === 's-register-merchant') {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const c = FyloxMap.getUserCoords();
      FyloxMap.initRegisterMap(c.lat || -34.6037, c.lng || -58.3816);
    }));
  }
};
