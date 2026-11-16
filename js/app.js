/* Carwash — js/app.js
   Inicia o app: instalação no celular (PWA), modo offline e primeira tela. */
'use strict';
/* ============ app instalável (PWA) ============ */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  S.installEv = e;
  if (S.screen === 'login' && !S.modal) render();
});
window.addEventListener('appinstalled', () => {
  S.installEv = null;
  toast('Aplicativo instalado!');
});
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol))
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

/* ============ início ============ */
(function init() {
  try {
    const id = localStorage.getItem('carwash.session');
    const u = id && D.users.find(x => x.id === id);
    if (u) {
      S.user = u;
      S.screen = 'home';
    }
    if (sessionStorage.getItem('carwash.admin') === '1') S.adminOk = true;
    const sn = sessionStorage.getItem('carwash.staff');
    if (STAFF.includes(sn)) {
      S.staffOk = true;
      S.staffName = sn;
    }
  } catch (e) {}
  setTheme(curTheme());
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    D = loadDB();
    if (S.screen === 'admin') {
      S._snap = e.newValue;
      const a = document.activeElement;
      if (!(a && (a.tagName === 'SELECT' || a.id === 'admQ'))) render();
    } else if (S.screen === 'time') {
      render();
    } else if (S.screen === 'mybookings' && !S.modal) {
      render();
    }
  });
  render();
  window.Carwash = {
    S,
    go,
    setTheme,
    seedDemo,
    clearDemo,
    reset: () => {
      localStorage.clear();
      sessionStorage.clear();
      location.reload();
    },
    db: () => D
  };
})();
