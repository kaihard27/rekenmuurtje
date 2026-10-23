// Voortgang per steentje, bewaard in localStorage.
// Per steentje onthouden we de laatste 10 reeksen: {s: score 0..1, d: datum, z: aantal goed zonder hulp,
// h: aantal goed met hulp, f: aantal sommen fout, fs: de sommen die fout gingen}.
// Score per som: goed zonder hulp = 1, goed met hulp = 0,5, goed na tweede poging = 0,25, fout = 0.
// Oudere reeksen zijn alleen een getal (de score); die worden bij het lezen omgezet.
(function (root) {
  var SLEUTEL = 'rekenmuurtje.v1';
  var data = {};
  try { data = JSON.parse(localStorage.getItem(SLEUTEL)) || {}; } catch (e) { data = {}; }

  function bewaar() {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(data)); } catch (e) { /* dan blijft het alleen in het geheugen */ }
  }

  function normaal(r) { return typeof r === 'number' ? { s: r } : r; }

  function reeksen(id) { return (data[id] || []).map(normaal); }

  function reeksKlaar(id, score, extra) {
    var r = data[id] || [];
    var item = { s: Math.round(score * 1000) / 1000, d: new Date().toISOString() };
    for (var k in extra) item[k] = extra[k];
    r.push(item);
    data[id] = r.slice(-10);
    bewaar();
  }

  // Gewogen gemiddelde: nieuwere reeksen tellen iets zwaarder mee.
  function gemiddelde(id) {
    var r = reeksen(id);
    if (!r.length) return null;
    var som = 0, gewicht = 0;
    r.forEach(function (x, i) { som += x.s * (i + 1); gewicht += i + 1; });
    return som / gewicht;
  }

  function kleur(id) {
    var g = gemiddelde(id);
    if (g === null) return 'wit';
    if (g < 0.5) return 'grijs';
    if (g < 0.8) return 'blauw';
    return 'groen';
  }

  function wis() { data = {}; bewaar(); }

  // Voor opslaan/laden tussen apparaten.
  function exporteer() {
    return JSON.stringify({ app: 'rekenmuurtje', versie: 1, gemaakt: new Date().toISOString(), data: data }, null, 1);
  }

  // Voegt voortgang uit een bestand samen met wat er al is (dubbele reeksen vallen weg).
  function importeer(tekst) {
    var inhoud = JSON.parse(tekst);
    if (!inhoud || inhoud.app !== 'rekenmuurtje' || typeof inhoud.data !== 'object') throw new Error('Dit is geen voortgangsbestand.');
    Object.keys(inhoud.data).forEach(function (id) {
      var alle = (data[id] || []).concat(inhoud.data[id]).map(normaal);
      var gezien = {}, uniek = [];
      alle.forEach(function (x) {
        var sl = JSON.stringify(x);
        if (!gezien[sl]) { gezien[sl] = true; uniek.push(x); }
      });
      uniek.sort(function (a, b) { return (a.d || '').localeCompare(b.d || ''); });
      data[id] = uniek.slice(-10);
    });
    bewaar();
  }

  root.Voortgang = { reeksKlaar: reeksKlaar, reeksen: reeksen, gemiddelde: gemiddelde, kleur: kleur, wis: wis, exporteer: exporteer, importeer: importeer };
})(typeof window !== 'undefined' ? window : globalThis);
