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

    function topView(){
      // touch line on the left, line of touch across the middle, ours at the bottom, theirs (navy) at the top
      var h = '<rect x="0" y="0" width="420" height="330" rx="14" class="lf"/>';
      h += hot("zone", '<rect x="82" y="96" width="186" height="138" class="zonebox"/><text x="175" y="252" text-anchor="middle" class="lab">5m TO 15m</text>');
      h += '<line x1="34" y1="10" x2="34" y2="320" class="tl"/><text x="40" y="320" class="lab">touch</text>';
      h += '<line x1="82" y1="10" x2="82" y2="320" class="tl dash"/><text x="86" y="22" class="lab">5m</text>';
      h += '<line x1="268" y1="10" x2="268" y2="320" class="tl dash"/><text x="272" y="22" class="lab">15m</text>';
      h += hot("gap", '<rect x="90" y="150" width="172" height="30" class="gapbox"/><text x="176" y="169" text-anchor="middle" class="lab gapl">1 m GAP</text>');
      var xs = [108, 136, 164, 192, 220, 248];
      h += hot("them", xs.map(function(x){ return '<circle cx="' + x + '" cy="132" r="11" class="opp"/>'; }).join("") + '<text x="176" y="112" text-anchor="middle" class="lab">THEIR LINE</text>');
      h += hot("lifter", [108, 164, 192, 248].map(function(x){ return '<circle cx="' + x + '" cy="198" r="11" class="us"/><text x="' + x + '" y="202" text-anchor="middle" class="t">L</text>'; }).join(""));
      h += hot("jumper", [136, 220].map(function(x){ return '<circle cx="' + x + '" cy="198" r="11" class="us jmp"/><text x="' + x + '" y="202" text-anchor="middle" class="t w">J</text>'; }).join("") + '<text x="176" y="230" text-anchor="middle" class="lab">OUR LINE</text>');
      h += hot("thrower", '<circle cx="20" cy="165" r="12" class="us thr"/><text x="20" y="169" text-anchor="middle" class="t">H</text><ellipse cx="36" cy="150" rx="7" ry="5" class="ball"/>');
      h += hot("receiver", '<circle cx="292" cy="214" r="11" class="us rec"/><text x="292" y="218" text-anchor="middle" class="t">9</text><circle cx="292" cy="116" r="11" class="opp"/><text x="292" y="120" text-anchor="middle" class="t w">9</text><text x="320" y="218" class="lab">receiver</text>');
      h += hot("backs", '<rect x="40" y="276" width="370" height="36" rx="10" class="backsbox"/><text x="225" y="299" text-anchor="middle" class="lab">OUR BACKS: 10 m BACK</text><rect x="40" y="36" width="370" height="36" rx="10" class="backsbox opp2"/><text x="225" y="59" text-anchor="middle" class="lab">THEIR BACKS: 10 m BACK</text>');
      return '<svg viewBox="0 0 420 330" class="losvg" role="group" aria-label="Lineout from above. Tap a part to learn about it.">' + h + '</svg>';
    }
    function sideView(){
      var G = 214, h = '<rect x="0" y="0" width="560" height="270" rx="14" class="lf"/>';
      h += '<line x1="0" y1="' + G + '" x2="560" y2="' + G + '" class="tl"/>';
      [[52,"touch"],[100,"5m"],[520,"15m"]].forEach(function(m){ h += '<line x1="' + m[0] + '" y1="' + (G-6) + '" x2="' + m[0] + '" y2="' + (G+10) + '" class="tl"/><text x="' + m[0] + '" y="' + (G+26) + '" text-anchor="middle" class="lab">' + m[1] + '</text>'; });
      function fig(x, foot, cls, label, lifted){
        var top = foot - 66, s = '<rect x="' + (x-17) + '" y="' + top + '" width="34" height="62" rx="13" class="' + cls + '"/><circle cx="' + x + '" cy="' + (top-12) + '" r="10" class="' + cls + '"/>';
        if (lifted) s += '<path d="M' + (x-7) + ' ' + (top-20) + ' l-4 -20 M' + (x+7) + ' ' + (top-20) + ' l4 -20" class="arm"/>';
        return s + (label ? '<text x="' + x + '" y="' + (top+38) + '" text-anchor="middle" class="t' + (cls.indexOf("jmp") >= 0 || cls.indexOf("opp") >= 0 ? " w" : "") + '">' + label + '</text>' : '');
      }
      h += hot("them", [150,200,250,300,350,400].map(function(x){ return fig(x + 18, G - 10, "opp ghosty", ""); }).join("") + '<text x="300" y="30" text-anchor="middle" class="lab">THEIR LINE, 1 m BEHIND OURS</text>');
      h += hot("lifter", [150,250,300,400].map(function(x){ return fig(x, G, "us", "L"); }).join(""));
      h += hot("jumper", fig(200, G - 58, "us jmp", "J", true) + fig(350, G, "us jmp", "J"));
      h += '<path d="M44 ' + (G-118) + ' Q120 ' + (G-210) + ' 200 ' + (G-172) + '" class="throw"/>';
      h += hot("thrower", fig(30, G, "us thr", "H") + '<ellipse cx="44" cy="' + (G-118) + '" rx="10" ry="7" class="ball"/>');
      h += hot("receiver", fig(470, G, "us rec", "9") + '<text x="470" y="' + (G+42) + '" text-anchor="middle" class="lab">receiver</text>');
      return '<svg viewBox="0 0 560 270" class="losvg" role="group" aria-label="Lineout from the side. Tap a part to learn about it.">' + h + '</svg>';
    }
    function draw(){
      wrap.innerHTML = view === "top" ? topView() : sideView();
      for (var i = 0; i < views.length; i++) views[i].setAttribute("aria-pressed", views[i].getAttribute("data-view") === view ? "true" : "false");
      mark();
    }
    function mark(){ var hs = wrap.querySelectorAll(".hot"); for (var i = 0; i < hs.length; i++) hs[i].classList.toggle("on", hs[i].getAttribute("data-k") === picked); }
    function pick(k){
      picked = k; mark(); var it = d.items[k];
      info.innerHTML = '<h3>' + E(it.name) + '</h3><p>' + Phins.rich(it.text) + '</p>';
    }
    for (var i = 0; i < views.length; i++) views[i].addEventListener("click", function(){ view = this.getAttribute("data-view"); draw(); });
    wrap.addEventListener("click", function(e){ var g = e.target.closest(".hot"); if (g) pick(g.getAttribute("data-k")); });
    wrap.addEventListener("keydown", function(e){ var g = e.target.closest(".hot"); if (g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); pick(g.getAttribute("data-k")); } });
    draw();
    if (Phins.param("highlight") === "2") pick("thrower"); else info.innerHTML = "<p>Tap any part of the diagram.</p>";
  }).catch(function(){ Phins.loadFail(info, "lineout.json"); });
});
