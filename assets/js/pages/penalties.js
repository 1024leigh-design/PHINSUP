/* Penalties cheat sheet: three tabs (Penalty, Free kick, Scrum). Each tab shows its main signal, then the infringements
   that lead to it, with the ref's extra signal when there is one. */
Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich;
  var gold = document.getElementById("golden"), tabs = document.getElementById("ptabs"), main = document.getElementById("pmain"), cards = document.getElementById("pcards");
  Promise.all([Phins.load("penalties"), Phins.load("signals")]).then(function(r){
    var d = r[0], sig = {}; r[1].signals.forEach(function(s){ sig[s.key] = s; });
    gold.innerHTML = d.golden.map(function(g){ return '<li>' + E(g) + '</li>'; }).join("");
    tabs.innerHTML = d.tabs.map(function(t){ return '<button type="button" role="tab" data-tab="' + t.id + '" aria-controls="pmain">' + E(t.name) + ' <span class="cnt">' + d.cards.filter(function(c){ return c.tab === t.id; }).length + '</span></button>'; }).join("");
    var cur = d.tabs[0].id;
    function show(){
      var t = d.tabs.filter(function(x){ return x.id === cur; })[0], s = sig[t.signal];
      var bs = tabs.querySelectorAll("[data-tab]"); for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-selected", bs[i].getAttribute("data-tab") === cur ? "true" : "false");
      main.innerHTML = '<div class="mainsig tone-' + t.id + '">' + (s ? PhinsFigure(s, s.name) : '') + '<div><span class="tag">Main signal</span><h3>' + E(t.name) + '</h3><p>' + R(t.text) + '</p>' + (s ? '<p class="sigdesc"><b>The signal:</b> ' + R(s.desc) + '</p>' : '') + '</div></div>';
      cards.innerHTML = d.cards.filter(function(c){ return c.tab === cur; }).map(function(c){
        var s2 = c.signal ? sig[c.signal] : null;
        return '<article class="dcard pcard tone-' + c.tab + '"><div class="ptop">' + (s2 ? PhinsFigure(s2, s2.name) : '<div class="nosig" aria-hidden="true">' + E(t.name) + '<br>signal</div>') + '<h3 class="term">' + E(c.name) + '</h3></div>' +
          '<p><b>What it is:</b> ' + R(c.what) + '</p><p><b>Avoid it:</b> ' + R(c.avoid) + '</p>' +
          '<p class="from">' + (s2 ? 'Extra signal: ' + E(s2.desc) : 'No extra signal: the ref just gives the ' + E(t.name.toLowerCase()) + ' signal.') + '</p>' +
          (c.link ? '<a class="see" href="' + E(c.link) + '">' + E(c.linkText || "See it") + ' &rarr;</a>' : '') + '</article>';
      }).join("");
    }
    tabs.addEventListener("click", function(e){ var b = e.target.closest("[data-tab]"); if (b){ cur = b.getAttribute("data-tab"); show(); } });
    show();
  }).catch(function(){ Phins.loadFail(cards, "penalties.json"); });
});
