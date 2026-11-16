/* Carwash — js/exportar-excel.js
   Gera as planilhas Excel (.xlsx) dos painéis, sem bibliotecas. */
'use strict';
/* ---- exportação para Excel (.xlsx) — gerado no navegador, sem bibliotecas ---- */
const CRC_T = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(u) {
  let c = 0xffffffff;
  for (let i = 0; i < u.length; i++) c = CRC_T[(c ^ u[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function zipStore(files) {
  const enc = new TextEncoder(),
    parts = [],
    cen = [];
  let off = 0;
  const now = new Date(),
    dt = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1),
    dd = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  files.forEach(f => {
    const nm = enc.encode(f.name),
      data = enc.encode(f.data),
      crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true);
    lh.setUint16(10, dt, true);
    lh.setUint16(12, dd, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, nm.length, true);
    lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nm, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true);
    ch.setUint16(10, 0, true);
    ch.setUint16(12, dt, true);
    ch.setUint16(14, dd, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true);
    ch.setUint32(24, data.length, true);
    ch.setUint16(28, nm.length, true);
    ch.setUint32(42, off, true);
    cen.push(new Uint8Array(ch.buffer), nm);
    off += 30 + nm.length + data.length;
  });
  const cl = cen.reduce((a, x) => a + x.length, 0),
    end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cl, true);
  end.setUint32(16, off, true);
  return new Blob(parts.concat(cen, [new Uint8Array(end.buffer)]), {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}
const xe = s =>
  String(s == null ? '' : s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const colL = i => {
  let s = '';
  i++;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
};
/* célula: texto → string; {v,f:'money'|'pct'} → número formatado */
function xlsCell(v, r, c) {
  const ref = colL(c) + (r + 1);
  if (r === 0) return '<c r="' + ref + '" s="1" t="inlineStr"><is><t>' + xe(v) + '</t></is></c>';
  if (v && typeof v === 'object' && v.f)
    return '<c r="' + ref + '" s="' + (v.f === 'money' ? 2 : 3) + '"><v>' + v.v + '</v></c>';
  if (typeof v === 'number') return '<c r="' + ref + '"><v>' + v + '</v></c>';
  if (v === '' || v == null) return '';
  return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xe(v) + '</t></is></c>';
}
function sheetXml(rows) {
  const nc = Math.max(1, ...rows.map(r => r.length)),
    w = [];
  for (let c = 0; c < nc; c++) {
    let m = 8;
    rows.forEach(r => {
      const v = r[c];
      const s =
        v && typeof v === 'object'
          ? v.f === 'money'
            ? 'R$ ' + v.v.toFixed(2)
            : '00,0%'
          : String(v == null ? '' : v);
      m = Math.max(m, Math.min(60, s.length + 2));
    });
    w.push(m);
  }
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>' +
    w
      .map((x, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + x + '" customWidth="1"/>')
      .join('') +
    '</cols><sheetData>' +
    rows
      .map((r, i) => '<row r="' + (i + 1) + '">' + r.map((v, c) => xlsCell(v, i, c)).join('') + '</row>')
      .join('') +
    '</sheetData>' +
    (rows.length > 1 ? '<autoFilter ref="A1:' + colL(nc - 1) + rows.length + '"/>' : '') +
    '</worksheet>'
  );
}
function xlsxBlob(sheets) {
  const used = new Set(),
    names = sheets.map(s => {
      let n =
          String(s.name)
            .replace(/[\[\]\*\?\/\\:]/g, ' ')
            .trim()
            .slice(0, 31) || 'Planilha',
        k = n,
        i = 2;
      while (used.has(k.toLowerCase())) {
        k = n.slice(0, 28) + ' ' + i++;
      }
      used.add(k.toLowerCase());
      return k;
    });
  const H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const dn =
    '<definedNames>' +
    sheets
      .map((sh, i) => {
        const nc = Math.max(1, ...sh.rows.map(r => r.length));
        return sh.rows.length > 1
          ? '<definedName name="_xlnm._FilterDatabase" localSheetId="' +
              i +
              '" hidden="1">\'' +
              xe(names[i]).replace(/&apos;/g, "''") +
              "'!$A$1:$" +
              colL(nc - 1) +
              '$' +
              sh.rows.length +
              '</definedName>'
          : '';
      })
      .join('') +
    '</definedNames>';
  const files = [
    {
      name: '[Content_Types].xml',
      data:
        H +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        sheets
          .map(
            (s, i) =>
              '<Override PartName="/xl/worksheets/sheet' +
              (i + 1) +
              '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
          )
          .join('') +
        '</Types>'
    },
    {
      name: '_rels/.rels',
      data:
        H +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
    },
    {
      name: 'xl/workbook.xml',
      data:
        H +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
        names
          .map((n, i) => '<sheet name="' + xe(n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>')
          .join('') +
        '</sheets>' +
        dn +
        '</workbook>'
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data:
        H +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        sheets
          .map(
            (s, i) =>
              '<Relationship Id="rId' +
              (i + 1) +
              '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' +
              (i + 1) +
              '.xml"/>'
          )
          .join('') +
        '<Relationship Id="rId' +
        (sheets.length + 1) +
        '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
    },
    {
      name: 'xl/styles.xml',
      data:
        H +
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;R$&quot;\\ #,##0.00"/><numFmt numFmtId="165" formatCode="0.0%"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'
    }
  ].concat(
    sheets.map((s, i) => ({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: sheetXml(s.rows) }))
  );
  return zipStore(files);
}
/* converte o texto de uma célula da tabela em valor de planilha (número, R$ ou %) */
function cellVal(txt) {
  const s = txt.replace(/\s+/g, ' ').trim();
  let m;
  if ((m = /^R\$\s?(-?[\d.]+),(\d{2})$/.exec(s)))
    return { v: parseFloat(m[1].replace(/\./g, '') + '.' + m[2]), f: 'money' };
  if ((m = /^(\d+(?:,\d+)?)%$/.exec(s)))
    return { v: Math.round(parseFloat(m[1].replace(',', '.')) * 10) / 1000, f: 'pct' };
  if (/^\d{1,7}$/.test(s)) return +s;
  return s;
}
function panelRows(p) {
  const tb = p.querySelector('table.dt');
  if (!tb) return [['Sem dados']];
  const heads = [...tb.querySelectorAll('thead th')].map(th => th.textContent.trim());
  const keep = heads.map((h, i) => h !== '');
  const rows = [heads.filter((h, i) => keep[i])];
  tb.querySelectorAll('tbody tr').forEach(tr => {
    const tds = [...tr.children];
    if (tds.length === 1 && tds[0].classList.contains('empty')) return;
    rows.push(
      tds
        .map((td, i) => {
          if (!keep[i]) return null;
          const c = td.cloneNode(true);
          c.querySelectorAll('button,.bar,.sr').forEach(x => x.remove());
          c.querySelectorAll('select').forEach(sel =>
            sel.replaceWith(document.createTextNode(sel.options[sel.selectedIndex].text))
          );
          c.querySelectorAll('br,.small,div').forEach(x => {
            if (x.tagName === 'BR') x.replaceWith(document.createTextNode(' · '));
          });
          return cellVal(c.textContent);
        })
        .filter((v, i) => keep[i])
    );
  });
  return rows;
}
function bookingsRows() {
  const rows = [
    [
      'Código',
      'Data',
      'Hora',
      'Cliente (nome civil)',
      'Nome social',
      'Celular',
      'E-mail',
      'Veículo',
      'Placa',
      'Serviço',
      'Unidade',
      'Colaborador de preferência',
      'Colaborador que atendeu',
      'Pagamento',
      'Situação do pagamento',
      ' Valor',
      'Status',
      'Observações do cliente',
      'Problema registrado'
    ]
  ];
  rows[0][15] = 'Valor';
  allList().forEach(b => {
    const v = vehById(b.vehicleId),
      u = userById(b.userId),
      sv = svcById(b.serviceId);
    rows.push([
      b.code,
      brDate(b.date),
      b.time,
      u ? u.name : '',
      u && u.socialName ? u.socialName : '',
      u ? u.phone : '',
      u ? u.email : '',
      v ? v.model : '',
      v ? v.plate : '',
      sv ? sv.name : '',
      b.unit,
      b.pref || 'Sem preferência',
      b.staff || '',
      payFull(b),
      b.paid ? 'Pago' : 'A receber',
      { v: b.price, f: 'money' },
      b.status,
      b.obs || '',
      hadProblem(b) ? probText(b) : ''
    ]);
  });
  return rows;
}
function panelSheet(p) {
  return {
    name: p.id === 'p-all' ? 'Agendamentos' : p.dataset.xl,
    rows: p.id === 'p-all' ? bookingsRows() : panelRows(p)
  };
}
function kpiRows() {
  const rows = [['Indicador', 'Valor', 'Detalhe']];
  $$('.kpi').forEach(k =>
    rows.push([$('span', k).textContent, cellVal($('b', k).textContent), $('small', k).textContent])
  );
  return rows;
}
function xlsPanel(id) {
  const p = document.getElementById('p-' + id);
  if (!p) return;
  saveBlob(xlsxBlob([panelSheet(p)]), 'carwash-' + id + '-' + todayKey() + '.xlsx');
  toast('Planilha Excel gerada');
}
function xlsAll() {
  const sheets = [{ name: 'Indicadores', rows: kpiRows() }].concat(
    $$('section.panel[data-xl]').map(panelSheet)
  );
  saveBlob(xlsxBlob(sheets), 'carwash-relatorio-completo-' + todayKey() + '.xlsx');
  toast('Relatório completo em Excel gerado');
}
