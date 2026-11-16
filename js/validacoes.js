/* Carwash — js/validacoes.js
   Regras dos formulários: e-mail @gmail/@outlook, senha forte, celular e placa Mercosul. */
'use strict';
/* ============ validações ============ */
const EMAIL_RE = /^[^\s@]+@(gmail\.com|outlook\.com|outlook\.com\.br)$/i;
const SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
const PASS_RULES = [
  ['Mínimo 8 caracteres', p => p.length >= 8],
  ['1 letra maiúscula', p => /[A-Z]/.test(p)],
  ['1 letra minúscula', p => /[a-z]/.test(p)],
  ['1 número', p => /\d/.test(p)],
  ['1 caractere especial (!@#$%)', p => SPECIAL.test(p)]
];
const strongPass = p => PASS_RULES.every(r => r[1](p));
const PLATE_RE = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
const maskPhone = v => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d ? '(' + d : '';
  if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
};
const validPhone = v => /^[1-9]{2}9\d{8}$/.test(digits(v));
const maskPlate = v =>
  String(v)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);
async function hashPw(email, pw) {
  try {
    const b = new TextEncoder().encode(email.toLowerCase() + '|carwash|' + pw);
    const h = await crypto.subtle.digest('SHA-256', b);
    return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'x:' + btoa(unescape(encodeURIComponent(email + '|' + pw)));
  }
}
