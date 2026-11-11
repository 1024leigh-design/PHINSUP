/* Lineout side view, Phins setup: front lifter, two lifter/jumpers, back lifter, back pod. Tap a spot or a number. ?highlight=N works. */
Phins.ready(function(){
  var E = Phins.esc, svg = document.getElementById("losvg"), info = document.getElementById("loinfo"), row = document.getElementById("lorow");
  Phins.load("lineout").then(function(d){
    var GROUND = 222, h = "";
    h += '<line x1="0" y1="' + GROUND + '" x2="560" y2="' + GROUND + '" class="fieldline"/>';
    [[52,"touch"],[100,"5m"],[536,"15m"]].forEach(function(m){ h += '<line x1="' + m[0] + '" y1="' + (GROUND-6) + '" x2="' + m[0] + '" y2="' + (GROUND+10) + '" stroke="var(--muted)" stroke-width="3"/><text x="' + m[0] + '" y="' + (GROUND+24) + '" text-anchor="middle" class="lab">' + m[1] + '</text>'; });
    function person(key, x, label, cls){
      var top = GROUND - 70;
      return '<g class="pl ' + (cls || "") + '" data-k="' + key + '" tabindex="0" role="button" aria-label="' + E(label) + '">' +
        '<rect class="body" x="' + (x-19) + '" y="' + top + '" width="38" height="66" rx="14"/>' +
        '<circle class="head" cx="' + x + '" cy="' + (top-13) + '" r="11"/>' +
        '<text x="' + x + '" y="' + (top+40) + '" text-anchor="middle" font-size="' + (label.length > 2 ? 13 : 16) + '">' + E(label) + '</text></g>';
    }
    // their line, behind ours
    for (var i = 0; i < 7; i++){ var tx = 140 + i*50 + (i > 3 ? 30 : 0) + 18; h += '<g class="them" aria-hidden="true"><rect x="' + (tx-15) + '" y="' + (GROUND-80) + '" width="30" height="60" rx="12"/><circle cx="' + tx + '" cy="' + (GROUND-93) + '" r="10"/></g>'; }
    h += '<ellipse cx="46" cy="' + (GROUND-122) + '" rx="10" ry="7" fill="var(--yellow)" stroke="#7a6100" stroke-width="2"/>';
    h += person("hooker", 30, "2", "hook");
    d.slots.forEach(function(s, i){ h += person(s.k, 140 + i*50 + (i > 3 ? 30 : 0), s.label, i > 3 ? "podp" : ""); });
    h += '<text x="235" y="' + (GROUND+40) + '" text-anchor="middle" class="lab">LIFTERS + JUMPERS</text><text x="420" y="' + (GROUND+40) + '" text-anchor="middle" class="lab">BACK POD</text>';
    h += person("nine", 510, "9", "nine");
    h += '<text x="300" y="20" text-anchor="middle" class="lab">THEIR LINE (DARK) IS 1 METER AWAY</text>';
    svg.innerHTML = h;

    var nums = ""; for (var n = 1; n <= 9; n++) nums += '<button type="button" data-n="' + n + '" aria-pressed="false">' + n + '</button>';
    row.innerHTML = nums + '<button type="button" data-n="10" aria-pressed="false" style="min-width:auto;padding:0 10px">10 to 15</button>';
    var bySlot = {}; d.slots.forEach(function(s){ bySlot[s.k] = s; });

    function light(keys, n){
      var gs = svg.querySelectorAll(".pl"); for (var i = 0; i < gs.length; i++) gs[i].classList.toggle("on", keys.indexOf(gs[i].getAttribute("data-k")) >= 0);
      var bs = row.querySelectorAll("button"); for (var j = 0; j < bs.length; j++){ var b = +bs[j].getAttribute("data-n"); bs[j].setAttribute("aria-pressed", n && (b === n || (n >= 10 && b === 10)) ? "true" : "false"); }
    }
    function show(title, txt){ info.innerHTML = '<h3>' + E(title) + '</h3><p>' + Phins.rich(txt) + '</p>'; }
    function pickNum(n){
      if (n === 2){ light(["hooker"], 2); show("Number 2: you throw", d.hooker); }
      else if (n === 9){ light(["nine"], 9); show("Number 9: receiver", d.nine); }
      else if (n >= 10){ light([], n); show("Backs", d.backs); }
      else { light(d.slots.map(function(s){ return s.k; }), n); show("Number " + n + ": any of these spots", d.anyForward); }
    }
    function pickSlot(k){
      if (k === "hooker") return pickNum(2);
      if (k === "nine") return pickNum(9);
      light([k], 0); show(bySlot[k].name, bySlot[k].text + " " + d.anyForward);
    }
    row.addEventListener("click", function(e){ var b = e.target.closest("[data-n]"); if (b) pickNum(+b.getAttribute("data-n")); });
    svg.addEventListener("click", function(e){ var g = e.target.closest("[data-k]"); if (g) pickSlot(g.getAttribute("data-k")); });
    svg.addEventListener("keydown", function(e){ var g = e.target.closest("[data-k]"); if (g && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); pickSlot(g.getAttribute("data-k")); } });
    document.getElementById("lonote").innerHTML = Phins.rich(d.note);
    var hl = parseInt(Phins.param("highlight"), 10);
    if (hl >= 1 && hl <= 15) pickNum(hl); else info.innerHTML = "<p>Tap a spot or your number.</p>";
  }).catch(function(){ Phins.loadFail(info, "lineout.json"); });
});
