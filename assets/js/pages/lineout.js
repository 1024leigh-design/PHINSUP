/* Lineout side view with tappable numbers. ?highlight=N works. */
Phins.ready(function(){
  var E = Phins.esc, svg = document.getElementById("losvg"), info = document.getElementById("loinfo"), row = document.getElementById("lorow");
  Phins.load("lineout").then(function(d){
    var GROUND = 230, X0 = 120, GAP = 50, xs = {}, h = "";
    // ground, touch, 5m and 15m marks
    h += '<line x1="0" y1="' + GROUND + '" x2="520" y2="' + GROUND + '" class="fieldline"/>';
    [[52,"touch"],[100,"5m"],[505,"15m"]].forEach(function(m){ h += '<line x1="' + m[0] + '" y1="' + (GROUND-6) + '" x2="' + m[0] + '" y2="' + (GROUND+10) + '" stroke="var(--muted)" stroke-width="3"/><text x="' + m[0] + '" y="' + (GROUND+24) + '" text-anchor="middle" class="lab">' + m[1] + '</text>'; });
    // faded opposition line (behind ours)
    d.order.forEach(function(n, i){ var x = X0 + i*GAP + 18; h += '<g class="ghost" aria-hidden="true"><rect class="body" x="' + (x-13) + '" y="' + (GROUND-78) + '" width="26" height="62" rx="12"/><circle class="head" cx="' + x + '" cy="' + (GROUND-90) + '" r="10"/></g>'; });
    // throw arc
    var jx = X0 + d.order.indexOf(d.lifted)*GAP;
    h += '<path d="M40 ' + (GROUND-120) + ' Q' + ((40+jx)/2) + ' ' + (GROUND-215) + ' ' + jx + ' ' + (GROUND-170) + '" fill="none" stroke="var(--pink)" stroke-width="3" stroke-dasharray="7 6"/>';
    function person(n, x, foot, lifted, extra){
      var top = foot - 70;
      return '<g class="pl" data-n="' + n + '" tabindex="0" role="button" aria-label="' + n + '">' +
        (extra || "") +
        '<rect class="body" x="' + (x-15) + '" y="' + top + '" width="30" height="66" rx="13"/>' +
        '<circle class="head" cx="' + x + '" cy="' + (top-13) + '" r="11"/>' +
        (lifted ? '<path d="M' + (x-8) + ' ' + (top-22) + ' l-4 -22 M' + (x+8) + ' ' + (top-22) + ' l4 -22" class="armline"/>' : '') +
        '<text x="' + x + '" y="' + (top+42) + '" text-anchor="middle" font-size="19">' + n + '</text></g>';
    }
    // hooker in touch
    h += person(2, 30, GROUND, false, '<ellipse cx="40" cy="' + (GROUND-122) + '" rx="10" ry="7" fill="var(--yellow)" stroke="#7a6100" stroke-width="2"/>');
    d.order.forEach(function(n, i){
      var x = X0 + i*GAP, lifted = n === d.lifted;
      h += person(n, x, lifted ? GROUND - 62 : GROUND, lifted);
    });
    // 9 a little apart
    h += person(9, X0 + d.order.length*GAP + 8, GROUND, false);
    h += '<text x="300" y="20" text-anchor="middle" class="lab">THEIR LINE (FADED) IS 1 METER AWAY</text>';
    svg.innerHTML = h;
    var nums = [2].concat(d.order).concat([9]);
    row.innerHTML = nums.map(function(n){ return '<button type="button" data-n="' + n + '" aria-pressed="false">' + n + '</button>'; }).join("") +
      '<button type="button" data-n="10" aria-pressed="false" style="min-width:auto;padding:0 10px">10 to 15</button>';
    function pick(n){
      var gs = svg.querySelectorAll(".pl");
      for (var i = 0; i < gs.length; i++) gs[i].classList.toggle("on", +gs[i].getAttribute("data-n") === n);
      var bs = row.querySelectorAll("button");
      for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", +bs[j].getAttribute("data-n") === n || (n >= 10 && +bs[j].getAttribute("data-n") === 10) ? "true" : "false");
      var txt = n >= 10 ? d.roles.backs : d.roles[String(n)];
      info.innerHTML = '<h3><span class="num">' + (n >= 10 ? n : n) + '</span>' + (n >= 10 ? "Backs" : "Number " + n) + '</h3><p>' + Phins.rich(txt || "") + '</p>';
    }
    function hit(e){ var t = e.target.closest("[data-n]"); if (t) pick(+t.getAttribute("data-n")); }
    svg.addEventListener("click", hit); row.addEventListener("click", hit);
    svg.addEventListener("keydown", function(e){ if ((e.key === "Enter" || e.key === " ") && e.target.closest(".pl")){ e.preventDefault(); hit(e); } });
    var hl = parseInt(Phins.param("highlight"), 10);
    if (hl >= 1 && hl <= 15) pick(hl); else info.innerHTML = '<p>Tap a number to see that job. ' + Phins.rich(d.note) + '</p>';
    document.getElementById("lonote").innerHTML = Phins.rich(d.note);
  }).catch(function(){ Phins.loadFail(info, "lineout.json"); });
});
