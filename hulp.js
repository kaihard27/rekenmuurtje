// Hulp niveau 2 (lege getallenlijn) en niveau 3 (splitsen in tientallen en eenheden).
(function (root) {
  var KLEUR = { 10: '#2f7fd8', 5: '#8e5bd1', 1: '#f08a24' };

  // ---------- Niveau 2: getallenlijn ----------
  function kleurVan(g) { return KLEUR[g] || '#2f7fd8'; }

  function venster(som) {
    if (som.max <= 20) return [0, 20];
    var laag = Math.min(som.start, som.end), hoog = Math.max(som.start, som.end);
    var g = hoog <= 100 ? 10 : 100, top = hoog <= 100 ? 100 : 1000;
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
  function tienEen(n) { return { t: Math.floor(n / 10), e: n % 10 }; }

  function blokjes(t, e) {
    var h = '', i;
    for (i = 0; i < t; i++) h += '<span class="blok tien">10</span>';
    for (i = 0; i < e; i++) h += '<span class="blok een"></span>';
    return h || '<span class="leeg">0</span>';
  }

  // Een rij met twee groepen (tientallen en eenheden). veranderd: {t, e} welke groep oplicht.
  function rij(label, n, veranderd, bijschrift) {
    var d = tienEen(n);
    var gt = '<div class="groep' + (veranderd && veranderd.t ? ' veranderd' : veranderd ? ' blijft' : '') + '">' +
             '<div class="blokken">' + blokjes(d.t, 0) + '</div>' + (bijschrift ? '<small>' + bijschrift.t + '</small>' : '') + '</div>';
    var ge = '<div class="groep' + (veranderd && veranderd.e ? ' veranderd' : veranderd ? ' blijft' : '') + '">' +
             '<div class="blokken">' + blokjes(0, d.e) + '</div>' + (bijschrift ? '<small>' + bijschrift.e + '</small>' : '') + '</div>';
    return '<div class="splits-rij"><div class="rij-label">' + label + '</div><div class="groepen">' + gt + ge + '</div></div>';
  }

  function splitsTekst(n) {
    var d = tienEen(n);
    return n + ' = ' + d.t * 10 + ' + ' + d.e;
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
      var tien = b >= 10, n = tien ? b / 10 : b;
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
    if (som.type === 'keer' || som.type === 'deel') { el.innerHTML = groepjes(som); return; }
    if (som.type === 'splits') {
      // Het getal als blokjes: het bekende deel geel, het ontbrekende deel gestippeld.
      var c = '';
      for (var i = 0; i < som.n; i++) c += '<span class="blok een ' + (i < som.k ? '' : 'gezocht') + '">' + (i < som.k ? '' : '?') + '</span>';
      h = '<div class="splits-rij"><div class="rij-label">' + som.n + ' is ' + som.k + ' en nog hoeveel?</div>' +
          '<div class="groepen"><div class="groep"><div class="blokken">' + c + '</div></div></div></div>';
      el.innerHTML = h;
      return;
    }
    var s = tienEen(som.start), e = tienEen(som.end);
    var vt = s.t !== e.t, ve = s.e !== e.e;
    var bij = {
      t: vt ? 'tientallen: ' + s.t + ' → ' + e.t : 'tientallen: blijven ' + s.t,
      e: ve ? 'eenheden: ' + s.e + ' → ' + e.e : 'eenheden: blijven ' + s.e
    };
    h += rij(splitsTekst(som.start), som.start, null, null);
    if (som.type === 'plus' || som.type === 'min') {
      h += rij((som.type === 'plus' ? '+ ' : '− ') + splitsTekst(som.b), som.b, null, null).replace('splits-rij', 'splits-rij operand');
    } else {
      h += '<div class="splits-rij"><div class="rij-label">' + (som.richting > 0 ? 'Hoeveel moet er bij?' : 'Hoeveel moet er af?') + ' → ' + som.end + '</div></div>';
    }
    h += rij('Welke blokjes veranderen?', som.end, { t: vt, e: ve }, bij);
    el.innerHTML = h;
  }

  root.Hulp = { lijn: lijn, splits: splits };
})(typeof window !== 'undefined' ? window : globalThis);
