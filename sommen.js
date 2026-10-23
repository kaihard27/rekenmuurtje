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

  // rijen: de volgorde van de steentjes op de muur, bovenste rij eerst (zoals op school).
  var lagen = [
    { nr: 1, titel: 'Laag 1 · tot 20', max: 20, kleur: '#d6456b', stenen: laag1, rijen: [
      ['l1-15+2', 'l1-6+8', 'l1-16-8', 'l1-17-2'],
      ['l1-5+2', 'l1-10+4', 'l1-6+..=10', 'l1-splitsen', 'l1-16-..=10', 'l1-10-2', 'l1-7-2']
    ] },
    { nr: 2, titel: 'Laag 2 · tot 100', max: 100, kleur: '#f0a040', stenen: laag2, rijen: [
      ['l2-65+22', 'l2-56+20', 'l2-76+8', 'l2-56-8', 'l2-76-20', 'l2-67-22'],
      ['l2-33+5', 'l2-50+20', 'l2-80+4', 'l2-76+..=80', 'l2-56-..=50', 'l2-50-2', 'l2-70-20', 'l2-57-2']
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
