/* Carwash — js/telas-unidades.js
   Telas das unidades: escolha do local (mapa + lista), "Nossas unidades" e a página de cada unidade
   com mapa, fotos da região e tour 360°. */
'use strict';
/* TELA 04 — Local (mapa + lista). Com S.browse a mesma tela vira "Nossas unidades", fora do agendamento */
const unitById = id => UNITS.find(u => u.id === id);
const unitLine = u => esc(u.addr || u.city) + (u.approx ? ' · localização aproximada' : '');
screens.unit = () => {
  const br = S.browse,
    ico = u =>
      '<span class="ico">' +
      ic('pin') +
      '</span><span class="txt"><b>' +
      u.id +
      '</b><span>' +
      unitLine(u) +
      '</span>';
  const rows = UNITS.map(u =>
    br
      ? '<button type="button" class="opt" data-act="place" data-id="' +
        u.id +
        '">' +
        ico(u) +
        '</span><span class="chev">' +
        ic('back') +
        '</span></button>'
      : '<div class="opt' +
        (S.draft.unit === u.id ? ' sel' : '') +
        '" role="radio" aria-checked="' +
        (S.draft.unit === u.id) +
        '" tabindex="0" data-act="selUnit" data-id="' +
        u.id +
        '">' +
        ico(u) +
        '<button type="button" class="linkbtn" data-act="place" data-id="' +
        u.id +
        '">' +
        ic('image') +
        'Fotos e tour 360°</button></span><span class="tick">' +
        ic('check') +
        '</span></div>'
  ).join('');
  return (
    (br
      ? backBtn('home') +
        '<h1>Nossas unidades</h1><p class="sub">Unidades FMU na cidade de São Paulo. Toque em uma unidade para ver o mapa, as fotos e o tour 360°.</p>'
      : stepper(2) +
        backBtn('services') +
        '<h1>Onde você quer lavar?</h1><p class="sub">Unidades FMU na cidade de São Paulo. Escolha no mapa ou na lista.</p>') +
    '<div id="umap" class="umap" role="region" aria-label="Mapa das unidades"></div>' +
    (br
      ? '<div>' + rows + '</div>'
      : '<div role="radiogroup" aria-label="Unidades">' +
        rows +
        '</div>' +
        '<div class="stick"><button class="btn primary" data-act="go" data-to="time" ' +
        (S.draft.unit ? '' : 'disabled') +
        '>' +
        (S.draft.unit ? 'Continuar · ' + esc(S.draft.unit) : 'Continuar') +
        '</button></div>')
  );
};

/* TELA 04B — Unidade: mapa, fotos e tour 360° */
const PLACE_TABS = [
  ['mapa', 'map', 'Mapa'],
  ['fotos', 'image', 'Fotos'],
  ['tour', 'pano', 'Tour 360°']
];
screens.place = () => {
  const u = unitById(S.place && S.place.id);
  if (!u) return '';
  const tab = S.place.tab,
    ll = u.lat + ',' + u.lng;
  const body =
    tab === 'mapa'
      ? '<div id="umap" class="umap big" role="region" aria-label="Mapa: ' + esc(u.id) + '"></div>'
      : tab === 'fotos'
        ? '<div id="gal">' + galHtml(u) + '</div>'
        : tourHtml(u);
  return (
    backBtn('unit', S.browse ? 'Todas as unidades' : 'Voltar') +
    '<div class="eyebrow">Unidade</div><h1>' +
    esc(u.id) +
    '</h1><p class="sub">' +
    esc(u.addr ? u.addr + ' · São Paulo/SP' : u.city) +
    '</p>' +
    '<div class="tabs" role="tablist" aria-label="Conheça a unidade">' +
    PLACE_TABS.map(
      t =>
        '<button type="button" role="tab" id="tab-' +
        t[0] +
        '" aria-selected="' +
        (tab === t[0]) +
        '" aria-controls="ppanel" data-act="placeTab" data-v="' +
        t[0] +
        '">' +
        ic(t[1]) +
        t[2] +
        '</button>'
    ).join('') +
    '</div>' +
    '<div id="ppanel" role="tabpanel" aria-labelledby="tab-' +
    tab +
    '">' +
    body +
    '</div>' +
    (u.approx
      ? '<p class="notice" style="margin-top:12px">Localização aproximada no mapa. Confirme o endereço com a equipe antes de sair.</p>'
      : '') +
    '<div class="uacts"><button class="btn primary" data-act="pickUnit" data-id="' +
    u.id +
    '">' +
    (S.browse ? 'Agendar nesta unidade' : 'Escolher esta unidade') +
    '</button>' +
    '<a class="btn outline" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' +
    ll +
    '">' +
    ic('route') +
    'Como chegar</a></div>'
  );
};

/* Fotos: as da unidade (UNIT_INFO.photos) ou, sem elas, fotos de lugares conhecidos perto da unidade */
const PHOTOS = {};
const ownPhotos = u =>
  (u.photos || []).map(p =>
    typeof p === 'string'
      ? { thumb: p, full: p, title: '', credit: '', page: '' }
      : { thumb: p.src, full: p.src, title: p.t || '', credit: p.credit || '', page: '' }
  );
const wmUrl = s => {
  try {
    const x = new URL(s);
    return x.protocol === 'https:' && /(^|\.)wikimedia\.org$/.test(x.hostname) ? x.href : '';
  } catch (e) {
    return '';
  }
};
const plain = h => {
  try {
    return (new DOMParser().parseFromString(String(h || ''), 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (e) {
    return '';
  }
};
const getJSON = url =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });
async function regionPhotos(u) {
  let near = [];
  for (const r of [1200, 4000]) {
    /* raio em metros; amplia se houver poucos lugares perto */
    const j = await getJSON(WIKI_NEAR + '&ggsradius=' + r + '&ggscoord=' + u.lat + '%7C' + u.lng);
    near = Object.values((j.query && j.query.pages) || {})
      .sort((a, b) => a.index - b.index)
      .filter(
        p =>
          p.pageimage &&
          /\.jpe?g$/i.test(p.pageimage) &&
          !/mapa|\bmap\b|locator|localiza|bandeira|flag|bras[aã]o|logo|escudo/i.test(p.pageimage)
      );
    if (near.length >= 6) break;
  }
  const seen = new Set(),
    files = [];
  near.forEach(p => {
    const f = 'File:' + p.pageimage.replace(/_/g, ' ');
    if (!seen.has(f) && files.length < 20) {
      seen.add(f);
      files.push({ f, place: p.title });
    }
  });
  if (!files.length) return [];
  const j = await getJSON(COMMONS_FILES + encodeURIComponent(files.map(x => x.f).join('|'))),
    info = {};
  Object.values((j.query && j.query.pages) || {}).forEach(p => {
    if (p.imageinfo) info[p.title] = p.imageinfo[0];
  });
  const out = [];
  for (const x of files) {
    const i = info[x.f];
    if (!i || i.mime !== 'image/jpeg' || i.width < 640 || i.height < 400) continue;
    const r = i.width / i.height;
    if (r < 0.5 || r > 2.4) continue;
    const thumb = wmUrl(i.thumburl),
      page = wmUrl(i.descriptionurl);
    if (!thumb || !page) continue;
    const m = i.extmetadata || {};
    out.push({
      thumb,
      page,
      title: x.place,
      full: i.width > 1280 ? thumb.replace(/\/\d+px-/, '/1280px-') : wmUrl(i.url) || thumb,
      credit: [
        plain(m.Artist && m.Artist.value).slice(0, 60),
        plain(m.LicenseShortName && m.LicenseShortName.value)
      ]
        .filter(Boolean)
        .join(' · ')
    });
    if (out.length === 9) break;
  }
  return out;
}
function loadPhotos(u) {
  if (PHOTOS[u.id]) return;
  PHOTOS[u.id] = { loading: true };
  const done = g => {
    PHOTOS[u.id] = g;
    if (S.screen === 'place' && S.place.id === u.id && S.place.tab === 'fotos' && !S.modal) {
      const e = $('#gal');
      if (e) e.innerHTML = galHtml(u);
    }
  };
  regionPhotos(u).then(
    list => done({ list }),
    () => done({ err: true })
  );
}
function galHtml(u) {
  const own = ownPhotos(u);
  if (own.length) PHOTOS[u.id] = { list: own, own: true };
  const g = PHOTOS[u.id];
  if (!g || g.loading) return '<div class="card center muted" role="status">Carregando fotos…</div>';
  if (g.err)
    return '<div class="card center"><p class="muted">Não foi possível carregar as fotos. Verifique sua conexão.</p><button type="button" class="btn ghost sm" style="margin-top:12px" data-act="retryPhotos">Tentar de novo</button></div>';
  if (!g.list.length) return '<div class="card center muted">Ainda não há fotos desta unidade.</div>';
  return (
    '<div class="gal">' +
    g.list
      .map(
        (p, i) =>
          '<button type="button" class="ph" data-act="photo" data-i="' +
          i +
          '" aria-label="Ampliar foto ' +
          (i + 1) +
          ' de ' +
          g.list.length +
          (p.title ? ': ' + esc(p.title) : '') +
          '"><img loading="lazy" decoding="async" alt="" src="' +
          esc(p.thumb) +
          '">' +
          (p.title ? '<span class="cap" aria-hidden="true">' + esc(p.title) + '</span>' : '') +
          '</button>'
      )
      .join('') +
    '</div>' +
    '<p class="galnote">' +
    (g.own
      ? 'Fotos da unidade. Toque para ampliar.'
      : 'Lugares conhecidos perto da unidade, com fotos do Wikimedia Commons. Toque para ampliar e ver o crédito.') +
    '</p>'
  );
}
function photoModal() {
  const g = PHOTOS[S.place && S.place.id],
    l = (g && g.list) || [],
    i = S.place ? S.place.i : 0,
    p = l[i];
  if (!p) return '';
  const nav = (d, lbl, cls) =>
    '<button type="button"' +
    (cls ? ' class="' + cls + '"' : '') +
    ' data-act="photoNav" data-d="' +
    d +
    '" aria-label="' +
    lbl +
    '"' +
    (l.length > 1 ? '' : ' disabled') +
    '>' +
    ic('back') +
    '</button>';
  return (
    '<div class="overlay lb" data-act="closeModal"><figure class="lbox" role="dialog" aria-modal="true" aria-label="Foto ' +
    (i + 1) +
    ' de ' +
    l.length +
    '">' +
    '<img alt="' +
    esc(p.title) +
    '" src="' +
    esc(p.full) +
    '" data-fb="' +
    esc(p.thumb) +
    '">' +
    '<figcaption>' +
    (p.title ? '<b>' + esc(p.title) + '</b><br>' : '') +
    esc(p.credit) +
    (p.page
      ? (p.credit ? ' · ' : '') +
        '<a href="' +
        esc(p.page) +
        '" target="_blank" rel="noopener">Ver no Wikimedia Commons</a>'
      : '') +
    '</figcaption>' +
    '<div class="lbnav">' +
    nav(-1, 'Foto anterior', '') +
    '<span>' +
    (i + 1) +
    ' / ' +
    l.length +
    '</span>' +
    nav(1, 'Próxima foto', 'nx') +
    '<button type="button" id="lbClose" data-act="closeModal">Fechar</button></div></figure></div>'
  );
}

/* Tour 360°: foto 360° da unidade (UNIT_INFO.pano, visualizador Pannellum) ou, sem ela, Google Street View do endereço */
const panoScenes = u =>
  !u.pano
    ? []
    : (Array.isArray(u.pano) ? u.pano : [u.pano]).map((p, i) =>
        typeof p === 'string' ? { t: 'Ambiente ' + (i + 1), src: p } : p
      );
const svUrl = u =>
  GMAPS_KEY
    ? 'https://www.google.com/maps/embed/v1/streetview?key=' +
      encodeURIComponent(GMAPS_KEY) +
      '&location=' +
      u.lat +
      ',' +
      u.lng +
      '&heading=' +
      (u.heading || 0) +
      '&fov=90'
    : 'https://www.google.com/maps?layer=c&cbll=' +
      u.lat +
      ',' +
      u.lng +
      '&cbp=11,' +
      (u.heading || 0) +
      ',0,0,0&output=svembed';
function tourHtml(u) {
  const sc = panoScenes(u);
  if (sc.length) {
    const n = Math.min(S.place.scene || 0, sc.length - 1);
    return (
      (sc.length > 1
        ? '<div class="chips" role="radiogroup" aria-label="Ambientes do tour" style="margin-bottom:10px">' +
          sc
            .map(
              (s, i) =>
                '<button type="button" class="chip" role="radio" aria-checked="' +
                (i === n) +
                '" data-act="scene" data-i="' +
                i +
                '">' +
                esc(s.t) +
                '</button>'
            )
            .join('') +
          '</div>'
        : '') +
      '<div class="pano" role="region" aria-label="Tour 360° de ' +
      esc(u.id) +
      '"><div id="pano"><div class="mapmsg" role="status">Carregando tour 360°…</div></div></div>' +
      '<p class="galnote">Arraste para olhar ao redor. Use dois dedos ou a rolagem do mouse para aproximar.</p>'
    );
  }
  return (
    '<div class="pano"><iframe title="Tour 360° — ' +
    esc(u.id) +
    '" src="' +
    esc(svUrl(u)) +
    '" loading="lazy" allow="accelerometer; gyroscope; fullscreen"></iframe></div>' +
    '<p class="galnote">Vista 360° da rua pelo Google Street View' +
    (u.approx ? ', em um ponto aproximado' : '') +
    '. Arraste para olhar ao redor. <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' +
    u.lat +
    ',' +
    u.lng +
    '" target="_blank" rel="noopener">Abrir no Google Maps</a></p>'
  );
}
