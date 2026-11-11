/* Renders the Phins Playbook call pages from data/playbook.json. Each page has one container. */
Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich;
  Phins.load("playbook").then(function(d){
    var el;
    if ((el = document.getElementById("lineoutcalls"))) el.innerHTML = d.lineoutCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term">🙌 ' + R(c.name) + '</h3>' +
        '<div class="todo">Diagram goes here once the call is added (who jumps, who lifts, where the throw goes).</div>' +
        '<p><b>Jumper:</b> ' + R(c.jumper || "?") + '</p><p><b>Lifters:</b> ' + R(c.lifters || "?") + '</p><p><b>Throw:</b> ' + R(c.throw || "?") + '</p><p><b>After:</b> ' + R(c.after) + '</p></article>';
    }).join("");
    if ((el = document.getElementById("scrumcalls"))) el.innerHTML = d.scrumCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term">🤝 ' + R(c.name) + '</h3><p><b>Means:</b> ' + R(c.means) + '</p><p><b>Who does what:</b> ' + R(c.who) + '</p></article>';
    }).join("");
    if ((el = document.getElementById("maulcalls"))) el.innerHTML = d.maulCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term">🧱 ' + R(c.name) + '</h3><p>' + R(c.means) + '</p></article>';
    }).join("");
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
