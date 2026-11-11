/* Renders the Phins Playbook call pages from data/playbook.json. Each page has one container. */
Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich;
  // Lineout call as an interactive play: set, move, lift and throw.
  function loPlay(c){
    var NAMES = ["Front lifter", "Lifter / jumper", "Lifter / jumper", "Back lifter"], LAB = ["L", "L/J", "L/J", "L"];
    var actors = {h:{label:"H", name:"Hooker", kind:"hook"}, ball:{kind:"ball"}}, set = {h:[15,84], ball:[15,70]}, move = {}, rel = {}, roles = {h:"Throws straight down the middle to the jumper."}, jx = 0;
    c.players.forEach(function(p, i){
      var k = "p" + i, j = i === c.jumper;
      actors[k] = {label:LAB[i], name:NAMES[i], kind:"lift"};
      set[k] = [p.x, 104]; move[k] = [p.to != null ? p.to : p.x, 104];
      rel[k] = j ? ["J", "jump"] : ["L", "lift"];
      roles[k] = (j ? "On this call, you're the jumper. " : "On this call, you lift. ") + "Everyone starts in the same spot; the call decides who jumps and who moves.";
      if (j) jx = move[k][0];
    });
    return {title:"Lineout " + c.letter, bg:"lineout", viewBox:"0 0 285 150", actors:actors, roles:roles, steps:[
      {name:"Set", text:"We always start in the same spot: four players, equally spaced. L = lifter, L/J = lifter or jumper, H = hooker.", pos:set},
      {name:"Move", text:c.how, pos:move, relabel:rel},
      {name:"Throw", text:"The lifters lift, the jumper goes up, and the hooker throws straight down the middle to the jumper.", pos:{ball:[jx, 92]}}]};
  }

  Phins.load("playbook").then(function(d){
    var el;
    if ((el = document.getElementById("lineoutcalls"))) el.innerHTML = d.lineoutCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term"><span class="bigletter">' + E(c.letter) + '</span>' + E(c.pod) +
        (c.tbd ? ' <span class="tag tagtodo">to be confirmed</span>' : '') + '</h3>' +
        '<p>' + R(c.how) + '</p>' + (c.example ? '<p><b>Example call:</b> ' + E(c.example) + '</p>' : '') + '<div class="loplay" data-i="' + d.lineoutCalls.indexOf(c) + '"></div></article>';
    }).join("");
    if (el) el.querySelectorAll(".loplay").forEach(function(box){ PhinsPlay(box, loPlay(d.lineoutCalls[+box.getAttribute("data-i")])); });
    if ((el = document.getElementById("scrumcalls"))) el.innerHTML = d.scrumCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term">' + R(c.name) + '</h3><p>' + R(c.means) + '</p>' + (c.who ? '<p>' + R(c.who) + '</p>' : '') + '</article>';
    }).join("");
    if ((el = document.getElementById("maulcalls"))) el.innerHTML = d.maulCalls.map(function(c){
      return '<article class="dcard is-phins"><span class="tag' + (c.side === "Defense" ? " pink" : "") + '">' + E(c.side || "") + '</span><h3 class="term">' + E(c.name) + '</h3>' +
        (c.points ? '<ul>' + c.points.map(function(p){ return '<li>' + R(p) + '</li>'; }).join("") + '</ul>' : '<p>' + R(c.means || "") + '</p>') +
        (c.example ? '<p><b>Example call:</b> ' + E(c.example) + '</p>' : '') + (c.play ? '<div class="maulplay" data-play="' + E(c.play) + '"></div>' : '') + '</article>';
    }).join("");
    var mbox = el;
    if (mbox && mbox.querySelector(".maulplay")) Phins.load("plays").then(function(pl){ mbox.querySelectorAll(".maulplay").forEach(function(box){ var k = box.getAttribute("data-play"); if (pl[k]) PhinsPlay(box, pl[k]); }); });
    if ((el = document.getElementById("redzone"))) el.innerHTML = d.redZoneExit.map(function(s){ return '<li><span>' + R(s.step) + '</span></li>'; }).join("");
    if ((el = document.getElementById("kosetup"))){
      var K = d.kickoff, i = 0;
      document.getElementById("korecv").innerHTML = R(K.receiving);
      document.getElementById("kokick").innerHTML = R(K.kicking);
      var show = function(){ el.innerHTML = '<h3><span class="num">' + (i+1) + '</span>' + E(K.phases[i].name) + '</h3><p>' + R(K.phases[i].text) + '</p>'; document.getElementById("kobtn").textContent = i < K.phases.length - 1 ? "Next phase ⏭" : "Start over ↺"; };
      document.getElementById("kobtn").addEventListener("click", function(){ i = (i + 1) % K.phases.length; show(); });
      show();
    }
  }).catch(function(){ var m = document.getElementById("main"); m.insertAdjacentHTML("beforeend", '<div class="todo">Could not load playbook.json.</div>'); });
});
