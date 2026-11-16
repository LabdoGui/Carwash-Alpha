/* Carwash — js/mapa-e-tour360.js
   Mapa das unidades (Leaflet + OpenStreetMap) e tour 360° (Pannellum). As bibliotecas vêm da internet
   e só são carregadas quando a tela de locais abre. */
'use strict';
/* ============ mapa e tour 360° (bibliotecas carregadas só quando a tela de locais abre) ============ */
const libs = {};
function loadLib(l) {
  if (!libs[l.js])
    libs[l.js] = new Promise((ok, fail) => {
      const c = document.createElement('link'),
        s = document.createElement('script');
      c.rel = 'stylesheet';
      c.href = l.css;
      s.src = l.js;
      s.async = true;
      s.onload = ok;
      s.onerror = () => {
        delete libs[l.js];
        c.remove();
        s.remove();
        fail(new Error('Falha ao carregar ' + l.js));
      };
      document.head.append(c, s);
    });
  return libs[l.js];
}
/* O mapa é criado uma vez e reaproveitado: a cada render() ele volta para dentro do novo #umap */
const MAPV = { el: null, map: null, mk: {}, on: {}, key: '', sel: null };
const PIN =
  '<svg viewBox="0 0 34 42" aria-hidden="true"><path d="M17 40.5S30.5 27.6 30.5 16a13.5 13.5 0 1 0-27 0c0 11.6 13.5 24.5 13.5 24.5z" fill="currentColor" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16" r="5.2" fill="#fff"/></svg>';
const pinIcon = on =>
  window.L.divIcon({
    className: '',
    html: '<div class="upin' + (on ? ' sel' : '') + '">' + PIN + '</div>',
    iconSize: [28, 35],
    iconAnchor: [14, 35],
    tooltipAnchor: [0, -34]
  });
function buildMap() {
  const L = window.L,
    m = (MAPV.map = L.map(MAPV.el, { scrollWheelZoom: false, minZoom: 10, maxZoom: 19 }));
  m.attributionControl.setPrefix(
    '<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>'
  );
  L.tileLayer(MAP_TILES, { attribution: MAP_ATTR, maxZoom: 19 }).addTo(m);
  UNITS.forEach(u => {
    MAPV.mk[u.id] = L.marker([u.lat, u.lng], { icon: pinIcon(false), riseOnHover: true })
      .addTo(m)
      .bindTooltip(u.id.replace('FMU ', ''), { direction: 'top' })
      .on('click', () => mapPick(u.id));
  });
  /* a rolagem do mouse só dá zoom depois de um clique no mapa, para não prender a rolagem da página */
  m.on('click', () => m.scrollWheelZoom.enable());
  m.on('mouseout', () => m.scrollWheelZoom.disable());
}
function syncMap() {
  const m = MAPV.map;
  if (!m) return;
  m.invalidateSize({ animate: false });
  const pl = S.screen === 'place' ? unitById(S.place.id) : null,
    sel = pl ? pl.id : S.browse ? null : S.draft.unit,
    key = pl ? 'p|' + pl.id : 'u',
    su = sel && unitById(sel);
  UNITS.forEach(u => {
    const k = MAPV.mk[u.id],
      on = u.id === sel;
    if (MAPV.on[u.id] !== on) {
      MAPV.on[u.id] = on;
      k.setIcon(pinIcon(on));
      k.setZIndexOffset(on ? 1000 : 0);
    }
    const e = k.getElement();
    if (e) e.setAttribute('aria-label', u.id + (on ? ' (selecionada)' : ''));
  });
  if (key !== MAPV.key) {
    if (pl) m.setView([pl.lat, pl.lng], 16, { animate: false });
    else
      m.fitBounds(
        UNITS.map(u => [u.lat, u.lng]),
        { padding: [26, 26], animate: false }
      );
  } else if (su && sel !== MAPV.sel) {
    const z = Math.max(m.getZoom(), 15);
    if (matchMedia('(prefers-reduced-motion:reduce)').matches)
      m.setView([su.lat, su.lng], z, { animate: false });
    else m.flyTo([su.lat, su.lng], z, { duration: 0.6 });
  }
  MAPV.key = key;
  MAPV.sel = sel;
}
function mountMap() {
  const box = $('#umap');
  if (!box) return;
  if (MAPV.el) {
    box.appendChild(MAPV.el);
    syncMap();
    return;
  }
  box.innerHTML = '<div class="mapmsg" role="status">Carregando mapa…</div>';
  loadLib(MAP_LIB)
    .then(() => {
      const b = $('#umap');
      if (!b) return;
      b.innerHTML = '';
      if (MAPV.el) b.appendChild(MAPV.el);
      else {
        MAPV.el = document.createElement('div');
        MAPV.el.className = 'umap-in';
        b.appendChild(MAPV.el);
        try {
          buildMap();
        } catch (e) {
          MAPV.el = MAPV.map = null;
          throw e;
        }
      }
      syncMap();
    })
    .catch(() => {
      const b = $('#umap');
      if (b)
        b.innerHTML =
          '<div class="mapmsg"><span>Não foi possível carregar o mapa. Verifique sua conexão.</span><button type="button" class="linkbtn" data-act="retryMap">Tentar de novo</button></div>';
    });
}
function openPlace(id, tab) {
  S.place = { id, tab: tab || 'fotos', i: 0, scene: 0 };
  go('place');
}
function mapPick(id) {
  if (S.screen === 'place') {
    if (S.place.id !== id) {
      S.place = { id, tab: 'mapa', i: 0, scene: 0 };
      render();
    }
  } else if (S.browse) openPlace(id);
  else actions.selUnit({ dataset: { id } });
}
const PANOV = { v: null };
function dropPano() {
  if (PANOV.v) {
    try {
      PANOV.v.destroy();
    } catch (e) {}
    PANOV.v = null;
  }
}
function mountPano(u) {
  const pick = () => {
      const sc = panoScenes(u);
      return sc[Math.min(S.place.scene || 0, sc.length - 1)];
    },
    s0 = pick();
  if (!s0 || !$('#pano')) return;
  loadLib(PANO_LIB)
    .then(() => {
      const el = $('#pano'),
        s = S.screen === 'place' && S.place.id === u.id && S.place.tab === 'tour' && pick();
      if (!el || !s || (s !== s0 && s.src !== s0.src)) return;
      dropPano();
      el.innerHTML = '';
      PANOV.v = window.pannellum.viewer(el, {
        type: 'equirectangular',
        panorama: s.src,
        autoLoad: true,
        autoRotate: -2,
        autoRotateInactivityDelay: 4000,
        hfov: 100,
        strings: {
          loadingLabel: 'Carregando…',
          fileAccessError: 'Não foi possível abrir a foto 360° (%s).',
          genericWebGLError: 'Seu navegador não conseguiu exibir o tour 360° (WebGL).',
          noPanoramaError: 'Nenhuma foto 360° configurada.',
          unknownError: 'Não foi possível abrir o tour 360°.'
        }
      });
    })
    .catch(() => {
      const el = $('#pano');
      if (el)
        el.innerHTML =
          '<div class="mapmsg">Não foi possível carregar o tour 360°. Verifique sua conexão.</div>';
    });
}
