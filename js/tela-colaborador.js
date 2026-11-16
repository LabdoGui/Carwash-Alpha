/* Carwash — js/tela-colaborador.js
   Área do colaborador: busca pelo código da lavagem e atualização do andamento. */
'use strict';
/* ============ ÁREA DO COLABORADOR ============ */
function findBooking(raw) {
  let c = String(raw || '')
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!c) return null;
  D = loadDB();
  return D.bookings.find(b => b.code === c) || D.bookings.find(b => b.code === 'CW-' + c) || null;
}
const STAFF_STEPS = [
  ['Iniciando', 'Iniciando a lavagem', 'Cliente no local · lavagem começando', 'info'],
  ['Em Lavagem', 'Lavagem em execução', 'Veículo sendo lavado agora', 'info'],
  ['Com Problema', 'Houve algum problema na lavagem', 'Descreva o que aconteceu', 'bad'],
  ['Concluído', 'Lavagem concluída', 'Veículo pronto para entrega', 'ok']
];
screens.staff = () => {
  const st = S.staff,
    b = st.id ? D.bookings.find(x => x.id === st.id) : null;
  let h =
    '<div class="stafftop"><div>' +
    backAct('exitStaff') +
    '<h1>Área do colaborador</h1><p class="sub">Olá, <b>' +
    esc(S.staffName || '') +
    '</b>. Digite o código da lavagem para ver o pedido e atualizar o andamento.</p></div></div>' +
    '<form class="card stack" data-form="staffCode" novalidate>' +
    field({
      id: 'wcode',
      label: 'Código da lavagem',
      ph: 'CW-XXXXX',
      val: st.code,
      attrs: 'data-mask="upper" autocomplete="off" autocapitalize="characters" spellcheck="false"'
    }) +
    '<button class="btn primary" type="submit">Buscar lavagem</button></form>';
  if (!b) return h;
  const v = vehById(b.vehicleId),
    sv = svcById(b.serviceId),
    u = userById(b.userId),
    cancelled = b.status === 'Cancelado';
  h +=
    (cancelled ? '<div class="banner bad">Agendamento cancelado — não iniciar a lavagem.</div>' : '') +
    (!cancelled && b.date !== todayKey()
      ? '<div class="banner warn">Atenção: este agendamento é para ' +
        brDate(b.date) +
        ', não para hoje.</div>'
      : '') +
    '<div class="card sum" style="margin-top:14px"><div><span>Código</span><span><span class="code">' +
    esc(b.code) +
    '</span></span></div><div><span>Status atual</span><span><span class="stsel s-' +
    stCls(b.status) +
    '" style="display:inline-flex;align-items:center">' +
    esc(b.status) +
    '</span></span></div><div><span>Cliente</span><span>' +
    esc(dispName(u)) +
    (u.useSocial && u.socialName ? ' <span class="muted small">(nome social)</span>' : '') +
    '</span></div>' +
    (u.useSocial && u.socialName
      ? '<div><span>Nome no cadastro</span><span>' + esc(u.name) + '</span></div>'
      : '') +
    '<div><span>Celular</span><span>' +
    esc(u.phone) +
    '</span></div><div><span>E-mail</span><span>' +
    esc(u.email) +
    '</span></div><div><span>Veículo</span><span>' +
    esc(v.model) +
    ' · ' +
    esc(v.color) +
    '</span></div><div><span>Placa</span><span><span class="plate">' +
    esc(v.plate) +
    '</span></span></div><div><span>Serviço</span><span>' +
    sv.name +
    '</span></div><div><span>Unidade</span><span>' +
    esc(b.unit) +
    '</span></div><div><span>Data e hora</span><span>' +
    wkShort(b.date) +
    ', ' +
    brDate(b.date) +
    ' · ' +
    b.time +
    '</span></div><div><span>Colaborador de preferência</span><span>' +
    esc(b.pref || 'Sem preferência') +
    '</span></div>' +
    (b.staff ? '<div><span>Atendido por</span><span>' + esc(b.staff) + '</span></div>' : '') +
    '<div><span>Pagamento</span><span>' +
    esc(payFull(b)) +
    '</span></div><div><span>Situação</span><span>' +
    payState(b) +
    '</span></div><div class="total"><span>Total</span><span>' +
    money(b.price) +
    '</span></div></div>' +
    '<div class="row2" style="margin-top:12px"><a class="btn outline" href="tel:+55' +
    digits(u.phone) +
    '">Ligar para o cliente</a><a class="btn outline" target="_blank" rel="noopener" href="https://wa.me/55' +
    digits(u.phone) +
    '">Abrir WhatsApp</a></div>' +
    (b.obs
      ? '<div class="obsbox"><b>Observações do cliente</b><p>' + esc(b.obs) + '</p></div>'
      : '<div class="obsbox none"><b>Observações do cliente</b><p>Nenhuma observação.</p></div>') +
    (b.problem && b.status === 'Com Problema'
      ? '<div class="banner bad">Problema registrado: ' + esc(b.problem) + '</div>'
      : '') +
    (b.pay === 'pix' && !b.paid && !cancelled
      ? '<div class="banner warn">Pix ainda não confirmado. Confira no app do banco.</div><button class="btn primary" data-act="confirmPix" data-id="' +
        b.id +
        '" style="margin-top:10px">Confirmar recebimento do Pix · ' +
        money(b.price) +
        '</button>'
      : '') +
    (b.pay === 'local' && !b.paid && !cancelled
      ? '<div class="banner warn">Pagamento no local: receber ' +
        money(b.price) +
        ' em dinheiro ou cartão. Ao concluir a lavagem ele é registrado como recebido.</div>'
      : '') +
    '<h2 style="font-size:16px;margin:22px 0 4px">Andamento da lavagem</h2>' +
    '<div class="stbtns">' +
    STAFF_STEPS.map(
      x =>
        '<button class="stb s-' +
        x[3] +
        (b.status === x[0] ? ' cur' : '') +
        '" data-act="' +
        (x[0] === 'Com Problema' ? 'stProblem' : 'stSet') +
        '" data-st="' +
        x[0] +
        '"' +
        (cancelled ? ' disabled' : '') +
        '><i></i><span>' +
        x[1] +
        '<small>' +
        (b.status === x[0] ? 'Status atual' : x[2]) +
        '</small></span></button>'
    ).join('') +
    '</div>';
  if (st.prob && !cancelled)
    h +=
      '<form class="card stack" data-form="staffProblem" novalidate style="margin-top:12px"><div class="field" data-f="ptxt"><label for="ptxt">O que aconteceu?</label><textarea id="ptxt" name="ptxt" rows="3" maxlength="300" placeholder="Ex.: risco antigo na porta traseira; cliente avisado.">' +
      esc(st.ptxt || '') +
      '</textarea><div class="hint">Detalhe o problema. O administrador verá este texto em tempo real.</div><div class="err" id="ptxt-err" role="alert"></div></div><div class="row2"><button type="button" class="btn ghost" data-act="stProblem">Cancelar</button><button class="btn primary" type="submit">Registrar problema</button></div></form>';
  const log = (b.log || []).slice().reverse();
  h +=
    '<h2 style="font-size:16px;margin:22px 0 0">Histórico</h2><ul class="tl">' +
    (log.length
      ? log
          .map(
            l =>
              '<li><time>' +
              fmtDT(l.at).replace(' às ', ' · ') +
              '</time><b>' +
              esc(l.st) +
              '</b> · ' +
              esc(l.by) +
              (l.note ? ' — ' + esc(l.note) : '') +
              '</li>'
          )
          .join('')
      : '<li class="muted">Sem registros ainda.</li>') +
    '</ul>' +
    '<div class="stack" style="margin-top:18px"><button class="btn ghost" data-act="staffPdf">' +
    ic('doc') +
    'Baixar comprovante em PDF</button></div>';
  return h;
};
