/* Renders the Phins Playbook call pages from data/playbook.json. Each page has one container. */
Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich;
  // Lineout call diagram: touch line, dashed 5m line, hooker (H) in touch, their line (dark), our lifters (L) and jumper (J).
  function loDiagram(c){
    var h = '<svg class="lodia" viewBox="0 0 272 150" role="img" aria-label="Lineout ' + E(c.letter) + ' diagram">' +
      '<line x1="27" y1="8" x2="27" y2="142" stroke="var(--ink)" stroke-width="2"/><line x1="82" y1="8" x2="82" y2="142" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      '<text x="27" y="146" font-size="8" text-anchor="middle">touch</text><text x="82" y="146" font-size="8" text-anchor="middle">5m</text>';
    [[60,40],[95,62],[130,62],[165,62],[228,62]].forEach(function(o){ h += '<circle class="lo-o" cx="' + o[0] + '" cy="' + o[1] + '" r="10"/>'; });
    h += '<g class="lo-h"><circle cx="15" cy="84" r="11"/><text x="15" y="88" font-size="11" text-anchor="middle">H</text></g>';
    (c.arrows || []).forEach(function(a){ h += '<line x1="' + a[0] + '" y1="' + a[2] + '" x2="' + a[1] + '" y2="' + a[2] + '" stroke="var(--pink)" stroke-width="2.5" marker-end="url(#lo-ah)"/>'; });
    (c.players || []).forEach(function(p){ h += '<g class="' + (p.t === "J" ? "lo-j" : "lo-l") + '"><circle cx="' + p.x + '" cy="104" r="13"/><text x="' + p.x + '" y="108.5" font-size="12" text-anchor="middle">' + E(p.t) + '</text></g>'; });
    return h + '<defs><marker id="lo-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--pink)"/></marker></defs></svg>';
  }
  Phins.load("playbook").then(function(d){
    var el;
    if ((el = document.getElementById("lineoutcalls"))) el.innerHTML = d.lineoutCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term"><span class="bigletter">' + E(c.letter) + '</span>' + E(c.pod) +
        (c.tbd ? ' <span class="tag todo">to be confirmed</span>' : '') + '</h3>' + loDiagram(c) +
        '<p>' + R(c.how) + '</p>' + (c.example ? '<p><b>Example call:</b> ' + E(c.example) + '</p>' : '') + '</article>';
    }).join("");
    if ((el = document.getElementById("scrumcalls"))) el.innerHTML = d.scrumCalls.map(function(c){
      return '<article class="dcard is-phins"><h3 class="term">🤝 ' + R(c.name) + '</h3><p><b>Means:</b> ' + R(c.means) + '</p><p><b>Who does what:</b> ' + R(c.who) + '</p></article>';
    }).join("");
    if ((el = document.getElementById("maulcalls"))) el.innerHTML = d.maulCalls.map(function(c){
      return '<article class="dcard is-phins"><span class="tag' + (c.side === "Defense" ? " pink" : "") + '">' + E(c.side || "") + '</span><h3 class="term"><span class="ic" aria-hidden="true">' + E(c.icon || "🧱") + '</span>' + E(c.name) + '</h3>' +
        (c.points ? '<ul>' + c.points.map(function(p){ return '<li>' + R(p) + '</li>'; }).join("") + '</ul>' : '<p>' + R(c.means || "") + '</p>') +
        (c.example ? '<p><b>Example call:</b> ' + E(c.example) + '</p>' : '') + '</article>';
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
