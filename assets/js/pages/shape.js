Phins.ready(function(){
  PhinsShape(document.getElementById("shapesvg"), document.getElementById("shaperow"), document.getElementById("shapeinfo"));
  var E = Phins.esc, R = Phins.rich;
  var roles = document.getElementById("roles"), note = document.getElementById("shapenote"), calls = document.getElementById("podcalls");

  // Pod structure around the ruck: ruck, 9 behind it, lazy inside, lead in front of the 10, plus outside.
  function podMini(on){
    var P = {Lazy:[30,66], Lead:[80,52], Plus:[110,70]};
    var h = '<svg class="mini podmini" viewBox="0 0 130 100" role="img" aria-label="Pod around the ruck: ruck, 9 behind it, lazy behind the ruck, lead in front of the 10, plus on the far side. ' + on + ' is highlighted.">' +
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
    // One diagram, click through: Lead, then Plus, then Lazy.
    var ri = 0;
    function showRole(){
      var x = d.roles[ri];
      roles.innerHTML = '<div class="dcard is-phins rolecard">' +
        '<div class="numrow steps-pills" style="margin:0">' + d.roles.map(function(o, i){ return '<button type="button" data-ri="' + i + '" aria-pressed="' + (i === ri) + '">' + (i+1) + '. ' + E(o.role) + '</button>'; }).join("") + '</div>' +
        podMini(x.role) +
        '<div aria-live="polite"><h3 class="term">' + E(x.role) + '</h3><p class="def">' + R(x.text) + '</p></div>' +
        '<div class="btnrow">' + (ri < d.roles.length - 1 ? '<button type="button" class="btn small" data-ri="' + (ri + 1) + '">Next: ' + E(d.roles[ri+1].role) + ' &rarr;</button>' : '<button type="button" class="btn small ghost" data-ri="0">Start over</button>') + '</div></div>';
    }
    roles.addEventListener("click", function(e){ var b = e.target.closest("[data-ri]"); if (b){ ri = +b.getAttribute("data-ri"); showRole(); } });
    showRole();
    calls.innerHTML = (d.podCalls || []).map(function(c, i){
      return '<article class="dcard is-phins playcard"><h3>' + E(c.name) + '</h3>' +
        '<div data-play="' + E(c.diagram) + '"></div>' +
        '<details class="more" style="margin-top:0"><summary>The rules for ' + E(c.name) + '</summary><div class="body"><ul>' + c.points.map(function(p){ return '<li>' + R(p) + '</li>'; }).join("") + '</ul></div></details></article>';
    }).join("");
    calls.querySelectorAll("[data-play]").forEach(function(el){ var k = el.getAttribute("data-play"); if (plays[k]) PhinsPlay(el, plays[k]); });
  }).catch(function(){ Phins.loadFail(roles, "shape.json / plays.json"); });
});
