/* Meet the Positions: tap a number on the team diagram to open its card. ?n=3 opens a card directly. */
Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich;
  var XY = {1:[130,52],2:[180,52],3:[230,52],4:[155,98],5:[205,98],6:[103,104],7:[257,104],8:[180,144],
            9:[208,186],10:[160,224],12:[120,258],13:[80,292],11:[36,334],14:[324,304],15:[180,392]};
  var WHERE = {scrum:["scrum","📍 Where am I in the scrum?"], lineout:["lineout","📍 Where am I in a lineout?"], openplay:["openplay","📍 Where am I in open play?"]};
  var svg = document.getElementById("teamsvg"), card = document.getElementById("poscard"), banner = document.getElementById("banner");
  var segBtns = document.querySelectorAll("[data-group]");
  var data, byNum = {}, group = "forwards", active = 0;

  Phins.load("positions").then(function(d){
    data = d;
    d.positions.forEach(function(p){ p.numbers.forEach(function(n){ byNum[n] = p; }); });
    var h = '<line x1="10" y1="22" x2="350" y2="22" class="fieldline" stroke-dasharray="6 6"/><text x="180" y="15" text-anchor="middle" font-size="12" fill="var(--muted)">attacking this way ↑</text>';
    for (var n = 1; n <= 15; n++){
      var p = byNum[n], xy = XY[n];
      h += '<g class="pl' + (p.group === "backs" ? " back" : "") + '" data-n="' + n + '" tabindex="0" role="button" aria-label="' + n + ', ' + E(p.name) + '">' +
        '<circle class="body" cx="' + xy[0] + '" cy="' + xy[1] + '" r="21"/><text x="' + xy[0] + '" y="' + (xy[1] + 7) + '" text-anchor="middle" font-size="20">' + n + '</text></g>';
    }
    svg.innerHTML = h;
    svg.addEventListener("click", function(e){ var g = e.target.closest(".pl"); if (g) pick(+g.getAttribute("data-n"), true); });
    svg.addEventListener("keydown", function(e){ if ((e.key === "Enter" || e.key === " ") && e.target.closest(".pl")){ e.preventDefault(); pick(+e.target.closest(".pl").getAttribute("data-n"), true); } });
    var start = parseInt(Phins.param("n") || Phins.param("highlight"), 10);
    setGroup(byNum[start] ? byNum[start].group : "forwards");
    if (byNum[start]) pick(start, false);
  }).catch(function(){ Phins.loadFail(card, "positions.json"); });

  for (var i = 0; i < segBtns.length; i++) segBtns[i].addEventListener("click", function(){ setGroup(this.getAttribute("data-group")); active = 0; paint(); card.innerHTML = hint(); });

  function hint(){ return '<div class="infopanel"><p>👆 Tap a number to see that position\'s card.</p></div>'; }
  function setGroup(g){
    group = g;
    for (var i = 0; i < segBtns.length; i++) segBtns[i].setAttribute("aria-pressed", segBtns[i].getAttribute("data-group") === g ? "true" : "false");
    banner.innerHTML = '<span class="ic" aria-hidden="true">' + (g === "forwards" ? "🏷️" : "🔜") + '</span><div>' + R(g === "forwards" ? data.forwardsBanner : data.backsBanner) + '</div>';
    paint();
    if (!active) card.innerHTML = hint();
  }
  function paint(){
    var gs = svg.querySelectorAll(".pl");
    for (var i = 0; i < gs.length; i++){
      var n = +gs[i].getAttribute("data-n"), p = byNum[n];
      gs[i].classList.toggle("on", n === active);
      gs[i].classList.toggle("dim", p.group !== group);
      gs[i].setAttribute("aria-pressed", n === active ? "true" : "false");
    }
  }
  function pick(n, scroll){
    var p = byNum[n]; active = n;
    if (p.group !== group) setGroup(p.group); else paint();
    try{ history.replaceState(null, "", "?n=" + n); }catch(e){}
    var h = '<article class="poscard dcard" aria-live="polite">' +
      '<div class="bignums">' + p.numbers.map(function(x){ return '<span' + (x === n ? ' class="me"' : '') + '>' + x + '</span>'; }).join('<i>&amp;</i>') + '</div>' +
      '<h2>' + E(p.name) + '</h2>';
    if (p.placeholder){
      h += '<div class="todo">[HANNAH TO PROVIDE] Card content for the ' + E(p.name) + ' comes later.</div>';
    } else {
      h += '<h3 class="lbl">Your job</h3><p>' + R(p.job) + '</p>';
      if (p.subroles) h += '<div class="subroles">' + p.subroles.map(function(s){ return '<div><b>' + E(s.label) + ':</b> ' + R(s.text) + '</div>'; }).join("") + '</div>';
      h += '<h3 class="lbl">You\'re involved in</h3><div class="chips">' + p.tags.map(function(t){ return '<span class="tag">' + E(t) + '</span>'; }).join("") + '</div>';
    }
    if (p.where && p.where.length){
      h += '<h3 class="lbl">Where am I?</h3><div class="btnrow">' + p.where.map(function(w){ return '<a class="btn small ghost" href="' + WHERE[w][0] + '.html?highlight=' + n + '">' + WHERE[w][1] + '</a>'; }).join("") + '</div>';
    }
    if (p.more){
      h += '<details class="more"><summary>Learn More 🤓</summary><div class="body"><h3>' + E(p.more.title) + '</h3><ul>' + p.more.points.map(function(x){ return '<li>' + R(x) + '</li>'; }).join("") + '</ul></div></details>';
    }
    card.innerHTML = h + '</article>';
    if (scroll && window.innerWidth < 900) card.scrollIntoView({behavior: Phins.reduced ? "auto" : "smooth", block: "start"});
  }
});
