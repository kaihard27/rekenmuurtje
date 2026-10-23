// De soorten sommen (steentjes) en hun generatoren.
(function (root) {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  // delen: de onderdelen van de som, '?' is het invulveld.
  // start/end/richting: beginpunt, eindpunt en looprichting voor de getallenlijn.
  function maak(type, delen, antwoord, start, end, richting, extra) {
    var s = { type: type, delen: delen, antwoord: antwoord, start: start, end: end, richting: richting };
    for (var k in extra) s[k] = extra[k];
    s.sleutel = delen.join(' ');
    s.oplossing = delen.map(function (d) { return d === '?' ? antwoord : d; }).join(' ');
    return s;
  }
  function plus(a, b) { return maak('plus', [a, '+', b, '=', '?'], a + b, a, a + b, 1, { a: a, b: b }); }
  function min(a, b) { return maak('min', [a, '−', b, '=', '?'], a - b, a, a - b, -1, { a: a, b: b }); }
  function misPlus(a, doel) { return maak('mis', [a, '+', '?', '=', doel], doel - a, a, doel, 1, {}); }
  function misMin(a, doel) { return maak('mis', [a, '−', '?', '=', doel], a - doel, a, doel, -1, {}); }
  function splits(n, k) { return maak('splits', [n, '=', k, '+', '?'], n - k, k, n, 1, { n: n, k: k }); }
  // a groepjes van b; en a verdelen in groepjes van b. stappen: de sprongen op de getallenlijn.
  function keer(a, b) { return maak('keer', [a, '×', b, '=', '?'], a * b, 0, a * b, 1, { a: a, b: b, stappen: [b] }); }
  function deel(a, b) { return maak('deel', [a, ':', b, '=', '?'], a / b, a, 0, -1, { a: a, b: b, stappen: [b] }); }
  // Steentje dat er al wel staat maar nog niet te openen is.
  function bk(id, label) { return { id: id, label: label, binnenkort: true }; }

  var laag1 = [
    { id: 'l1-5+2', label: '5 + 2', gen: function () { var a = ri(2, 8); return plus(a, ri(1, 10 - a)); } },
    { id: 'l1-10+4', label: '10 + 4', gen: function () { return plus(10, ri(1, 10)); } },
    { id: 'l1-6+8', label: '6 + 8', gen: function () { var a = ri(5, 9); return plus(a, ri(11 - a, 9)); } },
    { id: 'l1-15+2', label: '15 + 2', gen: function () { var u = ri(1, 7); return plus(10 + u, ri(1, 9 - u)); } },
    { id: 'l1-7-2', label: '7 − 2', gen: function () { var a = ri(3, 9); return min(a, ri(1, a - 1)); } },
    { id: 'l1-10-2', label: '10 − 2', gen: function () { return min(10, ri(1, 9)); } },
    { id: 'l1-16-8', label: '16 − 8', gen: function () { var a = ri(11, 18); return min(a, ri(a - 10 + 1, 9)); } },
    { id: 'l1-17-2', label: '17 − 2', gen: function () { var a = ri(12, 19); return min(a, ri(1, a - 10 - 1)); } },
    { id: 'l1-6+..=10', label: '6 + … = 10', gen: function () { return misPlus(ri(1, 9), 10); } },
    { id: 'l1-16-..=10', label: '16 − … = 10', gen: function () { return misMin(ri(11, 19), 10); } },
    { id: 'l1-splitsen', label: 'splitsen tot 10', gen: function () { var n = ri(3, 10); return splits(n, ri(1, n - 1)); } }
  ];

  var laag2 = [
    { id: 'l2-33+5', label: '33 + 5', gen: function () { var u = ri(1, 8); return plus(10 * ri(1, 9) + u, ri(1, 9 - u)); } },
    { id: 'l2-50+20', label: '50 + 20', gen: function () { var p = ri(1, 9); return plus(10 * p, 10 * ri(1, 10 - p)); } },
    { id: 'l2-80+4', label: '80 + 4', gen: function () { return plus(10 * ri(1, 9), ri(1, 9)); } },
    { id: 'l2-56+20', label: '56 + 20', gen: function () { var p = ri(1, 7); return plus(10 * p + ri(1, 9), 10 * ri(1, 9 - p)); } },
    { id: 'l2-76-20', label: '76 − 20', gen: function () { var p = ri(2, 9); return min(10 * p + ri(1, 9), 10 * ri(1, p - 1)); } },
    { id: 'l2-70-20', label: '70 − 20', gen: function () { var p = ri(2, 9); return min(10 * p, 10 * ri(1, p - 1)); } },
    { id: 'l2-50-2', label: '50 − 2', gen: function () { return min(10 * ri(2, 9), ri(1, 9)); } },
    { id: 'l2-57-2', label: '57 − 2', gen: function () { var u = ri(2, 9); return min(10 * ri(1, 9) + u, ri(1, u - 1)); } },
    { id: 'l2-76+..=80', label: '76 + … = 80', gen: function () { var p = ri(1, 9); return misPlus(10 * p + ri(1, 9), 10 * (p + 1)); } },
    { id: 'l2-56-..=50', label: '56 − … = 50', gen: function () { var p = ri(1, 9); return misMin(10 * p + ri(1, 9), 10 * p); } },
    { id: 'l2-65+22', label: '65 + 22', gen: function () {
      var p = ri(1, 6), u = ri(1, 8), q = ri(1, Math.min(3, 9 - p));
      return plus(10 * p + u, 10 * q + ri(1, 9 - u));
    } },
    { id: 'l2-67-22', label: '67 − 22', gen: function () {
      var p = ri(3, 9), u = ri(2, 9), q = ri(1, Math.min(3, p - 1));
      return min(10 * p + u, 10 * q + ri(1, u - 1));
    } },
    { id: 'l2-76+8', label: '76 + 8', gen: function () { var u = ri(2, 9); return plus(10 * ri(1, 8) + u, ri(11 - u, 9)); } },
    { id: 'l2-56-8', label: '56 − 8', gen: function () { var u = ri(1, 8); return min(10 * ri(1, 9) + u, ri(u + 1, 9)); } }
  ];

  laag1.push(bk('l1-gb10', 'Getalbegrip tot 10'), bk('l1-gb20', 'Getalbegrip tot 20'));
  laag2.push(bk('l2-gb100', 'Getalbegrip tot 100'));

  var laag3 = [
    { id: 'l3-56+28', label: '56 + 28', gen: function () {
      var p = ri(1, 7), u = ri(2, 9), q = ri(1, 8 - p);
      return plus(10 * p + u, 10 * q + ri(11 - u, 9));
    } },
    { id: 'l3-76-28', label: '76 − 28', gen: function () {
      var p = ri(2, 9), u = ri(1, 8), q = ri(1, p - 1);
      return min(10 * p + u, 10 * q + ri(u + 1, 9));
    } },
    { id: 'l3-7x80', label: '7 × 80', gen: function () { return keer(ri(2, 9), 10 * ri(2, 9)); } },
    { id: 'l3-7x8', label: '7 × 8', gen: function () { return keer(ri(2, 9), ri(2, 9)); } },
    { id: 'l3-56:8', label: '56 : 8', gen: function () { var b = ri(2, 9); return deel(b * ri(2, 9), b); } },
    bk('l3-optellen1000', 'Optellen tot 1000'), bk('l3-delenrest', 'Delen met rest'),
    bk('l3-aftrekken1000', 'Aftrekken tot 1000'), bk('l3-gb1000', 'Getalbegrip tot 1000')
  ];

  var laag4 = [
    bk('l4-optellen', 'Optellen boven 1000'), bk('l4-vermenigvuldigen', 'Vermenigvuldigen'),
    bk('l4-delen', 'Delen'), bk('l4-aftrekken', 'Aftrekken boven 1000'),
    bk('l4-gb10000', 'Getalbegrip tot 10.000'), bk('l4-gb100000', 'Getalbegrip tot 100.000'),
    bk('l4-gb1000000', 'Getalbegrip tot 1.000.000')
  ];

  var laag5 = [
    bk('l5-lengte', 'Lengte en omtrek'), bk('l5-oppervlakte', 'Oppervlakte'), bk('l5-inhoud', 'Inhoud'),
    bk('l5-gewicht', 'Gewicht'), bk('l5-geld', 'Geld'), bk('l5-tijd', 'Tijd'),
    bk('l5-verhoudingen', 'Verhoudingen'), bk('l5-breuken', 'Breuken'), bk('l5-procenten', 'Procenten'),
    bk('l5-kommagetallen', 'Kommagetallen')
  ];

  // rijen: de volgorde van de steentjes op de muur, bovenste rij eerst (zoals op school).
  var lagen = [
    { nr: 1, titel: 'Laag 1 · tot 20', max: 20, kleur: '#d6456b', stenen: laag1, rijen: [
      ['l1-15+2', 'l1-6+8', 'l1-16-8', 'l1-17-2'],
      ['l1-5+2', 'l1-10+4', 'l1-6+..=10', 'l1-splitsen', 'l1-16-..=10', 'l1-10-2', 'l1-7-2'],
      ['l1-gb10', 'l1-gb20']
    ] },
    { nr: 2, titel: 'Laag 2 · tot 100', max: 100, kleur: '#f0a040', stenen: laag2, rijen: [
      ['l2-65+22', 'l2-56+20', 'l2-76+8', 'l2-56-8', 'l2-76-20', 'l2-67-22'],
      ['l2-33+5', 'l2-50+20', 'l2-80+4', 'l2-76+..=80', 'l2-56-..=50', 'l2-50-2', 'l2-70-20', 'l2-57-2'],
      ['l2-gb100']
    ] },
    { nr: 3, titel: 'Laag 3 · tot 1000', max: 1000, kleur: '#3fb7a0', stenen: laag3, rijen: [
      ['l3-optellen1000', 'l3-56+28', 'l3-7x80', 'l3-7x8', 'l3-56:8', 'l3-delenrest', 'l3-76-28', 'l3-aftrekken1000'],
      ['l3-gb1000']
    ] },
    { nr: 4, titel: 'Laag 4', max: 1000000, kleur: '#4fb7d6', stenen: laag4, rijen: [
      ['l4-optellen', 'l4-vermenigvuldigen', 'l4-delen', 'l4-aftrekken'],
      ['l4-gb10000', 'l4-gb100000', 'l4-gb1000000']
    ] },
    { nr: 5, titel: 'Laag 5', max: 1000000, kleur: '#9b4fc4', stenen: laag5, rijen: [
      ['l5-lengte', 'l5-oppervlakte', 'l5-inhoud', 'l5-gewicht', 'l5-geld', 'l5-tijd'],
      ['l5-verhoudingen', 'l5-breuken', 'l5-procenten', 'l5-kommagetallen']
    ] }
  ];

  lagen.forEach(function (l) { l.stenen.forEach(function (s) { s.laag = l; }); });

  // Een reeks van n verschillende sommen (dubbele alleen als er te weinig varianten zijn).
  function maakReeks(steen, n) {
    var reeks = [], gezien = {};
    for (var i = 0; i < n; i++) {
      var som = null;
      for (var poging = 0; poging < 40; poging++) {
        som = steen.gen();
        if (!gezien[som.sleutel]) break;
      }
      gezien[som.sleutel] = true;
      som.max = steen.laag.max;
      reeks.push(som);
    }
    return reeks;
  }

  root.Sommen = { lagen: lagen, maakReeks: maakReeks };
})(typeof window !== 'undefined' ? window : globalThis);
