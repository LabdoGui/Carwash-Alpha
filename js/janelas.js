/* Carwash — js/janelas.js
   Janelas que abrem por cima da tela: senha do admin, acesso do colaborador, reclamação, cancelamento
   e a foto ampliada das unidades. */
'use strict';
/* ============ modais ============ */
function modalHtml() {
  if (S.modal === 'photo') return photoModal();
  if (S.modal === 'admin')
    return (
      '<div class="overlay" data-act="closeModal"><form class="modal stack" data-form="admin" role="dialog" aria-modal="true" aria-labelledby="mt" novalidate><h2 id="mt">Acesso restrito</h2><p class="muted small">Área exclusiva da equipe Carwash.</p>' +
      field({
        id: 'apass',
        label: 'Senha do administrador',
        type: 'password',
        attrs: 'autocomplete="off"',
        pw: true
      }) +
      '<div class="row2"><button type="button" class="btn ghost" data-act="closeModal">Cancelar</button><button class="btn primary" type="submit">Entrar</button></div></form></div>'
    );
  if (S.modal === 'staff')
    return (
      '<div class="overlay" data-act="closeModal"><form class="modal stack" data-form="staff" role="dialog" aria-modal="true" aria-labelledby="mt" novalidate><h2 id="mt">Acesso do colaborador</h2><p class="muted small">Escolha quem é você e digite a sua senha.</p>' +
      '<div class="field" data-f="sname"><label for="sname">Quem é você?</label><select id="sname" name="sname"><option value="">Selecione seu nome</option>' +
      STAFF.map(n => '<option>' + n + '</option>').join('') +
      '</select><div class="hint"></div><div class="err" id="sname-err" role="alert"></div></div>' +
      field({
        id: 'spass',
        label: 'Senha do colaborador',
        type: 'password',
        attrs: 'autocomplete="off"',
        pw: true,
        hint: 'Seu nome seguido de @2026.'
      }) +
      '<div class="row2"><button type="button" class="btn ghost" data-act="closeModal">Cancelar</button><button class="btn primary" type="submit">Entrar</button></div></form></div>'
    );
  if (S.modal === 'req' || S.modal === 'cancel') {
    const b = D.bookings.find(x => x.id === S.req.bid);
    if (!b) return '';
    const cancel = S.modal === 'cancel',
      ty = S.req.type,
      v = vehById(b.vehicleId);
    const T = {
      'Fale conosco': [
        'Fale conosco',
        'Escreva sua mensagem. Ela fica registrada no seu agendamento e a equipe responde pelos contatos do seu cadastro.',
        'Sua mensagem'
      ],
      Reclamação: [
        'Registrar reclamação',
        'Conte o que aconteceu. A reclamação fica registrada e é analisada pela equipe.',
        'O que aconteceu?'
      ],
      Estorno: [
        'Solicitar estorno',
        'Informe o motivo do pedido de estorno do Pix. A equipe analisa e retorna.',
        'Motivo do estorno'
      ],
      Cancelamento: [
        'Cancelar agendamento',
        'O horário será liberado. Só é possível cancelar antes de a lavagem começar.' +
          (b.paid && b.pay === 'pix'
            ? ' Como o Pix já foi pago, o pedido de estorno é aberto automaticamente.'
            : ''),
        'Motivo (opcional)'
      ]
    }[ty];
    return (
      '<div class="overlay" data-act="closeModal"><form class="modal stack" data-form="' +
      (cancel ? 'cancelBk' : 'request') +
      '" role="dialog" aria-modal="true" aria-labelledby="mt" novalidate><h2 id="mt">' +
      T[0] +
      '</h2><p class="muted small">' +
      esc(b.code) +
      ' · ' +
      esc(v ? v.model + ' · ' + v.plate : '') +
      ' · ' +
      brDate(b.date) +
      ' às ' +
      b.time +
      '</p><p class="small">' +
      T[1] +
      '</p>' +
      '<div class="field" data-f="rtxt"><label for="rtxt">' +
      T[2] +
      '</label><textarea id="rtxt" name="rtxt" rows="4" maxlength="300"></textarea><div class="hint">' +
      (ty === 'Fale conosco'
        ? 'Prefere e-mail? <a href="mailto:' + SUPPORT_EMAIL + '">' + SUPPORT_EMAIL + '</a>'
        : '') +
      '</div><div class="err" id="rtxt-err" role="alert"></div></div>' +
      '<div class="row2"><button type="button" class="btn ghost" data-act="closeModal">Voltar</button><button class="btn primary" type="submit">' +
      (cancel ? 'Cancelar agendamento' : 'Enviar') +
      '</button></div></form></div>'
    );
  }
  return '';
}
