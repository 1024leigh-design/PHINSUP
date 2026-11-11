/* Shared 1-3-3-1 diagram (Open Play page and Our Shape page). Reads data/shape.json.
   PhinsShape(svgEl, rowEl, infoEl) draws it, wires up taps, and honors ?highlight=N. */
window.PhinsShape = function(svg, row, info){
  "use strict";
  var E = Phins.esc;
  Phins.load("shape").then(function(d){
    var A = d.podA || [], B = d.podB || [];
    var spots = {edgeL:[48,110], edgeR:[352,110]};
    var tri = [[0,-24],[-26,20],[26,20]];
    var h = '<line x1="8" y1="20" x2="8" y2="200" class="fieldline"/><line x1="392" y1="20" x2="392" y2="200" class="fieldline"/>' +
      '<text x="200" y="22" text-anchor="middle" class="lab">ATTACKING THIS WAY ↑</text>';
    function dot(cls, x, y, label, n){
      return '<g class="pl ' + cls + '"' + (n ? ' data-n="' + n + '"' : '') + '><circle class="body" cx="' + x + '" cy="' + y + '" r="17"/>' +
        (label !== "" ? '<text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" font-size="17">' + E(label) + '</text>' : '') + '</g>';
    }
    h += dot("edge", spots.edgeL[0], spots.edgeL[1], d.edgeLeft, d.edgeLeft);
    h += dot("edge", spots.edgeR[0], spots.edgeR[1], d.edgeRight, d.edgeRight);
    [[148,"A",A],[252,"B",B]].forEach(function(p){
      h += '<rect class="podbox" data-pod="' + p[1] + '" x="' + (p[0]-50) + '" y="62" width="100" height="98" rx="26"/>';
      tri.forEach(function(t, i){ var n = p[2][i]; h += dot("inpod", p[0]+t[0], 110+t[1], n || "", n || 0); });
    });
    [[48,"1"],[148,"3"],[252,"3"],[352,"1"]].forEach(function(l){ h += '<text x="' + l[0] + '" y="196" text-anchor="middle" class="big">' + l[1] + '</text>'; });
    svg.innerHTML = h;

    var btns = "";
    for (var n = 1; n <= 8; n++) btns += '<button type="button" data-n="' + n + '" aria-pressed="false">' + n + '</button>';
    row.innerHTML = btns + '<button type="button" data-n="9" aria-pressed="false" style="min-width:auto;padding:0 10px">9 to 15</button>';

    function pick(n){
      var inA = A.indexOf(n) >= 0, inB = B.indexOf(n) >= 0, edge = n === d.edgeLeft || n === d.edgeRight;
      var center = !edge && n >= 1 && n <= 8;
      var gs = svg.querySelectorAll(".pl");
      for (var i = 0; i < gs.length; i++) gs[i].classList.toggle("on", +gs[i].getAttribute("data-n") === n && n > 0);
      var pods = svg.querySelectorAll(".podbox");
      for (var j = 0; j < pods.length; j++){ var pid = pods[j].getAttribute("data-pod"); pods[j].classList.toggle("on", center && ((pid === "A" && inA) || (pid === "B" && inB) || (!inA && !inB))); }
      var bs = row.querySelectorAll("button");
      for (var k = 0; k < bs.length; k++) bs[k].setAttribute("aria-pressed", (+bs[k].getAttribute("data-n") === n || (n >= 9 && +bs[k].getAttribute("data-n") === 9)) ? "true" : "false");
      var t;
      if (edge) t = "You're usually the <b>1</b> on an edge of our 1-3-3-1.";
      else if (center) t = (inA || inB ? "You're usually in center pod " + (inA ? "A" : "B") + ". " : "You're in one of the two center pods (the <b>3s</b>). ") + "The tight five are ALWAYS in a center pod, and the 8 usually joins them. You carry the ball in a pod of 3.";
      else t = "Backs content is coming later. " + Phins.rich("[HANNAH TO PROVIDE: where backs fit around us]");
      info.innerHTML = '<h3><span class="num">' + (n >= 9 ? "9+" : n) + '</span>' + (n >= 9 ? "Backs" : "Number " + n) + '</h3><p>' + t + '</p>';
    }
    row.addEventListener("click", function(e){ var b = e.target.closest("[data-n]"); if (b) pick(+b.getAttribute("data-n")); });
    svg.addEventListener("click", function(e){ var g = e.target.closest("[data-n]"); if (g && +g.getAttribute("data-n")) pick(+g.getAttribute("data-n")); });
    var hl = parseInt(Phins.param("highlight"), 10);
    if (hl >= 1 && hl <= 15) pick(hl); else info.innerHTML = "<p>👆 Pick your number to see where you usually are.</p>";
  }).catch(function(){ Phins.loadFail(info, "shape.json"); });
};

/* HOT and FLASH pod call diagrams (redrawn from the forwards' slides). kind = "hot" or "flash". */
window.PhinsPodCall = function(kind){
  "use strict";
  function c(x, y, label, cls, r){ return '<g class="' + cls + '"><circle cx="' + x + '" cy="' + y + '" r="' + (r || 15) + '"/><text x="' + x + '" y="' + (y + (label.length > 2 ? 3.5 : 5)) + '" text-anchor="middle" font-size="' + (label.length > 2 ? 9.5 : 13) + '">' + label + '</text></g>'; }
  function run(d, cls){ return '<path d="' + d + '" class="' + (cls || "run") + '" marker-end="url(#pc-ah-' + kind + ')"/>'; }
  var h = '<svg class="podcall" viewBox="0 0 300 250" role="img" aria-label="' + (kind === "hot" ? "HOT" : "FLASH") + ' pod call diagram">' +
    '<defs><marker id="pc-ah-' + kind + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>' +
    '<rect x="0" y="0" width="300" height="250" rx="12" class="pcfield"/>';
  [109,135,166,213].forEach(function(x){ h += c(x, 20, "D", "pcd", 11); });
  h += '<polygon points="82,30 58,72 106,72" class="pcruck"/><text x="82" y="64" text-anchor="middle" font-size="10" class="pcrt">Ruck</text>';
  // the banana run we DON'T want
  h += '<path d="M72 184 C 95 250, 215 262, 252 196" class="pcno"/><text x="262" y="214" class="pcnot">NO!</text>';
  // runs
  h += run("M92 132 L160 74");                               // lazy
  h += kind === "hot" ? run("M176 168 L175 60 L183 36") : run("M176 168 L174 52"); // lead
  h += run("M214 196 L190 76");                              // plus
  h += run("M50 160 L258 84", "run next");                   // next pod sets up
  if (kind === "flash") h += '<path d="M90 104 L166 214" class="channel" marker-end="url(#pc-ah-' + kind + ')"/><text x="102" y="178" class="pcch" transform="rotate(56 102 178)">sacred channel</text>';
  h += '<ellipse cx="172" cy="112" rx="13" ry="8" transform="rotate(25 172 112)" class="pcball"/>';
  h += c(82, 92, "9", "pcs") + c(82, 142, "Lazy", "pcp") + c(176, 183, "Lead", "pcp") + c(216, 211, "Plus", "pcp") + c(176, 232, "10", "pcs", 13);
  h += c(26, 140, "F", "pcf", 10) + c(16, 162, "F", "pcf", 10) + c(40, 162, "F", "pcf", 10);
  return h + '</svg>';
};
