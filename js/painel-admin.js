/* Carwash — js/painel-admin.js
   Painel do administrador: indicadores, pátio, agendamentos, clientes, colaboradores, unidades, problemas e pagamentos. */
'use strict';
/* ============ ADMIN ============ */
function table(heads, rows, empty, cols) {
  return (
    '<div class="scroll"><table class="dt"><thead><tr>' +
    heads.map((h, i) => '<th scope="col"' + (h[1] ? ' class="n"' : '') + '>' + h[0] + '</th>').join('') +
    '</tr></thead><tbody>' +
    (rows.length
      ? rows.join('')
      : '<tr><td class="empty" colspan="' + heads.length + '">' + empty + '</td></tr>') +
    '</tbody></table></div>'
  );
}
function weekStart(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
function adminStats() {
  const t = todayKey(),
    n0 = new Date(),
    tm = dkey(new Date(n0.getFullYear(), n0.getMonth(), n0.getDate() + 1));
  const live = D.bookings.filter(b => b.status !== 'Cancelado'),
    today = live.filter(b => b.date === t);
  const done = today.filter(b => b.status === 'Concluído');
  const sum = a => a.reduce((x, b) => x + b.price, 0);
  const kpi = {
    rev: sum(done),
    served: today.filter(b => b.status !== 'Aguardando').length,
    done: done.length,
    eff: today.length ? Math.round((done.length / today.length) * 100) : 0
  };
  const extra = {
    n: today.length,
    recv: sum(today.filter(b => !b.paid)),
    avg: today.length ? sum(today) / today.length : 0,
    tom: live.filter(b => b.date === tm).length
  };
  const cl = {};
  live.forEach(b => {
    const c = cl[b.userId] || (cl[b.userId] = { n: 0, total: 0, last: '' });
    c.n++;
    c.total += b.price;
    if (b.date > c.last && b.date <= t) c.last = b.date;
  });
  const clients = Object.keys(cl)
    .map(id => ({ u: userById(id), ...cl[id] }))
    .filter(x => x.u)
    .sort((a, b) => b.total - a.total || b.n - a.n)
    .slice(0, 5);
  const weeks = [];
  const w0 = weekStart(new Date());
  for (let i = 5; i >= 0; i--) {
    const s = new Date(w0);
    s.setDate(s.getDate() - 7 * i);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    const a = dkey(s),
      z = dkey(e);
    const bs = D.bookings.filter(b => b.status === 'Concluído' && b.date >= a && b.date <= z);
    weeks.push({ a, z, n: bs.length, rev: sum(bs) });
  }
  const types = SERVICES.map(s => ({ s, n: live.filter(b => b.serviceId === s.id).length })).sort(
    (a, b) => b.n - a.n
  );
  const units = UNITS.map(u => {
    const n = today.filter(b => b.unit === u.id).length;
    return { id: u.id, n, free: SLOTS.length - n };
  });
  const pays = [
    ['Pix · confirmado', b => b.pay === 'pix' && b.paid],
    ['Pix · a confirmar', b => b.pay === 'pix' && !b.paid],
    ['Pagar no local · recebido', b => b.pay === 'local' && b.paid],
    ['Pagar no local · a receber', b => b.pay === 'local' && !b.paid]
  ].map(p => {
    const bs = live.filter(p[1]);
    return { name: p[0], n: bs.length, rev: sum(bs) };
  });
  return { kpi, extra, clients, weeks, types, units, pays, today, total: live.length };
}
const stCls = s =>
  s === 'Concluído'
    ? 'ok'
    : s === 'Em Lavagem' || s === 'Iniciando'
      ? 'info'
      : s === 'Cancelado' || s === 'Com Problema'
        ? 'bad'
        : 'warn';
const obsLine = b => (b.obs ? '<div class="oline">Obs.: ' + esc(b.obs) + '</div>' : '');
function statusSelect(b, prefix, opts) {
  const v = vehById(b.vehicleId);
  return (
    '<select class="stsel s-' +
    stCls(b.status) +
    '" id="' +
    prefix +
    b.id +
    '" data-status="' +
    b.id +
    '" aria-label="Status de ' +
    esc(b.code) +
    (v ? ' (' + esc(v.plate) + ')' : '') +
    '">' +
    opts.map(o => '<option' + (o === b.status ? ' selected' : '') + '>' + o + '</option>').join('') +
    '</select>' +
    (b.status === 'Com Problema' && b.problem ? '<div class="prob small">⚠ ' + esc(b.problem) + '</div>' : '')
  );
}
function allList() {
  const f = S.adm,
    q = f.q.trim().toLowerCase();
  return D.bookings
    .slice()
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .filter(b => {
      if (f.unit && b.unit !== f.unit) return false;
      if (f.status && b.status !== f.status) return false;
      if (!q) return true;
      const v = vehById(b.vehicleId),
        u = userById(b.userId);
      return [b.code, u && u.name, u && u.socialName, v && v.plate, v && v.model]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
}
function allRowsHtml(list) {
  if (!list.length) return '<tr><td class="empty" colspan="9">Nenhum agendamento encontrado.</td></tr>';
  return list
    .slice(0, S.adm.limit)
    .map(b => {
      const v = vehById(b.vehicleId),
        u = userById(b.userId),
        sv = svcById(b.serviceId);
      return (
        '<tr><td><span class="cw">' +
        esc(b.code) +
        '</span></td><td>' +
        brDate(b.date).slice(0, 5) +
        ' · ' +
        b.time +
        '</td><td><b>' +
        esc(u ? u.name : '—') +
        '</b>' +
        (u && u.useSocial && u.socialName
          ? ' <span class="tag">social: ' + esc(u.socialName) + '</span>'
          : '') +
        '<br><span class="muted small">' +
        esc(u ? u.phone : '') +
        '</span></td><td class="w">' +
        esc(v ? v.model : '—') +
        ' <span class="plate">' +
        esc(v ? v.plate : '') +
        '</span></td><td class="w">' +
        sv.name +
        obsLine(b) +
        '</td><td class="w">' +
        esc(b.unit) +
        '</td><td>' +
        payLabel(b) +
        ' <span class="muted">· ' +
        payShort(b) +
        '</span>' +
        pixBtn(b) +
        '</td><td class="n">' +
        money(b.price) +
        '</td><td>' +
        statusSelect(b, 'stA-', STATUSES_ALL) +
        '</td></tr>'
      );
    })
    .join('');
}
function allNoteHtml(list) {
  const sh = Math.min(S.adm.limit, list.length);
  return (
    'Mostrando ' +
    sh +
    ' de ' +
    list.length +
    ' agendamentos. Cancelar um agendamento libera o horário.' +
    (sh < list.length ? ' <button class="linkbtn" data-act="moreAll">Mostrar mais</button>' : '')
  );
}
function refreshAll() {
  const list = allList(),
    b = $('#allBody');
  if (!b) return;
  b.innerHTML = allRowsHtml(list);
  const n = $('#allNote');
  if (n) n.innerHTML = allNoteHtml(list);
  const c = $('#allCount');
  if (c) c.textContent = list.length;
}
/* ---- estatísticas extras do painel (unidades, problemas, colaboradores, solicitações) ---- */
const sumP = a => a.reduce((x, b) => x + b.price, 0);
const probText = b =>
  b.problem || ((b.log || []).filter(l => l.st === 'Com Problema').pop() || {}).note || 'Sem descrição';
const pctS = (n, t) => (t ? String(Math.round((n / t) * 1000) / 10).replace('.', ',') + '%' : '0%');
function adminExtra() {
  const t = todayKey(),
    live = D.bookings.filter(b => b.status !== 'Cancelado');
  const un = UNITS.map(u => {
    const all = D.bookings.filter(b => b.unit === u.id),
      bs = all.filter(b => b.status !== 'Cancelado');
    return {
      id: u.id,
      n: bs.length,
      hoje: bs.filter(b => b.date === t).length,
      aguard: bs.filter(b => b.status === 'Aguardando').length,
      andam: bs.filter(b => ['Iniciando', 'Em Lavagem', 'Com Problema'].includes(b.status)).length,
      conc: bs.filter(b => b.status === 'Concluído').length,
      canc: all.length - bs.length,
      receita: sumP(bs.filter(b => b.status === 'Concluído')),
      recebido: sumP(bs.filter(b => b.paid)),
      areceber: sumP(bs.filter(b => !b.paid)),
      total: sumP(bs),
      prob: bs.filter(hadProblem).length
    };
  });
  const months = [];
  const n0 = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(n0.getFullYear(), n0.getMonth() - i, 1),
      k = d.getFullYear() + '-' + pad(d.getMonth() + 1);
    const bs = live.filter(b => b.date.slice(0, 7) === k),
      pr = bs.filter(hadProblem);
    const byU = {};
    pr.forEach(b => {
      byU[b.unit] = (byU[b.unit] || 0) + 1;
    });
    months.push({
      k,
      label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      n: bs.length,
      p: pr.length,
      units:
        Object.keys(byU)
          .sort((a, b) => byU[b] - byU[a])
          .map(u => u.replace('FMU ', '') + ' (' + byU[u] + ')')
          .join(', ') || '—'
    });
  }
  const probs = D.bookings
    .filter(b => b.status !== 'Cancelado' && hadProblem(b))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const staff = STAFF.map(n => {
    const mine = D.bookings.filter(b => b.staff === n && b.status !== 'Cancelado');
    return {
      n,
      conc: mine.filter(b => b.status === 'Concluído').length,
      hojeC: mine.filter(b => b.status === 'Concluído' && b.date === t).length,
      agora: mine.filter(b => ['Iniciando', 'Em Lavagem', 'Com Problema'].includes(b.status)).length,
      prob: mine.filter(hadProblem).length,
      pref: live.filter(b => b.pref === n).length
    };
  }).sort((a, b) => b.conc - a.conc || b.agora - a.agora);
  const totConc = staff.reduce((a, s) => a + s.conc, 0);
  return {
    un,
    months,
    probs,
    staff,
    totConc,
    top: staff[0] && staff[0].conc ? staff[0] : null,
    reqs: D.requests.slice().sort((a, b) => b.at - a.at)
  };
}
