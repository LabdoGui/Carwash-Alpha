/* Carwash — js/banco-local.js
   Onde os dados ficam guardados (localStorage do navegador) e o estado da tela atual. */
'use strict';
const KEY = 'carwash.v1';

const emptyDB = () => ({ users: [], vehicles: [], bookings: [], cards: [], holds: [], requests: [] });
function loadDB() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.users) return Object.assign(emptyDB(), d);
  } catch (e) {}
  return emptyDB();
}
let D = loadDB();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(D));
  } catch (e) {}
}

const S = {
  screen: 'login',
  staffName: '',
  terms: null,
  resched: null,
  req: null,
  user: null,
  adminOk: false,
  staffOk: false,
  staff: { code: '', id: null, prob: false, ptxt: '' },
  modal: null,
  draft: { vehicleId: null, serviceId: null, unit: null, date: null, time: null },
  gv: { cat: 'Carro', sub: 'Sedan', model: '', color: '', plate: '' },
  showForm: false,
  pix: null,
  last: null,
  vTab: 'Carro',
  adm: { q: '', unit: '', status: '', limit: 12 },
  browse: false,
  place: null
};
let timers = [];
