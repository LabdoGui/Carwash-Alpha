/* Carwash — js/painel-admin-telas.js
   Monta a tela do painel administrativo (todos os painéis e botões de exportar). */
'use strict';
/* ---- painel administrativo ---- */
const PNL = (id, title, sub, body, cls) =>
  '<section class="panel' +
  (cls ? ' ' + cls : '') +
  '" id="p-' +
  id +
  '" data-xl="' +
  esc(title) +
  '"><header><h2>' +
  title +
  '</h2><div class="tools">' +
  (sub ? '<span class="muted small">' + sub + '</span>' : '') +
  '<button class="btn ghost sm" data-act="xlsPanel" data-p="' +
  id +
  '" aria-label="Exportar ' +
  esc(title) +
  ' para Excel">' +
  ic('doc') +
  'Exportar Excel</button></div></header>' +
  body +
  '</section>';
const NAV = [
  ['yard', 'Pátio'],
  ['all', 'Agendamentos'],
  ['cad', 'Clientes'],
  ['staff', 'Colaboradores'],
  ['req', 'Solicitações'],
  ['uagd', 'Por unidade'],
  ['ulucro', 'Lucros'],
  ['pmes', 'Problemas'],
  ['pag', 'Pagamentos']
];
function adminHtml() {
  const A = adminStats(),
    X = adminExtra(),
    now = new Date(),
    K = A.kpi,
    E = A.extra;
  const dm = D.users.some(u => u.demo) || D.bookings.some(b => b.demo);
  const maxT = Math.max(1, ...A.types.map(t => t.n));
  const yard = A.today
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(b => {
      const v = vehById(b.vehicleId),
        u = userById(b.userId),
        sv = svcById(b.serviceId);
      return (
        '<tr><td><b>' +
        b.time +
        '</b></td><td><span class="cw">' +
        esc(b.code) +
        '</span></td><td>' +
        esc(u ? u.name : '—') +
        '</td><td class="w">' +
        esc(v ? v.model : '—') +
        ' <span class="plate">' +
        esc(v ? v.plate : '') +
        '</span></td><td class="w">' +
        sv.name +
        obsLine(b) +
        '</td><td class="w">' +
        esc(b.unit) +
        '</td><td>' +
        esc(b.staff || b.pref || '—') +
        '</td><td>' +
        payLabel(b) +
        ' <span class="muted">· ' +
        payShort(b) +
        '</span>' +
        pixBtn(b) +
        '</td><td>' +
        statusSelect(b, 'st-', STATUSES) +
        '</td></tr>'
      );
    })
    .join('');
  const clients = A.clients.map(
    (c, i) =>
      '<tr><td>' +
      (i + 1) +
      '</td><td><b>' +
      esc(c.u.name) +
      '</b><br><span class="muted small">' +
      esc(c.u.email) +
      '</span></td><td class="n">' +
      c.n +
      '</td><td class="n"><b>' +
      money(c.total) +
      '</b></td><td>' +
      (c.last ? brDate(c.last) : '—') +
      '</td></tr>'
  );
  const vrows = cat =>
    D.vehicles
      .filter(v => v.cat === cat)
      .map(v => {
        const u = userById(v.userId);
        return (
          '<tr><td><span class="plate">' +
          esc(v.plate) +
          '</span></td><td>' +
          esc(v.model) +
          '</td><td><span class="tag">' +
          esc(v.sub) +
          '</span></td><td>' +
          esc(v.color) +
          '</td><td>' +
          esc(u ? u.name : '—') +
          '</td></tr>'
        );
      });
  const cars = vrows('Carro'),
    motos = vrows('Moto');
  const weeks = A.weeks.map((w, i) => {
    const prev = A.weeks[i - 1];
    let v = '—';
    if (prev && prev.rev > 0) {
      const p = Math.round(((w.rev - prev.rev) / prev.rev) * 100);
      v = '<span class="' + (p >= 0 ? 'pos' : 'neg') + '">' + (p >= 0 ? '▲ +' : '▼ ') + p + '%</span>';
    }
    return (
      '<tr><td>' +
      brDate(w.a).slice(0, 5) +
      ' – ' +
      brDate(w.z).slice(0, 5) +
      (i === 5 ? ' <span class="tag">atual</span>' : '') +
      '</td><td class="n">' +
      w.n +
      '</td><td class="n"><b>' +
      money(w.rev) +
      '</b></td><td class="n">' +
      v +
      '</td></tr>'
    );
  });
  const types = A.types
    .slice(0, 8)
    .map(
      (t, i) =>
        '<tr><td>' +
        (i + 1) +
        '</td><td><b>' +
        t.s.name +
        '</b></td><td class="n">' +
        t.n +
        '</td><td class="n">' +
        (A.total ? Math.round((t.n / A.total) * 100) : 0) +
        '%</td><td><div class="mini"><div class="bar"><span style="width:' +
        Math.round((t.n / maxT) * 100) +
        '%"></span></div></div></td></tr>'
    );
  const occ = A.units.map(u => {
    const p = Math.round((u.n / SLOTS.length) * 100);
    return (
      '<tr><td><b>' +
      esc(u.id) +
      '</b></td><td class="n">' +
      u.n +
      '</td><td class="n">' +
      u.free +
      '</td><td><div class="mini"><div class="bar"><span style="width:' +
      p +
      '%"></span></div><span class="small muted" style="min-width:34px;text-align:right">' +
      p +
      '%</span></div></td></tr>'
    );
  });
  const totPay = A.pays.reduce((a, p) => a + p.n, 0);
  const pays = A.pays.map(
    p =>
      '<tr><td><b>' +
      p.name +
      '</b></td><td class="n">' +
      p.n +
      '</td><td class="n">' +
      money(p.rev) +
      '</td><td class="n">' +
      (totPay ? Math.round((p.n / totPay) * 100) : 0) +
      '%</td></tr>'
  );
  const list = allList();
  const pixWait = D.bookings.filter(b => b.pay === 'pix' && !b.paid && b.status !== 'Cancelado');
  const totN = X.un.reduce((a, u) => a + u.n, 0);
  const uagd = X.un.map(
    u =>
      '<tr><td><b>' +
      esc(u.id) +
      '</b></td><td class="n">' +
      u.n +
      '</td><td class="n">' +
      pctS(u.n, totN) +
      '</td><td class="n">' +
      u.hoje +
      '</td><td class="n">' +
      u.aguard +
      '</td><td class="n">' +
      u.andam +
      '</td><td class="n">' +
      u.conc +
      '</td><td class="n">' +
      u.canc +
      '</td></tr>'
  );
  const ulu = X.un.map(
    u =>
      '<tr><td><b>' +
      esc(u.id) +
      '</b></td><td class="n">' +
      u.conc +
      '</td><td class="n"><b>' +
      money(u.receita) +
      '</b></td><td class="n">' +
      money(u.recebido) +
      '</td><td class="n">' +
      money(u.areceber) +
      '</td><td class="n">' +
      money(u.total) +
      '</td></tr>'
  );
  const tR = X.un.reduce(
    (a, u) => [a[0] + u.receita, a[1] + u.recebido, a[2] + u.areceber, a[3] + u.total],
    [0, 0, 0, 0]
  );
  const pmes = X.months.map(
    m =>
      '<tr><td><b>' +
      m.label +
      '</b></td><td class="n">' +
      m.n +
      '</td><td class="n">' +
      m.p +
      '</td><td class="n"><b>' +
      pctS(m.p, m.n) +
      '</b></td><td class="w">' +
      esc(m.units) +
      '</td></tr>'
  );
  const punit = X.un.map(
    u =>
      '<tr><td><b>' +
      esc(u.id) +
      '</b></td><td class="n">' +
      u.n +
      '</td><td class="n">' +
      u.prob +
      '</td><td class="n"><b>' +
      pctS(u.prob, u.n) +
      '</b></td></tr>'
  );
  const prob = X.probs.slice(0, 30).map(b => {
    const v = vehById(b.vehicleId);
    return (
      '<tr><td>' +
      brDate(b.date) +
      ' · ' +
      b.time +
      '</td><td class="w">' +
      esc(b.unit) +
      '</td><td><span class="cw">' +
      esc(b.code) +
      '</span></td><td>' +
      esc(b.staff || '—') +
      '</td><td class="w">' +
      esc(probText(b)) +
      '</td><td>' +
      esc(b.status) +
      '</td></tr>'
    );
  });
  const stf = X.staff.map(
    (s, i) =>
      '<tr><td>' +
      (i + 1) +
      '</td><td><b>' +
      s.n +
      '</b></td><td class="n"><b>' +
      s.conc +
      '</b></td><td class="n">' +
      pctS(s.conc, X.totConc) +
      '</td><td class="n">' +
      s.hojeC +
      '</td><td class="n">' +
      s.agora +
      '</td><td class="n">' +
      s.prob +
      '</td><td class="n">' +
      s.pref +
      '</td></tr>'
  );
  const req = X.reqs.slice(0, 25).map(r => {
    const u = userById(r.userId);
    return (
      '<tr><td>' +
      fmtDT(r.at).replace(' às ', ' · ') +
      '</td><td><span class="cw">' +
      esc(r.code) +
      '</span></td><td>' +
      esc(u ? u.name : '—') +
      '</td><td><span class="tag">' +
      esc(r.type) +
      '</span></td><td class="w" style="min-width:200px">' +
      esc(r.text) +
      '</td><td>' +
      esc(r.status) +
      '</td><td>' +
      (r.status !== 'Concluída'
        ? '<button class="btn ghost sm" data-act="resolveReq" data-id="' +
          r.id +
          '">Marcar como resolvida</button>'
        : '') +
      '</td></tr>'
    );
  });
  const cad = D.users
    .slice()
    .sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0))
    .map(
      u =>
        '<tr><td><b>' +
        esc(u.name) +
        '</b></td><td>' +
        esc(u.socialName || '—') +
        (u.socialName
          ? ' <span class="muted small">(' + (u.useSocial ? 'usa' : 'não usa') + ')</span>'
          : '') +
        '</td><td>' +
        esc(u.phone) +
        '</td><td class="w">' +
        esc(u.email) +
        '</td><td class="n">' +
        D.vehicles.filter(v => v.userId === u.id).length +
        '</td><td class="n">' +
        D.bookings.filter(b => b.userId === u.id && b.status !== 'Cancelado').length +
        '</td><td>' +
        (u.termsAt ? brDate(dkey(new Date(u.termsAt))) : '—') +
        '</td></tr>'
    );
  return (
    '<div class="adm-head"><div>' +
    backAct('exitAdmin', 'Voltar') +
    '<div class="eyebrow">Painel administrativo</div><h1 style="margin:0">Pátio de hoje · ' +
    brDate(todayKey()) +
    '</h1><span class="live" style="margin-top:6px"><i></i>Tempo real · atualizado às <span id="upd">' +
    pad(now.getHours()) +
    ':' +
    pad(now.getMinutes()) +
    ':' +
    pad(now.getSeconds()) +
    '</span></span></div>' +
    '<div class="tools"><button class="btn primary sm" data-act="xlsAll">' +
    ic('doc') +
    'Exportar tudo (Excel)</button><button class="btn ghost sm" data-act="' +
    (dm ? 'clearDemo' : 'seedDemo') +
    '">' +
    (dm ? 'Remover dados de demonstração' : 'Carregar dados de demonstração') +
    '</button></div></div>' +
    '<nav class="jump" aria-label="Ir para o painel">' +
    NAV.map(
      n => '<button type="button" class="chip" data-act="jump" data-id="p-' + n[0] + '">' + n[1] + '</button>'
    ).join('') +
    '</nav>' +
    '<section class="kpis" aria-label="Indicadores de hoje">' +
    '<div class="kpi"><span>Faturamento Hoje</span><b>' +
    money(K.rev) +
    '</b><small>serviços concluídos hoje</small></div>' +
    '<div class="kpi"><span>Veículos Atendidos</span><b>' +
    K.served +
    '</b><small>em lavagem ou concluídos</small></div>' +
    '<div class="kpi"><span>Concluídos</span><b>' +
    K.done +
    '</b><small>de ' +
    A.today.length +
    ' agendados hoje</small></div>' +
    '<div class="kpi"><span>Eficiência</span><b>' +
    K.eff +
    '%</b><small>concluídos ÷ agendados</small></div></section>' +
    '<section class="kpis k2" aria-label="Mais indicadores">' +
    '<div class="kpi"><span>Agendados Hoje</span><b>' +
    E.n +
    '</b><small>todas as unidades</small></div>' +
    '<div class="kpi"><span>A Receber (hoje)</span><b>' +
    money(E.recv) +
    '</b><small>Pix a confirmar + pagar no local</small></div>' +
    '<div class="kpi"><span>Colaborador destaque</span><b>' +
    (X.top ? X.top.n : '—') +
    '</b><small>' +
    (X.top ? X.top.conc + ' lavagens concluídas' : 'ainda sem lavagens') +
    '</small></div>' +
    '<div class="kpi"><span>Agendados Amanhã</span><b>' +
    E.tom +
    '</b><small>para planejar a equipe</small></div></section>' +
    PNL(
      'yard',
      'Pátio em tempo real',
      'Altere o status operacional de cada veículo',
      table(
        [
          ['Horário'],
          ['Código'],
          ['Cliente'],
          ['Veículo'],
          ['Serviço'],
          ['Unidade'],
          ['Colaborador'],
          ['Pagamento'],
          ['Status']
        ],
        yard ? [yard] : [],
        'Nenhum veículo agendado para hoje.'
      )
    ) +
    PNL(
      'all',
      'Agendamentos e códigos de lavagem',
      '<span class="tag" id="allCount">' + list.length + '</span>',
      '<div class="filters"><input id="admQ" type="text" autocomplete="off" placeholder="Buscar por código, cliente ou placa" value="' +
        esc(S.adm.q) +
        '" aria-label="Buscar agendamentos">' +
        '<select id="admU" aria-label="Filtrar por unidade"><option value="">Todas as unidades</option>' +
        UNITS.map(u => '<option' + (S.adm.unit === u.id ? ' selected' : '') + '>' + u.id + '</option>').join(
          ''
        ) +
        '</select>' +
        '<select id="admS" aria-label="Filtrar por status"><option value="">Todos os status</option>' +
        STATUSES_ALL.map(
          o => '<option' + (S.adm.status === o ? ' selected' : '') + '>' + o + '</option>'
        ).join('') +
        '</select></div>' +
        '<div class="scroll"><table class="dt"><thead><tr><th scope="col">Código</th><th scope="col">Data · Hora</th><th scope="col">Cliente</th><th scope="col">Veículo</th><th scope="col">Serviço</th><th scope="col">Unidade</th><th scope="col">Pagamento</th><th scope="col" class="n">Valor</th><th scope="col">Status</th></tr></thead><tbody id="allBody">' +
        allRowsHtml(list) +
        '</tbody></table></div><div class="note" id="allNote">' +
        allNoteHtml(list) +
        '</div>',
      'mt'
    ) +
    PNL(
      'cad',
      'Clientes cadastrados',
      '<span class="tag">' + D.users.length + '</span>',
      table(
        [
          ['Nome civil'],
          ['Nome social'],
          ['Celular / WhatsApp'],
          ['E-mail'],
          ['Veículos', 1],
          ['Agendamentos', 1],
          ['Aceite dos termos']
        ],
        cad,
        'Nenhum cliente cadastrado ainda.'
      ) +
        '<div class="note">Os dados de contato ficam guardados no cadastro para a equipe entrar em contato quando precisar.</div>',
      'mt'
    ) +
    PNL(
      'staff',
      'Colaboradores',
      'quem lavou mais e quem está atendendo agora',
      table(
        [
          ['#'],
          ['Colaborador'],
          ['Lavagens concluídas', 1],
          ['Participação', 1],
          ['Concluídas hoje', 1],
          ['Atendendo agora', 1],
          ['Com problema', 1],
          ['Pedidos de preferência', 1]
        ],
        stf,
        ''
      ) +
        '<div class="note">“Atendendo agora” é a quantidade de veículos em andamento com o colaborador. “Pedidos de preferência” mostra quantos clientes pediram cada um.</div>',
      'mt'
    ) +
    PNL(
      'req',
      'Solicitações dos clientes',
      'reclamações, estornos, Fale conosco e reagendamentos<span class="tag">' +
        D.requests.filter(r => r.status !== 'Concluída').length +
        ' abertas</span>',
      table(
        [['Data'], ['Código'], ['Cliente'], ['Tipo'], ['Mensagem'], ['Situação'], ['']],
        req,
        'Nenhuma solicitação ainda.'
      ),
      'mt'
    ) +
    PNL(
      'uagd',
      'Agendamentos por unidade',
      'todos os períodos',
      table(
        [
          ['Unidade'],
          ['Agendamentos', 1],
          ['% do total', 1],
          ['Hoje', 1],
          ['Aguardando', 1],
          ['Em andamento', 1],
          ['Concluídos', 1],
          ['Cancelados', 1]
        ],
        uagd,
        ''
      ),
      'mt'
    ) +
    PNL(
      'ulucro',
      'Lucros por unidade',
      'total utilizado, recebido e a receber',
      table(
        [
          ['Unidade'],
          ['Lavagens concluídas', 1],
          ['Receita concluída', 1],
          ['Recebido', 1],
          ['A receber', 1],
          ['Total (sem cancelados)', 1]
        ],
        ulu,
        ''
      ) +
        '<div class="note">Total geral: receita concluída <b>' +
        money(tR[0]) +
        '</b> · recebido <b>' +
        money(tR[1]) +
        '</b> · a receber <b>' +
        money(tR[2]) +
        '</b> · total <b>' +
        money(tR[3]) +
        '</b>. Receita bruta, sem custos operacionais.</div>',
      'mt'
    ) +
    '<div class="grid2">' +
    PNL(
      'pmes',
      'Problemas por mês',
      'últimos 6 meses · % sobre os agendamentos',
      table(
        [['Mês'], ['Agendamentos', 1], ['Com problema', 1], ['Porcentagem', 1], ['Unidades com problema']],
        pmes,
        ''
      )
    ) +
    PNL(
      'puni',
      'Problemas por unidade',
      'todos os períodos',
      table([['Unidade'], ['Agendamentos', 1], ['Com problema', 1], ['Porcentagem', 1]], punit, '')
    ) +
    '</div>' +
    PNL(
      'prob',
      'Problemas registrados',
      'quais foram, em qual unidade e quem atendia',
      table(
        [['Data · Hora'], ['Unidade'], ['Código'], ['Colaborador'], ['Problema'], ['Status']],
        prob,
        'Nenhum problema registrado.'
      ),
      'mt'
    ) +
    '<div class="grid2">' +
    PNL(
      'cli',
      'Maiores clientes',
      'por valor em serviços',
      table(
        [['#'], ['Cliente'], ['Lavagens', 1], ['Total', 1], ['Última visita']],
        clients,
        'Sem clientes com agendamentos ainda.'
      )
    ) +
    PNL(
      'pixw',
      'Pix aguardando confirmação',
      '<span class="tag">' + pixWait.length + '</span>',
      table(
        [['Código'], ['Cliente'], ['Valor', 1], ['']],
        pixWait.slice(0, 8).map(b => {
          const u = userById(b.userId);
          return (
            '<tr><td><span class="cw">' +
            esc(b.code) +
            '</span></td><td>' +
            esc(u ? u.name : '—') +
            '</td><td class="n">' +
            money(b.price) +
            '</td><td><button class="btn ghost sm" data-act="confirmPix" data-id="' +
            b.id +
            '">Confirmar</button></td></tr>'
          );
        }),
        'Nenhum Pix pendente.'
      ) + '<div class="note">Confira o recebimento no app do seu banco e toque em Confirmar.</div>'
    ) +
    PNL(
      'cars',
      'Veículos cadastrados · Carros',
      '<span class="tag">' + cars.length + '</span>',
      table([['Placa'], ['Modelo'], ['Tipo'], ['Cor'], ['Proprietário']], cars, 'Nenhum carro cadastrado.')
    ) +
    PNL(
      'motos',
      'Veículos cadastrados · Motos',
      '<span class="tag">' + motos.length + '</span>',
      table([['Placa'], ['Modelo'], ['Tipo'], ['Cor'], ['Proprietário']], motos, 'Nenhuma moto cadastrada.')
    ) +
    PNL(
      'sem',
      'Lucros semanais',
      'últimas 6 semanas',
      table([['Semana'], ['Lavagens', 1], ['Receita', 1], ['vs. anterior', 1]], weeks, '') +
        '<div class="note">Receita bruta de serviços concluídos (sem custos operacionais).</div>'
    ) +
    PNL(
      'tipos',
      'Lavagens mais solicitadas',
      'top 8 de ' + SERVICES.length + ' serviços',
      table([['#'], ['Tipo de lavagem'], ['Pedidos', 1], ['Porcentagem', 1], ['']], types, '')
    ) +
    PNL(
      'ocup',
      'Ocupação por unidade · hoje',
      SLOTS.length + ' horários por unidade',
      table([['Unidade'], ['Agendados', 1], ['Livres', 1], ['Ocupação']], occ, '')
    ) +
    PNL(
      'pag',
      'Formas de pagamento',
      'Pix e Pagar no local',
      table([['Forma'], ['Pedidos', 1], ['Valor', 1], ['Porcentagem', 1]], pays, '')
    ) +
    '</div>'
  );
}
screens.admin = () => adminHtml();
