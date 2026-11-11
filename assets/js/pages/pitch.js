/* Interactive pitch: tap a line or zone. Drawn roughly to scale (70m wide, 100m + two 10m in-goals). */
Phins.ready(function(){
  var svg = document.getElementById("pitchsvg"), info = document.getElementById("pinfo"), row = document.getElementById("prow");
  // Landscape: length (120m incl. in-goals) runs left to right, width (70m) top to bottom.
  var k = 3.6, X0 = 16, Y0 = 16, LEN = 120*k, W = 70*k;
  function L(m){ return X0 + m*k; }   // meters from the left dead ball line
  function T(m){ return Y0 + m*k; }   // meters from the top touch line
  var h = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + LEN + '" height="' + W + '" fill="var(--green-soft)"/>';
  [[0,10],[110,120]].forEach(function(z){ h += '<rect class="zone" data-id="ingoal" x="' + L(z[0]) + '" y="' + Y0 + '" width="' + (10*k) + '" height="' + W + '"/>'; });
  function seg(id, x1, y1, x2, y2, dash){ return '<g class="pline" data-id="' + id + '"><line class="hit" x1="' + x1 + '" x2="' + x2 + '" y1="' + y1 + '" y2="' + y2 + '"/><line class="vis" x1="' + x1 + '" x2="' + x2 + '" y1="' + y1 + '" y2="' + y2 + '"' + (dash ? ' stroke-dasharray="7 6"' : '') + '/></g>'; }
  function across(id, m, dash){ return seg(id, L(m), Y0, L(m), Y0 + W, dash); }        // lines across the field
  function along(id, w, dash){ return seg(id, L(10), T(w), L(110), T(w), dash); }       // lines parallel to touch
  h += along("fivetouch", 5, true) + along("fivetouch", 65, true);
  h += along("fifteen", 15, true) + along("fifteen", 55, true);
  h += across("dead", 0) + across("dead", 120);
  h += across("try", 10) + across("try", 110);
  h += across("five", 15, true) + across("five", 105, true);
  h += across("twentytwo", 32) + across("twentytwo", 88);
  h += across("ten", 50, true) + across("ten", 70, true);
  h += across("half", 60);
  h += seg("touch", X0, Y0, X0 + LEN, Y0) + seg("touch", X0, Y0 + W, X0 + LEN, Y0 + W);
  [10,110].forEach(function(m){ var x = L(m), d = m === 10 ? -6 : 6; h += '<g aria-hidden="true" fill="var(--ink)"><circle cx="' + x + '" cy="' + (T(35)-10) + '" r="3"/><circle cx="' + x + '" cy="' + (T(35)+10) + '" r="3"/><line x1="' + (x+d) + '" y1="' + (T(35)-10) + '" x2="' + (x+d) + '" y2="' + (T(35)+10) + '" stroke="var(--ink)" stroke-width="3"/></g>'; });
  svg.setAttribute("viewBox", "0 0 " + (LEN + 2*X0) + " " + (W + 2*Y0));
  svg.innerHTML = h;
  Phins.load("pitch").then(function(d){
    var by = {}; d.items.forEach(function(i){ by[i.id] = i; });
    row.innerHTML = d.items.map(function(i){ return '<button type="button" data-id="' + i.id + '" aria-pressed="false">' + Phins.esc(i.name) + '</button>'; }).join("");
    function pick(id){
      var els = svg.querySelectorAll("[data-id]");
      for (var i = 0; i < els.length; i++) els[i].classList.toggle("on", els[i].getAttribute("data-id") === id);
      var bs = row.querySelectorAll("button"); for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", bs[j].getAttribute("data-id") === id ? "true" : "false");
      info.innerHTML = '<h3>' + Phins.esc(by[id].name) + '</h3><p>' + Phins.rich(by[id].text) + '</p>';
    }
    function hit(e){ var t = e.target.closest("[data-id]"); if (t) pick(t.getAttribute("data-id")); }
    svg.addEventListener("click", hit); row.addEventListener("click", hit);
    info.innerHTML = "<p>👆 Tap a line on the field, or a button below.</p>";
  }).catch(function(){ Phins.loadFail(info, "pitch.json"); });
});
