Phins.ready(function(){
  PhinsShape(document.getElementById("shapesvg"), document.getElementById("shaperow"), document.getElementById("shapeinfo"));
  var roles = document.getElementById("roles"), note = document.getElementById("shapenote");
  Phins.load("shape").then(function(d){
    note.innerHTML = Phins.rich(d.note);
    var POS = {Point:[50,18], Support:[34,44], Lazy:[66,50]};
    roles.innerHTML = d.roles.map(function(r){
      var mini = '<svg class="mini" viewBox="0 0 100 64" aria-hidden="true">' + Object.keys(POS).map(function(k){
        var on = k === r.role, p = POS[k];
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" class="' + (on ? "mon" : "moff") + '"/><text x="' + p[0] + '" y="' + (p[1]+3.5) + '" text-anchor="middle" font-size="10" font-weight="800" class="' + (on ? "mton" : "mtoff") + '">' + k.charAt(0) + '</text>';
      }).join("") + '</svg>';
      return '<article class="dcard is-phins">' + mini + '<h3 class="term"><span class="ic" aria-hidden="true">' + Phins.esc(r.icon) + '</span>' + Phins.esc(r.role) + '</h3><p class="def">' + Phins.rich(r.text) + '</p></article>';
    }).join("");
  }).catch(function(){ Phins.loadFail(roles, "shape.json"); });
});
