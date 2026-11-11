Phins.ready(function(){
  var el = document.getElementById("principles");
  Phins.load("playbook").then(function(d){
    el.innerHTML = d.principles.map(function(p){
      return '<article class="dcard is-phins"><h3 class="term"><span class="ic" aria-hidden="true">' + Phins.esc(p.icon) + '</span>' + Phins.esc(p.title) + '</h3><p class="def">' + Phins.rich(p.text) + '</p></article>';
    }).join("");
  }).catch(function(){ Phins.loadFail(el, "playbook.json"); });
});
