/* Shared vocab card + search helpers (used by the home page and the vocab page). */
window.PhinsVocab = (function(){
  "use strict";
  function norm(s){ return String(s).toLowerCase().replace(/["'“”]/g, ""); }
  function card(t, tabLabel){
    var E = Phins.esc;
    return '<article class="dcard' + (t.phins ? ' is-phins' : '') + '">' +
      (tabLabel ? '<span class="from">' + E(tabLabel) + '</span>' : '') +
      '<h3 class="term">' + (t.icon ? '<span class="ic" aria-hidden="true">' + E(t.icon) + '</span>' : '') + E(t.term) +
      (t.phins ? ' <span class="phins" title="Phins team term">🐬 Phins</span>' : '') + '</h3>' +
      '<p class="def">' + Phins.rich(t.def) + '</p>' +
      (t.see ? '<a class="see" href="' + E(t.see) + '">See it &rarr;</a>' : '') + '</article>';
  }
  function search(data, q){
    q = norm(q).trim(); var out = [];
    if (!q) return out;
    data.tabs.forEach(function(tab){ tab.terms.forEach(function(t){
      var hay = norm(t.term + " " + t.def);
      var score = norm(t.term).indexOf(q) === 0 ? 0 : norm(t.term).indexOf(q) >= 0 ? 1 : hay.indexOf(q) >= 0 ? 2 : -1;
      if (score >= 0) out.push({t:t, tab:tab, score:score});
    }); });
    out.sort(function(a,b){ return a.score - b.score; });
    return out;
  }
  return {card:card, search:search};
})();
