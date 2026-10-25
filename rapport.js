// Ouderrapport: overzicht van de voortgang per steentje, plus voortgang opslaan en laden.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var STATUS = { wit: 'nog niet geoefend', grijs: 'meer oefenen', blauw: 'bijna goed', groen: 'goed' };

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function gem(lijst) { return lijst.reduce(function (a, x) { return a + x.s; }, 0) / lijst.length; }
  function datum(iso) { return iso ? new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '–'; }

  // Verloop: de nieuwste reeksen (maximaal 3) tegenover de reeksen daarvoor.
  function verloop(r) {
    if (r.length < 2) return '–';
    var half = Math.min(3, Math.floor(r.length / 2));
    var nu = r.slice(-half), eerder = r.slice(r.length - 2 * half, r.length - half);
    var v = gem(nu) - gem(eerder);
    if (v > 0.08) return '<span class="op">▲ beter</span>';
    if (v < -0.08) return '<span class="neer">▼ minder</span>';
    return '= gelijk';
  }

  function gegevens() {
    var uit = [];
    Sommen.lagen.slice().reverse().forEach(function (laag) {
      var rijen = [];
      laag.rijen.forEach(function (ids) {
        ids.forEach(function (id) {
          var steen = laag.stenen.filter(function (s) { return s.id === id; })[0];
          if (steen.binnenkort) return;
          rijen.push({ steen: steen, kleur: Voortgang.kleur(id), r: Voortgang.reeksen(id), gem: Voortgang.gemiddelde(id) });
        });
      });
      if (rijen.length) uit.push({ laag: laag, rijen: rijen });
    });
    return uit;
  }

  function foutenVan(r) {
    var tel = {};
    r.forEach(function (x) { (x.fs || []).forEach(function (s) { tel[s] = (tel[s] || 0) + 1; }); });
    return Object.keys(tel).sort(function (a, b) { return tel[b] - tel[a]; }).map(function (s) { return { s: s, n: tel[s] }; });
  }

  function teken() {
    var lagen = gegevens(), alle = [];
    lagen.forEach(function (l) { alle = alle.concat(l.rijen); });
    $('datum').textContent = 'Stand van ' + new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    var tel = { wit: 0, grijs: 0, blauw: 0, groen: 0 }, reeksen = 0, laatste = '';
    alle.forEach(function (x) {
      tel[x.kleur]++; reeksen += x.r.length;
      x.r.forEach(function (re) { if (re.d && re.d > laatste) laatste = re.d; });
    });
    $('samenvatting').innerHTML =
      '<div class="kaart"><b>' + tel.groen + ' / ' + alle.length + '</b><span>steentjes groen</span></div>' +
      '<div class="kaart"><b>' + tel.blauw + '</b><span>bijna goed</span></div>' +
      '<div class="kaart"><b>' + tel.grijs + '</b><span>meer oefenen</span></div>' +
      '<div class="kaart"><b>' + tel.wit + '</b><span>nog niet geoefend</span></div>' +
      '<div class="kaart"><b>' + reeksen + '</b><span>reeksen bewaard</span></div>' +
      '<div class="kaart"><b>' + datum(laatste) + '</b><span>laatst geoefend</span></div>';

    // Aandachtspunten: geoefend maar nog niet groen, laagste score eerst; daarna het vaakst gemiste sommen.
    var aandacht = alle.filter(function (x) { return x.kleur === 'grijs' || x.kleur === 'blauw'; })
      .sort(function (a, b) { return a.gem - b.gem; }).slice(0, 5);
    var punten = aandacht.map(function (x) {
      var f = foutenVan(x.r).slice(0, 2).map(function (e) { return esc(e.s); }).join(', ');
      return '<li><b>' + esc(x.steen.label) + '</b> (' + STATUS[x.kleur] + ', ' + pct(x.gem) + ')' + (f ? ' · vaak fout: ' + f : '') + '</li>';
    });
    var nietGeoefend = tel.wit;
    $('aandacht').innerHTML = (punten.length ? '<ul class="lijst">' + punten.join('') + '</ul>' : '<p class="leeg-tekst">' +
      (reeksen ? 'Geen steentjes die extra aandacht nodig hebben. 🎉' : 'Er is nog niets geoefend.') + '</p>') +
      (nietGeoefend && reeksen ? '<p class="leeg-tekst">Nog niet geoefend: ' + nietGeoefend + ' steentjes.</p>' : '');

    $('tabellen').innerHTML = lagen.map(function (l) {
      var body = l.rijen.map(function (x) {
        var laatsteR = x.r[x.r.length - 1];
        var zonder = laatsteR && laatsteR.z !== undefined ? laatsteR.z + ' van 10' : '–';
        var f = foutenVan(x.r).slice(0, 2).map(function (e) { return esc(e.s) + (e.n > 1 ? ' (' + e.n + '×)' : ''); }).join('<br>') || '–';
        return '<tr><td><b>' + esc(x.steen.label) + '</b></td><td><span class="chip ' + x.kleur + '">' + STATUS[x.kleur] + '</span></td>' +
          '<td>' + x.r.length + '</td><td>' + (laatsteR ? pct(laatsteR.s) : '–') + '</td><td>' + zonder + '</td><td>' + verloop(x.r) + '</td>' +
          '<td>' + datum(laatsteR && laatsteR.d) + '</td><td>' + f + '</td></tr>';
      }).join('');
      return '<table><caption>' + esc(l.laag.titel) + '</caption><thead><tr><th>Steentje</th><th>Status</th><th>Reeksen</th><th>Laatste score</th><th>Zonder hulp (laatste)</th><th>Verloop</th><th>Laatst</th><th>Vaak fout</th></tr></thead><tbody>' + body + '</tbody></table>';
    }).join('');
  }

  // Het leerwerkboek: per les hoe het gaat, zodat je ziet hoe het huiswerk gaat.
  function boekTabel() {
    var h = Sommen.boek.map(function (blok) {
      var body = blok.lessen.map(function (les) {
        var r = Voortgang.reeksen(les.id), k = Voortgang.kleur(les.id), laatste = r[r.length - 1];
        var f = foutenVan(r).slice(0, 2).map(function (e) { return esc(e.s) + (e.n > 1 ? ' (' + e.n + '×)' : ''); }).join('<br>') || '–';
        return '<tr><td><b>Les ' + les.nr + '</b> · blz. ' + les.pag + '–' + les.tot + '<br>' + esc(les.titel) + '</td>' +
          '<td><span class="chip ' + k + '">' + STATUS[k] + '</span></td><td>' + r.length + '</td>' +
          '<td>' + (laatste ? pct(laatste.s) : '–') + '</td><td>' + (laatste && laatste.z !== undefined ? laatste.z + ' van 10' : '–') + '</td>' +
          '<td>' + verloop(r) + '</td><td>' + datum(laatste && laatste.d) + '</td><td>' + f + '</td></tr>';
      }).join('');
      return '<table><caption>Leerwerkboek · ' + esc(blok.titel) + '</caption><thead><tr><th>Les</th><th>Status</th><th>Reeksen</th><th>Laatste score</th><th>Zonder hulp (laatste)</th><th>Verloop</th><th>Laatst</th><th>Vaak fout</th></tr></thead><tbody>' + body + '</tbody></table>';
    }).join('');
    $('tabellen').insertAdjacentHTML('afterbegin', h);
  }

  function melding(t) { $('melding').textContent = t; }

  $('opslaan').addEventListener('click', function () {
    var blob = new Blob([Voortgang.exporteer()], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rekenmuurtje-voortgang-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    melding('Bestand opgeslagen in je downloads.');
  });

  $('laden').addEventListener('change', function (e) {
    var f = e.target.files[0];
    if (!f) return;
    var lezer = new FileReader();
    lezer.onload = function () {
      try { Voortgang.importeer(lezer.result); teken(); boekTabel(); melding('Voortgang geladen en samengevoegd.'); }
      catch (err) { melding('Dat lukte niet: ' + err.message); }
    };
    lezer.readAsText(f);
    e.target.value = '';
  });

  $('print').addEventListener('click', function () { window.print(); });

  teken();
  boekTabel();
})();
