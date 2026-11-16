/* Carwash — js/eventos.js
   O que acontece em cada toque/clique e no envio de cada formulário. */
'use strict';
/* ============ eventos ============ */
const actions = {
  theme: t => setTheme(t.dataset.t),
  go: t => go(t.dataset.to),
  togglePw: t => {
    const i = document.getElementById(t.dataset.target);
    const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    t.innerHTML = ic(show ? 'eyeoff' : 'eye');
    t.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
  },
  logout: () => {
    releaseHold();
    S.resched = null;
    S.user = null;
    S.draft = { vehicleId: null, serviceId: null, unit: null, date: null, time: null };
    try {
      localStorage.removeItem('carwash.session');
    } catch (e) {}
    go('login');
  },
  installApp: async () => {
    const e = S.installEv;
    if (!e) return;
    e.prompt();
    try {
      await e.userChoice;
    } catch (_) {}
    S.installEv = null;
    render();
  },
  openStaff: () => {
    if (S.staffOk) {
      go('staff');
    } else {
      S.modal = 'staff';
      render();
    }
  },
  exitStaff: () => {
    S.staffOk = false;
    S.staffName = '';
    S.staff = { code: '', id: null, prob: false, ptxt: '' };
    try {
      sessionStorage.removeItem('carwash.staff');
    } catch (e) {}
    go('login');
  },
  stProblem: () => {
    S.staff.prob = !S.staff.prob;
    render();
    if (S.staff.prob) {
      const t = $('#ptxt');
      if (t) t.focus();
    }
  },
  stSet: t => {
    D = loadDB();
    const b = D.bookings.find(x => x.id === S.staff.id);
    if (!b || b.status === 'Cancelado') return;
    if (b.status === t.dataset.st) {
      toast('Esse já é o status atual');
      return;
    }
    setStatus(b, t.dataset.st, '', S.staffName);
    S.staff.prob = false;
    S.staff.ptxt = '';
    save();
    S._snap = localStorage.getItem(KEY);
    render();
    toast('Status atualizado: ' + t.dataset.st + ' — o painel do admin já foi atualizado');
  },
  staffPdf: () => {
    const b = D.bookings.find(x => x.id === S.staff.id);
    if (b) downloadReceipt(b);
  },
  openAdmin: () => {
    if (S.adminOk) {
      go('admin');
    } else {
      S.modal = 'admin';
      render();
    }
  },
  closeModal: (t, e) => {
    if (e.target === t || t.tagName === 'BUTTON') {
      S.modal = null;
      render();
    }
  },
  exitAdmin: () => {
    S.adminOk = false;
    try {
      sessionStorage.removeItem('carwash.admin');
    } catch (e) {}
    go('login');
  },
  seedDemo: () => {
    seedDemo();
    toast('Dados de demonstração carregados');
    render();
  },
  clearDemo: () => {
    clearDemo();
    toast('Dados de demonstração removidos');
    render();
  },
  selCat: t => {
    S.gv.cat = t.dataset.v;
    S.gv.sub = SUBS[S.gv.cat][0];
    render();
  },
  selSub: t => {
    S.gv.sub = t.dataset.v;
    render();
  },
  showForm: () => {
    S.showForm = true;
    render();
    const m = $('#model');
    if (m) m.focus();
  },
  selVeh: (t, e) => {
    if (e.target.closest('[data-act="delVeh"]')) return;
    S.draft.vehicleId = t.dataset.id;
    render();
  },
  delVeh: (t, e) => {
    e.stopPropagation();
    const id = t.dataset.id;
    if (D.bookings.some(b => b.vehicleId === id)) {
      toast('Este veículo possui agendamentos e não pode ser removido.');
      return;
    }
    if (!confirm('Remover este veículo da garagem?')) return;
    D.vehicles = D.vehicles.filter(v => v.id !== id);
    if (S.draft.vehicleId === id) S.draft.vehicleId = null;
    save();
    render();
  },
  selSvc: t => {
    S.draft.serviceId = t.dataset.id;
    render();
  },
  selUnit: t => {
    releaseHold();
    S.draft.unit = t.dataset.id;
    S.draft.time = null;
    render();
  },
  openUnits: () => {
    S.browse = true;
    go('unit');
  },
  place: t => openPlace(t.dataset.id),
  placeTab: t => {
    S.place.tab = t.dataset.v;
    render();
    const b = $('#tab-' + S.place.tab);
    if (b) b.focus({ preventScroll: true });
  },
  pickUnit: t => {
    const id = t.dataset.id;
    if (S.browse) {
      S.browse = false;
      S.resched = null;
      S.showForm = false;
      S.draft = { vehicleId: null, serviceId: null, unit: id, date: null, time: null, pref: '' };
      go('garage');
    } else {
      releaseHold();
      S.draft.unit = id;
      S.draft.time = null;
      go('time');
    }
  },
  retryMap: () => mountMap(),
  retryPhotos: () => {
    delete PHOTOS[S.place.id];
    render();
  },
  photo: t => {
    S.place.i = +t.dataset.i;
    S.modal = 'photo';
    render();
    const b = $('#lbClose');
    if (b) b.focus();
  },
  photoNav: t => {
    const g = PHOTOS[S.place.id],
      n = g && g.list ? g.list.length : 0;
    if (n < 2) return;
    S.place.i = (S.place.i + +t.dataset.d + n) % n;
    render();
    const b = $('.lbnav [data-d="' + t.dataset.d + '"]');
    if (b) b.focus();
  },
  scene: t => {
    S.place.scene = +t.dataset.i;
    render();
  },
  selDate: t => {
    releaseHold();
    S.draft.date = t.dataset.k;
    S.draft.time = null;
    render();
  },
  selTime: t => {
    S.draft.time = t.dataset.t;
    holdSlot();
    render();
  },
  selPay: t => {
    const p = t.dataset.id;
    S.draft.pay = p;
    if (p === 'pix') go('pix');
    else {
      const b = createBooking('local', false);
      if (b) go('confirm');
    }
  },

  copyPix: async () => {
    const txt = S.pix.payload;
    try {
      await navigator.clipboard.writeText(txt);
      toast('Código Pix copiado');
    } catch (e) {
      const ta = $('#copia');
      ta.select();
      try {
        document.execCommand('copy');
        toast('Código Pix copiado');
      } catch (_) {
        toast('Selecione e copie o código manualmente');
      }
    }
  },
  newPix: () => {
    S.pix = null;
    clearTimers();
    holdSlot();
    render();
  },
  simPix: () => {
    if (S.pix.expires <= Date.now()) {
      toast('Este Pix expirou. Gere um novo código.');
      return;
    }
    if (createBooking('pix', PIX_DEMO, { pixTxid: S.pix.txid })) go('confirm');
  },
  confirmPix: t => {
    D = loadDB();
    const b = D.bookings.find(x => x.id === t.dataset.id);
    if (!b || b.paid) return;
    b.paid = true;
    b.paidAt = Date.now();
    (b.log = b.log || []).push({
      st: b.status,
      at: Date.now(),
      by: S.screen === 'staff' ? S.staffName : 'Administrador',
      note: 'Pagamento Pix confirmado'
    });
    save();
    S._snap = localStorage.getItem(KEY);
    render();
    toast('Pagamento Pix confirmado');
  },
  startBooking: () => {
    S.draft = { vehicleId: null, serviceId: null, unit: null, date: null, time: null, pref: '' };
    S.resched = null;
    S.showForm = false;
    S.browse = false;
    go('garage');
  },
  selPref: t => {
    S.draft.pref = t.dataset.v;
    render();
  },
  selTerms: t => {
    S.terms = t.dataset.v;
    $$('[data-act=selTerms]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.v === S.terms)));
    const ban = $('#termsBan');
    if (ban) ban.style.display = S.terms === 'no' ? '' : 'none';
    setErr('terms', '');
  },
  openReq: t => {
    S.req = { bid: t.dataset.id, type: t.dataset.type };
    S.modal = 'req';
    render();
  },
  openCancel: t => {
    S.req = { bid: t.dataset.id, type: 'Cancelamento' };
    S.modal = 'cancel';
    render();
  },
  reschedule: t => {
    const b = D.bookings.find(x => x.id === t.dataset.id);
    if (!b || b.status !== 'Aguardando') {
      toast('Só é possível reagendar antes de a lavagem começar.');
      return;
    }
    releaseHold();
    S.resched = b.id;
    S.draft = {
      vehicleId: b.vehicleId,
      serviceId: b.serviceId,
      unit: b.unit,
      date: b.date,
      time: null,
      obs: b.obs,
      pref: b.pref || ''
    };
    go('time');
  },
  doResched: () => {
    D = loadDB();
    const b = D.bookings.find(x => x.id === S.resched),
      d = S.draft;
    if (!b || !d.time) return;
    if (b.status !== 'Aguardando') {
      toast('Só é possível reagendar antes de a lavagem começar.');
      go('mybookings');
      return;
    }
    if (!slotFree(b.unit, d.date, d.time)) {
      toast('Esse horário acabou de ser ocupado. Escolha outro.');
      d.time = null;
      render();
      return;
    }
    const old = brDate(b.date) + ' às ' + b.time,
      nw = brDate(d.date) + ' às ' + d.time;
    b.date = d.date;
    b.time = d.time;
    (b.log = b.log || []).push({
      st: b.status,
      at: Date.now(),
      by: 'Cliente',
      note: 'Reagendado de ' + old + ' para ' + nw
    });
    addReq(b, 'Reagendamento', 'De ' + old + ' para ' + nw, 'Concluída');
    D.holds = D.holds.filter(h => h.userId !== S.user.id);
    save();
    S._snap = localStorage.getItem(KEY);
    S.resched = null;
    S.draft = { vehicleId: null, serviceId: null, unit: null, date: null, time: null, pref: '' };
    toast('Agendamento reagendado para ' + nw);
    go('mybookings');
  },
  pdfBk: t => {
    const b = D.bookings.find(x => x.id === t.dataset.id);
    if (b) downloadReceipt(b);
  },
  resolveReq: t => {
    D = loadDB();
    const r = D.requests.find(x => x.id === t.dataset.id);
    if (!r) return;
    r.status = 'Concluída';
    r.doneAt = Date.now();
    save();
    S._snap = localStorage.getItem(KEY);
    render();
    toast('Solicitação marcada como resolvida');
  },
  xlsPanel: t => xlsPanel(t.dataset.p),
  xlsAll: () => xlsAll(),
  jump: t => {
    const e = document.getElementById(t.dataset.id);
    if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  pdf: () => downloadReceipt(S.last),
  moreAll: () => {
    S.adm.limit += 12;
    refreshAll();
  },
  newBooking: () => actions.startBooking()
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const a = actions[t.dataset.act];
  if (a) {
    if (t.tagName === 'A') return;
    a(t, e);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.modal) {
    S.modal = null;
    render();
    return;
  }
  if (S.modal === 'photo' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    actions.photoNav({ dataset: { d: e.key === 'ArrowLeft' ? '-1' : '1' } });
    return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=radio][data-act]')) {
    e.preventDefault();
    e.target.click();
  }
});
/* foto que não carrega: a ampliada volta para a miniatura; a miniatura some da galeria */
document.addEventListener(
  'error',
  e => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    if (t.dataset.fb) {
      const f = t.dataset.fb;
      delete t.dataset.fb;
      t.src = f;
    } else if (t.closest('.gal .ph')) t.closest('.ph').hidden = true;
  },
  true
);
document.addEventListener('input', e => {
  const t = e.target,
    m = t.dataset && t.dataset.mask;
  if (m === 'phone') t.value = maskPhone(t.value);
  if (m === 'plate') t.value = maskPlate(t.value);
  if (m === 'upper') t.value = t.value.toUpperCase();
  if (t.id === 'admQ') {
    S.adm.q = t.value;
    S.adm.limit = 12;
    refreshAll();
  }
  if (t.dataset && t.dataset.gv) S.gv[t.dataset.gv] = t.value;
  if (t.id === 'obs') {
    S.draft.obs = t.value;
    const n = $('#obsN');
    if (n) n.textContent = t.value.length + '/200';
  }
  if (t.id === 'ptxt') S.staff.ptxt = t.value;
  if (t.id === 'password' && t.closest('[data-form=register]')) {
    const p = t.value;
    $$('#rules li').forEach((li, i) => li.classList.toggle('ok', PASS_RULES[i][1](p)));
  }
  if (t.id && t.closest('.field')) setErr(t.id, '');
  const fe = t.closest && t.closest('form') && t.closest('form').querySelector('.formerr');
  if (fe) fe.textContent = '';
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('[data-status]')) {
    const b = D.bookings.find(x => x.id === t.dataset.status);
    if (b) {
      setStatus(b, t.value, '', 'Administrador');
      save();
      S._snap = localStorage.getItem(KEY);
      const id = t.id;
      render();
      const el = document.getElementById(id);
      if (el) el.focus();
    }
  }
  if (t.id === 'admU') {
    S.adm.unit = t.value;
    S.adm.limit = 12;
    refreshAll();
  }
  if (t.id === 'admS') {
    S.adm.status = t.value;
    S.adm.limit = 12;
    refreshAll();
  }
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const h = forms[f.dataset.form];
  if (h) await h(f);
});

const forms = {
  async login(f) {
    const email = f.email.value.trim().toLowerCase(),
      pw = f.password.value;
    let ok = true;
    setErr('email', '');
    setErr('password', '');
    if (!email) {
      setErr('email', 'Informe seu e-mail.');
      ok = false;
    } else if (!EMAIL_RE.test(email)) {
      setErr('email', 'Use um e-mail @gmail ou @outlook.');
      ok = false;
    }
    if (!pw) {
      setErr('password', 'Informe sua senha.');
      ok = false;
    }
    if (!ok) {
      failForm(f);
      return;
    }
    const u = D.users.find(x => x.email === email && x.hash),
      h = await hashPw(email, pw);
    if (!u || u.hash !== h) {
      setErr('password', 'E-mail ou senha incorretos.');
      failForm(f);
      return;
    }
    startSession(u);
  },
  async register(f) {
    const name = f.name.value.trim().replace(/\s+/g, ' '),
      social = f.social.value.trim().replace(/\s+/g, ' '),
      useSocial = f.useSocial.checked,
      email = f.email.value.trim().toLowerCase(),
      phone = f.phone.value,
      pw = f.password.value;
    let ok = true;
    ['name', 'social', 'email', 'phone', 'password', 'terms'].forEach(x => setErr(x, ''));
    if (name.split(' ').filter(x => x.length > 1).length < 2) {
      setErr('name', 'Informe nome e sobrenome.');
      ok = false;
    }
    if (social && social.length < 2) {
      setErr('social', 'Nome social muito curto.');
      ok = false;
    }
    if (useSocial && !social) {
      setErr('social', 'Informe o nome social ou desmarque a opção abaixo.');
      ok = false;
    }
    if (!EMAIL_RE.test(email)) {
      setErr('email', 'Use um e-mail @gmail ou @outlook válido.');
      ok = false;
    } else if (D.users.some(u => u.email === email)) {
      setErr('email', 'Este e-mail já está cadastrado. Tente entrar.');
      ok = false;
    }
    if (!validPhone(phone)) {
      setErr('phone', 'Informe um celular válido, com DDD.');
      ok = false;
    }
    if (!strongPass(pw)) {
      setErr('password', 'A senha ainda não atende a todos os requisitos.');
      ok = false;
    }
    if (S.terms !== 'yes') {
      setErr(
        'terms',
        S.terms === 'no'
          ? 'Sem concordar com as regras e a política de uso não é possível criar a conta.'
          : 'Leia as regras e escolha “Concordo” para continuar.'
      );
      ok = false;
      const ban = $('#termsBan');
      if (ban && S.terms === 'no') ban.style.display = '';
    }
    if (!ok) {
      failForm(f);
      return;
    }
    const u = {
      id: uid(),
      name,
      socialName: social,
      useSocial: !!(social && useSocial),
      email,
      phone: maskPhone(phone),
      hash: await hashPw(email, pw),
      termsAt: Date.now(),
      termsV: TERMS_V,
      createdAt: Date.now()
    };
    D.users.push(u);
    save();
    S.terms = null;
    startSession(u);
  },
  async vehicle(f) {
    const g = S.gv,
      model = f.model.value.trim(),
      color = f.color.value.trim(),
      plate = maskPlate(f.plate.value);
    let ok = true;
    ['model', 'color', 'plate'].forEach(x => setErr(x, ''));
    if (model.length < 2) {
      setErr('model', 'Informe o modelo.');
      ok = false;
    }
    if (color.length < 3) {
      setErr('color', 'Informe a cor.');
      ok = false;
    }
    if (!PLATE_RE.test(plate)) {
      setErr('plate', 'Placa Mercosul inválida. Ex.: ABC1D23.');
      ok = false;
    } else if (D.vehicles.some(v => v.plate === plate)) {
      setErr('plate', 'Esta placa já está cadastrada.');
      ok = false;
    }
    if (!ok) {
      failForm(f);
      return;
    }
    const v = {
      id: uid(),
      userId: S.user.id,
      cat: g.cat,
      sub: g.sub,
      model,
      color: color[0].toUpperCase() + color.slice(1),
      plate
    };
    D.vehicles.push(v);
    save();
    S.draft.vehicleId = v.id;
    S.gv.model = S.gv.color = S.gv.plate = '';
    S.showForm = false;
    render();
    toast('Veículo salvo na sua garagem');
  },
  async staff(f) {
    const n = f.sname.value,
      v = f.spass.value;
    let ok = true;
    setErr('sname', '');
    setErr('spass', '');
    if (!STAFF.includes(n)) {
      setErr('sname', 'Selecione quem é você.');
      ok = false;
    }
    if (!v) {
      setErr('spass', 'Informe a senha.');
      ok = false;
    } else if (ok && v !== staffPass(n)) {
      setErr('spass', 'Senha incorreta.');
      ok = false;
    }
    if (!ok) return;
    S.staffOk = true;
    S.staffName = n;
    try {
      sessionStorage.setItem('carwash.staff', n);
    } catch (e) {}
    go('staff');
  },
  async staffCode(f) {
    const raw = f.wcode.value;
    setErr('wcode', '');
    S.staff.code = raw;
    S.staff.prob = false;
    S.staff.ptxt = '';
    const b = findBooking(raw);
    if (!raw.trim()) {
      setErr('wcode', 'Digite o código da lavagem.');
      S.staff.id = null;
      render();
      return;
    }
    if (!b) {
      setErr('wcode', 'Código não encontrado. Confira e tente de novo.');
      S.staff.id = null;
      render();
      setErr('wcode', 'Código não encontrado. Confira e tente de novo.');
      return;
    }
    S.staff.id = b.id;
    S.staff.code = b.code;
    render();
  },
  async staffProblem(f) {
    const txt = f.ptxt.value.trim();
    setErr('ptxt', '');
    if (txt.length < 5) {
      setErr('ptxt', 'Descreva o problema (mínimo 5 letras).');
      return;
    }
    D = loadDB();
    const b = D.bookings.find(x => x.id === S.staff.id);
    if (!b) return;
    setStatus(b, 'Com Problema', txt, S.staffName);
    S.staff.prob = false;
    S.staff.ptxt = '';
    save();
    S._snap = localStorage.getItem(KEY);
    render();
    toast('Problema registrado e enviado ao administrador');
  },
  async request(f) {
    const txt = f.rtxt.value.trim();
    setErr('rtxt', '');
    if (txt.length < 5) {
      setErr('rtxt', 'Escreva pelo menos 5 letras.');
      return;
    }
    D = loadDB();
    const b = D.bookings.find(x => x.id === S.req.bid);
    if (!b) return;
    const ty = S.req.type;
    addReq(b, ty, txt);
    save();
    S._snap = localStorage.getItem(KEY);
    S.modal = null;
    render();
    toast(ty + ' enviado(a). A equipe responde pelos contatos do seu cadastro.');
  },
  async cancelBk(f) {
    const txt = f.rtxt.value.trim();
    D = loadDB();
    const b = D.bookings.find(x => x.id === S.req.bid);
    if (!b || b.status !== 'Aguardando') {
      S.modal = null;
      render();
      toast('Só é possível cancelar antes de a lavagem começar.');
      return;
    }
    setStatus(b, 'Cancelado', txt || 'Cancelado pelo cliente', 'Cliente');
    if (b.paid && b.pay === 'pix')
      addReq(
        b,
        'Estorno',
        'Estorno solicitado automaticamente no cancelamento.' + (txt ? ' Motivo: ' + txt : '')
      );
    save();
    S._snap = localStorage.getItem(KEY);
    S.modal = null;
    render();
    toast(
      b.paid && b.pay === 'pix'
        ? 'Agendamento cancelado. Pedido de estorno aberto.'
        : 'Agendamento cancelado. O horário foi liberado.'
    );
  },
  async admin(f) {
    const v = f.apass.value;
    setErr('apass', '');
    if (v === ADMIN_PASS) {
      S.adminOk = true;
      try {
        sessionStorage.setItem('carwash.admin', '1');
      } catch (e) {}
      S._snap = localStorage.getItem(KEY);
      go('admin');
    } else setErr('apass', 'Senha incorreta.');
  }
};
function startSession(u) {
  S.user = u;
  try {
    localStorage.setItem('carwash.session', u.id);
  } catch (e) {}
  S.gv = { cat: 'Carro', sub: 'Sedan', model: '', color: '', plate: '' };
  S.showForm = false;
  S.resched = null;
  S.draft = { vehicleId: null, serviceId: null, unit: null, date: null, time: null, pref: '' };
  go('home');
}
