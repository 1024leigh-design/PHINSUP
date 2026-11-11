/* Zones pitch. Zone boundaries come from data/playbook.json (from/to in meters from our try line, 0 to 100). */
Phins.ready(function(){
  var svg = document.getElementById("zsvg"), info = document.getElementById("zinfo"), row = document.getElementById("zrow"), note = document.getElementById("znote");
  Phins.load("playbook").then(function(d){
    var Z = d.zones, k = 3.6, X0 = 16, Y0 = 16, W = 70*k, tbd = false;
    note.innerHTML = Phins.rich(Z.note);
    var h = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (120*k) + '" height="' + W + '" fill="var(--surface-2)"/>';
    Z.list.forEach(function(z, i){
      var from = z.from, to = z.to;
      if (from == null || to == null){ tbd = true; from = i * 100/3; to = (i+1) * 100/3; }
      h += '<rect class="zrect" data-id="' + z.id + '" x="' + (X0 + (10+from)*k) + '" y="' + Y0 + '" width="' + ((to-from)*k) + '" height="' + W + '" fill="' + z.color + '" tabindex="0" role="button" aria-label="' + Phins.esc(z.name) + '"/>' +
        '<text x="' + (X0 + (10+(from+to)/2)*k) + '" y="' + (Y0 + W/2 + 6) + '" text-anchor="middle" class="zlab">' + Phins.esc(z.name.toUpperCase()) + '</text>';
    });
    [10,110].forEach(function(m){ h += '<line x1="' + (X0+m*k) + '" y1="' + Y0 + '" x2="' + (X0+m*k) + '" y2="' + (Y0+W) + '" stroke="#fff" stroke-width="3"/>'; });
    h += '<text x="' + (X0 + 5*k) + '" y="' + (Y0 + W/2) + '" text-anchor="middle" class="zlab small" transform="rotate(-90 ' + (X0+5*k) + ' ' + (Y0+W/2) + ')">OUR IN-GOAL</text>';
    h += '<text x="' + (X0 + 115*k) + '" y="' + (Y0 + W/2) + '" text-anchor="middle" class="zlab small" transform="rotate(90 ' + (X0+115*k) + ' ' + (Y0+W/2) + ')">THEIR IN-GOAL</text>';
    svg.setAttribute("viewBox", "0 0 " + (120*k + 2*X0) + " " + (W + 2*Y0));
    svg.innerHTML = h;
    if (tbd) document.getElementById("ztbd").hidden = false;
    row.innerHTML = Z.list.map(function(z){ return '<button type="button" data-id="' + z.id + '" aria-pressed="false" style="padding:0 14px">' + Phins.esc(z.name) + '</button>'; }).join("");
    function pick(id){
      var z = Z.list.filter(function(x){ return x.id === id; })[0];
      var rs = svg.querySelectorAll(".zrect"); for (var i = 0; i < rs.length; i++) rs[i].classList.toggle("on", rs[i].getAttribute("data-id") === id);
      var bs = row.querySelectorAll("button"); for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", bs[j].getAttribute("data-id") === id ? "true" : "false");
      info.innerHTML = '<h3>' + Phins.esc(z.name) + '</h3><p><b>Where:</b> ' + Phins.rich(z.where) + '</p><p><b>What changes:</b> ' + Phins.rich(z.changes) + '</p>';
    }
    function hit(e){ var t = e.target.closest("[data-id]"); if (t) pick(t.getAttribute("data-id")); }
    svg.addEventListener("click", hit); row.addEventListener("click", hit);
    svg.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); hit(e); } });
    info.innerHTML = "<p>Tap a zone.</p>";
  }).catch(function(){ Phins.loadFail(info, "playbook.json"); });
});
