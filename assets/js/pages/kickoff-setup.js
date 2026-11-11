/* Kickoff Setup: whole field with the four kick zones (tap one) and the chase line on halfway. */
Phins.ready(function(){
  var E = Phins.esc, svg = document.getElementById("kofield"), info = document.getElementById("kozinfo"), row = document.getElementById("kozrow"), chase = document.getElementById("kochase");
  Phins.load("playbook").then(function(pb){
    var K = pb.kickoff, k = 3.6, X0 = 24, Y0 = 18, W = 70*k;
    function y(m){ return Y0 + m*k; }   // meters from the top (their) dead ball line
    function x(m){ return X0 + m*k; }
    var h = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + W + '" height="' + (120*k) + '" fill="var(--green-soft)" stroke="var(--line)" stroke-width="2"/>';
    // zones in their half: short = 10m to 25m past halfway, long = 30m to 50m past halfway
    var Z = {short:[35,50], long:[10,30]};
    K.zones.forEach(function(z){
      var r = Z[z.len], left = z.side === "left";
      h += '<rect class="kz" data-z="' + z.n + '" x="' + (left ? x(1) : x(35.5)) + '" y="' + y(r[0]) + '" width="' + (33.5*k) + '" height="' + ((r[1]-r[0])*k) + '" rx="8" fill="' + (z.len === "short" ? "#f2c200" : "#2fb36b") + '" tabindex="0" role="button" aria-label="Kick ' + z.n + ': ' + E(z.text) + '"/>' +
        '<text class="kzn" x="' + (left ? x(17.75) : x(52.25)) + '" y="' + (y((r[0]+r[1])/2) + 9) + '" text-anchor="middle">' + z.n + '</text>';
    });
    [[10,"THEIR TRY LINE",0],[32,"THEIR 22",1],[50,"10m",1],[60,"HALFWAY",0],[88,"OUR 22",1],[110,"OUR TRY LINE",0]].forEach(function(l){
      h += '<line x1="' + X0 + '" x2="' + (X0+W) + '" y1="' + y(l[0]) + '" y2="' + y(l[0]) + '" stroke="var(--ink)" stroke-width="' + (l[2] ? 1.2 : 2.2) + '"' + (l[2] ? ' stroke-dasharray="6 5"' : '') + '/>' +
        '<text x="' + (X0 + W - 4) + '" y="' + (y(l[0]) - 4) + '" text-anchor="end" class="lab">' + l[1] + '</text>';
    });
    h += '<text x="' + x(35) + '" y="' + y(4) + '" text-anchor="middle" class="lab">THEM</text><text x="' + x(35) + '" y="' + y(117) + '" text-anchor="middle" class="lab">US</text>';
    // chase line on halfway: a mix of forwards and backs each side, wings on the sidelines, pinch-in forward by the kicker
    var line = [["W",3],["F",11],["B",18],["F",25],["P",31],["K",35],["F",42],["B",49],["F",56],["B",62],["W",67]];
    line.forEach(function(p){ h += '<g class="kp ' + p[0] + '"><circle cx="' + x(p[1]) + '" cy="' + (y(60) + 14) + '" r="9"/><text x="' + x(p[1]) + '" y="' + (y(60) + 17.5) + '">' + p[0] + '</text></g>'; });
    svg.innerHTML = h;
    row.innerHTML = K.zones.map(function(z){ return '<button type="button" data-z="' + z.n + '" aria-pressed="false">' + z.n + ': ' + E(z.len) + ' ' + E(z.side) + '</button>'; }).join("");
    function pick(n){
      var z = K.zones.filter(function(q){ return q.n === n; })[0];
      var rs = svg.querySelectorAll(".kz"); for (var i = 0; i < rs.length; i++) rs[i].classList.toggle("on", +rs[i].getAttribute("data-z") === n);
      var bs = row.querySelectorAll("button"); for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", +bs[j].getAttribute("data-z") === n ? "true" : "false");
      info.innerHTML = '<h3><span class="num">' + n + '</span>' + E(z.len.charAt(0).toUpperCase() + z.len.slice(1)) + ' ' + E(z.side) + '</h3><p>' + Phins.rich(z.text) + '</p>';
    }
    function hit(e){ var t = e.target.closest("[data-z]"); if (t) pick(+t.getAttribute("data-z")); }
    svg.addEventListener("click", hit); row.addEventListener("click", hit);
    svg.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); hit(e); } });
    info.innerHTML = "<p>Tap a zone or a number. Odd numbers go left, even numbers go right.</p>";
    chase.innerHTML = K.chase.filter(function(c){ return c.k !== "B"; }).map(function(c){ return '<article class="dcard"><h3 class="term"><span class="kchip ' + c.k + '">' + c.k + '</span>' + E(c.name) + '</h3><p class="def">' + Phins.rich(c.text) + '</p></article>'; }).join("");
  }).catch(function(){ Phins.loadFail(info, "playbook.json"); });
});

/* First phases after receiving a kickoff: 4 moving diagrams, one per landing spot.
   Whoever is closest catches; they go in with their two ruckers; a pod forms in front of the 10 and takes it into contact. */
Phins.ready(function(){
  var box = document.getElementById("kophases"), tabs = document.getElementById("kotabs");
  if (!box) return;
  var F = {1:[160,100],2:[200,100],3:[240,100],4:[180,138],5:[220,138],8:[200,168],6:[50,118],7:[350,118],9:[200,204],10:[262,214],15:[200,240]};
  var LAND = {sl:{name:"Short left", at:[112,116]}, sr:{name:"Short right", at:[288,116]}, ll:{name:"Long left", at:[110,232]}, lr:{name:"Long right", at:[290,232]}};
  var FWD = [1,2,3,4,5,6,7,8];
  function d2(a, b){ var dx = a[0]-b[0], dy = a[1]-b[1]; return dx*dx + dy*dy; }
  function build(key){
    var L = LAND[key].at, left = L[0] < 200, actors = {}, roles = {}, set = {}, them = {};
    Object.keys(F).forEach(function(n){ actors["p" + n] = {label:String(n), name:"Number " + n, kind:(n == 9 || n == 10 || n == 15) ? "back" : "lift"}; set["p" + n] = F[n]; });
    for (var t = 0; t < 6; t++){ actors["t" + t] = {kind:"them"}; set["t" + t] = [60 + t*56, 16]; }
    actors.ball = {kind:"ball"}; set.ball = [200, 10];
    actors = Object.assign({ruck:{kind:"ruck"}}, actors);
    actors.ruck = {kind:"ruck"}; set.ruck = [L[0], L[1] - (L[1] > 180 ? 56 : 24), 0];
    // catcher = closest of all but 9 and 10; ruckers = next two closest forwards
    var pool = Object.keys(F).map(Number).filter(function(n){ return n !== 9 && n !== 10; }).sort(function(a, b){ return d2(F[a], L) - d2(F[b], L); });
    var catcher = pool[0], ruckers = FWD.filter(function(n){ return n !== catcher; }).sort(function(a, b){ return d2(F[a], L) - d2(F[b], L); }).slice(0, 2);
    var C = [L[0], L[1] - (L[1] > 180 ? 56 : 24)];
    // the pod: the flanker on that side if free, plus the next closest free forwards
    var used = [catcher].concat(ruckers), flank = left ? 6 : 7;
    var podPool = FWD.filter(function(n){ return used.indexOf(n) < 0; }).sort(function(a, b){ return d2(F[a], C) - d2(F[b], C); });
    var pod = (used.indexOf(flank) < 0 ? [flank] : []).concat(podPool.filter(function(n){ return n !== flank; })).slice(0, 3);
    var dir = left ? 1 : -1;                 // pod builds toward the middle of the field
    var LZ = [C[0], C[1] + 40], LD = [C[0] + dir*72, C[1] + 22], PL = [C[0] + dir*112, C[1] + 34], TEN = [C[0] + dir*72, C[1] + 64];
    var podSpots = [LZ, LD, PL], podNames = [["Lazy","pod"],["Lead","pod"],["Plus","pod"]];
    roles["p" + catcher] = "Closest to the ball, so you catch it and go in.";
    ruckers.forEach(function(n){ roles["p" + n] = "One of the two ruckers. Before kickoff, confirm with the catcher that you'll ruck for them."; });
    var s2 = {}; s2["p" + catcher] = L; s2.ball = [L[0], L[1] - 8];
    var s3 = {ruck:[C[0], C[1], 1]}; s3["p" + catcher] = [C[0], C[1] - 6]; s3.ball = [C[0] - 10, C[1] + 8];
    s3["p" + ruckers[0]] = [C[0] - 14, C[1] + 14]; s3["p" + ruckers[1]] = [C[0] + 14, C[1] + 14];
    for (var t2 = 0; t2 < 6; t2++) s3["t" + t2] = [C[0] - 40 + t2*16 + (t2 > 2 ? 30 : 0) - 20, C[1] - 26];
    var s4 = {p9:[C[0], C[1] + 20], p10:TEN, ball:[C[0] + 8, C[1] + 22]}, rel = {};
    pod.forEach(function(n, i){ s4["p" + n] = podSpots[i]; rel["p" + n] = podNames[i]; roles["p" + n] = "In the pod as the " + podNames[i][0].toLowerCase() + (n === flank ? ". Flankers very often sub into these pods." : "."); });
    var leadN = pod[1], s5 = {}; s5.ball = [LD[0], LD[1] - 12];
    s5["p" + leadN] = [LD[0], LD[1] - 4];
    var s6 = {}; s6["p" + leadN] = [LD[0], LD[1] - 56]; s6.ball = [LD[0], LD[1] - 66]; s6["p" + pod[2]] = [PL[0] - dir*12, PL[1] - 42]; s6["p" + pod[0]] = [LZ[0] + dir*30, LZ[1] - 40];
    roles.p9 = "Gets behind the ruck and passes to the lead."; roles.p10 = "Stands right behind the lead.";
    return {title:LAND[key].name, bg:"kickrecv", viewBox:"0 0 400 300", actors:actors, roles:roles, steps:[
      {name:"Their kick", text:"They kick off. We're set in our exploded scrum.", pos:set},
      {name:"Catch", text:"The kick lands " + LAND[key].name.toLowerCase() + ". **Whoever is closest catches it.**", pos:s2},
      {name:"First one in", text:"The catcher takes it into contact, and their **two ruckers** are right there. Before every kickoff, confirm with two people that they'll be your ruckers.", pos:s3},
      {name:"Pod forms", text:"A pod forms like always: lazy behind the ruck, lead in front of the 10, plus on the far side. **It's very likely a flanker subs into one of these pods.**", pos:s4, relabel:rel},
      {name:"Pass", text:"The 9 passes to the lead.", pos:s5},
      {name:"Into contact", text:"The pod takes it into contact. On to the next phase!", pos:s6}]};
  }
  var cur = "sl";
  tabs.innerHTML = Object.keys(LAND).map(function(k){ return '<button type="button" role="tab" data-k="' + k + '">' + LAND[k].name + '</button>'; }).join("");
  function show(){
    var bs = tabs.querySelectorAll("[data-k]"); for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-selected", bs[i].getAttribute("data-k") === cur ? "true" : "false");
    PhinsPlay(box, build(cur));
  }
  tabs.addEventListener("click", function(e){ var b = e.target.closest("[data-k]"); if (b){ cur = b.getAttribute("data-k"); show(); } });
  show();
});
