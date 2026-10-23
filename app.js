// Schermen, verloop van een reeks, feedback en sterretjes.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var REEKS = 10;
  var GOED = ['Super! 🎉', 'Goed gedaan! 🌟', 'Yes, helemaal goed! 🙌', 'Wat knap! 👏', 'Top! 🚀', 'Fantastisch! 🥳', 'Lekker bezig! 😊', 'Ja! Dat is het! ✨'];
  var STATUS = { wit: 'nog niet geoefend', grijs: 'meer oefenen', blauw: 'bijna goed', groen: 'goed' };
  var S = null;       // toestand van de lopende reeks
  var timer = null;

  function toon(naam) {
    ['muur', 'oefen', 'einde'].forEach(function (n) { $(n).classList.toggle('actief', n === naam); });
    window.scrollTo(0, 0);
  }

  // ---------- Muurtje ----------
  function steenKnop(steen) {
    var k = Voortgang.kleur(steen.id);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'steen ' + k;
    b.innerHTML = steen.label + '<small>' + STATUS[k] + '</small>';
    return b;
  }

  function bouwMuur() {
    var doos = $('muur-lagen');
    doos.innerHTML = '';
    // Laag 2 bovenaan, laag 1 onderaan; links het lagenblok, rechts de rijen steentjes.
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
          b.addEventListener('click', function () { start(steen); });
          rij.appendChild(b);
        });
        d.querySelector('.rijen').appendChild(rij);
      });
      doos.appendChild(d);
    });
  }

  // ---------- Reeks ----------
  function start(steen) {
    clearTimeout(timer);
    var reeks = Sommen.maakReeks(steen, REEKS);
    S = {
      steen: steen,
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

  function tekenSom() {
    var som = S.cur.som;
    $('som').innerHTML = som.delen.map(function (d) {
      return d === '?' ? '<input id="invul" class="invul" readonly inputmode="none" aria-label="antwoord">' : '<span>' + d + '</span>';
    }).join('');
    $('invul').value = S.invoer;
  }

  function tekenHulp() {
    var vak = $('hulp-vak');
    var knop = $('hulp-knop');
    knop.innerHTML = 'Hulp' + (S.hulp > 1 ? '<small>niveau ' + S.hulp + ' van 3</small>' : '');
    if (S.hulp === 1) { vak.hidden = true; vak.innerHTML = ''; return; }
    vak.hidden = false;
    vak.innerHTML = '<div class="hulp-titel">' + (S.hulp === 2 ? 'Getallenlijn: tik de sprongen' : 'Splitsen: tientallen en eenheden') + '</div><div id="hulp-inhoud"></div>';
    var inhoud = $('hulp-inhoud');
    if (S.hulp === 2) Hulp.lijn(inhoud, S.cur.som); else Hulp.splits(inhoud, S.cur.som);
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
    if (S.fase !== 'vraag' || S.invoer.length >= 3) return;
    S.invoer = (S.invoer + cijfer).replace(/^0+(?=\d)/, '');
    $('invul').value = S.invoer;
  }
  function wis() {
    if (S.fase !== 'vraag') return;
    S.invoer = S.invoer.slice(0, -1);
    $('invul').value = S.invoer;
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
    if (S.invoer === '') { schud(); return; }
    var c = S.cur;
    var goed = Number(S.invoer) === c.som.antwoord;

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
    feedback('bijna', '<div class="uitleg">Het antwoord is <b>' + c.som.antwoord + '</b>:<br>' + c.som.oplossing + '</div>', [
      { tekst: 'Volgende', klasse: 'klaar', doe: volgende }
    ]);
  }

  function nogEenKeer(metHint) {
    S.fase = 'vraag';
    S.invoer = '';
    $('invul').value = '';
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
    var k = Voortgang.kleur(S.steen.id);
    var b = steenKnop(S.steen);
    $('einde-steen').innerHTML = '';
    $('einde-steen').appendChild(b);
    toon('einde');
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
    $('klaar-knop').addEventListener('click', klaar);
    $('hulp-knop').addEventListener('click', function () {
      if (S && S.fase === 'vraag') zetHulp(S.hulp % 3 + 1);
    });
    $('terug').addEventListener('click', function () {
      if (S && S.fase !== 'einde' && S.sterren.some(Boolean) && !confirm('Stoppen? Deze reeks wordt dan niet bewaard.')) return;
      clearTimeout(timer); bouwMuur(); toon('muur');
    });
    $('opnieuw').addEventListener('click', function () { start(S.steen); });
    $('naar-muur').addEventListener('click', function () { bouwMuur(); toon('muur'); });
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
