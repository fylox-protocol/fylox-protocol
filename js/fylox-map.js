// ═══════════════════════════════════════════════════
//  FYLOX MAP ENGINE v3 — Canvas nativo
//  Sin dependencias externas, funciona en Pi Browser
//  - Mapa de fondo con gradiente dark
//  - Punto azul pulsante del Pioneer
//  - Pines de comercios con distancia real
//  - Toggle satelite via iframe de OpenStreetMap
//  - Geolocalización real
// ═══════════════════════════════════════════════════

const FyloxMap = (() => {

  let _userLat        = null;
  let _userLng        = null;
  let _registerLat    = null;
  let _registerLng    = null;
  let _pulseAnim      = null;
  let _pulsePhase     = 0;

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
    if (km < 1)    return Math.round(km*1000) + 'm';
    if (km < 10)   return km.toFixed(1) + 'km';
    return Math.round(km) + 'km';
  }

  // ── Proyección lat/lng → píxeles en el canvas ─────
  // Mercator simple centrada en la posición del usuario
  function _project(lat, lng, centerLat, centerLng, scale, W, H) {
    const x = W/2 + (lng - centerLng) * scale;
    const y = H/2 - (lat - centerLat) * scale * 1.3;
    return { x, y };
  }

  // ── Dibujar el mapa en canvas ─────────────────────
  function _drawMap(canvas, merchants) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const scale = 4000; // píxeles por grado (~1km ≈ 111px a escala 1)

    ctx.clearRect(0, 0, W, H);

    // Fondo
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
    bg.addColorStop(0,   '#0F1022');
    bg.addColorStop(0.6, '#0A0B14');
    bg.addColorStop(1,   '#060608');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid de calles simulado
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
    }
    for (let j = 0; j < H; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
    }

    // Calles principales simuladas
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    [H*0.3, H*0.5, H*0.7].forEach(y => {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    });
    [W*0.25, W*0.5, W*0.75].forEach(x => {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    });

    const cLat = _userLat || -34.6037;
    const cLng = _userLng || -58.3816;

    // Comercios
    if (merchants && merchants.length > 0) {
      merchants.forEach(m => {
        if (!m.location?.coordinates) return;
        const [lng, lat] = m.location.coordinates;
        if (lat === 0 && lng === 0) return;

        const p = _project(lat, lng, cLat, cLng, scale, W, H);
        if (p.x < -20 || p.x > W+20 || p.y < -20 || p.y > H+20) return;

        const isOpen  = m.status === 'open';
        const color   = isOpen ? '#00D4E8' : '#666';
        const bgColor = isOpen ? 'rgba(0,212,232,0.15)' : 'rgba(100,100,100,0.15)';

        // Sombra del pin
        ctx.beginPath();
        ctx.arc(p.x, p.y + 2, 10, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Pin fondo
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI*2);
        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Emoji del comercio
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.icon || '🏪', p.x, p.y);

        // Distancia
        if (_userLat && m.distanceText) {
          ctx.font = 'bold 9px Inter, Arial';
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.fillText(m.distanceText, p.x, p.y + 22);
        }
      });
    }

    // Círculo de radio del usuario
    ctx.beginPath();
    ctx.arc(W/2, H/2, 60, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,212,232,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,212,232,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Punto del usuario (animado externamente)
    const pulse = Math.abs(Math.sin(_pulsePhase)) * 0.4 + 0.6;

    // Aro exterior pulsante
    ctx.beginPath();
    ctx.arc(W/2, H/2, 14 + (1-pulse)*6, 0, Math.PI*2);
    ctx.fillStyle = `rgba(0,212,232,${0.15 * pulse})`;
    ctx.fill();

    // Aro medio
    ctx.beginPath();
    ctx.arc(W/2, H/2, 10, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,212,232,0.25)';
    ctx.fill();

    // Punto central
    ctx.beginPath();
    ctx.arc(W/2, H/2, 7, 0, Math.PI*2);
    ctx.fillStyle = '#00D4E8';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label "Vos"
    ctx.font = 'bold 10px Inter, Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Vos', W/2, H/2 - 22);

    // Brújula
    ctx.font = '14px Arial';
    ctx.fillText('🧭', W - 22, 22);
  }

  // ── Inicializar canvas map ────────────────────────
  function initMainMap(lat, lng, merchants) {
    const container = document.getElementById('fylox-map-container');
    if (!container) return;

    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width  = container.offsetWidth  || 340;
    canvas.height = container.offsetHeight || 220;
    canvas.style.cssText = 'width:100%;height:100%;border-radius:16px;display:block;cursor:grab;';
    container.appendChild(canvas);

    // Botón toggle vista satelite
    const toggleBtn = document.createElement('button');
    toggleBtn.id        = 'map-layer-toggle';
    toggleBtn.innerHTML = '🛰️ Satelite';
    toggleBtn.style.cssText = `
      position:absolute;top:10px;right:10px;z-index:10;
      background:rgba(13,14,21,.9);border:1px solid rgba(0,212,232,.3);
      border-radius:10px;padding:5px 10px;font-size:11px;font-weight:600;
      color:rgba(255,255,255,.8);cursor:pointer;backdrop-filter:blur(8px);
    `;
    toggleBtn.onclick = () => _toggleSatellite(lat, lng, canvas, toggleBtn);
    container.appendChild(toggleBtn);

    // Animación de pulso
    if (_pulseAnim) cancelAnimationFrame(_pulseAnim);
    function animate() {
      _pulsePhase += 0.05;
      _drawMap(canvas, merchants || []);
      _pulseAnim = requestAnimationFrame(animate);
    }
    animate();

    // Touch para ver comercio cercano al tap
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const tx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const ty = (e.clientY - rect.top)  * (canvas.height / rect.height);
      _onMapTap(tx, ty, canvas, merchants || []);
    });
  }

  // ── Toggle a vista satelite (iframe OSM) ──────────
  let _satelliteMode = false;
  function _toggleSatellite(lat, lng, canvas, btn) {
    _satelliteMode = !_satelliteMode;
    const container = document.getElementById('fylox-map-container');
    if (!container) return;

    if (_satelliteMode) {
      // Mostrar iframe de OpenStreetMap
      if (_pulseAnim) cancelAnimationFrame(_pulseAnim);
      canvas.style.display = 'none';
      const iframe = document.createElement('iframe');
      iframe.id = 'sat-iframe';
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.004},${lng+0.005},${lat+0.004}&layer=hot&marker=${lat},${lng}`;
      iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:16px;display:block;';
      iframe.setAttribute('loading', 'lazy');
      container.insertBefore(iframe, btn);
      btn.innerHTML = '🗺️ Mapa';
      btn.style.borderColor = 'rgba(0,212,232,.6)';
      btn.style.color = '#00D4E8';
    } else {
      // Volver al canvas
      const iframe = document.getElementById('sat-iframe');
      if (iframe) iframe.remove();
      canvas.style.display = 'block';
      btn.innerHTML = '🛰️ Satelite';
      btn.style.borderColor = 'rgba(0,212,232,.3)';
      btn.style.color = 'rgba(255,255,255,.8)';
      // Reiniciar animación
      function animate() {
        _pulsePhase += 0.05;
        _drawMap(canvas, window._merchantsData || []);
        _pulseAnim = requestAnimationFrame(animate);
      }
      animate();
    }
    if (navigator.vibrate) navigator.vibrate(20);
  }

  // ── Tap en el mapa → seleccionar comercio cercano ─
  function _onMapTap(tx, ty, canvas, merchants) {
    const W = canvas.width;
    const H = canvas.height;
    const scale = 4000;
    const cLat = _userLat || -34.6037;
    const cLng = _userLng || -58.3816;

    let closest = null;
    let minDist = 30; // px

    merchants.forEach(m => {
      if (!m.location?.coordinates) return;
      const [lng, lat] = m.location.coordinates;
      if (lat === 0 && lng === 0) return;
      const p = _project(lat, lng, cLat, cLng, scale, W, H);
      const d = Math.sqrt((p.x - tx)**2 + (p.y - ty)**2);
      if (d < minDist) { minDist = d; closest = m; }
    });

    if (closest) {
      window._currentMerchant     = closest.name;
      window._currentMerchantPi   = closest.piAddress;
      window._currentMerchantIcon = closest.icon;
      goTo('s14');
    }
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
        const m = { 1:'Permiso denegado.', 2:'GPS no disponible.', 3:'Tiempo agotado.' };
        onError?.(m[err.code] || 'Error de ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  // ── Mapa de registro — canvas con pin arrastrable ─
  function initRegisterMap(lat, lng) {
    const container = document.getElementById('fylox-register-map');
    if (!container) return;
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width  = container.offsetWidth  || 340;
    canvas.height = container.offsetHeight || 220;
    canvas.style.cssText = 'width:100%;height:100%;border-radius:16px;display:block;cursor:crosshair;';
    container.appendChild(canvas);

    _registerLat = lat;
    _registerLng = lng;

    function draw() {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
      bg.addColorStop(0, '#0F1022'); bg.addColorStop(1, '#060608');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      for (let i=0;i<W;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
      for (let j=0;j<H;j+=40){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(W,j);ctx.stroke();}

      // Cruz central
      ctx.strokeStyle = 'rgba(139,92,246,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
      ctx.setLineDash([]);

      // Pin del comercio
      ctx.beginPath(); ctx.arc(W/2, H/2, 16, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(139,92,246,0.2)'; ctx.fill();
      ctx.strokeStyle = '#8B5CF6'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.font = '16px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('📍', W/2, H/2);

      ctx.font = 'bold 11px Inter, Arial'; ctx.fillStyle = '#8B5CF6';
      ctx.fillText('Tu comercio', W/2, H/2 + 28);
      ctx.font = '10px Inter, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('Tocá para mover el pin', W/2, H - 14);
    }

    draw();

    // Tap mueve el pin y hace reverse geocoding
    canvas.addEventListener('click', async (e) => {
      const rect = canvas.getBoundingClientRect();
      const tx = (e.clientX - rect.left) / rect.width;
      const ty = (e.clientY - rect.top)  / rect.height;
      const scale = 4000;
      const W = canvas.width, H = canvas.height;
      // Convertir píxeles relativos a delta lat/lng
      const deltaLng = (tx - 0.5) * (W / scale);
      const deltaLat = -(ty - 0.5) * (H / scale / 1.3);
      _registerLat = lat + deltaLat;
      _registerLng = lng + deltaLng;
      draw();
      await _reverseGeocode(_registerLat, _registerLng);
      if (navigator.vibrate) navigator.vibrate(30);
    });
  }

  // ── Reverse geocoding con Nominatim ───────────────
  async function _reverseGeocode(lat, lng) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language':'es','User-Agent':'Fylox/1.0' } }
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
    } catch(e) { console.warn('[Map] Geocoding:', e.message); }
  }

  // ── Cargar comercios con geo ──────────────────────
  async function loadMerchantsWithLocation() {
    const statusEl = document.getElementById('map-location-status');
    const listEl   = document.getElementById('merchant-list');

    if (listEl) listEl.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--t2);font-size:13px">
        <div style="width:24px;height:24px;border:2px solid var(--c);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px"></div>
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
          renderMerchantsWithDistance(window._merchantsData);
          // Inicializar canvas con comercios
          requestAnimationFrame(() => initMainMap(lat, lng, window._merchantsData));

          const counterEl = document.getElementById('nearby-count');
          if (counterEl && data.total > 0)
            counterEl.textContent = `${data.total} comercios Pi cerca tuyo`;
        } catch(err) {
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
        } catch(err) {
          initMainMap(-34.6037, -58.3816, []);
          if (listEl) listEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--t2);font-size:13px">No se pudieron cargar los comercios.</div>`;
        }
      }
    );
  }

  // ── Render lista ──────────────────────────────────
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
          <div style="font-size:11px;color:var(--t2);margin-top:2px">${CAT[m.category]||m.category}${city}</div>
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

  return { loadMerchantsWithLocation, initRegisterMap, renderMerchantsWithDistance,
           selectMerchant, onMerchantRowClick, getUserCoords, getRegisterCoords };
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
