Phins.ready(function(){
  var inp = document.getElementById("q"), out = document.getElementById("results");
  var form = document.getElementById("searchform");
  Phins.load("vocab").then(function(data){
    function run(){
      var q = inp.value, hits = PhinsVocab.search(data, q);
      if (!q.trim()){ out.innerHTML = ""; return; }
      if (!hits.length){ out.innerHTML = '<p class="count">No match for "' + Phins.esc(q) + '". Try a shorter word.</p>'; return; }
      var h = '<p class="count" aria-live="polite">' + hits.length + ' match' + (hits.length === 1 ? '' : 'es') + '</p><div class="cards">';
      hits.slice(0, 6).forEach(function(x){ h += PhinsVocab.card(x.t, x.tab.label); });
      h += '</div>';
      if (hits.length > 6) h += '<p style="margin-top:10px"><a class="btn ghost small" href="vocab.html?q=' + encodeURIComponent(q) + '">See all ' + hits.length + ' in Quick Vocab &rarr;</a></p>';
      out.innerHTML = h;
    }
    inp.addEventListener("input", run);
    form.addEventListener("submit", function(e){ e.preventDefault(); run(); });
  }).catch(function(){ Phins.loadFail(out, "vocab.json"); });
});
