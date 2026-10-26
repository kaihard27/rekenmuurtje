// Schermen, verloop van een reeks, feedback en sterretjes.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var REEKS = 10;
  var GOED = ['Super! 🎉', 'Goed gedaan! 🌟', 'Yes, helemaal goed! 🙌', 'Wat knap! 👏', 'Top! 🚀', 'Fantastisch! 🥳', 'Lekker bezig! 😊', 'Ja! Dat is het! ✨'];
  var STATUS = { wit: 'nog niet geoefend', grijs: 'meer oefenen', blauw: 'bijna goed', groen: 'goed' };
  var HUISWERK_SLEUTEL = 'rekenmuurtje.huiswerk';
  var STANDAARD_LES = 'boek-b3-l5';   // hier is ze nu: blok 3, les 5 (blz. 88 en 89)
  var S = null;       // toestand van de lopende reeks
  var timer = null;

  function toon(naam) {
    ['muur', 'boek', 'gereedschap', 'oefen', 'einde'].forEach(function (n) { $(n).classList.toggle('actief', n === naam); });
    window.scrollTo(0, 0);
  }

  // ---------- Huiswerk: de les waar ze nu mee bezig is ----------
  function huidigeLesId() {
    try { var id = localStorage.getItem(HUISWERK_SLEUTEL); if (id && Sommen.lesMetId(id)) return id; } catch (e) { /* standaard */ }
    return STANDAARD_LES;
  }
  function zetHuidigeLes(id) {
    try { localStorage.setItem(HUISWERK_SLEUTEL, id); } catch (e) { /* niet erg */ }
  }
  function paginas(les) { return 'blz. ' + les.pag + '–' + les.tot; }

  // ---------- Muurtje ----------
  function steenKnop(steen) {
    var b = document.createElement('button');
    b.type = 'button';
    if (steen.binnenkort) {
      b.className = 'steen binnenkort';
      b.disabled = true;
      b.innerHTML = steen.label + '<small>binnenkort</small>';
      return b;
    }
    var k = Voortgang.kleur(steen.id);
    b.className = 'steen ' + k;
    b.innerHTML = steen.label + '<small>' + STATUS[k] + '</small>';
    return b;
  }

  function bouwHuiswerk() {
    var les = Sommen.lesMetId(huidigeLesId());
    var d = $('huiswerk');
    d.innerHTML = '<div class="hw-tekst"><small>Huiswerk · Getal &amp; Ruimte Junior 5</small>' +
      '<b>Blok ' + les.blok + ' · Les ' + les.nr + ' – ' + les.titel + '</b><span>' + paginas(les) + '</span></div>' +
      '<div class="hw-knoppen"><button id="hw-start" class="knop klaar" type="button">Oefenen</button>' +
      '<button id="hw-boek" class="knop hulp" type="button">Alle lessen</button>' +
      '<button id="hw-gr" class="knop gr" type="button">Getallenlijn en klok</button></div>';
    $('hw-start').addEventListener('click', function () { start(les, 'muur'); });
    $('hw-gr').addEventListener('click', function () { toon('gereedschap'); });
    $('hw-boek').addEventListener('click', function () { bouwBoek(); toon('boek'); });
  }

  function bouwMuur() {
    bouwHuiswerk();
    var doos = $('muur-lagen');
    doos.innerHTML = '';
    // Hoogste laag bovenaan; links het lagenblok, rechts de rijen steentjes.
    Sommen.lagen.slice().reverse().forEach(function (laag) {
      var d = document.createElement('div');
      d.className = 'laag';
      d.style.setProperty('--lk', laag.kleur);
      d.innerHTML = '<div class="laag-blok">Laag<b>' + laag.nr + '</b></div><div class="rijen"></div>';
      laag.rijen.forEach(function (ids) {
        var rij = document.createElement('div');
        rij.className = 'rij';
        ids.forEach(function (id) {
          var steen = laag.stenen.filter(function (s) { return s.id === id; })[0];
          var b = steenKnop(steen);
          b.addEventListener('click', function () { start(steen, 'muur'); });
          rij.appendChild(b);
        });
        d.querySelector('.rijen').appendChild(rij);
      });
      doos.appendChild(d);
    });
  }

  // ---------- Het boek: alle lessen van blok 2 en 3 ----------
  function bouwBoek() {
    var nu = huidigeLesId();
    var doos = $('boek-inhoud');
    doos.innerHTML = '';
    Sommen.boek.forEach(function (blok) {
      var h = document.createElement('section');
      h.className = 'boek-blok';
      h.innerHTML = '<h2>' + blok.titel + '</h2><div class="lessen"></div>';
      blok.lessen.forEach(function (les) {
        var k = Voortgang.kleur(les.id);
        var t = document.createElement('div');
        t.className = 'les-tegel ' + k + (les.id === nu ? ' nu' : '');
        t.innerHTML = '<button type="button" class="les-start"><span class="les-nr">Les ' + les.nr + '</span>' +
          '<span class="les-titel">' + les.titel + '</span><span class="les-pag">' + paginas(les) + '</span>' +
          '<small>' + STATUS[k] + '</small></button>' +
          '<button type="button" class="les-pin" title="Hier ben ik nu" aria-label="Hier ben ik nu">📍</button>';
        t.querySelector('.les-start').addEventListener('click', function () { start(les, 'boek'); });
        t.querySelector('.les-pin').addEventListener('click', function () { zetHuidigeLes(les.id); bouwBoek(); });
        h.querySelector('.lessen').appendChild(t);
      });
      doos.appendChild(h);
    });
  }

  // ---------- Reeks ----------
  function start(steen, vanaf) {
    clearTimeout(timer);
    var reeks = Sommen.maakReeks(steen, REEKS);
    S = {
      steen: steen, vanaf: vanaf || 'muur',
      wachtrij: reeks.map(function (som, i) { return { slot: i, som: som, herhaling: false }; }),
      sterren: [], scores: [], fouten: [],
      cur: null, poging: 1, hulp: 1, maxHulp: 1, invoer: '', fase: 'vraag'
    };
    for (var i = 0; i < REEKS; i++) { S.sterren.push(false); S.scores.push(0); }
    toon('oefen');
    tekenSterren();
    volgende();
  }

  function tekenSterren(nieuw) {
    $('sterren').innerHTML = S.sterren.map(function (v, i) {
      return '<span class="ster' + (v ? ' vol' : '') + (i === nieuw ? ' pop' : '') + '">★</span>';
    }).join('');
  }

  function volgende() {
    clearTimeout(timer);
    if (!S.wachtrij.length) return einde();
    S.cur = S.wachtrij.shift();
    S.poging = 1; S.hulp = 1; S.maxHulp = 1; S.invoer = ''; S.fase = 'vraag';
    tekenSom();
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    tekenHulp();
  }

  function isKlok() { return S.cur.som.type === 'klok'; }

  function tekenSom() {
    var som = S.cur.som, el = $('som');
    var invul = '<input id="invul" class="invul' + (som.type === 'klok' ? ' tijd' : som.tekst ? ' breed' : som.max >= 100 ? ' lang' : '') +
      '" readonly inputmode="none" aria-label="antwoord">';
    el.classList.toggle('verhaal-modus', !!(som.tekst || som.type === 'klok'));
    if (som.type === 'klok') {
      el.innerHTML = '<div class="klok-vak">' + Hulp.klok(som.u, som.m) + '</div>' +
        '<div class="verhaal">Hoe laat is het? Typ de tijd met 4 cijfers.</div>' +
        '<div class="antwoordrij">' + invul + '<span class="eenheid">uur</span></div>';
    } else if (som.tekst) {
      el.innerHTML = '<div class="verhaal">' + som.tekst + '</div>' +
        '<div class="antwoordrij">' + invul + (som.eenheid ? '<span class="eenheid">' + som.eenheid + '</span>' : '') + '</div>';
    } else {
      el.innerHTML = som.delen.map(function (d) { return d === '?' ? invul : '<span>' + d + '</span>'; }).join('');
    }
    toonInvoer();
  }

  function toonInvoer() {
    var v = S.invoer;
    if (isKlok()) { var p = (v + '····').slice(0, 4); v = p.slice(0, 2) + ':' + p.slice(2); }
    $('invul').value = v;
  }

  function antwoordTekst(som) {
    return som.type === 'klok' ? som.antwoord.slice(0, 2) + ':' + som.antwoord.slice(2) : som.antwoord;
  }

  function tekenHulp() {
    var vak = $('hulp-vak'), knop = $('hulp-knop'), som = S.cur.som, ht = som.hulpTekst;
    knop.innerHTML = 'Hulp' + (S.hulp > 1 ? '<small>niveau ' + S.hulp + ' van 3</small>' : '');
    if (S.hulp === 1) { vak.hidden = true; vak.innerHTML = ''; return; }
    vak.hidden = false;
    var titel, doe;
    var tekstHulp = ht && ht[S.hulp - 2];
    if (tekstHulp) {
      titel = S.hulp === 2 ? 'Tip' : 'Uitleg';
      doe = function (el) { Hulp.tekst(el, tekstHulp); };
    } else if (S.hulp === 2) {
      titel = som.type === 'duur' ? 'Getallenlijn: tel de minuten' : 'Getallenlijn: tik de sprongen';
      doe = function (el) { Hulp.lijn(el, som); };
    } else {
      titel = /^(keer|deel)$/.test(som.type) ? 'Groepjes maken' : 'Splitsen: honderdtallen, tientallen en eenheden';
      doe = function (el) { Hulp.splits(el, som); };
    }
    vak.innerHTML = '<div class="hulp-titel">' + titel + '</div><div id="hulp-inhoud"></div>';
    doe($('hulp-inhoud'));
  }

  function zetHulp(niveau) {
    S.hulp = niveau;
    if (niveau > S.maxHulp) S.maxHulp = niveau;
    tekenHulp();
  }

  function schud() {
    var s = $('som');
    s.classList.remove('schud'); void s.offsetWidth; s.classList.add('schud');
  }

  function typ(cijfer) {
    if (S.fase !== 'vraag' || S.invoer.length >= 4) return;
    S.invoer = isKlok() ? S.invoer + cijfer : (S.invoer + cijfer).replace(/^0+(?=\d)/, '');
    toonInvoer();
  }
  function wis() {
    if (S.fase !== 'vraag') return;
    S.invoer = S.invoer.slice(0, -1);
    toonInvoer();
  }

  function feedback(klasse, html, knoppen) {
    var f = $('feedback');
    f.className = 'feedback ' + klasse;
    f.innerHTML = html;
    (knoppen || []).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'knop ' + k.klasse; b.textContent = k.tekst;
      b.addEventListener('click', k.doe);
      f.appendChild(b);
    });
  }

  function klaar() {
    if (!S || S.fase !== 'vraag') return;
    var c = S.cur, inv = S.invoer;
    if (isKlok() && inv.length === 3) inv = '0' + inv;      // "715" telt als 07:15
    if (inv === '' || (isKlok() && inv.length < 4)) { schud(); return; }
    var goed = inv === String(c.som.antwoord);

    if (goed) {
      var score = S.poging === 2 ? 0.25 : (S.maxHulp > 1 ? 0.5 : 1);
      if (!c.herhaling) S.scores[c.slot] = score;
      S.sterren[c.slot] = true;
      S.fase = 'feedback';
      tekenSterren(c.slot);
      feedback('goed', GOED[Math.floor(Math.random() * GOED.length)]);
      timer = setTimeout(volgende, 1500);
      return;
    }

    if (S.poging === 1) {
      if (!c.herhaling) S.fouten.push(c.som.oplossing);
      S.poging = 2;
      S.fase = 'feedback';
      feedback('bijna', 'Bijna! Wil je een hint?', [
        { tekst: 'Ja, een hint', klasse: 'hulp', doe: function () { nogEenKeer(true); } },
        { tekst: 'Zelf nog eens', klasse: 'klaar', doe: function () { nogEenKeer(false); } }
      ]);
      return;
    }

    // Twee keer fout: oplossing tonen, som komt later nog een keer terug.
    S.fase = 'feedback';
    if (!c.herhaling) {
      S.scores[c.slot] = 0;
      S.wachtrij.splice(Math.min(S.wachtrij.length, 3), 0, { slot: c.slot, som: c.som, herhaling: true });
    }
    feedback('bijna', '<div class="uitleg">Het antwoord is <b>' + antwoordTekst(c.som) + '</b>:<br>' + c.som.oplossing + '</div>', [
      { tekst: 'Volgende', klasse: 'klaar', doe: volgende }
    ]);
  }

  function nogEenKeer(metHint) {
    S.fase = 'vraag';
    S.invoer = '';
    toonInvoer();
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    if (metHint) zetHulp(2);
  }

  // ---------- Einde ----------
  function einde() {
    S.fase = 'einde';
    var gem = S.scores.reduce(function (a, b) { return a + b; }, 0) / REEKS;
    var zonderHulp = S.scores.filter(function (s) { return s === 1; }).length;
    Voortgang.reeksKlaar(S.steen.id, gem, {
      z: zonderHulp,
      h: S.scores.filter(function (s) { return s > 0 && s < 1; }).length,
      f: S.fouten.length,
      fs: S.fouten.slice(0, 10)
    });
    $('einde-sterren').innerHTML = S.sterren.map(function () { return '<span class="ster vol">★</span>'; }).join('');
    $('einde-tekst').textContent = zonderHulp === REEKS
      ? 'Alles zonder hulp goed! Wat ben jij slim! 🎉'
      : zonderHulp + ' van de ' + REEKS + ' sommen zonder hulp goed. Goed gedaan! 🌟';
    var b = steenKnop(S.steen);
    $('einde-steen').innerHTML = '';
    $('einde-steen').appendChild(b);
    $('naar-muur').textContent = S.vanaf === 'boek' ? 'Naar het boek' : 'Naar het muurtje';
    toon('einde');
  }

  function terugNaarStart() {
    clearTimeout(timer);
    if (S && S.vanaf === 'boek') { bouwBoek(); toon('boek'); } else { bouwMuur(); toon('muur'); }
  }

  // ---------- Opstarten ----------
  function toetsenbord() {
    var t = $('toetsen');
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', ''].forEach(function (x) {
      if (x === '') { t.appendChild(document.createElement('span')); return; }
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'toets' + (x === '⌫' ? ' wis' : ''); b.textContent = x;
      b.addEventListener('click', function () { x === '⌫' ? wis() : typ(x); });
      t.appendChild(b);
    });
  }

  function init() {
    bouwMuur();
    toetsenbord();
    Gereedschap.init();
    $('gr-terug').addEventListener('click', function () { bouwMuur(); toon('muur'); });
    $('klaar-knop').addEventListener('click', klaar);
    $('hulp-knop').addEventListener('click', function () {
      if (S && S.fase === 'vraag') zetHulp(S.hulp % 3 + 1);
    });
    $('terug').addEventListener('click', function () {
      if (S && S.fase !== 'einde' && S.sterren.some(Boolean) && !confirm('Stoppen? Deze reeks wordt dan niet bewaard.')) return;
      terugNaarStart();
    });
    $('opnieuw').addEventListener('click', function () { start(S.steen, S.vanaf); });
    $('naar-muur').addEventListener('click', terugNaarStart);
    $('boek-terug').addEventListener('click', function () { bouwMuur(); toon('muur'); });
    $('reset').addEventListener('click', function () {
      if (confirm('Alle voortgang wissen?')) { Voortgang.wis(); bouwMuur(); }
    });
    document.addEventListener('keydown', function (e) {
      if (!S || !$('oefen').classList.contains('actief') || S.fase !== 'vraag') return;
      if (/^[0-9]$/.test(e.key)) typ(e.key);
      else if (e.key === 'Backspace') wis();
      else if (e.key === 'Enter') { e.preventDefault(); klaar(); }
    });
  }

  init();
})();
