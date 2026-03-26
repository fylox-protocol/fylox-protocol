// ═══════════════════════════════════════════════════
//  FYLOX MAP ENGINE — Leaflet + OpenStreetMap + Esri Satellite
//  100% gratuito, sin API key, nivel planetario
//  - Mapa callejero dark mode
//  - Capa satelital Esri (toggle)
//  - Punto azul pulsante del Pioneer
//  - Marcadores de comercios con popup
//  - Distancia real calculada
//  - Mapa de registro con pin arrastrable
//  - Reversa geocoding con Nominatim (OpenStreetMap)
// ═══════════════════════════════════════════════════

const FyloxMap = (() => {

  // ── Estado ────────────────────────────────────────
  let _map             = null;
  let _userMarker      = null;
  let _userCircle      = null;
  let _merchantMarkers = [];
  let _userLat         = null;
  let _userLng         = null;
  let _registerMap     = null;
  let _registerMarker  = null;
  let _registerLat     = null;
  let _registerLng     = null;
  let _isSatellite     = false;
  let _streetLayer     = null;
  let _satelliteLayer  = null;

  // ── Capas de mapa ─────────────────────────────────
  function _streetTileLayer() {
    // OpenStreetMap estándar — máxima compatibilidad, funciona en Pi Browser
    return L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap contributors',
        subdomains: 'abc',
        maxZoom: 19,
      }
    );
  }

  function _satelliteTileLayer() {
    // Esri World Imagery — satélite de alta resolución, 100% gratis
    return L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri — Source: Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
        maxZoom: 20,
      }
    );
  }

  // Etiquetas de calles sobre el satelite (para ver nombres)
  function _satelliteLabelLayer() {
    return L.tileLayer(
      'https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png',
      { maxZoom: 20, opacity: 0.7 }
    );
  }

  // ── Icono Pioneer (punto azul pulsante) ───────────
  function _userIcon() {
    return L.divIcon({
      className: '',
      html: `<div style="
        width:18px;height:18px;
        background:#00D4E8;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 0 6px rgba(0,212,232,.25),0 0 0 12px rgba(0,212,232,.1);
        animation:fyloxPulse 2s ease-out infinite;
      "></div>`,
      iconSize:   [18, 18],
      iconAnchor: [9, 9],
    });
  }

  // ── Icono comercio ────────────────────────────────
  function _merchantIcon(icon, isVerified, isOpen) {
    const borderColor = !isOpen ? '#666' : isVerified ? '#00E090' : '#00D4E8';
    const bgColor     = !isOpen ? 'rgba(60,60,60,.9)' : 'rgba(13,14,21,.92)';
    return L.divIcon({
      className: '',
      html: `<div style="
        width:36px;height:36px;
        background:${bgColor};
        border:2px solid ${borderColor};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 12px rgba(0,0,0,.5);
      ">
        <span style="transform:rotate(45deg);font-size:16px;line-height:1">${icon}</span>
      </div>`,
      iconSize:   [36, 36],
      iconAnchor: [18, 36],
      popupAnchor:[0, -36],
    });
  }

  // ── CSS del mapa — inyectar una sola vez ──────────
  function _injectMapStyles() {
    if (document.getElementById('fylox-map-styles')) return;
    const s = document.createElement('style');
    s.id = 'fylox-map-styles';
    s.textContent = `
      @keyframes fyloxPulse {
        0%   { box-shadow:0 0 0 0 rgba(0,212,232,.6),0 0 0 0 rgba(0,212,232,.3); }
        70%  { box-shadow:0 0 0 10px rgba(0,212,232,0),0 0 0 20px rgba(0,212,232,0); }
        100% { box-shadow:0 0 0 0 rgba(0,212,232,0),0 0 0 0 rgba(0,212,232,0); }
      }
      .leaflet-container { background:#0D0E15 !important; font-family:'Inter',sans-serif; }
      .leaflet-popup-content-wrapper {
        background:rgba(13,14,21,.96) !important;
        border:1px solid rgba(0,212,232,.2) !important;
        border-radius:14px !important;
        box-shadow:0 8px 32px rgba(0,0,0,.5) !important;
        backdrop-filter:blur(12px);
      }
      .leaflet-popup-tip { background:rgba(13,14,21,.96) !important; }
      .leaflet-popup-content { color:#fff; margin:10px 14px !important; }
      .leaflet-control-attribution { display:none !important; }
      .leaflet-bar a {
        background:rgba(13,14,21,.92) !important;
        color:rgba(255,255,255,.7) !important;
        border-color:rgba(255,255,255,.1) !important;
      }
      .leaflet-bar a:hover { background:rgba(0,212,232,.15) !important; color:#00D4E8 !important; }
      /* Botón toggle satelite */
      .fylox-layer-toggle {
        position:absolute;top:10px;right:10px;z-index:1000;
        background:rgba(13,14,21,.92);
        border:1px solid rgba(0,212,232,.25);
        border-radius:10px;
        padding:6px 10px;
        font-size:12px;font-weight:600;
        color:rgba(255,255,255,.7);
        cursor:pointer;
        display:flex;align-items:center;gap:5px;
        transition:all .2s;
        backdrop-filter:blur(8px);
      }
      .fylox-layer-toggle:active { transform:scale(.95); }
      .fylox-layer-toggle.sat { background:rgba(0,212,232,.15); color:#00D4E8; border-color:rgba(0,212,232,.4); }
    `;
    document.head.appendChild(s);
  }

  // ── Botón toggle satelite ─────────────────────────
  function _addToggleBtn(mapEl, mapInstance) {
    const btn = document.createElement('button');
    btn.className = 'fylox-layer-toggle';
    btn.id = 'map-layer-toggle';
    btn.innerHTML = '🛰️ Satelite';
    btn.onclick = () => toggleSatellite(mapInstance, btn);
    mapEl.style.position = 'relative';
    mapEl.appendChild(btn);
  }

  function toggleSatellite(mapInstance, btn) {
    _isSatellite = !_isSatellite;
    if (_isSatellite) {
      mapInstance.removeLayer(_streetLayer);
      _satelliteLayer.addTo(mapInstance);
      _satelliteLabelLayer().addTo(mapInstance);
      btn.innerHTML = '🗺️ Calles';
      btn.classList.add('sat');
    } else {
      mapInstance.eachLayer(l => {
        if (l !== _userMarker && l !== _userCircle &&
            !_merchantMarkers.includes(l)) {
          mapInstance.removeLayer(l);
        }
      });
      _streetLayer = _streetTileLayer().addTo(mapInstance);
      btn.innerHTML = '🛰️ Satelite';
      btn.classList.remove('sat');
    }
    if (navigator.vibrate) navigator.vibrate(20);
  }

  // ── Inicializar mapa principal (s13) ──────────────
  function initMainMap(lat, lng) {
    _injectMapStyles();
    const container = document.getElementById('fylox-map-container');
    if (!container) return;

    // Destruir mapa previo si existe
    if (_map) { _map.remove(); _map = null; }

    _map = L.map('fylox-map-container', {
      center:          [lat, lng],
      zoom:            15,
      zoomControl:     true,
      attributionControl: false,
    });

    _streetLayer = _streetTileLayer().addTo(_map);
    _satelliteLayer = _satelliteTileLayer();

    // Forzar recálculo de tamaño — crítico cuando el contenedor estaba oculto
    // Múltiples intentos de invalidateSize para garantizar render
    setTimeout(() => _map.invalidateSize(), 100);
    setTimeout(() => _map.invalidateSize(), 400);
    setTimeout(() => _map.invalidateSize(), 800);

    // Punto del Pioneer
    _userMarker = L.marker([lat, lng], { icon: _userIcon(), zIndexOffset: 999 }).addTo(_map);

    // Círculo de precisión
    _userCircle = L.circle([lat, lng], {
      radius:      300,
      color:       '#00D4E8',
      fillColor:   '#00D4E8',
      fillOpacity: 0.04,
      weight:      1,
      opacity:     0.2,
    }).addTo(_map);

    _addToggleBtn(container, _map);
  }

  // ── Actualizar posición del Pioneer ──────────────
  function updateUserPosition(lat, lng) {
    if (!_map) return;
    _userMarker?.setLatLng([lat, lng]);
    _userCircle?.setLatLng([lat, lng]);
    _map.panTo([lat, lng]);
  }

  // ── Pintar marcadores de comercios ───────────────
  function plotMerchants(merchants) {
    if (!_map) return;

    _merchantMarkers.forEach(m => m.remove());
    _merchantMarkers = [];

    merchants.forEach(m => {
      if (!m.location?.coordinates) return;
      const [lng, lat] = m.location.coordinates;
      if (lat === 0 && lng === 0) return;

      const isOpen = m.status === 'open';
      const statusLabel = isOpen ? 'Abierto' : m.status === 'busy' ? 'Ocupado' : 'Cerrado';
      const statusColor = isOpen ? '#00E090' : m.status === 'busy' ? '#FFB700' : '#FF4D6A';
      const dist = m.distanceText ? `<span style="color:#00D4E8;font-weight:700">${m.distanceText}</span>` : '';

      const marker = L.marker([lat, lng], {
        icon:          _merchantIcon(m.icon, m.verified, isOpen),
        zIndexOffset:  isOpen ? 100 : 0,
      }).addTo(_map);

      marker.bindPopup(`
        <div style="min-width:160px;font-family:'Space Grotesk',sans-serif">
          <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:6px">${m.city || m.address || ''}</div>
          <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:4px">
            ${m.name}${m.verified ? ' <span style="color:#00D4E8;font-size:11px">✓</span>' : ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <span style="font-size:11px;color:${statusColor};font-weight:600">${statusLabel}</span>
            ${dist}
          </div>
          <button onclick="FyloxMap.selectMerchant('${m._id}')"
            style="width:100%;padding:8px;background:linear-gradient(135deg,#00D4E8,#00AACC);color:#000;border:none;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif">
            Pagar con π →
          </button>
        </div>
      `, { maxWidth: 220 });

      _merchantMarkers.push(marker);
    });
  }

  // ── Seleccionar comercio desde popup ─────────────
  function selectMerchant(merchantId) {
    _map?.closePopup();
    const m = window._merchantsData?.find(x => x._id === merchantId);
    if (!m) return;
    window._currentMerchant     = m.name;
    window._currentMerchantPi   = m.piAddress;
    window._currentMerchantIcon = m.icon;
    goTo('s14');
  }

  // ── Geolocalización del Pioneer ───────────────────
  function locateUser(onSuccess, onError) {
    if (!navigator.geolocation) {
      onError?.('Geolocalización no disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        _userLat = pos.coords.latitude;
        _userLng = pos.coords.longitude;
        onSuccess?.(_userLat, _userLng, pos.coords.accuracy);
      },
      err => {
        const msgs = {
          1: 'Permiso de ubicación denegado.',
          2: 'No se pudo obtener la ubicación.',
          3: 'Tiempo de espera agotado.',
        };
        onError?.(msgs[err.code] || 'Error de geolocalización');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  // ── Inicializar mapa de registro ──────────────────
  function initRegisterMap(lat, lng) {
    _injectMapStyles();
    const container = document.getElementById('fylox-register-map');
    if (!container) return;

    if (_registerMap) { _registerMap.remove(); _registerMap = null; }

    _registerMap = L.map('fylox-register-map', {
      center:           [lat, lng],
      zoom:             17,
      zoomControl:      true,
      attributionControl: false,
    });

    // Usar satelite de entrada para que sea más fácil ubicarse
    _satelliteTileLayer().addTo(_registerMap);
    _satelliteLabelLayer().addTo(_registerMap);

    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;
        background:#8B5CF6;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 0 6px rgba(139,92,246,.3);
        cursor:grab;
      "></div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 14],
    });

    _registerMarker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(_registerMap);
    _registerLat = lat;
    _registerLng = lng;

    // Al mover el pin → reversa geocoding
    _registerMarker.on('dragend', () => {
      const pos = _registerMarker.getLatLng();
      _registerLat = pos.lat;
      _registerLng = pos.lng;
      _reverseGeocode(pos.lat, pos.lng);
    });

    // Click en el mapa mueve el pin
    _registerMap.on('click', (e) => {
      _registerMarker.setLatLng(e.latlng);
      _registerLat = e.latlng.lat;
      _registerLng = e.latlng.lng;
      _reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Geocoding inicial
    _reverseGeocode(lat, lng);
  }

  // ── Reversa geocoding con Nominatim (gratis) ──────
  async function _reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'es', 'User-Agent': 'Fylox/1.0' } }
      );
      const data = await res.json();

      const a = data.address || {};
      const address = data.display_name || '';
      const city    = a.city || a.town || a.village || a.municipality || '';
      const country = a.country || '';
      const street  = [a.road, a.house_number].filter(Boolean).join(' ');

      const addrEl    = document.getElementById('register-address');
      const cityEl    = document.getElementById('register-city');
      const countryEl = document.getElementById('register-country');

      if (addrEl)    addrEl.value    = street || address.split(',')[0] || '';
      if (cityEl)    cityEl.value    = city;
      if (countryEl) countryEl.value = country;

    } catch (err) {
      console.warn('[Map] Geocoding error:', err.message);
    }
  }

  // ── Cargar comercios con geolocalización ──────────
  async function loadMerchantsWithLocation() {
    const statusEl = document.getElementById('map-location-status');
    const listEl   = document.getElementById('merchant-list');

    if (listEl) listEl.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
        <div style="width:24px;height:24px;border:2px solid var(--c);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px"></div>
        Obteniendo tu ubicación…
      </div>`;

    locateUser(
      async (lat, lng, accuracy) => {
        if (statusEl) {
          statusEl.innerHTML = `📍 ±${Math.round(accuracy)}m`;
          statusEl.style.color = 'var(--grn)';
        }

        initMainMap(lat, lng);

        try {
          const data = await apiCall('GET', `/merchants?lat=${lat}&lng=${lng}&radius=50`);
          window._merchantsData = data.merchants || [];
          renderMerchantsWithDistance(window._merchantsData);
          plotMerchants(window._merchantsData);

          const counterEl = document.getElementById('nearby-count');
          if (counterEl) counterEl.textContent = `${data.total} comercios Pi cerca tuyo`;
        } catch (err) {
          console.warn('[Map] Error:', err.message);
          if (listEl) listEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>`;
        }
      },
      async (errMsg) => {
        // Sin GPS — inicializar mapa en posición por defecto y cargar todos
        if (statusEl) {
          statusEl.innerHTML = `⚠️ ${errMsg}`;
          statusEl.style.color = 'var(--ylw)';
        }
        initMainMap(-34.6037, -58.3816); // Buenos Aires como fallback
        try {
          const data = await apiCall('GET', '/merchants');
          window._merchantsData = data.merchants || [];
          renderMerchantsWithDistance(window._merchantsData);
          plotMerchants(window._merchantsData);
        } catch (err) {
          if (listEl) listEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>`;
        }
      }
    );
  }

  // ── Render lista con distancia ────────────────────
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

    const CATEGORY_LABEL = {
      food:'Comida', coffee:'Café', pharmacy:'Farmacia',
      electronics:'Electrónica', retail:'Retail',
      services:'Servicios', transport:'Transporte', other:'Otro',
    };

    list.innerHTML = merchants.map(m => {
      const isOpen      = m.status === 'open';
      const statusColor = isOpen ? 'var(--grn)' : m.status === 'busy' ? 'var(--ylw)' : 'var(--red)';
      const statusBg    = isOpen ? 'rgba(0,224,144,.08)' : m.status === 'busy' ? 'rgba(255,183,0,.08)' : 'rgba(255,77,106,.08)';
      const statusLabel = isOpen ? 'Abierto' : m.status === 'busy' ? 'Ocupado' : 'Cerrado';
      const catLabel    = CATEGORY_LABEL[m.category] || m.category;
      const verified    = m.verified ? ' <span style="color:var(--c);font-size:10px">✓</span>' : '';
      const distHtml    = m.distanceText
        ? `<span style="font-size:11px;color:var(--c);font-weight:700;font-family:var(--fm)">${m.distanceText}</span>`
        : '';
      const cityHtml    = m.city ? `<span style="color:var(--t3)"> · ${m.city}</span>` : '';

      return `<div class="row" data-go="s14"
        data-merchant="${m.name}"
        data-merchant-pi="${m.piAddress}"
        data-merchant-icon="${m.icon}"
        data-merchant-id="${m._id}"
        onclick="FyloxMap.onMerchantRowClick(this)">
        <div class="ti" style="background:rgba(0,212,232,.08);font-size:22px">${m.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600">${m.name}${verified}</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px">${catLabel}${cityHtml}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
          <div style="padding:3px 8px;border-radius:8px;background:${statusBg};font-size:10px;font-weight:700;color:${statusColor}">${statusLabel}</div>
          ${distHtml}
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
    initMainMap, initRegisterMap, loadMerchantsWithLocation,
    plotMerchants, selectMerchant, onMerchantRowClick,
    getUserCoords, getRegisterCoords, toggleSatellite,
  };

})();

// ── Hook en goTo ──────────────────────────────────
const _origGoToMap = goTo;
goTo = function(id) {
  _origGoToMap(id);

  if (id === 's13') {
    // Esperar 2 frames para que el display:flex sea efectivo
    // y el contenedor tenga dimensiones reales antes de init Leaflet
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        FyloxMap.loadMerchantsWithLocation();
      });
    });
  }

  if (id === 's-register-merchant') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const c = FyloxMap.getUserCoords();
        FyloxMap.initRegisterMap(
          c.lat || -34.6037,
          c.lng || -58.3816
        );
      });
    });
  }
};
