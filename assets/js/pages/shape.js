Phins.ready(function(){
  PhinsShape(document.getElementById("shapesvg"), document.getElementById("shaperow"), document.getElementById("shapeinfo"));
  var E = Phins.esc, R = Phins.rich;
  var roles = document.getElementById("roles"), note = document.getElementById("shapenote"), calls = document.getElementById("podcalls");
  Phins.load("shape").then(function(d){
    note.innerHTML = R(d.note);
    document.getElementById("edges").innerHTML = R(d.edges || "");
    document.getElementById("nobanana").innerHTML = R(d.noBanana || "");
    // Lead in front, plus outside, lazy inside near the ruck
    var POS = {Lead:[52,16], Plus:[74,46], Lazy:[28,46]};
    roles.innerHTML = d.roles.map(function(r){
      var mini = '<svg class="mini" viewBox="0 0 100 64" aria-hidden="true">' + d.roles.map(function(o){
        var on = o.role === r.role, p = POS[o.role] || [50,32];
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" class="' + (on ? "mon" : "moff") + '"/><text x="' + p[0] + '" y="' + (p[1]+3.5) + '" text-anchor="middle" font-size="9.5" font-weight="800" class="' + (on ? "mton" : "mtoff") + '">' + E(o.short || o.role.charAt(0)) + '</text>';
      }).join("") + '</svg>';
      return '<article class="dcard is-phins">' + mini + '<h3 class="term"><span class="ic" aria-hidden="true">' + E(r.icon) + '</span>' + E(r.role) + '</h3><p class="def">' + R(r.text) + '</p></article>';
    }).join("");
    calls.innerHTML = (d.podCalls || []).map(function(c){
      return '<article class="dcard is-phins"><h3 class="term"><span class="ic" aria-hidden="true">' + E(c.icon) + '</span>' + E(c.name) + '</h3>' +
        (c.diagram ? PhinsPodCall(c.diagram) : '') + '<ul>' + c.points.map(function(p){ return '<li>' + R(p) + '</li>'; }).join("") + '</ul></article>';
    }).join("");
  }).catch(function(){ Phins.loadFail(roles, "shape.json"); });
});
