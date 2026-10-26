// Hulpmiddelen om zelf mee te rekenen: een getallenlijn voor een eigen som en een klok.
// Bedoeld voor het werken in het echte leerwerkboek: de som uit het boek intikken,
// de sprongen op de lijn zetten en het antwoord daarna zelf in het boek schrijven.
(function (root) {
  var $ = function (id) { return document.getElementById(id); };
  function p2(n) { return (n < 10 ? '0' : '') + n; }

  // Schaalverdeling voor de getallenlijn: [getal per label, getal per streepje].
  var SCHALEN = [[1, 1], [2, 1], [5, 1], [10, 1], [20, 2], [50, 5], [100, 10], [200, 20], [500, 50], [1000, 100], [2000, 200], [5000, 500]];
  function sprongKleur(g) { g = Math.abs(g); return g >= 100 ? '#d6456b' : g >= 10 ? '#2f7fd8' : g >= 5 ? '#8e5bd1' : '#f08a24'; }

  // ---------- Invoer met het cijferblok ----------
  // Elk veld is een knop; het cijferblok vult het veld dat gekozen is.
  var velden = {};          // naam -> {waarde, max, el, toon, bijWijzigen, volgende}
  var focus = null;

  function maakVeld(naam, el, opties) {
    var v = { naam: naam, waarde: '', max: opties.max || 4, el: el, leeg: opties.leeg || '···', toon: opties.toon, bijWijzigen: opties.bijWijzigen, behoudNul: !!opties.behoudNul };
    velden[naam] = v;
    el.addEventListener('click', function () { kies(naam); });
    teken(v);
    return v;
  }
  function teken(v) {
    v.el.textContent = v.toon ? v.toon(v.waarde) : (v.waarde || v.leeg);
    v.el.classList.toggle('leeg', !v.waarde);
  }
  function toonToetsen(aan) {
    $('gr-toetsenvak').hidden = !aan;
    $('gereedschap').classList.toggle('met-toetsen', aan);
  }
  function kies(naam) {
    focus = naam;
    Object.keys(velden).forEach(function (n) { velden[n].el.classList.toggle('gekozen', n === naam); });
    toonToetsen(true);
  }
  // Het cijferblok verdwijnt als je klaar bent met typen, zodat je de lijn of klok ziet.
  function klaarMetTypen() {
    focus = null;
    Object.keys(velden).forEach(function (n) { velden[n].el.classList.remove('gekozen'); });
    toonToetsen(false);
  }
  function typ(c) {
    var v = velden[focus];
    if (!v || v.waarde.length >= v.max) return;
    // Getallen verliezen hun voorloopnul, tijden houden die (0715).
    v.waarde = v.behoudNul ? v.waarde + c : (v.waarde + c).replace(/^0+(?=\d)/, '');
    teken(v);
    if (v.bijWijzigen) v.bijWijzigen(v);
  }
  function wis() {
    var v = velden[focus];
    if (!v) return;
    v.waarde = v.waarde.slice(0, -1);
    teken(v);
    if (v.bijWijzigen) v.bijWijzigen(v);
  }
  function zet(naam, waarde) {
    var v = velden[naam];
    v.waarde = String(waarde);
    teken(v);
  }
  function volgendeVeld() {
    var tab = $('gr-lijn').hidden ? ['tijd', 'tot', 'erbij'] : ['a', 'b', 'eigen', 'antwoord'];
    var i = tab.indexOf(focus);
    kies(tab[(i + 1) % tab.length]);
  }

  // ---------- Getallenlijn ----------
  var L = null;           // {a, b, op, start, end, pos, sprongen, teken}
  var op = '+';

  function schaalVoor(punten) {
    var lo = Math.min.apply(null, punten), hi = Math.max.apply(null, punten);
    var rand = Math.max((hi - lo) * 0.18, 3);
    lo = Math.max(0, lo - rand); hi = hi + rand;
    var span = hi - lo, s = SCHALEN[SCHALEN.length - 1];
    for (var i = 0; i < SCHALEN.length; i++) if (span / SCHALEN[i][0] <= 11) { s = SCHALEN[i]; break; }
    lo = Math.floor(lo / s[0]) * s[0];
    hi = Math.ceil(hi / s[0]) * s[0];
    if (hi - lo < s[0] * 3) hi = lo + s[0] * 3;
    return { lo: lo, hi: hi, label: s[0], klein: s[1] };
  }

  function tekenLijn() {
    var punten = [L.start, L.end, L.pos];
    L.sprongen.forEach(function (s) { punten.push(s.naar); });
    var sc = schaalVoor(punten), Y = 175;
    var x = function (n) { return 40 + (n - sc.lo) / (sc.hi - sc.lo) * 820; };
    var h = '<line x1="30" y1="' + Y + '" x2="870" y2="' + Y + '" stroke="#555" stroke-width="4" stroke-linecap="round"/>';
    for (var n = sc.lo; n <= sc.hi; n += sc.klein) {
      var groot = n % sc.label === 0;
      h += '<line x1="' + x(n) + '" y1="' + Y + '" x2="' + x(n) + '" y2="' + (Y + (groot ? 20 : 9)) + '" stroke="#555" stroke-width="' + (groot ? 3 : 1.5) + '"/>';
      if (groot) h += '<text x="' + x(n) + '" y="' + (Y + 52) + '" text-anchor="middle" font-size="28" fill="#444">' + n + '</text>';
    }
    L.sprongen.forEach(function (s, i) {
      var x0 = x(s.van), x1 = x(s.naar), mid = (x0 + x1) / 2, k = sprongKleur(s.g);
      var hoogte = Math.min(110, 26 + Math.abs(x1 - x0) / 4) + (i % 3) * 26;
      h += '<path d="M' + x0 + ',' + (Y - 6) + ' Q' + mid + ',' + (Y - hoogte * 2 + 6) + ' ' + x1 + ',' + (Y - 6) + '" fill="none" stroke="' + k + '" stroke-width="5" stroke-linecap="round"/>' +
           '<text x="' + mid + '" y="' + (Y - hoogte - 8) + '" text-anchor="middle" font-size="30" font-weight="700" fill="' + k + '">' + (s.naar > s.van ? '+' : '−') + Math.abs(s.naar - s.van) + '</text>';
    });
    h += '<circle cx="' + x(L.start) + '" cy="' + Y + '" r="9" fill="#fff" stroke="#2a9d5c" stroke-width="5"/>';
    h += '<circle cx="' + x(L.pos) + '" cy="' + Y + '" r="13" fill="#2a9d5c"/>';
    $('gr-svg').innerHTML = h;
    $('gr-kop').innerHTML = 'Je begint op <b>' + L.start + '</b>' + (L.sprongen.length ? ' · je staat nu op <b>' + L.pos + '</b>' : ' · kies een sprong');
    $('gr-terug-sprong').disabled = !L.sprongen.length;
  }

  function sprong(g) {
    var naar = L.pos + g;
    if (naar < 0 || naar > 100000) return;
    L.sprongen.push({ van: L.pos, naar: naar, g: Math.abs(g) });
    L.pos = naar;
    tekenLijn();
  }

  function sprongKnoppen() {
    var rij = $('gr-sprongen');
    rij.innerHTML = '';
    var grootste = Math.max(L.a, L.b), lijst = [];
    if (L.op === '×' || L.op === ':') lijst.push(L.b);
    [100, 50, 20, 10, 5, 2, 1].forEach(function (g) {
      if ((g <= Math.max(L.b, 10) && g <= grootste) && lijst.indexOf(g) < 0) lijst.push(g);
    });
    lijst.forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sprong'; b.style.background = sprongKleur(g);
      b.textContent = (L.teken > 0 ? '+' : '−') + g;
      b.addEventListener('click', function () { sprong(L.teken * g); });
      rij.appendChild(b);
    });
  }

  function zetOpDeLijn() {
    var m = $('gr-melding');
    var a = velden.a.waarde, b = velden.b.waarde;
    if (a === '' || b === '') { m.textContent = 'Vul eerst allebei de getallen in.'; return; }
    var A = Number(a), B = Number(b), start, end, teken;
    if (op === '+') { start = A; end = A + B; teken = 1; }
    else if (op === '−') {
      if (B > A) { m.textContent = 'Het tweede getal is groter dan het eerste. Kijk nog eens naar de som.'; return; }
      start = A; end = A - B; teken = -1;
    } else if (op === '×') {
      if (A * B > 20000) { m.textContent = 'Dat getal is te groot voor de getallenlijn.'; return; }
      start = 0; end = A * B; teken = 1;
    } else {
      if (B === 0) { m.textContent = 'Je kunt niet delen door 0.'; return; }
      start = A; end = A % B; teken = -1;
    }
    klaarMetTypen();
    L = { a: A, b: B, op: op, start: start, end: end, pos: start, sprongen: [], teken: teken };
    m.textContent = op === '×' ? A + ' groepjes van ' + B + ': tik ' + A + ' keer de sprong van ' + B + '.'
      : op === ':' ? 'Hoeveel keer kun je ' + B + ' van ' + A + ' aftrekken?' : '';
    $('gr-lijn-vak').hidden = false;
    $('gr-uitkomst').textContent = '';
    zet('antwoord', '');
    $('gr-tekenknoppen').querySelectorAll('button').forEach(function (b2) { b2.classList.toggle('actief', Number(b2.dataset.teken) === L.teken); });
    sprongKnoppen();
    tekenLijn();
  }

  function controleer() {
    var u = $('gr-uitkomst');
    if (!L) return;
    klaarMetTypen();
    var w = velden.antwoord.waarde;
    if (w === '') { u.textContent = 'Typ eerst je antwoord.'; u.className = 'uitkomst'; return; }
    if (L.op === ':' && L.a % L.b !== 0) {
      u.textContent = 'Deze deling komt niet precies uit. Aan het eind blijft er een rest over.'; u.className = 'uitkomst'; return;
    }
    var verwacht = L.op === '+' ? L.a + L.b : L.op === '−' ? L.a - L.b : L.op === '×' ? L.a * L.b : L.a / L.b;
    var goed = Number(w) === verwacht;
    u.textContent = goed ? 'Goed zo! 🎉 Schrijf het ook in je boek.' : 'Bijna! Kijk nog eens naar je sprongen op de lijn.';
    u.className = 'uitkomst ' + (goed ? 'goed' : 'bijna');
  }

  function bouwLijn() {
    var paneel = $('gr-lijn');
    paneel.innerHTML =
      '<p class="gr-uitleg">Tik de som uit je boek in. Zet hem op de getallenlijn en maak de sprongen.</p>' +
      '<div class="gr-som">' +
        '<button type="button" class="veld groot" id="veld-a"></button>' +
        '<div class="ops" id="gr-ops"></div>' +
        '<button type="button" class="veld groot" id="veld-b"></button>' +
        '<span class="gelijk">= ?</span>' +
      '</div>' +
      '<button type="button" class="knop klaar gr-zet" id="gr-zet">Zet op de getallenlijn</button>' +
      '<p class="melding" id="gr-melding"></p>' +
      '<div id="gr-lijn-vak" hidden>' +
        '<div class="lijn-kop" id="gr-kop"></div>' +
        '<svg class="lijn-svg" id="gr-svg" viewBox="0 0 900 235" role="img" aria-label="Getallenlijn"></svg>' +
        '<div class="gr-teken" id="gr-tekenknoppen">' +
          '<button type="button" data-teken="1">Vooruit (+)</button><button type="button" data-teken="-1">Terug (−)</button>' +
        '</div>' +
        '<div class="lijn-knoppen" id="gr-sprongen"></div>' +
        '<div class="lijn-knoppen eigen">' +
          '<span>Eigen sprong:</span><button type="button" class="veld" id="veld-eigen"></button>' +
          '<button type="button" class="sprong" id="gr-eigen-spring">Spring</button>' +
          '<button type="button" class="sprong terug" id="gr-terug-sprong">↩ terug</button>' +
          '<button type="button" class="sprong terug" id="gr-opnieuw">Opnieuw</button>' +
        '</div>' +
        '<div class="gr-antwoord"><span>Mijn antwoord:</span><button type="button" class="veld groot" id="veld-antwoord"></button>' +
          '<button type="button" class="knop klaar" id="gr-controleer">Controleer</button></div>' +
        '<p class="uitkomst" id="gr-uitkomst" aria-live="polite"></p>' +
      '</div>';

    maakVeld('a', $('veld-a'), { max: 4, leeg: 'getal', bijWijzigen: function () { $('gr-lijn-vak').hidden = true; L = null; } });
    maakVeld('b', $('veld-b'), { max: 4, leeg: 'getal', bijWijzigen: function () { $('gr-lijn-vak').hidden = true; L = null; } });
    maakVeld('eigen', $('veld-eigen'), { max: 4, leeg: '···' });
    maakVeld('antwoord', $('veld-antwoord'), { max: 5, leeg: '···' });

    ['+', '−', '×', ':'].forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = o; b.className = o === op ? 'actief' : '';
      b.addEventListener('click', function () {
        op = o; $('gr-ops').querySelectorAll('button').forEach(function (x) { x.classList.toggle('actief', x === b); });
        $('gr-lijn-vak').hidden = true; L = null; $('gr-melding').textContent = '';
      });
      $('gr-ops').appendChild(b);
    });

    $('gr-zet').addEventListener('click', zetOpDeLijn);
    $('gr-controleer').addEventListener('click', controleer);
    $('gr-terug-sprong').addEventListener('click', function () {
      var s = L.sprongen.pop();
      if (s) { L.pos = s.van; tekenLijn(); }
    });
    $('gr-opnieuw').addEventListener('click', function () { L.pos = L.start; L.sprongen = []; $('gr-uitkomst').textContent = ''; tekenLijn(); });
    $('gr-eigen-spring').addEventListener('click', function () {
      var g = Number(velden.eigen.waarde);
      if (g > 0) sprong(L.teken * g);
    });
    $('gr-tekenknoppen').querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        L.teken = Number(b.dataset.teken);
        $('gr-tekenknoppen').querySelectorAll('button').forEach(function (x) { x.classList.toggle('actief', x === b); });
        sprongKnoppen();
      });
    });
    kies('a');
  }

  // ---------- Klok ----------
  var K = { u: 7, m: 0, snap5: true };
  var sleep = null;

  function tijdTekst(u, m) { return p2(u) + ':' + p2(m); }

  function tekenKlok() {
    $('gr-klokvlak').innerHTML = Hulp.klok(K.u, K.m);
    $('gr-digitaal').textContent = tijdTekst(K.u, K.m) + ' uur';
    $('gr-woorden').textContent = K.m % 5 === 0 ? Sommen.woorden(K.u, K.m) : K.m + ' minuten na ' + K.u + ' uur';
    toonDuur();
  }

  function zetTijd(t) {            // t = minuten sinds 12:00 (0..719)
    t = ((t % 720) + 720) % 720;
    K.u = Math.floor(t / 60) || 12;
    K.m = t % 60;
    tekenKlok();
  }
  function tijdInMinuten(u, m) { return (u % 12) * 60 + m; }

  function toonDuur() {
    var tot = velden.tot ? velden.tot.waarde : '';
    var el = $('gr-duur');
    if (tot.length !== 4) { el.textContent = ''; return; }
    var u2 = Number(tot.slice(0, 2)), m2 = Number(tot.slice(2));
    if (u2 > 23 || m2 > 59) { el.textContent = 'Dat is geen tijd. Typ bijvoorbeeld 0830.'; return; }
    var d = (tijdInMinuten(u2, m2) - tijdInMinuten(K.u, K.m) + 720) % 720;
    var uren = Math.floor(d / 60), rest = d % 60, tekst = 'Van ' + tijdTekst(K.u, K.m) + ' tot ' + p2(u2) + ':' + p2(m2) + ' duurt ' + d + ' minuten';
    if (uren) tekst += ' (' + uren + ' uur' + (rest ? ' en ' + rest + ' minuten' : '') + ')';
    var naarUur = (60 - K.m) % 60;
    if (d > naarUur && naarUur > 0) tekst += '. Stap 1: naar het hele uur = ' + naarUur + ' min. Stap 2: de rest = ' + (d - naarUur) + ' min.';
    el.textContent = tekst.replace(/\.?$/, '.');
  }

  function bouwKlok() {
    var paneel = $('gr-klok');
    paneel.innerHTML =
      '<p class="gr-uitleg">Sleep de grote wijzer, of typ de tijd uit je boek met 4 cijfers (bijvoorbeeld 0715).</p>' +
      '<div class="gr-klokrij">' +
        '<div class="gr-klokvlak" id="gr-klokvlak"></div>' +
        '<div class="gr-klokinfo">' +
          '<div class="digitaal" id="gr-digitaal"></div>' +
          '<div class="woorden" id="gr-woorden"></div>' +
          '<label class="schakel"><input type="checkbox" id="gr-snap" checked> sleep per 5 minuten</label>' +
          '<div class="gr-tijdknoppen">' +
            '<button type="button" data-d="-60">uur −</button><button type="button" data-d="60">uur +</button>' +
            '<button type="button" data-d="-5">5 min −</button><button type="button" data-d="5">5 min +</button>' +
            '<button type="button" data-d="-1">1 min −</button><button type="button" data-d="1">1 min +</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="gr-regel"><span>Typ de tijd:</span><button type="button" class="veld groot tijd" id="veld-tijd"></button></div>' +
      '<div class="gr-regel"><span>Minuten erbij of eraf:</span><button type="button" class="veld" id="veld-erbij"></button>' +
        '<button type="button" class="sprong" id="gr-erbij">erbij</button><button type="button" class="sprong terug" id="gr-eraf">eraf</button></div>' +
      '<div class="gr-regel"><span>Hoeveel minuten tot:</span><button type="button" class="veld groot tijd" id="veld-tot"></button></div>' +
      '<p class="uitkomst" id="gr-duur" aria-live="polite"></p>';

    var tijdWeergave = function (w) { var p = (w + '····').slice(0, 4); return p.slice(0, 2) + ':' + p.slice(2); };
    maakVeld('tijd', $('veld-tijd'), { max: 4, toon: tijdWeergave, behoudNul: true, bijWijzigen: function (v) {
      if (v.waarde.length === 4) {
        var u = Number(v.waarde.slice(0, 2)), m = Number(v.waarde.slice(2));
        if (u <= 23 && m <= 59) { K.u = u % 12 || 12; K.m = m; tekenKlok(); v.el.classList.remove('fout'); } else v.el.classList.add('fout');
      }
    } });
    maakVeld('erbij', $('veld-erbij'), { max: 3, leeg: '···' });
    maakVeld('tot', $('veld-tot'), { max: 4, toon: tijdWeergave, behoudNul: true, bijWijzigen: toonDuur });

    $('gr-erbij').addEventListener('click', function () { var n = Number(velden.erbij.waarde); if (n) zetTijd(tijdInMinuten(K.u, K.m) + n); });
    $('gr-eraf').addEventListener('click', function () { var n = Number(velden.erbij.waarde); if (n) zetTijd(tijdInMinuten(K.u, K.m) - n); });
    paneel.querySelectorAll('.gr-tijdknoppen button').forEach(function (b) {
      b.addEventListener('click', function () { zetTijd(tijdInMinuten(K.u, K.m) + Number(b.dataset.d)); });
    });
    $('gr-snap').addEventListener('change', function (e) { K.snap5 = e.target.checked; });

    // Slepen aan de klok: de grote wijzer volgt je vinger, de kleine wijzer loopt mee.
    var vlak = $('gr-klokvlak');
    var sleepNaar = function (e) {
      var r = vlak.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var hoek = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
      var nieuw = Math.round(hoek / 6) % 60;
      if (K.snap5) nieuw = (Math.round(nieuw / 5) * 5) % 60;
      var verschil = nieuw - K.m;
      if (verschil === 0) return;
      if (verschil < -30) verschil += 60; else if (verschil > 30) verschil -= 60;
      zetTijd(tijdInMinuten(K.u, K.m) + verschil);
    };
    vlak.addEventListener('pointerdown', function (e) { sleep = true; vlak.setPointerCapture(e.pointerId); sleepNaar(e); });
    vlak.addEventListener('pointermove', function (e) { if (sleep) sleepNaar(e); });
    vlak.addEventListener('pointerup', function () { sleep = false; });
    vlak.addEventListener('pointercancel', function () { sleep = false; });
    tekenKlok();
  }

  // ---------- Scherm ----------
  function toonTab(naam) {
    $('gr-lijn').hidden = naam !== 'lijn';
    $('gr-klok').hidden = naam !== 'klok';
    $('tab-lijn').classList.toggle('actief', naam === 'lijn');
    $('tab-klok').classList.toggle('actief', naam === 'klok');
    kies(naam === 'lijn' ? 'a' : 'tijd');
  }

  function init() {
    bouwLijn();
    bouwKlok();
    var t = $('gr-toetsen');
    var sluit = document.createElement('button');
    sluit.type = 'button'; sluit.className = 'gr-sluit'; sluit.textContent = 'Klaar met typen ▾';
    sluit.addEventListener('click', klaarMetTypen);
    $('gr-toetsenvak').insertBefore(sluit, t);
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '▶'].forEach(function (x) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'toets' + (x === '⌫' ? ' wis' : x === '▶' ? ' door' : ''); b.textContent = x;
      b.setAttribute('aria-label', x === '⌫' ? 'wis' : x === '▶' ? 'volgend veld' : x);
      b.addEventListener('click', function () { x === '⌫' ? wis() : x === '▶' ? volgendeVeld() : typ(x); });
      t.appendChild(b);
    });
    $('tab-lijn').addEventListener('click', function () { toonTab('lijn'); });
    $('tab-klok').addEventListener('click', function () { toonTab('klok'); });
    document.addEventListener('keydown', function (e) {
      if (!$('gereedschap').classList.contains('actief')) return;
      if (/^[0-9]$/.test(e.key)) typ(e.key);
      else if (e.key === 'Backspace') wis();
      else if (e.key === 'Tab') { e.preventDefault(); volgendeVeld(); }
    });
    toonTab('lijn');
  }

  root.Gereedschap = { init: init };
})(typeof window !== 'undefined' ? window : globalThis);
