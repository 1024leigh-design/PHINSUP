Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich;
  var oc = document.getElementById("outcomes"), gold = document.getElementById("golden"), cards = document.getElementById("pcards");
  Promise.all([Phins.load("penalties"), Phins.load("signals")]).then(function(r){
    var d = r[0], sig = {}; r[1].signals.forEach(function(s){ sig[s.key] = s; });
    var COL = {penalty:"var(--pink)", freekick:"var(--yellow)", scrum:"var(--green)", choice:"var(--green)"};
    oc.innerHTML = d.outcomes.map(function(o){ return '<article class="dcard" style="--c:' + COL[o.type] + '"><h3 class="term">' + E(o.name) + '</h3><p class="def">' + R(o.text) + '</p></article>'; }).join("");
    gold.innerHTML = d.golden.map(function(g){ return '<li>' + E(g) + '</li>'; }).join("");
    cards.innerHTML = d.cards.map(function(c){
      var s = sig[c.signal];
      return '<article class="dcard pcard" style="--c:' + COL[c.type] + '">' +
        '<div class="ptop">' + (s ? PhinsFigure(s, s.name) : '') + '<h3 class="term">' + E(c.name) + '</h3></div>' +
        '<p><b>What it is:</b> ' + R(c.what) + '</p><p><b>Avoid it:</b> ' + R(c.avoid) + '</p>' +
        '<p class="res">' + E(c.result) + '</p>' + (s ? '<p class="from">Signal shown: ' + E(s.name) + '</p>' : '') + '</article>';
    }).join("");
  }).catch(function(){ Phins.loadFail(cards, "penalties.json"); });
});
