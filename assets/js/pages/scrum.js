/* Build-by-number scrum. Players appear in number order with one active callout.
   Wide screens: callouts in fixed slots around the diagram with a leader line.
   Narrow screens: a fixed panel under the diagram. ?highlight=N shows the full scrum with N open. */
Phins.ready(function(){
  "use strict";
  var E = Phins.esc;
  // body: [cx, top y, width, height, rotate]; head: [cx, cy, r]; bind: path d
  var GEO = {
    1:{b:[166,300,84,46,0], h:[178,284,15], bind:"M192 314 Q210 320 228 316"},
    2:{b:[250,300,84,46,0], h:[246,284,15], bind:"M222 304 Q200 296 176 304 M278 304 Q300 296 324 304"},
    3:{b:[334,300,84,46,0], h:[314,284,15], bind:"M308 314 Q290 320 272 316"},
    4:{b:[208,362,72,46,0], h:[208,352,12], bind:"M234 380 Q250 386 266 380"},
    5:{b:[292,362,72,46,0], h:[292,352,12], bind:"M266 392 Q250 398 234 392"},
    6:{b:[112,358,62,48,10], h:[132,348,12], bind:"M140 380 Q158 388 176 384"},
    7:{b:[388,358,62,48,-10], h:[368,348,12], bind:"M360 380 Q342 388 324 384"},
    8:{b:[250,422,72,46,0], h:[250,412,12], bind:"M230 436 Q216 420 220 404 M270 436 Q284 420 280 404"}
  };
  var svg = document.getElementById("scrumsvg"), stage = document.getElementById("stage"), lines = document.getElementById("leader");
  var panel = document.getElementById("panel"), chips = document.getElementById("chips"), status = document.getElementById("status");
  var bPlay = document.getElementById("b-play"), bNext = document.getElementById("b-next"), bReplay = document.getElementById("b-replay"), bAll = document.getElementById("b-all");
  var data, P = {}, shown = 0, active = 0, timer = null, note = "";
  var wide = window.matchMedia("(min-width: 1000px)");

  Phins.load("scrum").then(function(d){
    data = d; d.players.forEach(function(p){ P[p.n] = p; });
    draw(); buildSlots();
    var hl = parseInt(Phins.param("highlight"), 10);
    if (hl >= 1 && hl <= 8){ shown = 8; active = hl; }
    else if (hl === 9){ shown = 8; note = d.notInScrum["9"]; }
    else if (hl >= 10 && hl <= 15){ shown = 8; note = d.notInScrum.backs; }
    render();
    if (hl >= 1 && hl <= 8) setTimeout(function(){ stage.scrollIntoView({block:"start", behavior:"auto"}); }, 50);
  }).catch(function(){ Phins.loadFail(panel, "scrum.json"); });

  function draw(){
    var h = '<text x="250" y="190" text-anchor="middle" class="lab">THEIR FRONT ROW</text>';
    [[200,"3"],[284,"2"],[368,"1"]].forEach(function(o){
      h += '<g class="ghost" aria-hidden="true"><rect class="body" x="' + (o[0]-42) + '" y="200" width="84" height="46" rx="16"/><text x="' + o[0] + '" y="230" text-anchor="middle" font-size="18">' + o[1] + '</text></g>';
    });
    [[212],[280],[348]].forEach(function(o){ h += '<circle class="ghosthead" cx="' + o[0] + '" cy="262" r="15" aria-hidden="true"/>'; });
    h += '<text x="250" y="505" text-anchor="middle" class="lab">OUR SCRUM · PUSHING THIS WAY ↑</text>';
    for (var n = 1; n <= 8; n++){
      var g = GEO[n], b = g.b, cx = b[0], cy = b[1] + b[3]/2;
      h += '<g class="pl sp hidden" data-n="' + n + '" role="button" tabindex="-1" aria-hidden="true">' +
        '<path class="bindline" d="' + g.bind + '"/>' +
        '<g transform="rotate(' + b[4] + ' ' + cx + ' ' + cy + ')"><rect class="body" x="' + (cx - b[2]/2) + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="16"/></g>' +
        '<circle class="head" cx="' + g.h[0] + '" cy="' + g.h[1] + '" r="' + g.h[2] + '"/>' +
        '<text x="' + cx + '" y="' + (cy + 9) + '" text-anchor="middle" font-size="24">' + n + '</text></g>';
    }
    svg.insertAdjacentHTML("beforeend", h);
    svg.addEventListener("click", function(e){ var g = e.target.closest(".sp"); if (g && !g.classList.contains("hidden")) tap(+g.getAttribute("data-n")); });
    svg.addEventListener("keydown", function(e){ var g = e.target.closest(".sp"); if (g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); tap(+g.getAttribute("data-n")); } });
  }

  function buildSlots(){
    data.players.forEach(function(p){
      var col = document.getElementById("slots-" + p.side);
      var s = document.createElement("div"); s.className = "slot"; s.id = "slot-" + p.n; s.setAttribute("data-n", p.n); s.hidden = true;
      col.appendChild(s);
    });
    stage.addEventListener("click", function(e){ var b = e.target.closest("[data-pick]"); if (b) tap(+b.getAttribute("data-pick")); });
  }

  function calloutHtml(p, tag){
    return '<' + tag + ' class="callout"><div class="ch"><span class="num">' + p.n + '</span><h3>' + E(p.name) + '</h3></div><p>' + Phins.rich(p.text) + '</p></' + tag + '>';
  }

  function render(){
    // players
    var gs = svg.querySelectorAll(".sp");
    for (var i = 0; i < gs.length; i++){
      var n = +gs[i].getAttribute("data-n"), vis = n <= shown;
      gs[i].classList.toggle("hidden", !vis);
      gs[i].classList.toggle("on", n === active);
      gs[i].setAttribute("tabindex", vis ? "0" : "-1");
      gs[i].setAttribute("aria-hidden", vis ? "false" : "true");
      gs[i].setAttribute("aria-label", n + ", " + P[n].name + (n === active ? ", selected" : ""));
    }
    // wide-screen slots
    for (var n2 = 1; n2 <= 8; n2++){
      var s = document.getElementById("slot-" + n2), p = P[n2];
      s.hidden = n2 > shown;
      if (n2 === active) s.innerHTML = calloutHtml(p, "div");
      else s.innerHTML = '<button type="button" class="chip" data-pick="' + n2 + '"><span class="num">' + n2 + '</span>' + E(p.name) + '</button>';
      s.classList.toggle("active", n2 === active);
    }
    // narrow-screen panel + chips
    if (active) panel.innerHTML = calloutHtml(P[active], "div");
    else if (note) panel.innerHTML = '<div class="callout"><p>' + Phins.rich(note) + '</p></div>';
    else if (shown === 0) panel.innerHTML = '<p class="hint">Press <b>▶ Play</b> to build the scrum, or <b>⏭ Next player</b> to go one at a time.</p>';
    else panel.innerHTML = '<p class="hint">Tap any player to see their job.</p>';
    var c = "";
    for (var k = 1; k <= shown; k++) c += '<button type="button" data-pick="' + k + '" aria-pressed="' + (k === active) + '">' + k + '</button>';
    chips.innerHTML = c;
    status.textContent = shown === 0 ? "Ready to build" : shown < 8 ? "Player " + shown + " of 8" : "Full scrum ✔";
    bPlay.textContent = timer ? "⏸ Pause" : "▶ Play";
    bNext.disabled = shown >= 8;
    leader(); setTimeout(leader, 450);
  }

  // leader line from the active slot to the active player (wide screens only)
  function leader(){
    lines.innerHTML = "";
    if (!wide.matches || !active) return;
    var slot = document.getElementById("slot-" + active), g = svg.querySelector('.sp[data-n="' + active + '"] .body');
    if (!slot || slot.hidden || !g) return;
    var st = stage.getBoundingClientRect(), sr = slot.getBoundingClientRect(), gr = g.getBoundingClientRect(), side = P[active].side;
    var x1, y1, x2 = gr.left + gr.width/2 - st.left, y2 = gr.top + gr.height/2 - st.top;
    if (side === "left"){ x1 = sr.right - st.left; y1 = sr.top + sr.height/2 - st.top; x2 = gr.left - st.left + 6; }
    else if (side === "right"){ x1 = sr.left - st.left; y1 = sr.top + sr.height/2 - st.top; x2 = gr.right - st.left - 6; }
    else if (side === "top"){ x1 = sr.left + sr.width/2 - st.left; y1 = sr.bottom - st.top; }
    else { x1 = sr.left + sr.width/2 - st.left; y1 = sr.top - st.top; }
    lines.setAttribute("viewBox", "0 0 " + st.width + " " + st.height);
    lines.innerHTML = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/><circle cx="' + x2 + '" cy="' + y2 + '" r="5"/><circle cx="' + x1 + '" cy="' + y1 + '" r="4"/>';
  }

  function stop(){ if (timer){ clearInterval(timer); timer = null; } }
  function next(){ note = ""; if (shown < 8){ shown++; active = shown; } if (shown >= 8) stop(); render(); }
  function play(){
    if (timer){ stop(); render(); return; }
    if (shown >= 8){ shown = 0; active = 0; }
    note = ""; next();
    if (shown < 8){ timer = setInterval(next, 1900); render(); }
  }
  function tap(n){ stop(); note = ""; if (n <= shown){ active = n; render(); } }

  bPlay.addEventListener("click", play);
  bNext.addEventListener("click", function(){ stop(); next(); });
  bReplay.addEventListener("click", function(){ stop(); shown = 0; active = 0; note = ""; play(); });
  bAll.addEventListener("click", function(){ stop(); shown = 8; note = ""; render(); });
  window.addEventListener("resize", leader);
  if (wide.addEventListener) wide.addEventListener("change", render);
  if (window.ResizeObserver) new ResizeObserver(leader).observe(stage);
});
