Phins.ready(function(){
  var el = document.getElementById("callcards");
  Phins.load("calls").then(function(d){
    el.innerHTML = d.calls.map(function(c){
      return '<article class="dcard' + (c.phins ? ' is-phins' : '') + '"><h3 class="term">' + (c.icon ? '<span class="ic" aria-hidden="true">' + Phins.esc(c.icon) + '</span>' : '') + Phins.rich(c.call) + (c.phins ? ' <span class="phins">🐬 Phins</span>' : '') + '</h3><p class="def">' + Phins.rich(c.means) + '</p>' + (c.see ? '<a class="see" href="' + Phins.esc(c.see) + '">See it &rarr;</a>' : '') + '</article>';
    }).join("");
  }).catch(function(){ Phins.loadFail(el, "calls.json"); });
});
