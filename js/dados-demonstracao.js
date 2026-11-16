/* Carwash — js/dados-demonstracao.js
   Gera clientes e agendamentos de exemplo para apresentar o painel admin. */
'use strict';
/* ============ dados de demonstração ============ */
function mulberry(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedDemo() {
  clearDemo();
  const rnd = mulberry(20261009),
    pick = a => a[Math.floor(rnd() * a.length)],
    mk = o => Object.assign({ demo: true }, o);
  const names = [
    'Ana Lima',
    'Bruno Carvalho',
    'Camila Rocha',
    'Diego Martins',
    'Eduarda Nunes',
    'Felipe Araújo',
    'Gabriela Souza',
    'Henrique Faria',
    'Isabela Duarte',
    'João Pedro Alves'
  ];
  const social = { 1: 'Bruna Carvalho', 6: 'Gabriel Souza' };
  const slug = n => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.');
  const users = names.map((n, i) =>
    mk({
      id: 'du' + i,
      name: n,
      socialName: social[i] || '',
      useSocial: !!social[i],
      termsAt: Date.now() - (10 + i) * 86400000,
      termsV: TERMS_V,
      email: slug(n) + '.demo@' + (i % 3 === 2 ? 'outlook.com' : 'gmail.com'),
      phone: '(11) 9' + (8000 + i * 137) + '-' + (1000 + i * 311),
      hash: null
    })
  );
  const L = 'ABCDEFGHJKLMNOPRSTUVWXYZ',
    plate = () =>
      pick(L) +
      pick(L) +
      pick(L) +
      Math.floor(rnd() * 10) +
      pick(L) +
      Math.floor(rnd() * 10) +
      Math.floor(rnd() * 10);
  const M = {
    Sedan: ['Corolla', 'Civic', 'Virtus', 'Cruze'],
    Hatch: ['Onix', 'HB20', 'Polo', 'Argo'],
    SUV: ['Creta', 'T-Cross', 'Compass', 'Tracker'],
    Custom: ['Meteor 350', 'Shadow 600', 'Vulcan S'],
    Esportiva: ['CBR 500R', 'Ninja 400', 'YZF-R3']
  };
  const PROBS = [
    'Risco antigo na porta traseira; cliente avisado',
    'Mancha no tapete que não saiu',
    'Falta de água na unidade durante a lavagem',
    'Rodas com ferrugem superficial',
    'Bancos de couro ressecados; aplicado hidratante',
    'Máquina de polimento falhou',
    'Vazamento de óleo no motor do veículo',
    'Cliente chegou 20 min atrasado e o horário apertou'
  ];
  const cs = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde'],
    vehicles = [];
  users.forEach((u, i) => {
    const n = rnd() < 0.4 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const moto = rnd() < 0.35,
        cat = moto ? 'Moto' : 'Carro',
        sub = pick(SUBS[cat]);
      vehicles.push(
        mk({
          id: 'dv' + i + '_' + k,
          userId: u.id,
          cat,
          sub,
          model: pick(M[sub]),
          color: pick(cs),
          plate: plate()
        })
      );
    }
  });
  const used = new Set(D.vehicles.map(v => v.plate));
  vehicles.forEach(v => {
    while (used.has(v.plate)) v.plate = plate();
    used.add(v.plate);
  });
  const w = [
      ['express', 0.12],
      ['ecologica', 0.08],
      ['ducha', 0.2],
      ['simples', 0.22],
      ['completa', 0.18],
      ['motor', 0.04],
      ['higien', 0.06],
      ['bancos', 0.03],
      ['couro', 0.02],
      ['farois', 0.02],
      ['polimento', 0.02],
      ['cristal', 0.01]
    ],
    svc = () => {
      let r = rnd(),
        a = 0;
      for (const [id, p] of w) {
        a += p;
        if (r < a) return id;
      }
      return 'ducha';
    };
  const bookings = [],
    cards = [],
    busy = new Set(),
    n0 = new Date();
  let bi = 0;
  const add = (date, time, unit, status, pay, v, sid, opt) => {
    opt = opt || {};
    const u = users.find(x => x.id === v.userId);
    let sv = SERVICES.find(x => x.id === sid);
    if (sv.only && sv.only !== v.cat) sv = SERVICES.find(x => x.id === 'simples');
    const at = new Date(date + 'T' + time + ':00').getTime();
    bi++;
    const paid = pay === 'local' ? status === 'Concluído' : status !== 'Aguardando' || rnd() < 0.5;
    const worked = ['Iniciando', 'Em Lavagem', 'Com Problema', 'Concluído'].includes(status);
    const staff = worked ? pick(STAFF) : '',
      pref = rnd() < 0.55 ? pick(STAFF) : '';
    const log = [{ st: 'Aguardando', at: at - 86400000, by: 'Sistema', note: 'Agendamento confirmado' }];
    let problem = '';
    if (worked) {
      log.push({ st: 'Iniciando', at: at + 5 * 60000, by: staff, note: '' });
      if (status === 'Com Problema' || opt.prob) {
        problem = pick(PROBS);
        log.push({ st: 'Com Problema', at: at + 20 * 60000, by: staff, note: problem });
      }
      if (status === 'Concluído') log.push({ st: 'Concluído', at: at + 50 * 60000, by: staff, note: '' });
      else if (status === 'Em Lavagem')
        log.push({ st: 'Em Lavagem', at: at + 10 * 60000, by: staff, note: '' });
    }
    if (status === 'Cancelado')
      log.push({ st: 'Cancelado', at: at - 3600000, by: 'Cliente', note: 'Cancelado pelo cliente' });
    const b = mk({
      id: 'db' + bi,
      code: 'CW-D' + String(bi).padStart(4, '0'),
      userId: u.id,
      vehicleId: v.id,
      serviceId: sv.id,
      price: sv.price,
      unit,
      date,
      time,
      status,
      pay,
      paid,
      paidAt: paid ? at : null,
      staff,
      pref,
      problem: problem || undefined,
      log,
      createdAt: at - 86400000
    });
    bookings.push(b);
    return b;
  };
  const free = (date, unit) => {
    for (let t = 0; t < 30; t++) {
      const h = pick(SLOTS),
        k = date + unit + h;
      if (!busy.has(k) && !D.bookings.some(b => b.date === date && b.unit === unit && b.time === h)) {
        busy.add(k);
        return h;
      }
    }
    return null;
  };
  for (let off = -41; off <= -1; off++) {
    const d = new Date(n0.getFullYear(), n0.getMonth(), n0.getDate() + off),
      date = dkey(d),
      wd = d.getDay();
    const n =
      wd === 6 ? 3 + Math.floor(rnd() * 3) : wd === 0 ? 1 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const unit = pick(UNITS).id,
        h = free(date, unit);
      if (!h) continue;
      const st = rnd() < 0.04 ? 'Cancelado' : 'Concluído';
      add(date, h, unit, st, rnd() < 0.3 ? 'local' : 'pix', pick(vehicles), svc(), {
        prob: st === 'Concluído' && rnd() < 0.09
      });
    }
  }
  const T = dkey(n0),
    tm = dkey(new Date(n0.getFullYear(), n0.getMonth(), n0.getDate() + 1));
  const today = [
    ['08:00', 'FMU Liberdade', 'Concluído', 'pix'],
    ['09:00', 'FMU Santo Amaro', 'Concluído', 'local'],
    ['10:00', 'FMU Liberdade', 'Concluído', 'pix'],
    ['11:00', 'FMU Santo Amaro', 'Em Lavagem', 'pix'],
    ['13:00', 'FMU Liberdade', 'Com Problema', 'local'],
    ['14:00', 'FMU Santo Amaro', 'Aguardando', 'pix'],
    ['16:00', 'FMU Liberdade', 'Aguardando', 'local']
  ];
  const used2 = D.bookings.filter(b => b.date === T);
  today.forEach((t, i) => {
    if (used2.some(b => b.unit === t[1] && b.time === t[0])) return;
    busy.add(T + t[1] + t[0]);
    add(
      T,
      t[0],
      t[1],
      t[2],
      t[3],
      vehicles[(i * 2) % vehicles.length],
      ['simples', 'completa', 'ducha', 'higien', 'completa', 'simples', 'ducha'][i]
    );
  });
  [
    ['09:00', 'FMU Liberdade'],
    ['11:00', 'FMU Liberdade'],
    ['14:00', 'FMU Liberdade'],
    ['10:00', 'FMU Santo Amaro']
  ].forEach((t, i) => {
    if (D.bookings.some(b => b.date === tm && b.unit === t[1] && b.time === t[0])) return;
    busy.add(tm + t[1] + t[0]);
    add(
      tm,
      t[0],
      t[1],
      'Aguardando',
      i % 2 ? 'local' : 'pix',
      vehicles[(i * 3 + 1) % vehicles.length],
      svc()
    );
  });
  const reqs = [],
    rq = (b, type, text, status, ago) => {
      if (b)
        reqs.push(
          mk({
            id: 'dr' + reqs.length,
            bookingId: b.id,
            userId: b.userId,
            code: b.code,
            type,
            text,
            at: Date.now() - ago * 3600000,
            status,
            unit: b.unit
          })
        );
    };
  const past = bookings.filter(b => b.status === 'Concluído'),
    canc = bookings.filter(b => b.status === 'Cancelado' && b.pay === 'pix'),
    todayB = bookings.filter(b => b.date === T);
  rq(past[past.length - 4], 'Reclamação', 'A lavagem deixou marcas de água nos vidros.', 'Em análise', 20);
  rq(past[past.length - 12], 'Reclamação', 'O serviço demorou mais do que o combinado.', 'Concluída', 90);
  rq(todayB[5], 'Fale conosco', 'Vou me atrasar uns 10 minutos, tudo bem?', 'Em análise', 1);
  rq(canc[0], 'Estorno', 'Estorno solicitado automaticamente no cancelamento.', 'Em análise', 30);
  rq(
    past[past.length - 20],
    'Reagendamento',
    'Reagendado para outro dia a pedido do cliente.',
    'Concluída',
    200
  );
  D.users.push(...users);
  D.vehicles.push(...vehicles);
  D.bookings.push(...bookings);
  D.requests = (D.requests || []).concat(reqs);
  D.cards.push(...cards);
  save();
  S._snap = localStorage.getItem(KEY);
}
function clearDemo() {
  D.users = D.users.filter(x => !x.demo);
  D.vehicles = D.vehicles.filter(x => !x.demo);
  D.bookings = D.bookings.filter(x => !x.demo);
  D.cards = D.cards.filter(x => !x.demo);
  D.requests = (D.requests || []).filter(x => !x.demo);
  save();
}
