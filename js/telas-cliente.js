/* Carwash — js/telas-cliente.js
   Telas do cliente: login, cadastro com termos, início, veículos, Meus agendamentos, serviços, horário, pagamento e confirmação.
   (A escolha do local e as telas das unidades ficam em js/telas-unidades.js.) */
'use strict';
/* ============ TELAS DO CLIENTE ============ */
const screens = {};

/* TELA 01A — Login */
screens.login = () =>
  '<div class="loginwrap"><div class="hero"><h1 class="sr">Carwash</h1>' +
  BIGLOGO +
  '<p class="slogan">Qualidade e Brilho Impecável para o seu Veículo</p><div class="feat"><div><b>1</b>Escolha o veículo e o serviço</div><div><b>2</b>Selecione a unidade FMU e o horário</div><div><b>3</b>Pague como preferir e receba o código da lavagem</div></div></div><div class="side">' +
  '<form class="card stack" data-form="login" novalidate>' +
  '<h1 style="font-size:20px;margin:0">Entrar</h1>' +
  field({
    id: 'email',
    label: 'E-mail',
    type: 'email',
    ph: 'seunome@gmail.com',
    attrs: 'autocomplete="email" inputmode="email"',
    hint: 'Use um e-mail @gmail ou @outlook.'
  }) +
  field({
    id: 'password',
    label: 'Senha',
    type: 'password',
    ph: 'Sua senha',
    attrs: 'autocomplete="current-password"',
    pw: true
  }) +
  '<button class="btn primary" type="submit">Entrar</button>' +
  '</form>' +
  '<div class="divider">ainda não tem conta?</div>' +
  '<button class="btn outline" data-act="go" data-to="register">Criar Conta</button>' +
  (S.installEv
    ? '<div style="margin-top:14px"><button class="btn outline" data-act="installApp">Instalar aplicativo no celular</button></div>'
    : '') +
  '<div class="admin-links"><button class="admin-link" data-act="openAdmin">' +
  ic('lock') +
  'Admin</button><button class="admin-link" data-act="openStaff">' +
  ic('lock') +
  'Colaborador</button></div></div></div>';

/* Regras e política de uso (texto-modelo — revise com o responsável pelo projeto) */
const TERMS_V = '1.0';
const TERMS_HTML = [
  [
    '1. Cadastro e dados pessoais',
    'Informe dados verdadeiros. Seu nome, e-mail e celular ficam guardados no cadastro e são usados somente para o atendimento da Carwash (confirmar, avisar ou resolver algo sobre a sua lavagem), conforme a LGPD. Você pode cadastrar um nome social e escolher ser chamado(a) por ele no aplicativo; o nome civil continua no cadastro para a equipe.'
  ],
  [
    '2. Veículos e placa Mercosul',
    'Só aceitamos placas no padrão Mercosul: 3 letras, 1 número, 1 letra e 2 números (exemplo: ABC1D23). Cada placa pode ser cadastrada uma única vez. Um veículo com agendamentos não pode ser removido.'
  ],
  [
    '3. Agendamentos',
    'Atendemos nas unidades FMU da cidade de São Paulo, das 08:00 às 17:00, em horários de 1 em 1 hora. Ao escolher um horário ele fica reservado para você por 15 minutos, enquanto você finaliza o pedido. Cada horário comporta um único agendamento por unidade.'
  ],
  [
    '4. Serviços e observações',
    'Os valores são os exibidos na tabela de serviços. O campo “Algo a dizer?” é lido pelo colaborador, mas não altera o serviço contratado nem o preço.'
  ],
  [
    '5. Preferência de colaborador',
    'Você pode indicar um colaborador de preferência. É apenas um pedido: não garantimos que você será atendido(a) por ele, pois isso depende de quem estiver disponível no horário.'
  ],
  [
    '6. Pagamento',
    'Você pode pagar por Pix (QR Code ou Copia e Cola; a equipe confirma o recebimento) ou escolher “Pagar no local”, em dinheiro ou cartão, na unidade. O pagamento no local é registrado como recebido quando a lavagem é concluída.'
  ],
  [
    '7. Chegada e tolerância',
    'Chegue no horário e apresente o código da lavagem ao colaborador. Há tolerância de 15 minutos; depois disso o horário pode ser remanejado.'
  ],
  [
    '8. Cancelamento, reagendamento e estorno',
    'Você pode cancelar ou reagendar enquanto a lavagem estiver como “Aguardando”. Depois que ela começar, não é mais possível. Em caso de Pix já pago, o pedido de estorno é registrado e analisado pela equipe.'
  ],
  [
    '9. Reclamações e Fale conosco',
    'Em “Meus agendamentos” você pode registrar reclamações e falar com a equipe. Tudo fica registrado no seu cadastro e é respondido pelos contatos informados ou pelo e-mail ' +
      SUPPORT_EMAIL +
      '.'
  ],
  [
    '10. Problemas durante a lavagem',
    'Se algo acontecer, o colaborador registra o problema e o status passa a “Com Problema”. A equipe entra em contato com você pelos dados do cadastro.'
  ],
  [
    '11. Uso adequado',
    'Não é permitido usar dados falsos, fazer agendamentos sem intenção de comparecer ou tentar acessar áreas restritas da equipe. Contas com uso indevido podem ser suspensas.'
  ]
]
  .map(x => '<h4>' + x[0] + '</h4><p>' + x[1] + '</p>')
  .join('');

/* TELA 01B — Cadastro */
screens.register = () =>
  backBtn('login', 'Voltar ao login') +
  '<h1>Criar conta</h1><p class="sub">Leva menos de um minuto.</p>' +
  '<form class="card stack" data-form="register" novalidate>' +
  field({
    id: 'name',
    label: 'Nome completo',
    ph: 'Maria da Silva',
    attrs: 'autocomplete="name"',
    hint: 'Nome e sobrenome, como está no documento.'
  }) +
  field({
    id: 'social',
    label: 'Nome social <span class="muted" style="font-weight:500">(opcional)</span>',
    ph: 'Como você prefere ser chamado(a)',
    attrs: 'autocomplete="off"',
    hint: ''
  }) +
  '<label style="display:flex;gap:10px;align-items:flex-start;font-size:14px"><input type="checkbox" id="useSocial" name="useSocial" style="width:20px;height:20px;accent-color:var(--primary);margin-top:1px"><span>Quero ser chamado(a) pelo nome social no aplicativo</span></label>' +
  field({
    id: 'email',
    label: 'E-mail',
    type: 'email',
    ph: 'seunome@gmail.com',
    attrs: 'autocomplete="email" inputmode="email"',
    hint: 'Use um e-mail @gmail ou @outlook.'
  }) +
  field({
    id: 'phone',
    label: 'Celular (WhatsApp)',
    type: 'tel',
    ph: '(11) 98765-4321',
    attrs: 'autocomplete="tel" inputmode="tel" data-mask="phone"',
    hint: 'Com DDD. Fica salvo no cadastro para a equipe falar com você quando precisar.'
  }) +
  field({
    id: 'password',
    label: 'Senha',
    type: 'password',
    ph: 'Crie uma senha forte',
    attrs: 'autocomplete="new-password"',
    pw: true
  }) +
  '<ul class="rules" id="rules" aria-label="Requisitos da senha">' +
  PASS_RULES.map(
    (r, i) => '<li data-r="' + i + '"><span class="dot">' + ic('check') + '</span>' + r[0] + '</li>'
  ).join('') +
  '</ul>' +
  '<div class="field" data-f="terms"><label id="tlbl">Regras e política de uso do app</label><div class="terms" tabindex="0" role="region" aria-labelledby="tlbl">' +
  TERMS_HTML +
  '</div>' +
  '<div class="seg" role="radiogroup" aria-label="Aceite das regras" style="margin-top:10px"><button type="button" role="radio" aria-checked="' +
  (S.terms === 'yes') +
  '" data-act="selTerms" data-v="yes">' +
  ic('check') +
  'Concordo</button><button type="button" role="radio" aria-checked="' +
  (S.terms === 'no') +
  '" data-act="selTerms" data-v="no">' +
  ic('trash') +
  'Discordo</button></div>' +
  '<div class="hint"></div><div class="err" id="terms-err" role="alert"></div>' +
  '<div class="banner bad" id="termsBan" style="' +
  (S.terms === 'no' ? '' : 'display:none') +
  '">Sem concordar com as regras e a política de uso não é possível criar a conta.</div></div>' +
  '<button class="btn primary" type="submit">Criar conta</button>' +
  '</form>';

/* TELA 02 — Hub do cliente */
const homeCard = (act, to, ico, title, desc, badge) =>
  '<button type="button" class="opt hub" data-act="' +
  act +
  '"' +
  (to ? ' data-to="' + to + '"' : '') +
  '><span class="ico">' +
  ic(ico) +
  '</span><span class="txt"><b>' +
  title +
  '</b><span>' +
  desc +
  '</span></span>' +
  (badge
    ? '<span class="tag" style="background:var(--primary);color:var(--primary-ink)">' + badge + '</span>'
    : '') +
  '<span class="chev">' +
  ic('back') +
  '</span></button>';
screens.home = () => {
  const act = D.bookings.filter(
    b => b.userId === S.user.id && !['Concluído', 'Cancelado'].includes(b.status)
  ).length;
  return (
    '<h1>Olá, ' +
    esc(firstName(dispName(S.user))) +
    '!</h1><p class="sub">O que você quer fazer agora?</p>' +
    homeCard(
      'go',
      'mybookings',
      'cal',
      'Meus agendamentos',
      'Acompanhe ao vivo, cancele, reagende ou fale conosco',
      act ? act + (act > 1 ? ' ativos' : ' ativo') : ''
    ) +
    homeCard(
      'startBooking',
      '',
      'drop',
      'Realizar um agendamento',
      'Escolha veículo, serviço, unidade e horário'
    ) +
    homeCard(
      'go',
      'vehicles',
      'car',
      'Cadastro de veículos',
      'Veja, adicione ou remova seus carros e motos'
    ) +
    homeCard('openUnits', '', 'pin', 'Nossas unidades', 'Mapa, fotos e tour 360° de cada unidade')
  );
};

/* TELA 02A — Garagem (agendar) e 02B — Cadastro de veículos */
function garageHtml(manage) {
  const g = S.gv,
    list = myVehicles(),
    show = S.showForm || !list.length;
  const vlist = list.length
    ? '<div role="' +
      (manage ? 'list' : 'radiogroup') +
      '" aria-label="Seus veículos" style="margin-bottom:14px">' +
      list
        .map(
          v =>
            '<div class="opt' +
            (!manage && S.draft.vehicleId === v.id ? ' sel' : '') +
            '" ' +
            (manage
              ? ''
              : 'role="radio" aria-checked="' +
                (S.draft.vehicleId === v.id) +
                '" tabindex="0" data-act="selVeh" data-id="' +
                v.id +
                '"') +
            ' style="cursor:' +
            (manage ? 'default' : 'pointer') +
            '">' +
            '<span class="ico">' +
            ic(v.cat === 'Moto' ? 'moto' : 'car') +
            '</span><span class="txt"><b>' +
            esc(v.model) +
            '</b><span>' +
            esc(v.cat) +
            ' · ' +
            esc(v.sub) +
            ' · ' +
            esc(v.color) +
            '</span></span>' +
            '<span class="plate">' +
            esc(v.plate) +
            '</span>' +
            '<button class="iconbtn" data-act="delVeh" data-id="' +
            v.id +
            '" aria-label="Remover ' +
            esc(v.model) +
            '">' +
            ic('trash') +
            '</button>' +
            (manage ? '' : '<span class="tick">' + ic('check') + '</span>') +
            '</div>'
        )
        .join('') +
      '</div>'
    : '';
  const form = show
    ? '<form class="card stack" data-form="vehicle" novalidate><h2 style="font-size:17px">Cadastrar veículo</h2>' +
      '<div><div class="small" style="font-weight:600;margin-bottom:8px" id="catlbl">Categoria</div><div class="seg" role="radiogroup" aria-labelledby="catlbl">' +
      ['Carro', 'Moto']
        .map(
          c =>
            '<button type="button" role="radio" aria-checked="' +
            (g.cat === c) +
            '" data-act="selCat" data-v="' +
            c +
            '">' +
            ic(c === 'Moto' ? 'moto' : 'car') +
            c +
            '</button>'
        )
        .join('') +
      '</div></div>' +
      '<div><div class="small" style="font-weight:600;margin-bottom:8px" id="sublbl">Tipo</div><div class="chips" role="radiogroup" aria-labelledby="sublbl">' +
      SUBS[g.cat]
        .map(
          s =>
            '<button type="button" class="chip" role="radio" aria-checked="' +
            (g.sub === s) +
            '" data-act="selSub" data-v="' +
            s +
            '">' +
            s +
            '</button>'
        )
        .join('') +
      '</div></div>' +
      field({
        id: 'model',
        label: 'Modelo',
        ph: g.cat === 'Moto' ? 'Ex.: CB 500' : 'Ex.: Corolla',
        val: g.model,
        attrs: 'data-gv="model" autocomplete="off"'
      }) +
      '<div class="field" data-f="color"><label for="color">Cor</label><input id="color" name="color" list="colors" placeholder="Ex.: Prata" value="' +
      esc(g.color) +
      '" data-gv="color" autocomplete="off" aria-describedby="color-err"><datalist id="colors">' +
      COLORS.map(c => '<option value="' + c + '">').join('') +
      '</datalist><div class="hint"></div><div class="err" id="color-err" role="alert"></div></div>' +
      field({
        id: 'plate',
        label: 'Placa (padrão Mercosul)',
        ph: 'ABC1D23',
        val: g.plate,
        attrs:
          'data-gv="plate" data-mask="plate" maxlength="7" autocapitalize="characters" autocomplete="off"',
        hint: '3 letras, 1 número, 1 letra e 2 números.'
      }) +
      '<button class="btn primary" type="submit">Salvar veículo</button></form>'
    : '<button class="btn ghost" data-act="showForm">' + ic('plus') + 'Cadastrar novo veículo</button>';
  if (manage)
    return (
      backBtn('home') +
      '<h1>Cadastro de veículos</h1><p class="sub">' +
      (list.length
        ? 'Seus veículos cadastrados. Para agendar, volte e toque em “Realizar um agendamento”.'
        : 'Cadastre seu primeiro carro ou moto.') +
      '</p>' +
      vlist +
      form
    );
  return (
    stepper(0) +
    backBtn('home') +
    '<h1>Olá ' +
    esc(firstName(dispName(S.user))) +
    ', gostaria de realizar a limpeza em qual veículo?</h1><p class="sub">Escolha um veículo salvo ou cadastre um novo.</p>' +
    vlist +
    form +
    '<div style="margin-top:18px"><button class="btn primary" data-act="go" data-to="services" ' +
    (S.draft.vehicleId ? '' : 'disabled') +
    '>Continuar</button></div>'
  );
}
screens.garage = () => garageHtml(false);
screens.vehicles = () => garageHtml(true);

/* TELA 02C — Meus agendamentos */
const STATUS_MSG = {
  Aguardando: 'Aguardando o horário do seu agendamento.',
  Iniciando: 'O colaborador está iniciando a sua lavagem.',
  'Em Lavagem': 'Seu veículo está sendo lavado agora.',
  'Com Problema': 'Houve um problema na lavagem. A equipe vai falar com você.',
  Concluído: 'Lavagem concluída. Seu veículo está pronto!',
  Cancelado: 'Este agendamento foi cancelado.'
};
const BADGE_CLS = s => ({ ok: 'b-ok', info: 'b-info', bad: 'b-bad', warn: 'b-warn' })[stCls(s)];
const inWindow = b =>
  ['Iniciando', 'Em Lavagem', 'Com Problema'].includes(b.status) ||
  (b.status === 'Aguardando' && b.date === todayKey() && new Date().getHours() >= parseInt(b.time));
function bookingCard(b) {
  const v = vehById(b.vehicleId),
    sv = svcById(b.serviceId),
    reqs = D.requests.filter(r => r.bookingId === b.id).sort((x, y) => y.at - x.at),
    hl = inWindow(b);
  const canChange = b.status === 'Aguardando',
    hasRefund = reqs.some(r => r.type === 'Estorno');
  const who =
    ['Iniciando', 'Em Lavagem', 'Com Problema', 'Concluído'].includes(b.status) && b.staff
      ? 'Colaborador: ' + b.staff
      : b.pref
        ? 'Preferência: ' + b.pref
        : 'Sem preferência de colaborador';
  return (
    '<article class="card bk' +
    (hl ? ' hl' : '') +
    '" aria-label="Agendamento ' +
    esc(b.code) +
    '">' +
    '<div class="hd"><span class="code">' +
    esc(b.code) +
    '</span><span class="badge ' +
    BADGE_CLS(b.status) +
    '" role="status">' +
    esc(b.status) +
    '</span></div>' +
    '<p class="msg"><b>' +
    STATUS_MSG[b.status] +
    '</b>' +
    (b.status === 'Com Problema' && b.problem
      ? '<br><span class="muted">' + esc(b.problem) + '</span>'
      : '') +
    '</p>' +
    '<div class="sum"><div><span>Veículo</span><span>' +
    esc(v ? v.model + ' · ' + v.plate : '—') +
    '</span></div><div><span>Serviço</span><span>' +
    (sv ? sv.name : '—') +
    '</span></div><div><span>Unidade</span><span>' +
    esc(b.unit) +
    '</span></div><div><span>Data e hora</span><span>' +
    wkShort(b.date) +
    ', ' +
    brDate(b.date) +
    ' · ' +
    b.time +
    '</span></div><div><span>Colaborador</span><span>' +
    esc(who.replace(/^Colaborador: |^Preferência: /, '')) +
    '</span></div><div><span>Pagamento</span><span>' +
    esc(payLabel(b)) +
    ' · ' +
    payShort(b) +
    '</span></div><div class="total"><span>Total</span><span>' +
    money(b.price) +
    '</span></div></div>' +
    '<div class="acts">' +
    (canChange
      ? '<button class="btn outline" data-act="reschedule" data-id="' +
        b.id +
        '">Reagendar</button><button class="btn outline" data-act="openCancel" data-id="' +
        b.id +
        '">Cancelar</button>'
      : '') +
    '<button class="btn ' +
    (hl ? 'primary' : 'outline') +
    (canChange ? '' : ' full') +
    '" data-act="openReq" data-id="' +
    b.id +
    '" data-type="Fale conosco">' +
    ic('mail') +
    'Fale conosco</button>' +
    '<button class="btn ghost" data-act="openReq" data-id="' +
    b.id +
    '" data-type="Reclamação">Reclamação</button>' +
    (b.paid && b.pay === 'pix' && !hasRefund && b.status !== 'Concluído'
      ? '<button class="btn ghost" data-act="openReq" data-id="' +
        b.id +
        '" data-type="Estorno">Solicitar estorno</button>'
      : '') +
    '<button class="btn ghost" data-act="pdfBk" data-id="' +
    b.id +
    '">' +
    ic('doc') +
    'Comprovante</button>' +
    '</div>' +
    (hl && b.status === 'Aguardando'
      ? '<p class="small muted" style="margin-top:10px">É a hora do seu agendamento. Precisando, use o “Fale conosco”.</p>'
      : '') +
    (reqs.length
      ? '<div class="reqs"><b>Solicitações deste agendamento</b>' +
        reqs
          .map(
            r =>
              '<div><span class="tag">' +
              esc(r.type) +
              '</span> <span class="tag" style="' +
              (r.status === 'Concluída' ? 'color:var(--ok)' : 'color:var(--warn)') +
              '">' +
              esc(r.status) +
              '</span> <span class="muted">' +
              fmtDT(r.at).replace(' às ', ' · ') +
              '</span><br>' +
              esc(r.text) +
              '</div>'
          )
          .join('') +
        '</div>'
      : '') +
    '</article>'
  );
}
screens.mybookings = () => {
  const all = D.bookings.filter(b => b.userId === S.user.id);
  const act = all
    .filter(b => !['Concluído', 'Cancelado'].includes(b.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const old = all
    .filter(b => ['Concluído', 'Cancelado'].includes(b.status))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  return (
    backBtn('home') +
    '<h1>Meus agendamentos</h1><p class="sub"><span class="live"><i></i>Status ao vivo</span></p>' +
    (all.length
      ? ''
      : '<div class="card center"><p>Você ainda não tem agendamentos.</p><button class="btn primary" style="margin-top:12px" data-act="startBooking">Realizar um agendamento</button></div>') +
    (act.length
      ? '<h2 style="font-size:16px;margin:4px 0 0">Em andamento e próximos</h2>' +
        act.map(bookingCard).join('')
      : '') +
    (old.length
      ? '<h2 style="font-size:16px;margin:22px 0 0">Histórico</h2>' + old.map(bookingCard).join('')
      : '')
  );
};

/* TELA 03 — Serviços */
screens.services = () => {
  const v = vehById(S.draft.vehicleId);
  if (!v) return '';
  const list = SERVICES.filter(x => !x.only || x.only === v.cat);
  if (S.draft.serviceId && !list.find(x => x.id === S.draft.serviceId)) S.draft.serviceId = null;
  const sel = S.draft.serviceId,
    sv = svcById(sel);
  let g = '';
  const rows = list
    .map(x => {
      let h = '';
      if (x.grp !== g) {
        g = x.grp;
        h = '<tr class="grp"><th colspan="3" scope="colgroup">' + g + '</th></tr>';
      }
      return (
        h +
        '<tr data-act="selSvc" data-id="' +
        x.id +
        '" class="' +
        (sel === x.id ? 'sel' : '') +
        '"><td style="width:44px"><input type="radio" name="svc" aria-label="' +
        esc(x.name) +
        '" ' +
        (sel === x.id ? 'checked' : '') +
        '></td><td><b>' +
        x.name +
        '</b><small>' +
        x.desc +
        '</small></td><td class="pr">' +
        money(x.price) +
        '</td></tr>'
      );
    })
    .join('');
  return (
    stepper(1) +
    backBtn('garage') +
    '<h1>Olá ' +
    esc(firstName(S.user.name)) +
    ', gostaria de lavar o veículo de qual maneira?</h1>' +
    '<p class="sub">' +
    esc(v.model) +
    ' · <span class="plate">' +
    esc(v.plate) +
    '</span></p>' +
    '<div class="svc"><table><caption class="sr">Tabela de serviços e valores</caption><thead><tr><th scope="col"><span class="sr">Selecionar</span></th><th scope="col">Serviço</th><th scope="col" style="text-align:right">Valor</th></tr></thead><tbody>' +
    rows +
    '</tbody></table></div>' +
    '<div class="field" data-f="obs" style="margin-top:18px"><label for="obs">Algo a dizer? <span class="muted" style="font-weight:500">(opcional)</span></label><textarea id="obs" name="obs" rows="3" maxlength="200" placeholder="Ex.: favor não retirar o tapete; ter cuidado com o risco na porta traseira.">' +
    esc(S.draft.obs || '') +
    '</textarea><div class="hint">Aparece no seu comprovante e para o colaborador que fará a lavagem. <span id="obsN">' +
    (S.draft.obs || '').length +
    '/200</span></div></div>' +
    '<div style="margin-top:18px"><button class="btn primary" data-act="go" data-to="unit" ' +
    (sel ? '' : 'disabled') +
    '>' +
    (sv ? 'Continuar · ' + money(sv.price) : 'Continuar') +
    '</button></div>'
  );
};

/* TELA 04 — Local e TELA 04B — Unidade (mapa, fotos e tour 360°): ficam em js/telas-unidades.js */

/* TELA 05 — Horário (também usada para reagendar) */
screens.time = () => {
  const d = S.draft,
    opts = dateOptions(d.unit),
    rs = !!S.resched;
  if (!d.date || !opts.find(o => o.k === d.date && o.free)) {
    const f = opts.find(o => o.free);
    d.date = f ? f.k : opts[0].k;
    if (d.time && !slotFree(d.unit, d.date, d.time)) d.time = null;
  }
  return (
    (rs ? '' : stepper(3)) +
    backBtn(rs ? 'mybookings' : 'unit') +
    '<h1>' +
    (rs ? 'Reagendar: escolha o novo dia e horário' : 'Escolha o dia e o horário') +
    '</h1><p class="sub">' +
    esc(d.unit) +
    ' · horários de 1 em 1 hora, das 08:00 às 17:00.</p>' +
    '<div class="dates" role="group" aria-label="Datas">' +
    opts
      .map(
        o =>
          '<button class="date" data-act="selDate" data-k="' +
          o.k +
          '" aria-pressed="' +
          (d.date === o.k) +
          '" ' +
          (o.free ? '' : 'disabled') +
          ' aria-label="' +
          wkShort(o.k) +
          ', ' +
          brDate(o.k) +
          (o.free ? '' : ' (sem horários)') +
          '"><small>' +
          o.wd +
          '</small><b>' +
          o.day +
          '</b></button>'
      )
      .join('') +
    '</div>' +
    '<div class="slots" role="group" aria-label="Horários disponíveis em ' +
    brDate(d.date) +
    '" style="margin-top:6px">' +
    SLOTS.map(t => {
      const free = slotFree(d.unit, d.date, t),
        taken = slotTaken(d.unit, d.date, t);
      return (
        '<button class="slot" data-act="selTime" data-t="' +
        t +
        '" aria-pressed="' +
        (d.time === t) +
        '" ' +
        (free ? '' : 'disabled') +
        '>' +
        t +
        (free
          ? ''
          : '<small>' +
            (bookedAt(d.unit, d.date, t)
              ? 'Ocupado'
              : heldAt(d.unit, d.date, t)
                ? 'Reservado'
                : 'Encerrado') +
            '</small>') +
        '</button>'
      );
    }).join('') +
    '</div>' +
    '<div style="margin-top:18px"><button class="btn primary" data-act="' +
    (rs ? 'doResched' : 'go') +
    '" data-to="checkout" ' +
    (d.time ? '' : 'disabled') +
    '>' +
    (d.time
      ? (rs ? 'Confirmar novo horário · ' : 'Continuar · ') + brDate(d.date) + ' às ' + d.time
      : rs
        ? 'Confirmar novo horário'
        : 'Continuar') +
    '</button></div>'
  );
};

function summaryHtml() {
  const d = S.draft,
    v = vehById(d.vehicleId),
    s = svcById(d.serviceId);
  return (
    '<div class="card sum"><div><span>Veículo</span><span>' +
    esc(v.model) +
    ' · ' +
    esc(v.plate) +
    '</span></div><div><span>Serviço</span><span>' +
    s.name +
    '</span></div>' +
    (d.obs && d.obs.trim()
      ? '<div><span>Observações</span><span>' + esc(d.obs.trim()) + '</span></div>'
      : '') +
    '<div><span>Unidade</span><span>' +
    esc(d.unit) +
    '</span></div><div><span>Data e hora</span><span>' +
    wkShort(d.date) +
    ', ' +
    brDate(d.date) +
    ' · ' +
    d.time +
    '</span></div><div><span>Colaborador de preferência</span><span>' +
    esc(d.pref || 'Sem preferência') +
    '</span></div><div class="total"><span>Total</span><span>' +
    money(s.price) +
    '</span></div></div>'
  );
}

/* TELA 06 — Checkout */
screens.checkout = () => {
  const pref = S.draft.pref || '';
  const opts = [
    ['pix', 'pix', 'Pix', 'Toque para gerar o QR Code e o Copia e Cola'],
    ['local', 'cash', 'Pagar no local', 'Esse pagamento pode ser realizado em dinheiro ou cartão no local']
  ];
  return (
    stepper(4) +
    backBtn('time') +
    '<h1>Finalizar agendamento</h1><p class="sub">Revise o pedido, escolha o colaborador de preferência e a forma de pagamento.</p>' +
    summaryHtml() +
    '<h2 style="font-size:16px;margin:20px 0 4px" id="preflbl">Tem preferência por algum colaborador?</h2>' +
    '<div class="chips" role="radiogroup" aria-labelledby="preflbl" style="margin-top:8px">' +
    STAFF.map(
      n =>
        '<button type="button" class="chip" role="radio" aria-checked="' +
        (pref === n) +
        '" data-act="selPref" data-v="' +
        n +
        '">' +
        n +
        '</button>'
    ).join('') +
    '<button type="button" class="chip" role="radio" aria-checked="' +
    (pref === '') +
    '" data-act="selPref" data-v="">Não faço questão de nenhum colaborador</button></div>' +
    '<p class="notice" style="margin-top:10px">A preferência é só um pedido: não garantimos que você será atendido(a) por esse colaborador, pois depende de quem estiver disponível no horário.</p>' +
    '<h2 style="font-size:16px;margin:20px 0 10px" id="paylbl">Forma de pagamento</h2><div aria-labelledby="paylbl" role="group">' +
    opts
      .map(
        o =>
          '<button type="button" class="opt" data-act="selPay" data-id="' +
          o[0] +
          '"><span class="ico">' +
          ic(o[1]) +
          '</span><span class="txt"><b>' +
          o[2] +
          '</b><span>' +
          o[3] +
          '</span></span><span class="chev">' +
          ic('back') +
          '</span></button>'
      )
      .join('') +
    '</div>'
  );
};

/* TELA 06A — Pix */
screens.pix = () => {
  const s = svcById(S.draft.serviceId);
  if (!S.pix || S.pix.expires <= 0) {
    const txid = 'CW' + Math.random().toString(36).slice(2, 12).toUpperCase();
    S.pix = {
      txid,
      payload: pixPayload(s.price, txid),
      expires: Date.now() + PIX_MINUTES * 60000,
      total: PIX_MINUTES * 60000
    };
  }
  return (
    backBtn('checkout') +
    '<h1>Pix Instantâneo</h1><p class="sub">Escaneie o QR Code no app do seu banco ou use o Copia e Cola.</p>' +
    '<div class="card center"><div class="muted small">Valor a pagar</div><div style="font-size:30px;font-weight:800;letter-spacing:-.02em;margin-bottom:12px">' +
    money(s.price) +
    '</div>' +
    '<div class="qr" id="qr">' +
    qrSvg(S.pix.payload) +
    '</div>' +
    '<div class="timer" aria-live="off">' +
    ic('clock') +
    '<span>Expira em <b id="pixTimer">--:--</b></span></div><div class="bar" aria-hidden="true"><span id="pixBar" style="width:100%"></span></div></div>' +
    '<div class="card stack" style="margin-top:14px"><label for="copia" style="font-weight:600;font-size:14px">Pix Copia e Cola</label><textarea id="copia" class="copybox" readonly>' +
    esc(S.pix.payload) +
    '</textarea>' +
    '<button class="btn outline" data-act="copyPix">' +
    ic('copy') +
    'Copiar código</button></div>' +
    (PIX_DEMO
      ? '<p class="notice" style="margin:14px 0">Ambiente de demonstração: o código usa uma chave fictícia e nenhuma cobrança real é feita. Use o botão abaixo para simular a confirmação do pagamento.</p>'
      : '<p class="notice" style="margin:14px 0">Pague no app do seu banco (o valor já vem no código). Depois toque em “Já fiz o pagamento”: a equipe confirma o recebimento na unidade.</p>') +
    '<button class="btn primary" id="simPix" data-act="simPix">' +
    (PIX_DEMO ? 'Simular pagamento aprovado' : 'Já fiz o pagamento') +
    '</button>' +
    '<button class="btn ghost" id="newPix" data-act="newPix" style="margin-top:10px;display:none">Gerar novo código Pix</button>'
  );
};

/* TELA 07 — Confirmação */
screens.confirm = () => {
  const b = S.last;
  if (!b) return '';
  const v = vehById(b.vehicleId),
    sv = svcById(b.serviceId),
    u = userById(b.userId);
  return (
    backBtn('home', 'Voltar ao início') +
    '<div class="center"><div class="okmark">' +
    ic('check') +
    '</div><h1>Agendamento confirmado!</h1><p class="sub">Código da lavagem <span class="code">' +
    b.code +
    '</span></p></div>' +
    '<div class="card sum"><div><span>Cliente</span><span>' +
    esc(dispName(u)) +
    '</span></div><div><span>Veículo</span><span>' +
    esc(v.model) +
    ' · ' +
    esc(v.plate) +
    '</span></div><div><span>Serviço</span><span>' +
    sv.name +
    '</span></div>' +
    (b.obs ? '<div><span>Observações</span><span>' + esc(b.obs) + '</span></div>' : '') +
    '<div><span>Unidade</span><span>' +
    esc(b.unit) +
    '</span></div><div><span>Data e hora</span><span>' +
    wkShort(b.date) +
    ', ' +
    brDate(b.date) +
    ' · ' +
    b.time +
    '</span></div><div><span>Colaborador de preferência</span><span>' +
    esc(b.pref || 'Sem preferência') +
    '</span></div><div><span>Pagamento</span><span>' +
    esc(payFull(b)) +
    '</span></div><div><span>Situação</span><span>' +
    payState(b) +
    '</span></div><div class="total"><span>Total</span><span>' +
    money(b.price) +
    '</span></div></div>' +
    (b.pref
      ? '<p class="notice" style="margin-top:10px">Pedimos o(a) colaborador(a) ' +
        esc(b.pref) +
        ', mas não é garantido que seja ele(a) a atender você.</p>'
      : '') +
    '<div class="card notif" style="margin-top:14px"><h2>Seu contato fica salvo no cadastro</h2><div class="sum" style="margin-top:8px"><div><span>Celular / WhatsApp</span><span>' +
    esc(u.phone) +
    '</span></div><div><span>E-mail</span><span>' +
    esc(u.email) +
    '</span></div></div><p class="notice" style="margin-top:10px">Se a equipe precisar falar com você, usará esses contatos. Guarde o código <b>' +
    b.code +
    '</b>: é com ele que o colaborador abre o seu pedido na unidade.</p></div>' +
    '<div class="stack" style="margin-top:18px">' +
    '<button class="btn primary" data-act="go" data-to="mybookings">' +
    ic('cal') +
    'Ver meus agendamentos</button>' +
    '<button class="btn ghost" data-act="pdf">' +
    ic('doc') +
    'Baixar comprovante em PDF</button>' +
    '<button class="btn outline" data-act="startBooking">Novo agendamento</button></div>' +
    '<p class="center small muted" style="margin-top:14px">Dúvidas? Fale com a Carwash: <a href="mailto:' +
    SUPPORT_EMAIL +
    '">' +
    SUPPORT_EMAIL +
    '</a></p>' +
    (PIX_DEMO
      ? '<p class="center small muted" style="margin-top:6px">Demonstração: nenhuma cobrança real é feita.</p>'
      : '') +
    ''
  );
};
