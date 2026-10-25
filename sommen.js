// De soorten sommen (steentjes) en hun generatoren.
(function (root) {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  // delen: de onderdelen van de som, '?' is het invulveld.
  // start/end/richting: beginpunt, eindpunt en looprichting voor de getallenlijn.
  function maak(type, delen, antwoord, start, end, richting, extra) {
    var s = { type: type, delen: delen, antwoord: antwoord, start: start, end: end, richting: richting };
    for (var k in extra) s[k] = extra[k];
    // Bij grotere sprongen op de getallenlijn horen grotere stappen (honderdtallen).
    if (!s.stappen && Math.max(start, end) > 100 && Math.abs(end - start) > 60) s.stappen = [100, 10, 1];
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
  // Steentje dat sommen kiest uit een of meer patronen (zie P hieronder).
  function st(id, label, types) { return { id: id, label: label, types: types }; }

  // ---------- Patronen uit het leerwerkboek (Getal & Ruimte Junior 5, blok 2 en 3) ----------
  // Elk patroon maakt sommen in dezelfde vorm als het boek, met eigen willekeurige getallen.
  function pick(lijst) { return lijst[ri(0, lijst.length - 1)]; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function metTekst(som, tekst, eenheid, oplossing) {
    som.tekst = tekst; som.eenheid = eenheid;
    if (oplossing) som.oplossing = oplossing;
    return som;
  }

  // Tijd in woorden, zoals in het boek: "kwart over zeven", "tien voor half acht".
  var UREN = ['twaalf', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];
  function uurWoord(u) { return UREN[u % 12]; }
  function woorden(u, m) {
    var v = u % 12 + 1;
    switch (m) {
      case 0: return uurWoord(u) + ' uur';
      case 5: return 'vijf over ' + uurWoord(u);
      case 10: return 'tien over ' + uurWoord(u);
      case 15: return 'kwart over ' + uurWoord(u);
      case 20: return 'tien voor half ' + uurWoord(v);
      case 25: return 'vijf voor half ' + uurWoord(v);
      case 30: return 'half ' + uurWoord(v);
      case 35: return 'vijf over half ' + uurWoord(v);
      case 40: return 'tien over half ' + uurWoord(v);
      case 45: return 'kwart voor ' + uurWoord(v);
      case 50: return 'tien voor ' + uurWoord(v);
      default: return 'vijf voor ' + uurWoord(v);
    }
  }

  function klok(u, m) {
    var tijd = p2(u) + ':' + p2(m);
    var grote = m / 5;
    return {
      type: 'klok', u: u, m: m, delen: ['klok'], sleutel: 'klok ' + tijd, antwoord: p2(u) + p2(m),
      oplossing: tijd + ' uur (' + woorden(u, m) + ')',
      hulpTekst: [
        'Kijk eerst naar de <b>grote wijzer</b>. Hij staat op de <b>' + grote + '</b>. ' +
          'Tel in vijven: ' + grote + ' × 5 = <b>' + m + ' minuten</b>.',
        'De kleine wijzer wijst naar het uur' + (m >= 30 && m > 0 ? ' (bij half en kwart voor is het bijna het volgende uur)' : '') +
          '. In woorden: <b>' + woorden(u, m) + '</b>. Typ de tijd met vier cijfers: uur en daarna minuten.'
      ]
    };
  }

  function duurSom(u1, m1, d) {
    var tot = m1 + d, u2 = u1 + Math.floor(tot / 60), m2 = tot % 60;
    if (u2 > 12) u2 -= 12;
    var van = p2(u1) + ':' + p2(m1), naar = p2(u2) + ':' + p2(m2);
    var s = maak('duur', ['duur', van, naar], d, 0, d, 1, { stappen: [10, 5, 1], max: 100 });
    var tekst = m1 + d > 60
      ? 'Eerst tot het hele uur: ' + (60 - m1) + ' minuten. Daarna nog ' + m2 + ' minuten. Samen: ' + (60 - m1) + ' + ' + m2 + ' = <b>' + d + '</b>.'
      : 'Beide tijden zijn in hetzelfde uur. Kijk naar de minuten: ' + m2 + ' − ' + m1 + ' = <b>' + d + '</b>.';
    s.hulpTekst = [null, tekst];
    return metTekst(s, 'Hoeveel minuten duurt het? Van ' + van + ' uur tot ' + naar + ' uur.', 'minuten', van + ' → ' + naar + ': ' + d + ' minuten');
  }

  var P = {};
  P.hhOpt = { id: 'p-hh-opt', label: 'honderdtallen erbij', max: 1000, gen: function () {
    var a = ri(1, 9); return plus(100 * a, 100 * ri(1, 10 - a));
  } };
  P.hhMin = { id: 'p-hh-min', label: 'honderdtallen eraf', max: 1000, gen: function () {
    var a = ri(2, 10); return min(100 * a, 100 * ri(1, a - 1));
  } };
  P.optHt = { id: 'p-opt-ht', label: 'honderdtallen en tientallen erbij', max: 1000, gen: function () {
    var a = 10 * ri(11, 80); return plus(a, 10 * ri(1, Math.min(30, (1000 - a) / 10)));
  } };
  P.aftrHt = { id: 'p-aftr-ht', label: 'honderdtallen en tientallen eraf', max: 1000, gen: function () {
    var a = 10 * ri(12, 100); return min(a, 10 * ri(1, Math.min(30, a / 10 - 1)));
  } };
  P.optEen = { id: 'p-opt-een', label: 'tientallen of eenheden erbij', max: 1000, gen: function () {
    var a = ri(101, 900); return plus(a, Math.random() < 0.5 ? 10 * ri(1, 9) : ri(1, 9));
  } };
  P.aftrEen = { id: 'p-aftr-een', label: 'tientallen of eenheden eraf', max: 1000, gen: function () {
    var a = ri(101, 999); return min(a, Math.random() < 0.5 ? 10 * ri(1, 9) : ri(1, 9));
  } };
  P.optBrug = { id: 'p-opt-brug', label: 'getal erbij met twee cijfers', max: 1000, gen: function () {
    var p = ri(10, 94), q = ri(1, 4), u, v;
    if (Math.random() < 0.7) { u = ri(2, 9); v = ri(10 - u, 9); } else { u = ri(1, 7); v = ri(1, 9 - u); }
    return plus(10 * p + u, 10 * q + v);
  } };
  P.aftrBrug = { id: 'p-aftr-brug', label: 'getal eraf met twee cijfers', max: 1000, gen: function () {
    var p = ri(11, 99), q = ri(1, 6), u, v;
    if (Math.random() < 0.7) { u = ri(1, 8); v = ri(u + 1, 9); } else { u = ri(2, 9); v = ri(1, u); }
    return min(10 * p + u, 10 * q + v);
  } };
  P.sprong = { id: 'p-sprong', label: 'steeds 1, 10 of 100 erbij of eraf', max: 1000, gen: function () {
    var a = ri(101, 899), d = pick([1, 10, 100]);
    var s = Math.random() < 0.5 ? plus(a, d) : min(a, d);
    s.stappen = [d]; return s;
  } };
  P.waarde = { id: 'p-waarde', label: 'wat is het cijfer waard', max: 1000, gen: function () {
    var n, plek;
    do { n = ri(101, 999); plek = pick([100, 10, 1]); } while (Math.floor(n / plek) % 10 === 0);
    var c = Math.floor(n / plek) % 10, antw = c * plek;
    var s = { type: 'tekst', delen: ['tekst'], sleutel: 'waarde ' + n + ' ' + plek, antwoord: antw, max: 1000, start: 0, end: 0, richting: 1,
      oplossing: 'Het cijfer ' + c + ' in ' + n + ' is ' + antw + ' waard.' };
    s.hulpTekst = [
      'Schrijf het getal onder H, T en E: honderdtallen, tientallen en eenheden. In <b>' + n + '</b> staat het cijfer <b>' + c + '</b> bij de ' + (plek === 100 ? 'honderdtallen (H)' : plek === 10 ? 'tientallen (T)' : 'eenheden (E)') + '.',
      n + ' = ' + (Math.floor(n / 100) * 100) + ' + ' + (Math.floor(n % 100 / 10) * 10) + ' + ' + (n % 10) + '. Welk deel hoort bij het cijfer ' + c + '?'
    ];
    return metTekst(s, 'Hoeveel is het cijfer ' + c + ' waard in het getal ' + n + '?', '', null);
  } };
  P.keer = { id: 'p-keer', label: 'tafels van 1 tot en met 10', max: 1000, gen: function () { return keer(ri(1, 10), ri(1, 10)); } };
  P.keer11 = { id: 'p-keer11', label: 'tafel van 11', max: 1000, gen: function () { return keer(ri(1, 10), 11); } };
  P.misKeer = { id: 'p-mis-keer', label: 'tafels: welk getal ontbreekt', max: 1000, gen: function () {
    var a = ri(2, 10), b = ri(2, 10), c = a * b;
    return Math.random() < 0.5
      ? maak('deel', ['?', '×', b, '=', c], a, c, 0, -1, { a: c, b: b, stappen: [b] })
      : maak('deel', [b, '×', '?', '=', c], a, c, 0, -1, { a: c, b: b, stappen: [b] });
  } };
  P.deel = { id: 'p-deel', label: 'deelsommen van de tafels', max: 1000, gen: function () { var b = ri(2, 10); return deel(b * ri(2, 10), b); } };
  P.klokKw = { id: 'p-klok-kw', label: 'hele uren, halve uren en kwartieren', max: 100, gen: function () { return klok(ri(1, 12), pick([0, 15, 30, 45])); } };
  P.klok10 = { id: 'p-klok-10', label: 'tien minuten over en voor', max: 100, gen: function () { return klok(ri(1, 12), pick([0, 10, 20, 30, 40, 50])); } };
  P.klok5 = { id: 'p-klok-5', label: 'vijf minuten over en voor', max: 100, gen: function () { return klok(ri(1, 12), 5 * ri(0, 11)); } };
  P.duur = { id: 'p-duur', label: 'hoeveel minuten duurt het', max: 100, gen: function () { return duurSom(ri(1, 11), 5 * ri(0, 11), 5 * ri(1, 11)); } };
  P.geldTerug = { id: 'p-geld-terug', label: 'wisselgeld in centen', max: 1000, gen: function () {
    var prijs = ri(5, 195), betaal = prijs < 100 && Math.random() < 0.5 ? 100 : 200;
    var s = min(betaal, prijs);
    return metTekst(s, 'Je koopt iets van ' + prijs + ' cent en betaalt met ' + (betaal === 100 ? '1 euro' : '2 euro') + '. Hoeveel cent krijg je terug?', 'cent',
      betaal + ' − ' + prijs + ' = ' + (betaal - prijs) + ' cent terug');
  } };
  P.geldAfrond = { id: 'p-geld-afrond', label: 'afronden op 5 cent', max: 1000, gen: function () {
    var x, r;
    do { x = ri(6, 199); r = x % 5; } while (r === 0);
    var laag = x - r, antw = r <= 2 ? laag : laag + 5;
    var s = { type: 'tekst', delen: ['tekst'], sleutel: 'afrond ' + x, antwoord: antw, max: 1000, start: 0, end: 0, richting: 1,
      oplossing: x + ' cent wordt ' + antw + ' cent' };
    s.hulpTekst = [
      'Kijk naar het laatste cijfer. <b>1 en 2</b>: naar beneden. <b>3 en 4</b>: omhoog naar 5 of 10. <b>6 en 7</b>: naar beneden. <b>8 en 9</b>: omhoog.',
      x + ' ligt tussen <b>' + laag + '</b> en <b>' + (laag + 5) + '</b>. Welke is het dichtstbij?'
    ];
    return metTekst(s, 'Rond af op 5 cent: ' + x + ' cent wordt …', 'cent', null);
  } };

  // Verhaaltjes met optellen en aftrekken tot 1000.
  var VERHAAL_OA = [
    { w: 'min', t: function (a, b) { return 'In een fles zit ' + a + ' ml limonade. Je schenkt er ' + b + ' ml uit. Hoeveel ml blijft er over?'; }, e: 'ml' },
    { w: 'plus', t: function (a, b) { return 'Op een camping staan ' + a + ' tenten. Er komen er ' + b + ' bij. Hoeveel tenten staan er nu?'; }, e: 'tenten' },
    { w: 'min', t: function (a, b) { return 'In een bibliotheek staan ' + a + ' boeken. ' + b + ' boeken worden uitgeleend. Hoeveel boeken staan er nog?'; }, e: 'boeken' },
    { w: 'min', t: function (a, b) { return 'Een wandelroute is ' + a + ' meter lang. Je hebt ' + b + ' meter gelopen. Hoeveel meter moet je nog?'; }, e: 'meter' },
    { w: 'plus', t: function (a, b) { return 'Er zijn ' + a + ' kinderen op het schoolplein. Er komen er ' + b + ' bij. Hoeveel kinderen zijn er nu?'; }, e: 'kinderen' },
    { w: 'plus', t: function (a, b) { return 'Mila heeft ' + a + ' knikkers. Ze krijgt er ' + b + ' bij. Hoeveel knikkers heeft ze nu?'; }, e: 'knikkers' },
    { w: 'min', t: function (a, b) { return 'Een zak rijst weegt ' + a + ' gram. Je gebruikt ' + b + ' gram. Hoeveel gram blijft er over?'; }, e: 'gram' },
    { w: 'min', t: function (a, b) { return 'Een fiets kost ' + a + ' euro. Je krijgt ' + b + ' euro korting. Hoeveel euro betaal je?'; }, e: 'euro' }
  ];
  P.verhaalOA = { id: 'p-verhaal-oa', label: 'verhaaltjes met optellen en aftrekken', max: 1000, gen: function () {
    var v = pick(VERHAAL_OA), a, b;
    if (v.w === 'plus') { a = ri(120, 850); b = Math.random() < 0.5 ? 10 * ri(2, 14) : ri(11, 99); if (a + b > 1000) b = 1000 - a; }
    else { a = ri(250, 950); b = Math.random() < 0.5 ? 10 * ri(2, 14) : ri(11, 99); }
    var s = v.w === 'plus' ? plus(a, b) : min(a, b);
    return metTekst(s, v.t(a, b), v.e, s.oplossing + ' ' + v.e);
  } };
  P.verhaalKeer = { id: 'p-verhaal-keer', label: 'verhaaltjes met keersommen', max: 1000, gen: function () {
    var a = ri(2, 10), b = ri(2, 11), x = Math.random();
    var s = keer(a, b);
    var tekst = x < 0.34 ? 'In een doos zitten ' + b + ' koekjes. Je koopt ' + a + ' dozen. Hoeveel koekjes zijn dat?'
      : x < 0.67 ? 'Een kaartje voor de speeltuin kost ' + b + ' euro. Je koopt ' + a + ' kaartjes. Hoeveel euro betaal je?'
      : 'Op een tafel staan ' + a + ' borden. Op elk bord liggen ' + b + ' druiven. Hoeveel druiven zijn dat samen?';
    return metTekst(s, tekst, x < 0.34 ? 'koekjes' : x < 0.67 ? 'euro' : 'druiven', s.oplossing);
  } };
  P.verhaalDeel = { id: 'p-verhaal-deel', label: 'verhaaltjes met deelsommen', max: 1000, gen: function () {
    var b = ri(2, 10), k = ri(2, 10);
    var s = deel(b * k, b);
    return metTekst(s, 'Er zijn ' + (b * k) + ' snoepjes. Ze worden eerlijk verdeeld over ' + b + ' kinderen. Hoeveel snoepjes krijgt elk kind?', 'snoepjes', s.oplossing);
  } };
  P.verhaalMix = { id: 'p-verhaal-mix', label: 'verhaaltjes', max: 1000, gen: function () {
    return Math.random() < 0.7 ? P.verhaalOA.gen() : (Math.random() < 0.5 ? P.verhaalKeer.gen() : P.verhaalDeel.gen());
  } };

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
    st('l3-optellen1000', 'Optellen tot 1000', [P.hhOpt, P.optHt, P.optEen, P.optBrug]), bk('l3-delenrest', 'Delen met rest'),
    st('l3-aftrekken1000', 'Aftrekken tot 1000', [P.hhMin, P.aftrHt, P.aftrEen, P.aftrBrug]),
    st('l3-gb1000', 'Getalbegrip tot 1000', [P.sprong, P.waarde])
  ];

  var laag4 = [
    bk('l4-optellen', 'Optellen boven 1000'), st('l4-vermenigvuldigen', 'Vermenigvuldigen', [P.keer, P.keer11, P.misKeer]),
    st('l4-delen', 'Delen', [P.deel]), bk('l4-aftrekken', 'Aftrekken boven 1000'),
    bk('l4-gb10000', 'Getalbegrip tot 10.000'), bk('l4-gb100000', 'Getalbegrip tot 100.000'),
    bk('l4-gb1000000', 'Getalbegrip tot 1.000.000')
  ];

  var laag5 = [
    bk('l5-lengte', 'Lengte en omtrek'), bk('l5-oppervlakte', 'Oppervlakte'), bk('l5-inhoud', 'Inhoud'),
    bk('l5-gewicht', 'Gewicht'), st('l5-geld', 'Geld', [P.geldTerug, P.geldAfrond]),
    st('l5-tijd', 'Tijd', [P.klokKw, P.klok10, P.klok5, P.duur]),
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

  // ---------- Het leerwerkboek: lessen per blok ----------
  // Getal & Ruimte Junior, leerwerkboek 5, blok 2 en 3. Pagina's uit de inhoudsopgave;
  // 'tot' is de laatste pagina van de les (de volgende les begint daarna).
  var T = {
    voorbereiden: 'voorbereiden', oefenen: 'oefenen', toepassen: 'toepassen', nog: 'Weet je nog?', test: 'Test jezelf'
  };
  var ALLE_OA = [P.hhOpt, P.hhMin, P.optHt, P.aftrHt, P.optEen, P.aftrEen, P.optBrug, P.aftrBrug];
  function les(nr, onderwerp, soort, pag, types) {
    return { nr: nr, onderwerp: onderwerp, soort: soort, pag: pag, types: types };
  }
  var boekBlokken = [
    { blok: 2, titel: 'Blok 2', lessen: [
      les(1, 'Optellen en aftrekken', T.voorbereiden, 6, [P.waarde, P.sprong]),
      les(2, 'Optellen en aftrekken', T.oefenen, 9, [P.hhOpt, P.optEen, P.optHt]),
      les(3, 'Optellen en aftrekken', T.oefenen, 12, [P.hhMin, P.aftrEen, P.aftrHt]),
      les(4, 'Optellen en aftrekken', T.toepassen, 16, [P.verhaalOA]),
      les(5, 'Optellen en aftrekken', T.nog, 20, [P.optHt, P.aftrHt, P.sprong, P.waarde]),
      les(6, 'Geld', T.voorbereiden, 23, [P.geldAfrond, P.geldTerug]),
      les(7, 'Geld', T.oefenen, 26, [P.geldTerug, P.geldAfrond]),
      les(8, 'Geld', T.oefenen, 29, [P.geldTerug, P.optHt]),
      les(9, 'Geld', T.toepassen, 32, [P.verhaalOA, P.geldTerug]),
      les(10, 'Geld', T.nog, 36, [P.geldTerug, P.geldAfrond, P.aftrHt]),
      les(11, 'Optellen en aftrekken', T.voorbereiden, 40, [P.optHt, P.aftrHt]),
      les(12, 'Optellen en aftrekken', T.oefenen, 44, [P.optHt, P.optEen]),
      les(13, 'Optellen en aftrekken', T.oefenen, 47, [P.aftrHt, P.aftrEen]),
      les(14, 'Optellen en aftrekken', T.toepassen, 51, [P.verhaalOA]),
      les(15, 'Optellen en aftrekken', T.nog, 55, ALLE_OA),
      les(16, '', T.test, 58, [P.waarde, P.optBrug, P.aftrBrug, P.optHt, P.aftrHt])
    ], eind: 60 },
    { blok: 3, titel: 'Blok 3', lessen: [
      les(1, 'Optellen en aftrekken', T.voorbereiden, 72, [P.optEen, P.aftrEen]),
      les(2, 'Optellen en aftrekken', T.oefenen, 75, [P.optEen, P.aftrEen, P.optBrug]),
      les(3, 'Optellen en aftrekken', T.oefenen, 79, [P.optBrug, P.aftrBrug]),
      les(4, 'Optellen en aftrekken', T.toepassen, 84, [P.verhaalOA]),
      les(5, 'Optellen en aftrekken, tafels en klokkijken', T.nog, 88, [P.optHt, P.aftrHt, P.misKeer, P.klokKw, P.optBrug]),
      les(6, 'Klokkijken', T.voorbereiden, 92, [P.klokKw]),
      les(7, 'Klokkijken', T.oefenen, 95, [P.klokKw, P.klok10]),
      les(8, 'Klokkijken', T.oefenen, 98, [P.klok5, P.duur]),
      les(9, 'Klokkijken', T.toepassen, 101, [P.duur, P.klok5]),
      les(10, 'Klokkijken', T.nog, 105, [P.klokKw, P.klok10, P.klok5, P.duur]),
      les(11, 'Vermenigvuldigen', T.voorbereiden, 108, [P.keer]),
      les(12, 'Vermenigvuldigen', T.oefenen, 111, [P.keer, P.keer11]),
      les(13, 'Vermenigvuldigen', T.oefenen, 114, [P.misKeer, P.keer11, P.deel]),
      les(14, 'Vermenigvuldigen', T.toepassen, 117, [P.verhaalKeer, P.verhaalDeel]),
      les(15, 'Vermenigvuldigen', T.nog, 121, [P.keer, P.keer11, P.misKeer, P.deel]),
      les(16, '', T.test, 125, [P.optBrug, P.aftrBrug, P.klok5, P.misKeer])
    ], eind: 127 }
  ];
  boekBlokken.forEach(function (b) {
    b.lessen.forEach(function (l, i) {
      var volgende = b.lessen[i + 1];
      l.tot = volgende ? volgende.pag - 1 : b.eind;
      l.id = 'boek-b' + b.blok + '-l' + l.nr;
      l.label = 'Les ' + l.nr;
      l.titel = l.soort === T.test || l.soort === T.nog ? l.soort : l.onderwerp + ' – ' + l.soort;
      l.blok = b.blok;
    });
  });

  function steenMetId(id) {
    var gevonden = null;
    lagen.forEach(function (l) { l.stenen.forEach(function (s) { if (s.id === id) gevonden = s; }); });
    return gevonden;
  }
  function lesMetId(id) {
    var gevonden = null;
    boekBlokken.forEach(function (b) { b.lessen.forEach(function (l) { if (l.id === id) gevonden = l; }); });
    return gevonden;
  }

  function schud(lijst) {
    for (var i = lijst.length - 1; i > 0; i--) {
      var j = ri(0, i), t = lijst[i]; lijst[i] = lijst[j]; lijst[j] = t;
    }
    return lijst;
  }

  // Een reeks van n verschillende sommen (dubbele alleen als er te weinig varianten zijn).
  // Een steentje of les met meerdere patronen (types) wisselt tussen de patronen af.
  function maakReeks(steen, n) {
    var reeks = [], gezien = {}, bron = [], i;
    if (steen.types) {
      for (i = 0; i < n; i++) bron.push(steen.types[i % steen.types.length]);
      schud(bron);
    } else {
      for (i = 0; i < n; i++) bron.push(steen);
    }
    for (i = 0; i < n; i++) {
      var som = null, soort = bron[i];
      for (var poging = 0; poging < 40; poging++) {
        som = soort.gen();
        if (!gezien[som.sleutel]) break;
      }
      gezien[som.sleutel] = true;
      som.max = som.max || soort.max || (steen.laag && steen.laag.max) || 100;
      reeks.push(som);
    }
    return reeks;
  }

  root.Sommen = { lagen: lagen, boek: boekBlokken, maakReeks: maakReeks, steenMetId: steenMetId, lesMetId: lesMetId };
})(typeof window !== 'undefined' ? window : globalThis);
