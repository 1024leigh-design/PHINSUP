/* Phins play animator. Turns a play definition into an interactive, step-by-step diagram.
   Used for HOT / FLASH (Our Shape), TANGO / SALSA (Mauls), and the lineout calls.

   A play definition looks like:
   {
     "title": "HOT", "bg": "pod" | "maul" | "lineout", "viewBox": "0 0 300 250",
     "actors": {"lead": {"label": "Lead", "kind": "pod"}, ...},   kinds: pod, back, def, next, ball, them, jump, lift, hook
     "roles":  {"lead": "What this player does in this play"},
     "steps":  [{"name": "Set", "text": "Caption", "pos": {"lead": [176, 183], ...}, "show": ["channel"]}]
   }
   Positions carry over from the step before, so a step only lists who moves. */
(function(){
  "use strict";
  var uid = 0;
  var R = {pod:14, back:12, def:9, next:13, ball:0, them:10, jump:13, lift:13, hook:11};

  function bg(kind, id, def){
    var h = "";
    if (kind === "pod"){
      h += '<rect x="0" y="0" width="300" height="250" rx="12" class="pcfield"/>' +
        '<polygon points="82,30 58,72 106,72" class="pcruck"/><text x="82" y="64" text-anchor="middle" font-size="10" class="pcrt">Ruck</text>' +
        (def.banana === false ? '' : '<path d="M72 184 C 95 250, 215 262, 252 196" class="pcno"/><text x="262" y="214" class="pcnot">NO!</text>') +
        '<g class="guides">' + (def.lazyRun === false ? '' : '<path d="M92 132 L160 74"/>') + '<path d="M176 168 L176 40"/><path d="M214 196 L190 76"/>' + (def.banana === false ? '' : '<path d="M50 160 L258 84" class="next"/>') + '</g>';
      if (def.channel) h += '<g data-ov="channel" class="ov"><path d="M90 104 L166 200" class="channel" marker-end="url(#ah' + id + ')"/><text x="98" y="170" class="pcch" transform="rotate(60 98 170)">sacred channel</text></g>';
    } else if (kind === "phase"){
      h += '<rect x="0" y="0" width="400" height="260" rx="12" class="pcfield"/>' +
        '<line x1="10" y1="34" x2="390" y2="34" class="tline dash"/><text x="200" y="24" text-anchor="middle" class="tlab">THEIR DEFENSE ↑</text>';
    } else if (kind === "maul"){
      h += '<rect x="0" y="0" width="300" height="200" rx="12" class="pcfield"/>' +
        '<line x1="20" y1="6" x2="20" y2="194" class="tline"/><line x1="55" y1="6" x2="55" y2="194" class="tline dash"/>' +
        '<text x="20" y="198" class="tlab" text-anchor="middle">touch</text><text x="55" y="198" class="tlab" text-anchor="middle">5m</text>' +
        '<text x="292" y="14" class="tlab" text-anchor="end">THEM ↓  US ↑</text>';
    } else if (kind === "lineout"){
      h += '<rect x="0" y="0" width="285" height="150" rx="12" class="pcfield"/>' +
        '<line x1="27" y1="8" x2="27" y2="142" class="tline"/><line x1="82" y1="8" x2="82" y2="142" class="tline dash"/>' +
        '<text x="27" y="147" class="tlab" text-anchor="middle">touch</text><text x="82" y="147" class="tlab" text-anchor="middle">5m</text>';
      [[60,40],[95,58],[130,58],[165,58],[228,58]].forEach(function(o){ h += '<circle class="lo-o" cx="' + o[0] + '" cy="' + o[1] + '" r="10"/>'; });
    }
    return h;
  }

  function actorSvg(key, a){
    if (a.kind === "ruck") return '<g class="actor k-ruck" data-a="' + key + '" aria-hidden="true"><rect x="-26" y="-13" width="52" height="26" rx="9"/><text x="0" y="4" text-anchor="middle" font-size="11">Ruck</text></g>';
    if (a.kind === "ball") return '<g class="actor ball" data-a="' + key + '"><ellipse cx="0" cy="0" rx="8" ry="5.5"/></g>';
    var r = a.r || R[a.kind] || 13, lab = a.label || "", long = lab.length > 2;
    return '<g class="actor k-' + a.kind + '" data-a="' + key + '"' + (a.kind === "them" || a.kind === "def" ? ' aria-hidden="true"' : ' tabindex="0" role="button" aria-label="' + Phins.esc(lab) + '"') + '>' +
      '<circle cx="0" cy="0" r="' + r + '"/>' + (lab ? '<text x="0" y="' + (long ? 2.6 : 4) + '" text-anchor="middle" font-size="' + (long ? 7 : 11) + '">' + Phins.esc(lab) + '</text>' : '') + '</g>';
  }

  window.PhinsPlay = function(el, def){
    var id = ++uid, E = Phins.esc, cur = 0, timer = null, pos = [];
    // work out every actor's position at every step (carry-over)
    var last = {};
    def.steps.forEach(function(s, i){ Object.keys(s.pos || {}).forEach(function(k){ last[k] = s.pos[k]; }); pos[i] = JSON.parse(JSON.stringify(last)); });

    var h = '<div class="play">' +
      '<div class="btnrow"><button type="button" class="btn small" data-act="play">▶ Play</button><button type="button" class="btn small ghost" data-act="next">⏭ Next step</button><button type="button" class="btn small ghost" data-act="restart">↺ Start over</button></div>' +
      '<div class="numrow steps-pills">' + def.steps.map(function(s, i){ return '<button type="button" data-step="' + i + '" aria-pressed="false">' + (i+1) + '. ' + E(s.name) + '</button>'; }).join("") + '</div>' +
      '<svg class="playsvg" viewBox="' + (def.viewBox || "0 0 300 250") + '" role="group" aria-label="' + E(def.title || "Play") + ' diagram. Tap a player to see their job.">' +
      '<defs><marker id="ah' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink)"/></marker></defs>' +
      bg(def.bg, id, def) + Object.keys(def.actors).map(function(k){ return actorSvg(k, def.actors[k]); }).join("") + '</svg>' +
      ((def.bg === "pod" || def.bg === "phase") ? '<p class="scalenote">Not to scale. Distances aren\'t exact here: on the field, you vibe it out.</p>' : '') +
      '<div class="infopanel playcap" aria-live="polite"></div><p class="tapinfo" aria-live="polite"></p></div>';
    el.innerHTML = h;
    var svg = el.querySelector("svg"), cap = el.querySelector(".playcap"), tap = el.querySelector(".tapinfo"), bPlay = el.querySelector('[data-act="play"]');

    function go(i){
      cur = i; var s = def.steps[i], p = pos[i];
      Object.keys(def.actors).forEach(function(k){
        var g = svg.querySelector('[data-a="' + k + '"]'), xy = p[k];
        if (!xy){ g.style.opacity = 0; return; }
        g.style.opacity = xy[2] === 0 ? 0 : 1;
        g.style.transform = "translate(" + xy[0] + "px," + xy[1] + "px)";
      });
      var ovs = svg.querySelectorAll("[data-ov]");
      for (var j = 0; j < ovs.length; j++) ovs[j].classList.toggle("on", (s.show || []).indexOf(ovs[j].getAttribute("data-ov")) >= 0);
      cap.innerHTML = '<b>' + (i+1) + '. ' + E(s.name) + ':</b> ' + Phins.rich(s.text);
      var bs = el.querySelectorAll("[data-step]"); for (var b = 0; b < bs.length; b++) bs[b].setAttribute("aria-pressed", b === i ? "true" : "false");
      el.querySelector('[data-act="next"]').disabled = i >= def.steps.length - 1;
    }
    function stop(){ if (timer){ clearInterval(timer); timer = null; } bPlay.textContent = "▶ Play"; }
    el.addEventListener("click", function(e){
      var b = e.target.closest("[data-act],[data-step]");
      if (b){
        if (b.hasAttribute("data-step")){ stop(); go(+b.getAttribute("data-step")); return; }
        var act = b.getAttribute("data-act");
        if (act === "next"){ stop(); if (cur < def.steps.length - 1) go(cur + 1); }
        if (act === "restart"){ stop(); go(0); }
        if (act === "play"){
          if (timer){ stop(); return; }
          if (cur >= def.steps.length - 1) go(0);
          bPlay.textContent = "⏸ Pause";
          timer = setInterval(function(){ if (cur >= def.steps.length - 1) stop(); else go(cur + 1); }, 2400);
        }
        return;
      }
      var a = e.target.closest(".actor[data-a]");
      if (a) who(a.getAttribute("data-a"));
    });
    svg.addEventListener("keydown", function(e){ var a = e.target.closest(".actor[data-a]"); if (a && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); who(a.getAttribute("data-a")); } });
    function who(k){
      var all = svg.querySelectorAll(".actor"); for (var i = 0; i < all.length; i++) all[i].classList.toggle("picked", all[i].getAttribute("data-a") === k);
      var txt = (def.roles || {})[k];
      tap.innerHTML = txt ? '<b>' + E(def.actors[k].name || def.actors[k].label) + ':</b> ' + Phins.rich(txt) : "";
    }
    tap.innerHTML = def.tapHint === false ? "" : "Tap any player to see their job.";
    svg.classList.add("instant"); go(0);   // first paint: no sliding in from the corner
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ svg.classList.remove("instant"); }); });
    return {go:go};
  };
})();
