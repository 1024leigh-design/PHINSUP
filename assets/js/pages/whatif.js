/* What If? Lab: filterable scenario cards. Tap a card to flip it and see the fix with a before/after diagram. */
Phins.ready(function(){
  var E = Phins.esc, R = Phins.rich, grid = document.getElementById("wgrid"), filt = document.getElementById("wfilter");
  var data, tag = "All";
  function mini(d, label){
    if (!d) return "";
    var h = '<figure class="wmini"><figcaption>' + label + '</figcaption><svg viewBox="0 0 100 60" role="img" aria-label="' + label + ' diagram">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--pink)"/></marker></defs>' +
      '<rect x="1" y="1" width="98" height="58" rx="6" fill="var(--green-soft)"/>';
    if (d.ruck) h += '<rect x="' + (d.ruck[0]-8) + '" y="' + (d.ruck[1]-5) + '" width="16" height="10" rx="3" fill="var(--yellow)" stroke="#7a6100" stroke-width=".8"/><text x="' + d.ruck[0] + '" y="' + (d.ruck[1]+2) + '" text-anchor="middle" font-size="5" font-weight="700" fill="#2b2200">ruck</text>';
    (d.arrows || []).forEach(function(a){ h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + a[2] + '" y2="' + a[3] + '" stroke="var(--pink)" stroke-width="1.4" stroke-dasharray="2.5 2" marker-end="url(#ah)"/>'; });
    (d.players || []).forEach(function(p){
      var cls = p.ghost ? "wg" : p.hl ? "wh" : "wn";
      h += '<circle cx="' + p.x + '" cy="' + p.y + '" r="5.2" class="' + cls + '"/>' +
        (p.tired ? '<text x="' + p.x + '" y="' + (p.y+2.6) + '" text-anchor="middle" font-size="7">😮‍💨</text>' : '<text x="' + p.x + '" y="' + (p.y+2) + '" text-anchor="middle" font-size="5.5" font-weight="800" class="' + cls + 't">' + E(p.t) + '</text>');
    });
    return h + '</svg></figure>';
  }
  Phins.load("whatif").then(function(d){
    data = d;
    filt.innerHTML = ["All"].concat(d.tags).map(function(t){ return '<button type="button" data-tag="' + E(t) + '" aria-pressed="' + (t === "All") + '">' + E(t) + '</button>'; }).join("");
    render();
  }).catch(function(){ Phins.loadFail(grid, "whatif.json"); });
  filt.addEventListener("click", function(e){ var b = e.target.closest("[data-tag]"); if (!b) return; tag = b.getAttribute("data-tag"); var bs = filt.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i] === b ? "true" : "false"); render(); });
  function render(){
    var list = data.scenarios.filter(function(s){ return tag === "All" || s.tags.indexOf(tag) >= 0; });
    grid.innerHTML = list.length ? list.map(function(s, i){
      if (s.placeholder) return '<div class="wcard soon"><p class="wq">' + R(s.q) + '</p><p class="def">' + R(s.fix) + '</p></div>';
      return '<div class="wcard" data-i="' + i + '"><button type="button" class="wflip" aria-expanded="false"><span class="wq">🧪 ' + R(s.q) + '</span><span class="whint">Tap to see the fix</span></button>' +
        '<div class="wback" hidden><p class="wfix">✅ ' + R(s.fix) + '</p>' +
        ((s.before || s.after) ? '<div class="wpair">' + mini(s.before, "Before") + mini(s.after, "After") + '</div><p class="wlegend">' + E(data.legend || "") + '</p>' : '') +
        '<div class="wtags">' + s.tags.map(function(t){ return '<span class="tag">' + E(t) + '</span>'; }).join("") + '</div>' +
        '<p class="wfoot">' + R(data.footer) + '</p></div></div>';
    }).join("") : '<p class="count">No scenarios with that tag yet.</p>';
  }
  grid.addEventListener("click", function(e){
    var b = e.target.closest(".wflip"); if (!b) return;
    var card = b.parentNode, back = card.querySelector(".wback"), open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", open ? "false" : "true"); back.hidden = open; card.classList.toggle("flipped", !open);
    b.querySelector(".whint").textContent = open ? "Tap to see the fix" : "Tap to hide";
  });
});
