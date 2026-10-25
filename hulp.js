// Hulp niveau 2 (lege getallenlijn) en niveau 3 (splitsen in honderdtallen, tientallen en eenheden),
// plus de klok en de hulpteksten voor sommen die niet op een getallenlijn passen.
(function (root) {
  var KLEUR = { 100: '#d6456b', 10: '#2f7fd8', 5: '#8e5bd1', 1: '#f08a24' };
  function kleurVan(g) { return KLEUR[g] || '#2f7fd8'; }

  // ---------- Niveau 2: getallenlijn ----------
  function venster(som) {
    if (som.max <= 20) return [0, 20];
    var laag = Math.min(som.start, som.end), hoog = Math.max(som.start, som.end);
    var span = hoog - laag;
    var g = (span <= 60 || hoog <= 100) ? 10 : 100, top = hoog <= 100 ? 100 : 1000;
    var lo = Math.max(0, g * Math.floor((laag - 1) / g) - g);
    var hi = Math.min(top, g * Math.ceil((hoog + 1) / g) + g);
    while (hi - lo < 4 * g) { if (lo > 0) lo -= g; else hi += g; }
    return [lo, Math.min(hi, top)];
  }

  function lijn(el, som) {
    var v = venster(som), lo = v[0], hi = v[1];
    var pos = som.start, sprongen = [];
    var teken = som.richting > 0 ? '+' : '−';
    var x = function (n) { return 40 + (n - lo) / (hi - lo) * 820; };
    var Y = 140;

    el.innerHTML =
      '<div class="lijn-kop"></div>' +
      '<svg class="lijn-svg" viewBox="0 0 900 215" role="img" aria-label="Getallenlijn"></svg>' +
      '<div class="lijn-knoppen"></div>';
    var kop = el.querySelector('.lijn-kop');
    var svg = el.querySelector('svg');
    var knoppen = el.querySelector('.lijn-knoppen');

    (som.stappen || [10, 5, 1]).forEach(function (g) {
      var b = document.createElement('button');
      b.className = 'sprong'; b.type = 'button';
      b.style.background = kleurVan(g);
      b.textContent = teken + g;
      b.addEventListener('click', function () {
        var nieuw = pos + som.richting * g;
        if (nieuw < lo || nieuw > hi) return;
        sprongen.push({ van: pos, naar: nieuw, g: g });
        pos = nieuw;
        teken_();
      });
      b.dataset.g = g;
      knoppen.appendChild(b);
    });
    var terug = document.createElement('button');
    terug.className = 'sprong terug'; terug.type = 'button'; terug.textContent = '↩ terug';
    terug.addEventListener('click', function () {
      var s = sprongen.pop();
      if (s) { pos = s.van; teken_(); }
    });
    knoppen.appendChild(terug);

    function teken_() {
      var h = '<line x1="30" y1="' + Y + '" x2="870" y2="' + Y + '" stroke="#555" stroke-width="4" stroke-linecap="round"/>';
      // Bij een lange lijn (tot 1000) tekenen we streepjes per 10 en getallen per 100.
      var span = hi - lo, klein = span <= 100 ? 1 : 10;
      var labelStap = span <= 20 ? 1 : span <= 100 ? 10 : 100;
      for (var n = lo; n <= hi; n += klein) {
        var grote = n % labelStap === 0, half = labelStap > 1 && n % (labelStap / 2) === 0;
        var hoogte = grote ? 20 : half ? 14 : 8;
        h += '<line x1="' + x(n) + '" y1="' + Y + '" x2="' + x(n) + '" y2="' + (Y + hoogte) + '" stroke="#555" stroke-width="' + (grote ? 3 : 2) + '"/>';
        if (grote) h += '<text x="' + x(n) + '" y="' + (Y + 52) + '" text-anchor="middle" font-size="30" fill="#444">' + n + '</text>';
      }
      if (som.type === 'mis' || som.type === 'splits') {
        h += '<circle cx="' + x(som.end) + '" cy="' + Y + '" r="17" fill="none" stroke="#e0457b" stroke-width="4" stroke-dasharray="6 5"/>' +
             '<text x="' + x(som.end) + '" y="' + (Y + 78) + '" text-anchor="middle" font-size="28" font-weight="700" fill="#e0457b">hier moet je komen</text>';
      }
      sprongen.forEach(function (s) {
        var x0 = x(s.van), x1 = x(s.naar), mid = (x0 + x1) / 2;
        var top = Y - Math.min(90, 28 + Math.abs(x1 - x0) / 3);
        h += '<path d="M' + x0 + ',' + (Y - 6) + ' Q' + mid + ',' + (top - 30) + ' ' + x1 + ',' + (Y - 6) + '" fill="none" stroke="' + kleurVan(s.g) + '" stroke-width="5" stroke-linecap="round"/>' +
             '<text x="' + mid + '" y="' + (top - 6) + '" text-anchor="middle" font-size="34" font-weight="700" fill="' + kleurVan(s.g) + '">' + (som.richting > 0 ? '+' : '−') + s.g + '</text>';
      });
      h += '<circle cx="' + x(som.start) + '" cy="' + Y + '" r="9" fill="#fff" stroke="#2a9d5c" stroke-width="5"/>';
      h += '<circle cx="' + x(pos) + '" cy="' + Y + '" r="13" fill="#2a9d5c"/>';
      svg.innerHTML = h;
      kop.innerHTML = 'Je begint op <b>' + som.start + '</b>' +
        (sprongen.length ? ' · je staat nu op <b>' + pos + '</b>' : ' · tik een sprong');
      Array.prototype.forEach.call(knoppen.querySelectorAll('.sprong[data-g]'), function (b) {
        var nieuw = pos + som.richting * Number(b.dataset.g);
        b.disabled = nieuw < lo || nieuw > hi;
      });
      terug.disabled = !sprongen.length;
    }
    teken_();
  }

  // ---------- Niveau 3: splitsen ----------
  function hte(n) { return { h: Math.floor(n / 100), t: Math.floor(n % 100 / 10), e: n % 10 }; }
  var GROEPEN = [['h', 'honderdtallen'], ['t', 'tientallen'], ['e', 'eenheden']];
  var BLOK = { h: ['honderd', '100'], t: ['tien', '10'], e: ['een', ''] };

  function blokjes(soort, aantal) {
    var h = '';
    for (var i = 0; i < aantal; i++) h += '<span class="blok ' + BLOK[soort][0] + '">' + BLOK[soort][1] + '</span>';
    return h || '<span class="leeg">0</span>';
  }

  // Een rij met groepen (honderdtallen, tientallen, eenheden). veranderd: welke groep oplicht.
  function rij(label, n, veranderd, bijschrift, metH) {
    var d = hte(n), h = '';
    GROEPEN.forEach(function (g) {
      var k = g[0];
      if (k === 'h' && !metH) return;
      var klasse = 'groep' + (veranderd ? (veranderd[k] ? ' veranderd' : ' blijft') : '');
      h += '<div class="' + klasse + '"><div class="blokken">' + blokjes(k, d[k]) + '</div>' +
           (bijschrift ? '<small>' + bijschrift[k] + '</small>' : '') + '</div>';
    });
    return '<div class="splits-rij"><div class="rij-label">' + label + '</div><div class="groepen">' + h + '</div></div>';
  }

  function splitsTekst(n) {
    var d = hte(n), delen = [];
    if (d.h) delen.push(d.h * 100);
    if (d.t) delen.push(d.t * 10);
    if (d.e || !delen.length) delen.push(d.e);
    return n + ' = ' + delen.join(' + ');
  }

  // Keersommen en deelsommen als groepjes.
  function groepje(aantal, tien) {
    var c = '';
    for (var i = 0; i < aantal; i++) c += tien ? '<span class="blok tien">10</span>' : '<span class="blok een"></span>';
    return '<div class="groep omlijnd"><div class="blokken">' + c + '</div></div>';
  }

  function groepjes(som) {
    var a = som.a, b = som.b, i, g = '', label, tekst;
    if (som.type === 'keer') {
      var tien = b >= 10 && b % 10 === 0, n = tien ? b / 10 : b;
      for (i = 0; i < a; i++) g += groepje(n, tien);
      label = a + ' groepjes van ' + b;
      tekst = tien ? a + ' × ' + n + ' tientallen = ' + (a * n) + ' tientallen' : 'Tel alle blokjes samen.';
    } else {
      for (i = 0; i < som.antwoord; i++) g += groepje(b, false);
      label = a + ' blokjes in groepjes van ' + b;
      tekst = 'Hoeveel groepjes zijn het?';
    }
    return '<div class="splits-rij"><div class="rij-label">' + label + '</div><div class="groepen klein">' + g + '</div>' +
           '<div class="rij-label">' + tekst + '</div></div>';
  }

  function splits(el, som) {
    var h = '';
    if (som.type === 'keer' || som.type === 'deel') {
      // Bij een tafel van 11 zijn het veel blokjes; laat dan alleen de eerste groepjes zien.
      el.innerHTML = groepjes(som);
      return;
    }
    if (som.type === 'splits') {
      // Het getal als blokjes: het bekende deel geel, het ontbrekende deel gestippeld.
      var c = '';
      for (var i = 0; i < som.n; i++) c += '<span class="blok een ' + (i < som.k ? '' : 'gezocht') + '">' + (i < som.k ? '' : '?') + '</span>';
      h = '<div class="splits-rij"><div class="rij-label">' + som.n + ' is ' + som.k + ' en nog hoeveel?</div>' +
          '<div class="groepen"><div class="groep"><div class="blokken">' + c + '</div></div></div></div>';
      el.innerHTML = h;
      return;
    }
    var s = hte(som.start), e = hte(som.end);
    var metH = Math.max(som.start, som.end, som.b || 0) >= 100;
    var vr = { h: s.h !== e.h, t: s.t !== e.t, e: s.e !== e.e };
    var bij = {};
    GROEPEN.forEach(function (g) {
      var k = g[0];
      bij[k] = g[1] + ': ' + (vr[k] ? s[k] + ' → ' + e[k] : 'blijven ' + s[k]);
    });
    h += rij(splitsTekst(som.start), som.start, null, null, metH);
    if (som.type === 'plus' || som.type === 'min') {
      h += rij((som.type === 'plus' ? '+ ' : '− ') + splitsTekst(som.b), som.b, null, null, metH).replace('splits-rij', 'splits-rij operand');
    } else {
      h += '<div class="splits-rij"><div class="rij-label">' + (som.richting > 0 ? 'Hoeveel moet er bij?' : 'Hoeveel moet er af?') + ' → ' + som.end + '</div></div>';
    }
    h += rij('Welke blokjes veranderen?', som.end, vr, bij, metH);
    el.innerHTML = h;
  }

  // ---------- Hulptekst en klok ----------
  function tekst(el, html) { el.innerHTML = '<p class="hulp-tekst">' + html + '</p>'; }

  // Een analoge klok als SVG: kleine wijzer = uur, grote wijzer = minuten.
  function klok(u, m) {
    var s = '<svg class="klok-svg" viewBox="0 0 200 200" role="img" aria-label="Een klok">' +
      '<circle cx="100" cy="100" r="94" fill="#fff" stroke="#c0392b" stroke-width="7"/>';
    var punt = function (hoek, r) { var a = hoek * Math.PI / 180; return [100 + r * Math.sin(a), 100 - r * Math.cos(a)]; };
    for (var i = 0; i < 60; i++) {
      var groot = i % 5 === 0, p1 = punt(i * 6, groot ? 80 : 85), p2 = punt(i * 6, 90);
      s += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="#555" stroke-width="' + (groot ? 3 : 1.2) + '"/>';
    }
    for (var n = 1; n <= 12; n++) {
      var t = punt(n * 30, 67);
      s += '<text x="' + t[0] + '" y="' + (t[1] + 7) + '" text-anchor="middle" font-size="21" font-weight="700" fill="#2b2f4a">' + n + '</text>';
    }
    var kl = punt(((u % 12) + m / 60) * 30, 46), gr = punt(m * 6, 72);
    s += '<line x1="100" y1="100" x2="' + kl[0] + '" y2="' + kl[1] + '" stroke="#2b2f4a" stroke-width="9" stroke-linecap="round"/>' +
         '<line x1="100" y1="100" x2="' + gr[0] + '" y2="' + gr[1] + '" stroke="#2b2f4a" stroke-width="5" stroke-linecap="round"/>' +
         '<circle cx="100" cy="100" r="6" fill="#c0392b"/></svg>';
    return s;
  }

  root.Hulp = { lijn: lijn, splits: splits, tekst: tekst, klok: klok };
})(typeof window !== 'undefined' ? window : globalThis);
