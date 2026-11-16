/* Carwash — js/config.js
   CONFIGURAÇÕES: serviços e preços, unidades FMU (endereço, mapa, fotos e tour 360°), horários, colaboradores,
   senhas, e-mail de contato e a CHAVE PIX. */
'use strict';
/* ============ dados ============ */
const SERVICES = [
  {
    id: 'express',
    grp: 'Lavagens',
    name: 'Lavagem Externa Rápida',
    price: 80,
    desc: 'Lavagem externa rápida com secagem'
  },
  {
    id: 'ecologica',
    grp: 'Lavagens',
    name: 'Lavagem Ecológica (a seco)',
    price: 100,
    desc: 'Limpeza a seco, sem uso de água'
  },
  {
    id: 'ducha',
    grp: 'Lavagens',
    name: 'Ducha Proteção',
    price: 120,
    desc: 'Lavagem externa com ducha de proteção'
  },
  {
    id: 'simples',
    grp: 'Lavagens',
    name: 'Simples c/ Cera',
    price: 170,
    desc: 'Lavagem externa com aplicação de cera'
  },
  {
    id: 'completa',
    grp: 'Lavagens',
    name: 'Completa c/ Cera',
    price: 220,
    desc: 'Lavagem externa e interna com cera'
  },
  {
    id: 'motor',
    grp: 'Estética e cuidados',
    name: 'Lavagem de Motor',
    price: 90,
    desc: 'Limpeza e proteção do compartimento do motor'
  },
  {
    id: 'farois',
    grp: 'Estética e cuidados',
    name: 'Polimento de Faróis',
    price: 140,
    desc: 'Recupera a transparência dos faróis'
  },
  {
    id: 'couro',
    grp: 'Estética e cuidados',
    name: 'Hidratação de Couro',
    price: 180,
    desc: 'Limpeza e hidratação dos bancos de couro',
    only: 'Carro'
  },
  {
    id: 'bancos',
    grp: 'Estética e cuidados',
    name: 'Higienização de Bancos',
    price: 240,
    desc: 'Limpeza e higienização de estofados',
    only: 'Carro'
  },
  {
    id: 'higien',
    grp: 'Estética e cuidados',
    name: 'Higienização Profunda',
    price: 310,
    desc: 'Limpeza profunda e higienização do veículo'
  },
  {
    id: 'polimento',
    grp: 'Estética e cuidados',
    name: 'Polimento Técnico',
    price: 380,
    desc: 'Correção de riscos leves e brilho na pintura'
  },
  {
    id: 'cristal',
    grp: 'Estética e cuidados',
    name: 'Cristalização de Pintura',
    price: 450,
    desc: 'Proteção e brilho duradouro da pintura'
  }
];
/* ===== CONFIGURE AQUI OS LOCAIS: MAPA, FOTOS E TOUR 360° =====
   addr   : endereço mostrado no app
   lat,lng: posição do marcador (no Google Maps, clique com o botão direito no local para copiar as coordenadas)
   approx : true enquanto o endereço não estiver confirmado — o app avisa "localização aproximada"
   photos : fotos da unidade, ex.: ['fotos/liberdade-1.jpg','fotos/liberdade-2.jpg'] (arquivos na pasta do app ou URLs).
            Sem fotos, o app mostra lugares conhecidos perto da unidade, com fotos da Wikipédia/Wikimedia Commons (APIs abertas, sem chave).
   pano   : foto 360° da unidade (equirretangular, proporção 2:1), ex.: 'fotos/liberdade-360.jpg', ou um tour com vários
            ambientes: [{t:'Recepção',src:'fotos/recepcao-360.jpg'},{t:'Box de lavagem',src:'fotos/box-360.jpg'}].
            Só abre com o app hospedado (http/https). Sem pano, o tour usa o Google Street View do endereço.
   heading: direção inicial da câmera no Street View (0 = norte, 90 = leste, 180 = sul, 270 = oeste) */
const UNIT_INFO = {
  'FMU Liberdade': { addr: 'Av. da Liberdade, 899 — Liberdade', lat: -23.56054, lng: -46.63813 },
  'FMU Brigadeiro/Liberdade': {
    addr: 'Av. Brigadeiro Luís Antônio, 1089 — Bela Vista',
    lat: -23.55946,
    lng: -46.64211
  },
  'FMU Santo Amaro': { addr: 'Av. Santo Amaro, 1239 — Vila Nova Conceição', lat: -23.59513, lng: -46.67291 },
  'FMU Vila Mariana': {
    addr: 'Av. Lins de Vasconcelos, 3406 — Vila Mariana',
    lat: -23.5889,
    lng: -46.6338,
    approx: true
  },
  'FMU Vila Mariana II': { addr: '', lat: -23.5837, lng: -46.63274, approx: true },
  'FMU Vergueiro': { addr: 'Rua Vergueiro, 107 — Liberdade', lat: -23.56304, lng: -46.63876, approx: true },
  'FMU Itaim Bibi': { addr: 'Rua Iguatemi, 306 — Itaim Bibi', lat: -23.584, lng: -46.68255 },
  'FMU Morumbi': { addr: 'Av. Morumbi, 501 — Morumbi', lat: -23.57952, lng: -46.70598 },
  'FMU Centro': { addr: '', lat: -23.5503, lng: -46.63395, approx: true }
};
const UNITS = Object.keys(UNIT_INFO).map(n =>
  Object.assign(
    { id: n, city: n.replace('FMU ', '') + ' · São Paulo/SP', photos: [], pano: '' },
    UNIT_INFO[n]
  )
);
/* Mapa: biblioteca Leaflet + mapa público do OpenStreetMap (gratuito, sem chave, para volume baixo de acessos).
   Para outro provedor de mapas, troque MAP_TILES e MAP_ATTR. O tema escuro é aplicado por CSS (.leaflet-tile-pane). */
const MAP_LIB = {
  js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
};
const MAP_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const PANO_LIB = {
  js: 'https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.js',
  css: 'https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.css'
};
/* Fotos da região: lugares da Wikipédia perto da unidade + foto principal de cada um no Wikimedia Commons (APIs abertas, sem chave) */
const WIKI_NEAR =
  'https://pt.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch&ggsnamespace=0&ggslimit=40&prop=pageimages&piprop=name';
const COMMONS_FILES =
  'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url%7Cmime%7Csize%7Cextmetadata&iiextmetadatafilter=Artist%7CLicenseShortName&iiurlwidth=500&titles=';
const GMAPS_KEY =
  ''; /* opcional: chave da Google Maps Embed API (gratuita). Vazio = Street View incorporado sem chave. */
const SLOTS = Array.from({ length: 10 }, (_, i) => pad(8 + i) + ':00');
const SUBS = { Carro: ['Sedan', 'Hatch', 'SUV'], Moto: ['Custom', 'Esportiva'] };
const COLORS = [
  'Branco',
  'Preto',
  'Prata',
  'Cinza',
  'Vermelho',
  'Azul',
  'Verde',
  'Amarelo',
  'Marrom',
  'Laranja'
];
const STATUSES = ['Aguardando', 'Iniciando', 'Em Lavagem', 'Com Problema', 'Concluído'];
const STATUSES_ALL = STATUSES.concat(['Cancelado']);
const ADMIN_PASS = 'Admin@2026';
const STAFF = ['Eziel', 'Guilherme', 'Murilo', 'Eduarda', 'Lucas'],
  staffPass = n => n + '@2026';
const SUPPORT_EMAIL = 'murilosantos0933@gmail.com'; /* e-mail de contato mostrado ao cliente */
/* ===== CONFIGURE AQUI O SEU PIX =====
   PIX_KEY : sua chave Pix (e-mail, CPF/CNPJ só com números, celular no formato +5511999999999 ou chave aleatória)
   PIX_NAME: nome de quem recebe (até 25 letras, MAIÚSCULAS, sem acento)
   PIX_CITY: cidade (até 15 letras, MAIÚSCULAS, sem acento)
   Enquanto a chave abaixo não for trocada, o app fica em modo demonstração (pagamento simulado). */
const PIX_KEY = 'pix@carwash.example',
  PIX_NAME = 'CARWASH',
  PIX_CITY = 'SAO PAULO';
const PIX_DEMO = PIX_KEY === 'pix@carwash.example',
  PIX_MINUTES = 15;
