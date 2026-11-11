/* Scrum page.
   1) Build-by-number: click "Add" to bring in each player in number order. Each player has a callout and a Learn more.
      Wide screens: callouts sit in fixed slots around the diagram with a leader line. Narrow screens: a panel under the diagram.
      ?highlight=N shows the full scrum with N open.
   2) Crouch / Bind / Set popup: both teams, three stages, tap a player for what they do at that stage. ?cbs=1 opens it. */
Phins.ready(function(){
  "use strict";
  var E = Phins.esc, R = Phins.rich;
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
  // The other team is our pack turned 180 degrees, so their loosehead sits opposite our tighthead.
  function flipPt(x, y){ return [526 - x, 546 - y]; }

  function playerSvg(n, team, dy, cls, extra){
    var g = GEO[n], b = g.b, cx = b[0], cy = b[1] + b[3]/2, hx = g.h[0], hy = g.h[1], bind = g.bind;
    if (team === "them"){ var c = flipPt(cx, cy), hh = flipPt(hx, hy); cx = c[0]; cy = c[1]; hx = hh[0]; hy = hh[1]; }
    cy += dy; hy += dy;
    var tr = team === "them" ? ' transform="translate(0 ' + dy + ') rotate(180 263 273)"' : (dy ? ' transform="translate(0 ' + dy + ')"' : '');
    return '<g class="' + cls + '" data-n="' + n + '" data-team="' + team + '"' + (extra || "") + '>' +
      '<path class="bindline"' + tr + ' d="' + bind + '"/>' +
      '<g transform="rotate(' + b[4] + ' ' + cx + ' ' + cy + ')"><rect class="body" x="' + (cx - b[2]/2) + '" y="' + (cy - b[3]/2) + '" width="' + b[2] + '" height="' + b[3] + '" rx="16"/></g>' +
      '<circle class="head" cx="' + hx + '" cy="' + hy + '" r="' + g.h[2] + '"/>' +
      '<text x="' + cx + '" y="' + (cy + 9) + '" text-anchor="middle" font-size="24">' + n + '</text></g>';
  }

  var svg = document.getElementById("scrumsvg"), stage = document.getElementById("stage"), lines = document.getElementById("leader");
  var panel = document.getElementById("panel"), chips = document.getElementById("chips"), status = document.getElementById("status");
  var bAdd = document.getElementById("b-add"), bAll = document.getElementById("b-all"), bReset = document.getElementById("b-reset");
  var data, P = {}, shown = 0, active = 0, note = "";
  var wide = window.matchMedia("(min-width: 1000px)");

  Phins.load("scrum").then(function(d){
    data = d; d.players.forEach(function(p){ P[p.n] = p; });
    draw(); buildSlots(); cbsSetup();
    var hl = parseInt(Phins.param("highlight"), 10);
    if (hl >= 1 && hl <= 8){ shown = 8; active = hl; }
    else if (hl === 9){ shown = 8; note = d.notInScrum["9"]; }
    else if (hl >= 10 && hl <= 15){ shown = 8; note = d.notInScrum.backs; }
    render();
    if (hl >= 1 && hl <= 8) setTimeout(function(){ stage.scrollIntoView({block:"start", behavior:"auto"}); }, 50);
    if (Phins.param("cbs") === "1") openCbs();
  }).catch(function(){ Phins.loadFail(panel, "scrum.json"); });

  /* ---------- build-by-number ---------- */
  function draw(){
    var h = '<text x="263" y="190" text-anchor="middle" class="lab">THE OTHER TEAM\'S FRONT ROW</text>';
    [1,2,3].forEach(function(n){ h += playerSvg(n, "them", 0, "opp", ' aria-hidden="true"'); });
    h += '<text x="250" y="505" text-anchor="middle" class="lab">OUR SCRUM · PUSHING THIS WAY ↑</text>';
    for (var n = 1; n <= 8; n++) h += playerSvg(n, "us", 0, "pl sp hidden", ' role="button" tabindex="-1" aria-hidden="true"');
    svg.insertAdjacentHTML("beforeend", h);
    svg.addEventListener("click", function(e){ var g = e.target.closest(".sp"); if (g && !g.classList.contains("hidden")) tap(+g.getAttribute("data-n")); });
    svg.addEventListener("keydown", function(e){ var g = e.target.closest(".sp"); if (g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); tap(+g.getAttribute("data-n")); } });
  }
  function buildSlots(){
    data.players.forEach(function(p){
      var s = document.createElement("div"); s.className = "slot"; s.id = "slot-" + p.n; s.hidden = true;
      document.getElementById("slots-" + p.side).appendChild(s);
    });
    stage.addEventListener("click", function(e){ var b = e.target.closest("[data-pick]"); if (b) tap(+b.getAttribute("data-pick")); });
    stage.addEventListener("toggle", leader, true);
  }
  function calloutHtml(p){
    return '<div class="callout"><div class="ch"><span class="num">' + p.n + '</span><h3>' + E(p.name) + '</h3></div><p>' + R(p.text) + '</p>' +
      (p.more ? '<details class="cmore"><summary>Learn more about the ' + p.n + '</summary><ul>' + p.more.map(function(x){ return '<li>' + R(x) + '</li>'; }).join("") + '</ul></details>' : '') + '</div>';
  }
  function render(){
    var gs = svg.querySelectorAll(".sp");
    for (var i = 0; i < gs.length; i++){
      var n = +gs[i].getAttribute("data-n"), vis = n <= shown;
      gs[i].classList.toggle("hidden", !vis); gs[i].classList.toggle("on", n === active);
      gs[i].setAttribute("tabindex", vis ? "0" : "-1"); gs[i].setAttribute("aria-hidden", vis ? "false" : "true");
      gs[i].setAttribute("aria-label", n + ", " + P[n].name + (n === active ? ", selected" : ""));
    }
    for (var n2 = 1; n2 <= 8; n2++){
      var s = document.getElementById("slot-" + n2), p = P[n2];
      s.hidden = n2 > shown;
      s.innerHTML = n2 === active ? calloutHtml(p) : '<button type="button" class="chip" data-pick="' + n2 + '"><span class="num">' + n2 + '</span>' + E(p.name) + '</button>';
      s.classList.toggle("active", n2 === active);
    }
    if (active) panel.innerHTML = calloutHtml(P[active]);
    else if (note) panel.innerHTML = '<div class="callout"><p>' + R(note) + '</p></div>';
    else if (shown === 0) panel.innerHTML = '<p class="hint">Press <b>Add the 1</b> to start building the scrum.</p>';
    else panel.innerHTML = '<p class="hint">Tap any player to see their job.</p>';
    var c = ""; for (var k = 1; k <= shown; k++) c += '<button type="button" data-pick="' + k + '" aria-pressed="' + (k === active) + '">' + k + '</button>';
    chips.innerHTML = c;
    status.textContent = shown < 8 ? shown + " of 8 players" : "Full scrum";
    if (shown < 8){ bAdd.disabled = false; bAdd.innerHTML = 'Add the ' + (shown + 1) + ': ' + E(P[shown + 1].name) + ' &rarr;'; }
    else { bAdd.disabled = true; bAdd.textContent = "All 8 are in!"; }
    leader(); setTimeout(leader, 450);
  }
  function leader(){
    lines.innerHTML = "";
    if (!wide.matches || !active) return;
    var slot = document.getElementById("slot-" + active), g = svg.querySelector('.sp[data-n="' + active + '"] .body');
    if (!slot || slot.hidden || !g) return;
    var st = stage.getBoundingClientRect(), sr = slot.getBoundingClientRect(), gr = g.getBoundingClientRect(), side = P[active].side;
    var x1, y1, x2 = gr.left + gr.width/2 - st.left, y2 = gr.top + gr.height/2 - st.top;
    if (side === "left"){ x1 = sr.right - st.left; y1 = sr.top + 30 - st.top; x2 = gr.left - st.left + 6; }
    else if (side === "right"){ x1 = sr.left - st.left; y1 = sr.top + 30 - st.top; x2 = gr.right - st.left - 6; }
    else if (side === "top"){ x1 = sr.left + sr.width/2 - st.left; y1 = sr.bottom - st.top; }
    else { x1 = sr.left + sr.width/2 - st.left; y1 = sr.top - st.top; }
    lines.setAttribute("viewBox", "0 0 " + st.width + " " + st.height);
    lines.innerHTML = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/><circle cx="' + x2 + '" cy="' + y2 + '" r="5"/><circle cx="' + x1 + '" cy="' + y1 + '" r="4"/>';
  }
  function tap(n){ note = ""; if (n <= shown){ active = n; render(); } }
  bAdd.addEventListener("click", function(){ note = ""; if (shown < 8){ shown++; active = shown; render(); } });
  bAll.addEventListener("click", function(){ shown = 8; note = ""; render(); });
  bReset.addEventListener("click", function(){ shown = 0; active = 0; note = ""; render(); });
  window.addEventListener("resize", leader);
  if (wide.addEventListener) wide.addEventListener("change", render);
  if (window.ResizeObserver) new ResizeObserver(leader).observe(stage);

  /* ---------- Crouch / Bind / Set popup ---------- */
  var dlg = document.getElementById("cbs"), csvg = document.getElementById("cbssvg"), ctext = document.getElementById("cbstext"), cinfo = document.getElementById("cbsinfo"), cpills = document.getElementById("cbspills");
  var cst = 0, cpick = 0, cteam = "";
  function openCbs(){ cst = 0; cpick = 0; cteam = ""; drawCbs(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
  function cbsSetup(){
    document.querySelectorAll("[data-open-cbs]").forEach(function(b){ b.addEventListener("click", openCbs); });
    dlg.querySelector(".x").addEventListener("click", function(){ dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
    dlg.addEventListener("click", function(e){ if (e.target === dlg) dlg.close(); });
    cpills.innerHTML = data.cbs.stages.map(function(s, i){ return '<button type="button" data-st="' + i + '" aria-pressed="false">' + (i+1) + '. ' + E(s.name) + '</button>'; }).join("") +
      '<button type="button" class="nextst" data-st="next">Next call &rarr;</button>';
    cpills.addEventListener("click", function(e){ var b = e.target.closest("[data-st]"); if (!b) return; var v = b.getAttribute("data-st"); cst = v === "next" ? (cst + 1) % 3 : +v; drawCbs(); });
    csvg.addEventListener("click", function(e){ var g = e.target.closest("[data-n]"); if (g){ cpick = +g.getAttribute("data-n"); cteam = g.getAttribute("data-team"); drawCbs(); } });
    csvg.addEventListener("keydown", function(e){ var g = e.target.closest("[data-n]"); if (g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); cpick = +g.getAttribute("data-n"); cteam = g.getAttribute("data-team"); drawCbs(); } });
  }
  function drawCbs(){
    var C = data.cbs, s = C.stages[cst], gap = s.gap, h = "";
    h += '<line x1="70" y1="273" x2="460" y2="273" class="midline"/>';
    for (var n = 8; n >= 1; n--){
      h += playerSvg(n, "them", -gap, "opp" + (cpick === n && cteam === "them" ? " on" : ""), ' role="button" tabindex="0" aria-label="Their ' + n + '"');
      h += playerSvg(n, "us", gap, "pl" + (cpick === n && cteam === "us" ? " on" : ""), ' role="button" tabindex="0" aria-label="Our ' + n + ', ' + E(P[n].name) + '"');
    }
    if (cst >= 1){
      // props bind on the opposing prop: our 1 (left arm) to their 3, our 3 (right arm) to their 1
      var t3 = flipPt(334, 300), t1 = flipPt(166, 300);
      h += '<path class="crossbind" d="M136 ' + (306 + gap) + ' Q140 ' + (273) + ' ' + (t3[0] - 30) + ' ' + (t3[1] - gap - 6) + '"/>';
      h += '<path class="crossbind" d="M364 ' + (306 + gap) + ' Q370 ' + (273) + ' ' + (t1[0] + 30) + ' ' + (t1[1] - gap - 6) + '"/>';
    }
    h += '<text x="263" y="30" text-anchor="middle" class="lab">THE OTHER TEAM</text><text x="263" y="542" text-anchor="middle" class="lab">US</text>';
    csvg.innerHTML = h;
    ctext.innerHTML = '<h3>' + (cst+1) + '. "' + E(s.name) + '"</h3><p>' + R(s.text) + '</p>';
    if (cpick && cteam === "us") cinfo.innerHTML = '<b>Our ' + cpick + ' (' + E(P[cpick].name) + ') on "' + E(s.name) + '":</b> ' + R(C.players[String(cpick)][cst]);
    else if (cpick) cinfo.innerHTML = '<b>Their ' + cpick + ':</b> ' + R(C.them);
    else cinfo.textContent = "Tap any player to see what they do on this call.";
    var bs = cpills.querySelectorAll("[data-st]"); for (var i = 0; i < bs.length - 1; i++) bs[i].setAttribute("aria-pressed", i === cst ? "true" : "false");
  }
});
