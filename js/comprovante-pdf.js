/* Carwash — js/comprovante-pdf.js
   Monta o comprovante em PDF (com o logotipo) direto no navegador, sem bibliotecas. */
'use strict';
/* ---- comprovante em PDF (gerado no próprio navegador, sem bibliotecas) ---- */
function pdfText(x) {
  return String(x == null ? '' : x)
    .replace(/—/g, '\x97')
    .replace(/•/g, '\x95')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x00-\xFF]/g, '?')
    .replace(/[\\()]/g, '\\$&');
}
function wrapTxt(t, n) {
  const w = String(t).split(' '),
    out = [];
  let l = '';
  w.forEach(x => {
    if ((l + ' ' + x).trim().length > n) {
      out.push(l);
      l = x;
    } else l = (l + ' ' + x).trim();
  });
  if (l) out.push(l);
  return out;
}
function receiptPdf(b) {
  const v = vehById(b.vehicleId),
    sv = svcById(b.serviceId),
    u = userById(b.userId);
  let c = '';
  const T = (x, y, size, txt, bold, col) => {
    c +=
      'BT /' +
      (bold ? 'F2' : 'F1') +
      ' ' +
      size +
      ' Tf ' +
      (col || '0.059 0.090 0.165') +
      ' rg ' +
      x +
      ' ' +
      y +
      ' Td (' +
      pdfText(txt) +
      ') Tj ET\n';
  };
  const R = (x, y, w, h, col) => {
    c += col + ' rg ' + x + ' ' + y + ' ' + w + ' ' + h + ' re f\n';
  };
  R(0, 742, 595, 100, '0.114 0.306 0.847');
  R(30, 750, 176, 86, '1 1 1');
  c += 'q 170 0 0 82.5 33 752 cm /Im1 Do Q\n';
  T(226, 800, 13, 'Qualidade e Brilho Impecável', true, '1 1 1');
  T(226, 782, 13, 'para o seu Veículo', true, '1 1 1');
  T(40, 702, 20, 'Comprovante de agendamento', true);
  R(40, 636, 240, 50, '0.859 0.918 0.996');
  T(52, 672, 8.5, 'CÓDIGO DA LAVAGEM', true, '0.114 0.306 0.847');
  T(52, 646, 24, b.code, true);
  const wk = parseKey(b.date).toLocaleDateString('pt-BR', { weekday: 'long' });
  const rows = [
    ['Cliente', dispName(u)],
    ['Celular (WhatsApp)', u.phone],
    ['E-mail', u.email],
    ['Veículo', v.model + ' · ' + v.cat + ' ' + v.sub + ' · ' + v.color],
    ['Placa (Mercosul)', v.plate],
    ['Serviço', sv.name]
  ]
    .concat(b.obs ? [['Observações', b.obs]] : [])
    .concat([
      ['Colaborador de preferência', b.pref || 'Sem preferência'],
      ['Unidade', b.unit + ' · São Paulo/SP'],
      ['Data e hora', wk + ', ' + brDate(b.date) + ' às ' + b.time],
      ['Forma de pagamento', payFull(b)]
    ]);
  let y = 606;
  rows.forEach(r => {
    const ls = wrapTxt(r[1], 58);
    T(40, y, 9.5, r[0], false, '0.39 0.45 0.55');
    ls.forEach((l, k) => T(200, y - k * 14, 12, l, false));
    y -= 14 * (ls.length - 1);
    R(40, y - 10, 515, 0.6, '0.89 0.91 0.94');
    y -= 28;
  });
  y -= 2;
  if (b.paid) {
    R(40, y - 40, 515, 50, '0.863 0.988 0.906');
    T(
      54,
      y - 10,
      12.5,
      payState(b) +
        ' · ' +
        (b.pay === 'pix' ? 'Pix' : b.pay === 'cartao' ? 'Cartão' : 'Dinheiro/cartão no local'),
      true,
      '0.082 0.502 0.239'
    );
    T(54, y - 28, 10.5, 'Valor pago: ' + money(b.price), false, '0.082 0.502 0.239');
  } else {
    R(40, y - 40, 515, 50, '0.996 0.953 0.780');
    T(
      54,
      y - 10,
      12.5,
      b.pay === 'pix'
        ? 'Pix informado — aguardando confirmação da equipe'
        : 'Pagamento no local (dinheiro ou cartão) — a pagar na unidade',
      true,
      '0.706 0.325 0.035'
    );
    T(
      54,
      y - 28,
      10.5,
      (b.pay === 'pix' ? 'Valor a confirmar: ' : 'Valor a pagar: ') + money(b.price),
      false,
      '0.706 0.325 0.035'
    );
  }
  y -= 74;
  T(40, y, 10, 'TOTAL DO SERVIÇO', true, '0.39 0.45 0.55');
  T(40, y - 30, 26, money(b.price), true, '0.114 0.306 0.847');
  R(40, 70, 515, 0.6, '0.89 0.91 0.94');
  T(40, 52, 9, 'Apresente o código da lavagem ' + b.code + ' na unidade.', false, '0.39 0.45 0.55');
  T(
    40,
    38,
    9,
    'Dúvidas? Fale com a Carwash: ' + SUPPORT_EMAIL + ' · Comprovante gerado em ' + fmtDT(Date.now()),
    false,
    '0.39 0.45 0.55'
  );
  const jpg = atob(LG_JPG);
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << /Im1 7 0 R >> >> /Contents 4 0 R >>',
    '<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /XObject /Subtype /Image /Width 622 /Height 302 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
      jpg.length +
      ' >>\nstream\n' +
      jpg +
      '\nendstream'
  ];
  let out = '%PDF-1.4\n';
  const offs = [];
  objs.forEach((o, k) => {
    offs.push(out.length);
    out += k + 1 + ' 0 obj\n' + o + '\nendobj\n';
  });
  const xref = out.length;
  out +=
    'xref\n0 ' +
    (objs.length + 1) +
    '\n0000000000 65535 f \n' +
    offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
    'trailer\n<< /Size ' +
    (objs.length + 1) +
    ' /Root 1 0 R >>\nstartxref\n' +
    xref +
    '\n%%EOF';
  const bytes = new Uint8Array(out.length);
  for (let k = 0; k < out.length; k++) bytes[k] = out.charCodeAt(k) & 255;
  return new Blob([bytes], { type: 'application/pdf' });
}
function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const downloadReceipt = b => saveBlob(receiptPdf(b), 'comprovante-' + b.code + '.pdf');
