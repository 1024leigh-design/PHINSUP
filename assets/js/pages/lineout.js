/* Lineout page: general concepts, with a side view and a top view. Tap a part of the diagram to learn about it.
   ?highlight=2 opens on the thrower. */
Phins.ready(function(){
  var E = Phins.esc, wrap = document.getElementById("lodia"), info = document.getElementById("loinfo"), good = document.getElementById("logood");
  var views = document.querySelectorAll("[data-view]");
  Phins.load("lineout").then(function(d){
    good.innerHTML = d.good.map(function(g){ return '<article class="dcard"><h3 class="term">' + E(g.term) + '</h3><p class="def">' + Phins.rich(g.def) + '</p></article>'; }).join("");
    var view = "top", picked = "";

    function hot(k, inner){ return '<g class="hot" data-k="' + k + '" tabindex="0" role="button" aria-label="' + E(d.items[k].name) + '">' + inner + '</g>'; }
    function person(x, y, label, cls){ return '<g class="lp ' + cls + '"><rect x="' + (x-16) + '" y="' + (y-14) + '" width="32" height="28" rx="11"/><circle cx="' + x + '" cy="' + (y-22) + '" r="8"/>' + (label ? '<text x="' + x + '" y="' + (y+5) + '" text-anchor="middle">' + label + '</text>' : '') + '</g>'; }

    var N = 7, PAT = {4:"LJLL", 5:"LJLJL", 6:"LJLLJL", 7:"LJLLJLL"}, cyc = null;
    function xsTop(n){ var r = []; for (var i = 0; i < n; i++) r.push(n === 1 ? 175 : 100 + i * (150 / (n - 1))); return r; }
    function xsSide(n){ var r = []; for (var i = 0; i < n; i++) r.push(150 + i * (300 / (n - 1))); return r; }
    function topView(){
      // touch line on the left, ours at the bottom, theirs (navy) at the top. Players move when the number changes.
      var h = '<rect x="0" y="0" width="420" height="330" rx="14" class="lf"/>';
      h += hot("zone", '<rect x="82" y="96" width="186" height="148" class="zonebox"/><text x="94" y="238" class="lab">5m TO 15m</text>');
      h += '<line x1="34" y1="10" x2="34" y2="320" class="tl"/><text x="40" y="320" class="lab">touch</text>';
      h += '<line x1="82" y1="10" x2="82" y2="320" class="tl dash"/><text x="86" y="22" class="lab">5m</text>';
      h += '<line x1="268" y1="10" x2="268" y2="320" class="tl dash"/><text x="272" y="22" class="lab">15m</text>';
      h += hot("gap", '<rect x="90" y="150" width="172" height="30" class="gapbox"/><text x="176" y="169" text-anchor="middle" class="lab gapl">1 m GAP</text>');
      var them = "", ours = "";
      for (var i = 0; i < 7; i++){
        them += '<g class="mv" data-i="' + i + '" data-row="them"><circle cx="0" cy="0" r="10" class="opp"/></g>';
        ours += '<g class="mv" data-i="' + i + '" data-row="us"><circle cx="0" cy="0" r="10" class="us"/><text x="0" y="4" text-anchor="middle" class="t">L</text></g>';
      }
      h += hot("them", them + '<text x="176" y="112" text-anchor="middle" class="lab">THEIR LINE</text>');
      h += '<g class="hot" data-k="ours" tabindex="0" role="button" aria-label="Our line">' + ours + '<text x="176" y="230" text-anchor="middle" class="lab">OUR LINE</text></g>';
      h += hot("thrower", '<circle cx="20" cy="165" r="12" class="us thr"/><text x="20" y="169" text-anchor="middle" class="t">H</text><ellipse cx="36" cy="150" rx="7" ry="5" class="ball"/>');
      h += hot("receiver", '<circle cx="190" cy="252" r="11" class="us rec"/><text x="190" y="256" text-anchor="middle" class="t">9</text><circle cx="190" cy="80" r="11" class="opp"/><text x="190" y="84" text-anchor="middle" class="t w">9</text><text x="206" y="256" class="lab">receiver</text>');
      h += hot("backs", '<rect x="40" y="280" width="370" height="34" rx="10" class="backsbox"/><text x="225" y="302" text-anchor="middle" class="lab">OUR BACKS: 10 m BACK</text><rect x="40" y="18" width="370" height="34" rx="10" class="backsbox opp2"/><text x="225" y="40" text-anchor="middle" class="lab">THEIR BACKS: 10 m BACK</text>');
      return '<svg viewBox="0 0 420 330" class="losvg" role="group" aria-label="Lineout from above. Tap a part to learn about it.">' + h + '</svg>';
    }
    function sideView(){
      var G = 214, h = '<rect x="0" y="0" width="560" height="270" rx="14" class="lf"/>';
      h += '<line x1="0" y1="' + G + '" x2="560" y2="' + G + '" class="tl"/>';
      [[52,"touch"],[100,"5m"],[520,"15m"]].forEach(function(m){ h += '<line x1="' + m[0] + '" y1="' + (G-6) + '" x2="' + m[0] + '" y2="' + (G+10) + '" class="tl"/><text x="' + m[0] + '" y="' + (G+26) + '" text-anchor="middle" class="lab">' + m[1] + '</text>'; });
      function fig(cls, label){ return '<rect x="-17" y="-66" width="34" height="62" rx="13" class="' + cls + '"/><circle cx="0" cy="-78" r="10" class="' + cls + '"/><text x="0" y="-28" text-anchor="middle" class="t' + (cls.indexOf("opp") >= 0 ? " w" : "") + '">' + label + '</text>'; }
      var them = "", ours = "";
      for (var i = 0; i < 7; i++){
        them += '<g class="mv" data-i="' + i + '" data-row="them">' + fig("opp ghosty", "") + '</g>';
        ours += '<g class="mv" data-i="' + i + '" data-row="us">' + fig("us", "L") + '</g>';
      }
      h += hot("them", them + '<text x="300" y="30" text-anchor="middle" class="lab">THEIR LINE, 1 m BEHIND OURS</text>');
      h += '<g class="hot" data-k="ours" tabindex="0" role="button" aria-label="Our line">' + ours + '</g>';
      h += hot("thrower", '<g transform="translate(30 ' + G + ')">' + fig("us thr", "H") + '</g><ellipse cx="44" cy="' + (G-118) + '" rx="10" ry="7" class="ball"/>');
      return '<svg viewBox="0 0 560 270" class="losvg" role="group" aria-label="Lineout from the side. Tap a part to learn about it.">' + h + '</svg>';
    }
    function place(){
      var top = view === "top", xs = top ? xsTop(N) : xsSide(N), pat = PAT[N], G = 214;
      wrap.querySelectorAll(".mv").forEach(function(g){
        var i = +g.getAttribute("data-i"), row = g.getAttribute("data-row"), on = i < N, x = xs[Math.min(i, N - 1)];
        var lifted = !top && row === "us" && pat.charAt(i) === "J" && i === pat.indexOf("J");
        var y = top ? (row === "us" ? 198 : 132) : (row === "us" ? (lifted ? G - 56 : G) : G - 10);
        if (!top && row === "them") x += 18;
        g.style.transform = "translate(" + x + "px," + y + "px)"; g.style.opacity = on ? 1 : 0;
        if (row === "us"){
          var j = on && pat.charAt(i) === "J", c = g.querySelectorAll("circle,rect"), t = g.querySelector("text");
          for (var k = 0; k < c.length; k++) c[k].classList.toggle("jmp", j);
          t.textContent = j ? "J" : "L"; t.classList.toggle("w", j);
          g.setAttribute("data-role", j ? "jumper" : "lifter");
        }
      });
      for (var b = 0; b < nbtn.length; b++) nbtn[b].setAttribute("aria-pressed", +nbtn[b].getAttribute("data-n") === N ? "true" : "false");
      document.getElementById("locount").textContent = N + " players each: " + PAT[N].split("").map(function(c){ return c === "J" ? "jumper" : "lifter"; }).filter(function(v, i, a){ return true; }).length + " in the line";
    }
    function draw(){
      wrap.innerHTML = view === "top" ? topView() : sideView();
      for (var i = 0; i < views.length; i++) views[i].setAttribute("aria-pressed", views[i].getAttribute("data-view") === view ? "true" : "false");
      wrap.querySelector("svg").classList.add("instant"); place(); mark();
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ var sv = wrap.querySelector("svg"); if (sv) sv.classList.remove("instant"); }); });
    }
    var nbtn = document.querySelectorAll("[data-n]");
    for (var q = 0; q < nbtn.length; q++) nbtn[q].addEventListener("click", function(){ stopCyc(); N = +this.getAttribute("data-n"); place(); });
    function stopCyc(){ if (cyc){ clearInterval(cyc); cyc = null; document.getElementById("locycle").textContent = "Show 4 to 7"; } }
    document.getElementById("locycle").addEventListener("click", function(){
      if (cyc){ stopCyc(); return; }
      N = 4; place(); this.textContent = "Pause";
      cyc = setInterval(function(){ if (N >= 7){ stopCyc(); return; } N++; place(); }, 1800);
    });
    function mark(){ var hs = wrap.querySelectorAll(".hot"); for (var i = 0; i < hs.length; i++) hs[i].classList.toggle("on", hs[i].getAttribute("data-k") === picked); }
    function pick(k){
      picked = k; mark(); var it = d.items[k]; if (!it) return;
      info.innerHTML = '<h3>' + E(it.name) + '</h3><p>' + Phins.rich(it.text) + '</p>';
    }
    for (var i = 0; i < views.length; i++) views[i].addEventListener("click", function(){ view = this.getAttribute("data-view"); draw(); });
    wrap.addEventListener("click", function(e){
      var m = e.target.closest('.mv[data-row="us"]'); if (m){ pick(m.getAttribute("data-role") || "lifter"); return; }
      var g = e.target.closest(".hot"); if (g) pick(g.getAttribute("data-k") === "ours" ? "lifter" : g.getAttribute("data-k"));
    });
    wrap.addEventListener("keydown", function(e){ var g = e.target.closest(".hot"); if (g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); pick(g.getAttribute("data-k")); } });
    draw();
    if (Phins.param("highlight") === "2") pick("thrower"); else info.innerHTML = "<p>Tap any part of the diagram.</p>";
  }).catch(function(){ Phins.loadFail(info, "lineout.json"); });
});
