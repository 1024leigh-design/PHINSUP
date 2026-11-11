/* Shared 1-3-3-1 diagram (Open Play page and Our Shape page). Reads data/shape.json.
   PhinsShape(svgEl, rowEl, infoEl) draws it, wires up taps, adds a "Show backs" toggle, and honors ?highlight=N. */
window.PhinsShape = function(svg, row, info){
  "use strict";
  var E = Phins.esc;
  Phins.load("shape").then(function(d){
    var A = d.podA || [], B = d.podB || [], backs = d.backs || [], showBacks = false, picked = 0;
    // Edges (sideline to the 15m line) are shaded. Flankers sit out there, in line with the backs. Pods are in the middle.
    var spots = {edgeL:[74,176], edgeR:[326,176]}, tri = [[0,-14],[-14,10],[14,10]];
    var h = '<rect x="8" y="30" width="78" height="202" class="edgezone"/><rect x="314" y="30" width="78" height="202" class="edgezone"/>' +
      '<text x="47" y="46" text-anchor="middle" class="lab">EDGE</text><text x="353" y="46" text-anchor="middle" class="lab">EDGE</text>' +
      '<line x1="8" y1="20" x2="8" y2="232" class="fieldline"/><line x1="392" y1="20" x2="392" y2="232" class="fieldline"/>' +
      '<text x="200" y="22" text-anchor="middle" class="lab">ATTACKING THIS WAY ↑</text>';
    function dot(cls, x, y, label, n){
      return '<g class="pl ' + cls + '"' + (n ? ' data-n="' + n + '"' : '') + '><circle class="body" cx="' + x + '" cy="' + y + '" r="8"/>' +
        (label !== "" ? '<text x="' + x + '" y="' + (y + 3.5) + '" text-anchor="middle" font-size="9.5">' + E(label) + '</text>' : '') + '</g>';
    }
    h += dot("edge", spots.edgeL[0], spots.edgeL[1], d.edgeLeft, d.edgeLeft) + dot("edge", spots.edgeR[0], spots.edgeR[1], d.edgeRight, d.edgeRight);
    h += '<text x="200" y="62" text-anchor="middle" class="podlab">' + E(d.podLabel || "1, 2, 3, 4, 5 and 8") + '</text>';
    [[152,"A",A],[248,"B",B]].forEach(function(p){
      h += '<rect class="podbox" data-pod="' + p[1] + '" x="' + (p[0]-30) + '" y="90" width="60" height="50" rx="16"/>';
      tri.forEach(function(t, i){ var n = p[2][i]; h += dot("inpod", p[0]+t[0], 116+t[1], n || "", n || 0); });
    });
    h += '<g class="fnums">';
    [[78,"1"],[152,"3"],[248,"3"],[322,"1"]].forEach(function(l){ h += '<text x="' + l[0] + '" y="' + (l[0] === 78 || l[0] === 322 ? 222 : 192) + '" text-anchor="middle" class="big">' + l[1] + '</text>'; });
    h += '</g>';
    h += '<g class="backs">' + backs.map(function(b){ return dot("backdot", b.x, b.y, b.n, b.n); }).join("") + '</g>';
    svg.innerHTML = h;

    // toggle + number buttons
    var tg = document.createElement("button"); tg.type = "button"; tg.className = "btn small ghost backtoggle"; tg.setAttribute("aria-pressed", "false");
    row.parentNode.insertBefore(tg, row);
    var btns = "";
    for (var n = 1; n <= 15; n++) btns += '<button type="button" data-n="' + n + '" aria-pressed="false"' + (n > 8 ? ' class="isback"' : '') + '>' + n + '</button>';
    row.innerHTML = btns;
    var note = document.createElement("p"); note.className = "backsnote"; note.innerHTML = Phins.rich(d.backsNote || ""); row.parentNode.insertBefore(note, row.nextSibling);

    function setBacks(on){
      showBacks = on;
      svg.setAttribute("viewBox", "0 0 400 236");
      svg.classList.toggle("withbacks", on);
      tg.textContent = on ? "Hide backs" : "Show backs (whole team)";
      tg.setAttribute("aria-pressed", on ? "true" : "false");
      note.hidden = !on;
      var bb = row.querySelectorAll(".isback"); for (var i = 0; i < bb.length; i++) bb[i].hidden = !on;
    }
    tg.addEventListener("click", function(){ setBacks(!showBacks); if (!showBacks && picked > 8) clear(); });

    function clear(){ picked = 0; paint(0); info.innerHTML = "<p>Pick your number to see where you usually are.</p>"; }
    function paint(n){
      var inA = A.indexOf(n) >= 0, inB = B.indexOf(n) >= 0, edge = n === d.edgeLeft || n === d.edgeRight, center = !edge && n >= 1 && n <= 8;
      var gs = svg.querySelectorAll(".pl");
      for (var i = 0; i < gs.length; i++) gs[i].classList.toggle("on", +gs[i].getAttribute("data-n") === n && n > 0);
      var pods = svg.querySelectorAll(".podbox");
      for (var j = 0; j < pods.length; j++){ var pid = pods[j].getAttribute("data-pod"); pods[j].classList.toggle("on", center && ((pid === "A" && inA) || (pid === "B" && inB) || (!inA && !inB))); }
      var bs = row.querySelectorAll("button"); for (var k = 0; k < bs.length; k++) bs[k].setAttribute("aria-pressed", +bs[k].getAttribute("data-n") === n ? "true" : "false");
      return {edge:edge, center:center, inA:inA, inB:inB};
    }
    function pick(n){
      picked = n;
      if (n > 8 && !showBacks) setBacks(true);
      var r = paint(n), t, title = "Number " + n;
      if (r.edge) t = "You're usually the <b>1</b> on an edge of our 1-3-3-1. " + Phins.rich(d.edges || "");
      else if (r.center) t = (r.inA || r.inB ? "You're usually in center pod " + (r.inA ? "A" : "B") + ". " : "You're in one of the two center pods (the <b>3s</b>). ") + "The tight five are in a center pod, and the 8 usually joins them. You carry the ball in a pod of 3.";
      else {
        var b = backs.filter(function(x){ return x.n === n; })[0];
        title = b ? n + " · " + b.name : "Backs";
        t = (b ? Phins.rich(b.where) + " " : "") + Phins.rich(d.backsNote || "");
      }
      info.innerHTML = '<h3><span class="num">' + n + '</span>' + E(title) + '</h3><p>' + t + '</p>';
    }
    row.addEventListener("click", function(e){ var b = e.target.closest("[data-n]"); if (b) pick(+b.getAttribute("data-n")); });
    svg.addEventListener("click", function(e){ var g = e.target.closest("[data-n]"); if (g && +g.getAttribute("data-n")) pick(+g.getAttribute("data-n")); });
    setBacks(false);
    var hl = parseInt(Phins.param("highlight"), 10);
    if (hl >= 1 && hl <= 15) pick(hl); else clear();
  }).catch(function(){ Phins.loadFail(info, "shape.json"); });
};
