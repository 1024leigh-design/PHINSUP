/* One phase of open play, step by step: carry, tackle, ruck, ball out, next phase. */
Phins.ready(function(){
  PhinsShape(document.getElementById("shapesvg"), document.getElementById("shaperow"), document.getElementById("shapeinfo"));

  var svg = document.getElementById("phasesvg"), cap = document.getElementById("phasecap"), pills = document.getElementById("pills");
  var ACT = {P:"P", S:"S", L:"L", N9:"9", D:"", NP:"P", NS:"S", NL:"L"};
  var STEPS = [
    {t:"Carry", c:"The point carries the ball into contact. Support and lazy are right there with them. <b>Never go alone.</b>",
      p:{P:[150,180],S:[122,206],L:[182,222],N9:[220,236],D:[150,66],NP:[292,192],NS:[268,214],NL:[318,222],ball:[164,172]}},
    {t:"Tackle", c:"The point is tackled and goes to ground, then places the ball back toward our team.",
      p:{P:[150,104],S:[134,150],L:[178,182],N9:[200,204],D:[150,82],NP:[292,192],NS:[268,214],NL:[318,222],ball:[150,128]}, down:true},
    {t:"Ruck", c:"Support gets there first and drives over the ball. Lazy arrives to help. The 9 gets behind the ruck. <b>Never let someone go alone.</b>",
      p:{P:[150,104],S:[150,134],L:[176,146],N9:[150,170],D:[150,84],NP:[292,192],NS:[268,214],NL:[318,222],ball:[150,120]}, down:true},
    {t:"Ball out", c:"The 9 plays the ball out to the next pod. Shout \"Ball's out!\"",
      p:{P:[150,104],S:[150,134],L:[176,146],N9:[154,168],D:[150,84],NP:[292,178],NS:[268,204],NL:[318,212],ball:[280,172]}, down:true},
    {t:"Next phase", c:"The next pod carries and the cycle starts again. Everyone else gets back up and heads to the next ruck.",
      p:{P:[172,150],S:[196,170],L:[226,184],N9:[242,198],D:[156,96],NP:[292,112],NS:[268,140],NL:[318,150],ball:[304,104]}}
  ];
  var h = '<line x1="10" y1="40" x2="390" y2="40" class="fieldline" stroke-dasharray="6 6"/><text x="200" y="30" text-anchor="middle" class="lab">THEIR DEFENSE ↑</text>';
  [70,230,310,370].forEach(function(x){ h += '<g class="ghost" aria-hidden="true"><circle class="body" cx="' + x + '" cy="66" r="14"/></g>'; });
  Object.keys(ACT).forEach(function(k){
    var cls = k === "D" ? "ghost def" : (k.charAt(0) === "N" && k !== "N9" ? "pl next" : "pl");
    h += '<g class="actor ' + cls + '" id="a-' + k + '"><circle class="body" cx="0" cy="0" r="15"/><text x="0" y="6" text-anchor="middle" font-size="16">' + ACT[k] + '</text></g>';
  });
  h += '<g class="actor" id="a-ball"><ellipse cx="0" cy="0" rx="9" ry="6" fill="var(--yellow)" stroke="#7a6100" stroke-width="2"/></g>';
  svg.insertAdjacentHTML("beforeend", h);
  pills.innerHTML = STEPS.map(function(s, i){ return '<button type="button" data-i="' + i + '" aria-pressed="false">' + (i+1) + '. ' + s.t + '</button>'; }).join("");
  var cur = 0, timer = null;
  function go(i){
    cur = i; var s = STEPS[i];
    Object.keys(s.p).forEach(function(k){ var el = document.getElementById("a-" + k); el.style.transform = "translate(" + s.p[k][0] + "px," + s.p[k][1] + "px)"; });
    document.getElementById("a-P").classList.toggle("down", !!s.down);
    cap.innerHTML = '<b>' + (i+1) + '. ' + s.t + ':</b> ' + s.c;
    var bs = pills.querySelectorAll("button"); for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", j === i ? "true" : "false");
  }
  function stop(){ if (timer){ clearInterval(timer); timer = null; } document.getElementById("p-play").textContent = "▶ Play"; }
  pills.addEventListener("click", function(e){ var b = e.target.closest("[data-i]"); if (b){ stop(); go(+b.getAttribute("data-i")); } });
  document.getElementById("p-next").addEventListener("click", function(){ stop(); go((cur + 1) % STEPS.length); });
  document.getElementById("p-play").addEventListener("click", function(){
    if (timer){ stop(); return; }
    this.textContent = "⏸ Pause"; go(0);
    timer = setInterval(function(){ if (cur >= STEPS.length - 1) stop(); else go(cur + 1); }, 2600);
  });
  go(0);
});
