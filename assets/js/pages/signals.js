Phins.ready(function(){
  var el = document.getElementById("sigs"), note = document.getElementById("signote");
  Phins.load("signals").then(function(d){
    note.innerHTML = Phins.rich(d.officialNote);
    el.innerHTML = d.signals.map(function(s){
      return '<article class="dcard sigcard">' + PhinsFigure(s, s.name) + '<h3 class="term">' + Phins.esc(s.name) + '</h3><p class="def">' + Phins.rich(s.desc) + '</p></article>';
    }).join("");
  }).catch(function(){ Phins.loadFail(el, "signals.json"); });
});
