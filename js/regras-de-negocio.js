/* Carwash — js/regras-de-negocio.js
   Regras do negócio: horários livres/ocupados, reserva de 15 min, criar agendamento, mudar status, pagamentos. */
'use strict';
/* ============ regras de negócio ============ */
const myVehicles = () => D.vehicles.filter(v => v.userId === (S.user && S.user.id));
const vehById = id => D.vehicles.find(v => v.id === id);
const svcById = id => SERVICES.find(s => s.id === id);
const userById = id => D.users.find(u => u.id === id);
const bookedAt = (unit, date, time) =>
  D.bookings.some(b => b.unit === unit && b.date === date && b.time === time && b.status !== 'Cancelado');
const heldAt = (unit, date, time) =>
  D.holds.some(
    h =>
      h.unit === unit &&
      h.date === date &&
      h.time === time &&
      h.exp > Date.now() &&
      h.userId !== (S.user && S.user.id)
  );
const slotTaken = (unit, date, time) => bookedAt(unit, date, time) || heldAt(unit, date, time);
function slotPast(date, time) {
  return date === todayKey() && parseInt(time) <= new Date().getHours();
}
const slotFree = (unit, date, time) => !slotTaken(unit, date, time) && !slotPast(date, time);
function dateOptions(unit) {
  const out = [],
    base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const k = dkey(d);
    out.push({ k, day: d.getDate(), wd: wkShort(k), free: SLOTS.filter(t => slotFree(unit, k, t)).length });
  }
  return out;
}
/* Reserva o horário escolhido por 15 min: some para os outros clientes enquanto a pessoa paga */
function releaseHold() {
  if (!S.user) return;
  D = loadDB();
  D.holds = D.holds.filter(h => h.userId !== S.user.id && h.exp > Date.now());
  save();
}
function holdSlot() {
  const d = S.draft;
  if (!S.user || !d.unit || !d.date || !d.time) return;
  D = loadDB();
  D.holds = D.holds.filter(h => h.userId !== S.user.id && h.exp > Date.now());
  if (slotTaken(d.unit, d.date, d.time)) {
    toast('Esse horário acabou de ser ocupado. Escolha outro.');
    d.time = null;
    save();
    return;
  }
  D.holds.push({
    id: uid(),
    unit: d.unit,
    date: d.date,
    time: d.time,
    userId: S.user.id,
    exp: Date.now() + PIX_MINUTES * 60000
  });
  save();
}
function createBooking(pay, paid, extra) {
  D = loadDB();
  const d = S.draft,
    v = vehById(d.vehicleId),
    sv = svcById(d.serviceId);
  if (!v || !sv || !d.unit || !d.date || !d.time) {
    go('garage');
    return null;
  }
  if (!slotFree(d.unit, d.date, d.time)) {
    toast('Esse horário acabou de ser ocupado. Escolha outro.');
    d.time = null;
    go('time');
    return null;
  }
  let code;
  do {
    code = 'CW-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  } while (D.bookings.some(x => x.code === code));
  const b = Object.assign(
    {
      id: uid(),
      code,
      userId: S.user.id,
      vehicleId: v.id,
      serviceId: sv.id,
      price: sv.price,
      unit: d.unit,
      date: d.date,
      time: d.time,
      obs: (d.obs || '').trim(),
      pref: d.pref || '',
      status: 'Aguardando',
      log: [{ st: 'Aguardando', at: Date.now(), by: 'Sistema', note: 'Agendamento confirmado' }],
      pay,
      paid,
      paidAt: paid ? Date.now() : null,
      createdAt: Date.now()
    },
    extra || {}
  );
  D.holds = D.holds.filter(h => h.userId !== S.user.id);
  D.bookings.push(b);
  save();
  S.last = b;
  return b;
}
function setStatus(b, st, note, by) {
  b.status = st;
  (b.log = b.log || []).push({ st, at: Date.now(), by: by || 'Administrador', note: note || '' });
  if (STAFF.includes(by) && (!b.staff || st === 'Iniciando')) b.staff = by;
  if (st === 'Com Problema') b.problem = note || b.problem || '';
  if (st === 'Iniciando' && !b.arrivedAt) b.arrivedAt = Date.now();
  if (b.pay === 'local') {
    if (st === 'Concluído' && !b.paid) {
      b.paid = true;
      b.paidAt = Date.now();
    } else if (st !== 'Concluído' && b.paid) {
      b.paid = false;
      b.paidAt = null;
    }
  }
}
function addReq(b, type, text, status) {
  D.requests = D.requests || [];
  D.requests.push({
    id: uid(),
    bookingId: b.id,
    userId: b.userId,
    code: b.code,
    type,
    text,
    at: Date.now(),
    status: status || 'Em análise',
    unit: b.unit,
    demo: b.demo || undefined
  });
}
const hhmm = ts => {
  const d = new Date(ts);
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
};
const fmtDT = ts => {
  const d = new Date(ts);
  return (
    pad(d.getDate()) +
    '/' +
    pad(d.getMonth() + 1) +
    '/' +
    d.getFullYear() +
    ' às ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes())
  );
};
const payLabel = b => (b.pay === 'pix' ? 'Pix' : b.pay === 'cartao' ? 'Cartão' : 'Pagar no local');
const payFull = b =>
  b.pay === 'cartao' && b.cardLast4
    ? 'Cartão ' + (b.cardBrand || '') + ' (final ' + b.cardLast4 + ')'
    : payLabel(b);
const payShort = b => (b.paid ? 'pago' : 'a receber');
const payState = b =>
  b.paid
    ? 'Pagamento realizado em ' + fmtDT(b.paidAt || b.createdAt)
    : b.pay === 'pix'
      ? 'Pix informado — aguardando confirmação da equipe'
      : 'Pagamento a realizar no local';
const pixBtn = b =>
  b.pay === 'pix' && !b.paid && b.status !== 'Cancelado'
    ? '<br><button class="btn ghost sm" data-act="confirmPix" data-id="' +
      b.id +
      '" style="margin-top:4px">Confirmar Pix</button>'
    : '';
