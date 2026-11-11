Phins.ready(function(){
  PhinsShape(document.getElementById("shapesvg"), document.getElementById("shaperow"), document.getElementById("shapeinfo"));
  var E = Phins.esc, R = Phins.rich;
  var roles = document.getElementById("roles"), note = document.getElementById("shapenote"), calls = document.getElementById("podcalls");

  // Pod structure around the ruck: ruck, 9 behind it, lazy inside, lead in front of the 10, plus outside.
  function podMini(on){
    var P = {Lazy:[30,66], Lead:[80,52], Plus:[110,70]};
    var h = '<svg class="mini podmini" viewBox="0 0 130 100" aria-hidden="true">' +
      '<polygon points="30,4 16,26 44,26" class="mruck"/><text x="30" y="22" text-anchor="middle" font-size="7.5" class="mrt">Ruck</text>' +
      '<circle cx="30" cy="40" r="8" class="mback"/><text x="30" y="43" text-anchor="middle" font-size="9" font-weight="800" class="mbt">9</text>' +
      '<circle cx="80" cy="88" r="8" class="mback"/><text x="80" y="91" text-anchor="middle" font-size="8" font-weight="800" class="mbt">10</text>';
    Object.keys(P).forEach(function(k){
      var p = P[k], o = k === on;
      h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11.5" class="' + (o ? "mon" : "moff") + '"/><text x="' + p[0] + '" y="' + (p[1]+3) + '" text-anchor="middle" font-size="8" font-weight="800" class="' + (o ? "mton" : "mtoff") + '">' + k + '</text>';
    });
    return h + '</svg>';
  }

  Promise.all([Phins.load("shape"), Phins.load("plays")]).then(function(r){
    var d = r[0], plays = r[1];
    note.innerHTML = R(d.note);
    document.getElementById("edges").innerHTML = R(d.edges || "");
    document.getElementById("nobanana").innerHTML = R(d.noBanana || "");
    roles.innerHTML = d.roles.map(function(x){
      return '<article class="dcard is-phins">' + podMini(x.role) + '<h3 class="term">' + E(x.role) + '</h3><p class="def">' + R(x.text) + '</p></article>';
    }).join("");
    calls.innerHTML = (d.podCalls || []).map(function(c, i){
      return '<article class="dcard is-phins playcard"><h3>' + E(c.name) + '</h3>' +
        '<div data-play="' + E(c.diagram) + '"></div>' +
        '<details class="more" style="margin-top:0"><summary>The rules for ' + E(c.name) + '</summary><div class="body"><ul>' + c.points.map(function(p){ return '<li>' + R(p) + '</li>'; }).join("") + '</ul></div></details></article>';
    }).join("");
    calls.querySelectorAll("[data-play]").forEach(function(el){ var k = el.getAttribute("data-play"); if (plays[k]) PhinsPlay(el, plays[k]); });
  }).catch(function(){ Phins.loadFail(roles, "shape.json / plays.json"); });
});
