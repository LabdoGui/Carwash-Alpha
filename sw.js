// Carwash — sw.js (service worker)
// Guarda os arquivos do app no celular para ele abrir mesmo sem internet.
// Troque a versão (V) sempre que publicar uma atualização.
const V = 'carwash-v6';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/estilo.css',
  './js/tema.js',
  './js/qrcode.js',
  './js/utilidades.js',
  './js/icones-e-logotipo.js',
  './js/logo-comprovante.js',
  './js/config.js',
  './js/banco-local.js',
  './js/validacoes.js',
  './js/interface.js',
  './js/regras-de-negocio.js',
  './js/pix.js',
  './js/comprovante-pdf.js',
  './js/telas-cliente.js',
  './js/telas-unidades.js',
  './js/tela-colaborador.js',
  './js/painel-admin.js',
  './js/exportar-excel.js',
  './js/painel-admin-telas.js',
  './js/janelas.js',
  './js/mapa-e-tour360.js',
  './js/navegacao.js',
  './js/eventos.js',
  './js/dados-demonstracao.js',
  './js/app.js',
  './img/logo-carro-claro.webp',
  './img/logo-carro-escuro.webp',
  './img/logo-completo-claro.webp',
  './img/logo-completo-escuro.webp',
  './img/logo-comprovante.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches
      .keys()
      .then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // rede primeiro (sempre a versão mais nova); sem internet, usa a cópia guardada
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const c = r.clone();
        caches.open(V).then(x => x.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
