/* Phins core: password gate, themes, header, "I'm lost" button, pager,
   data loading, quizzes, and "Watch this" clip slots. Loaded in <head> on every page. */
(function(){
  "use strict";
  var CFG = window.PHINS_CONFIG || {password:"phins"};
  var root = document.documentElement;

  /* ---------- safe storage ---------- */
  function sget(k){ try{ return window.localStorage.getItem(k); }catch(e){ return null; } }
  function sset(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }
  var memUnlocked = false;

  /* ---------- page list (order used for nav + pager) ---------- */
  var PAGES = {
    "1":[
      ["positions","Meet the Positions","🔢"],["vocab","Quick Vocab","📚"],["scrum","Set Pieces: Scrum","🤝"],
      ["lineout","Set Pieces: Lineout","🙌"],["openplay","Open Play","🏃"],["kickoffs","Kickoffs & Restarts","🦶"],
      ["pitch","The Pitch","🟩"],["penalties","Penalties & Ref Signals","🚩"],["scoring","Scoring & Kicking","🏉"],
      ["lost","I'm Lost!","🆘"],["tackling","Safe Tackling Basics","💪"],
      ["first-match","First Match Survival Guide","🌟"],["safety","Concussion & Safety","🧠"],["calls","Communication Calls","📣"]
    ],
    "2":[
      ["playbook","Rugby Is Chaos","🌀"],["shape","Our Shape: 1-3-3-1","🐬"],["zones","Zones: Red / Yellow / Green","🚦"],
      ["lineout-calls","Forward Calls: Lineouts","🙌"],["scrum-calls","Forward Calls: Scrums","🤝"],["mauls","Mauls","🧱"],
      ["kickoff-setup","Kickoff Setup + First Phases","🦶"],["exit-red-zone","Exiting the Red Zone","🚪"],["whatif","The \"What If?\" Lab","🧪"]
    ]
  };

  /* ---------- "Through the field": guided Next, Next, Next through every page ---------- */
  var TOUR = ["positions","vocab","scrum","lineout","openplay","kickoffs","pitch","penalties","scoring","tackling","first-match","safety","calls",
              "playbook","shape","zones","lineout-calls","scrum-calls","mauls","kickoff-setup","exit-red-zone","whatif"];
  function pageTitle(id){ var all = PAGES["1"].concat(PAGES["2"]); for (var i = 0; i < all.length; i++) if (all[i][0] === id) return all[i][1]; return id; }
  function tourBar(){
    var id = pageId();
    if (param("tour") === "1"){ sset("phins-tour", "1"); }
    if (param("tour") === "0" || id === "home"){ if (param("tour") === "0") sset("phins-tour", ""); }
    if (sget("phins-tour") !== "1") return;
    var i = TOUR.indexOf(id);
    if (i >= 0) sset("phins-tour-at", String(i));
    var at = i >= 0 ? i : parseInt(sget("phins-tour-at") || "0", 10);
    var bar = document.createElement("nav"); bar.className = "tourbar"; bar.setAttribute("aria-label", "Through the field");
    if (i < 0){
      bar.innerHTML = '<div class="in"><span class="tlabel">Through the field</span><a class="btn small" href="' + TOUR[at] + '.html">Back to the tour: ' + esc(pageTitle(TOUR[at])) + '</a><button type="button" class="tx">Exit</button></div>';
    } else {
      var prev = i > 0 ? TOUR[i-1] : null, next = i < TOUR.length - 1 ? TOUR[i+1] : null;
      bar.innerHTML = '<div class="in">' +
        '<span class="tlabel">Through the field <b>' + (i+1) + ' of ' + TOUR.length + '</b></span>' +
        '<div class="tprog" aria-hidden="true"><i style="width:' + Math.round((i+1)/TOUR.length*100) + '%"></i></div>' +
        (prev ? '<a class="btn small ghost" href="' + prev + '.html">&larr; Back</a>' : '') +
        (next ? '<a class="btn small" href="' + next + '.html">Next: ' + esc(pageTitle(next)) + ' &rarr;</a>' : '<a class="btn small pink" href="index.html?tour=0">Finish!</a>') +
        '<button type="button" class="tx">Exit</button></div>';
    }
    document.body.appendChild(bar); root.classList.add("touring");
    bar.querySelector(".tx").addEventListener("click", function(){ sset("phins-tour", ""); bar.remove(); root.classList.remove("touring"); });
  }

  /* ---------- password gate ---------- */
  function hash(s){ var h = 5381; for (var i = 0; i < s.length; i++){ h = ((h << 5) + h + s.charCodeAt(i)) | 0; } return "v1-" + (h >>> 0).toString(36); }
  var KEY = hash(String(CFG.password));
  function isUnlocked(){ return memUnlocked || sget("phins-unlocked") === KEY; }
  if (!isUnlocked()) root.classList.add("locked");

  /* ---------- theme (set before paint) ---------- */
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function applyTheme(t){
    if (t === "sparkle") root.setAttribute("data-theme","sparkle"); else root.removeAttribute("data-theme");
    var bs = document.querySelectorAll(".seg [data-theme-btn]");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-theme-btn") === (t || "classic") ? "true" : "false");
    sparkles(t === "sparkle");
  }
  var theme = sget("phins-theme") || "classic";
  if (theme === "sparkle") root.setAttribute("data-theme","sparkle");

  function sparkles(on){
    var old = document.querySelector(".sparkles"); if (old) old.remove();
    if (!on || reduced || !document.body) return;
    var box = document.createElement("div"); box.className = "sparkles"; box.setAttribute("aria-hidden","true");
    var cols = ["#ffe066","#ff8cc3","#ffffff","#52e295"];
    for (var i = 0; i < 28; i++){
      var s = document.createElement("i");
      s.style.left = (Math.random()*100).toFixed(1) + "%";
      s.style.top = (Math.random()*100).toFixed(1) + "%";
      s.style.setProperty("--s", (6 + Math.random()*14).toFixed(0) + "px");
      s.style.setProperty("--d", (2.2 + Math.random()*3).toFixed(2) + "s");
      s.style.setProperty("--dl", (Math.random()*4).toFixed(2) + "s");
      s.style.setProperty("--col", cols[i % cols.length]);
      box.appendChild(s);
    }
    document.body.appendChild(box);
  }

  /* ---------- helpers ---------- */
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  // Text from data files may contain **bold** and [TODO: ...] markers. Everything else is escaped.
  function rich(s){
    return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")
      .replace(/\[(HANNAH[^\]]*)\]/g,'<span class="tag tagtodo">$1</span>');
  }
  var cache = {};
  function load(name){
    if (!cache[name]) cache[name] = fetch("data/" + name + ".json", {cache:"no-cache"}).then(function(r){
      if (!r.ok) throw new Error(name + ".json " + r.status); return r.json();
    });
    return cache[name];
  }
  function param(k){ try{ return new URLSearchParams(location.search).get(k); }catch(e){ return null; } }
  function pageId(){ var m = document.getElementById("main"); return m ? m.getAttribute("data-page") : ""; }
  function loadFail(el, name){ el.innerHTML = '<div class="todo">Could not load ' + esc(name) + '. If you opened this file straight from your computer, run it through GitHub Pages or a local server (see README).</div>'; }

  /* ---------- header, lost button, pager ---------- */
  function header(){
    var id = pageId(), sec = (document.getElementById("main") || {}).getAttribute ? document.getElementById("main").getAttribute("data-section") : "";
    var h = document.createElement("header"); h.className = "topbar";
    h.innerHTML = '<div class="in"><a class="brand" href="index.html" aria-label="Phins home">🐬 <span>Phins</span></a>' +
      '<nav class="navlinks" aria-label="Main">' +
      '<a href="basics.html"' + (sec === "1" || id === "basics" ? ' aria-current="page"' : '') + '><span class="long">Rugby </span>Basics</a>' +
      '<a href="playbook.html"' + (sec === "2" ? ' aria-current="page"' : '') + '>Playbook</a>' +
      '<a href="vocab.html"' + (id === "vocab" ? ' aria-current="page"' : '') + '>Vocab</a></nav>' +
      '<div class="seg" role="group" aria-label="Theme"><button type="button" data-theme-btn="classic">Classic</button><button type="button" data-theme-btn="sparkle" aria-label="Sparkle theme">✨<span class="long"> Sparkle</span></button></div></div>';
    document.body.insertBefore(h, document.body.firstChild);
    h.querySelector(".seg").addEventListener("click", function(e){
      var b = e.target.closest("[data-theme-btn]"); if (!b) return;
      theme = b.getAttribute("data-theme-btn"); sset("phins-theme", theme); applyTheme(theme);
    });
    if (id !== "lost"){
      var a = document.createElement("a"); a.className = "lostbtn"; a.href = "lost.html"; a.innerHTML = "🆘 I'm lost!";
      document.body.appendChild(a);
    }
  }
  function pager(){
    var main = document.getElementById("main"); if (!main) return;
    var id = pageId(), sec = main.getAttribute("data-section"); if (!PAGES[sec]) return;
    var list = PAGES[sec], i = -1;
    for (var k = 0; k < list.length; k++) if (list[k][0] === id) i = k;
    if (i < 0) return;
    var hub = sec === "1" ? ["basics","Rugby Basics"] : ["playbook","Phins Playbook"];
    var prev = i > 0 ? list[i-1] : null, next = i < list.length - 1 ? list[i+1] : null;
    var n = document.createElement("nav"); n.className = "pager"; n.setAttribute("aria-label","Page navigation");
    n.innerHTML = (prev ? '<a href="' + prev[0] + '.html"><small>&larr; Back</small><b>' + esc(prev[1]) + '</b></a>' : '<a href="' + hub[0] + '.html"><small>&larr; Back to</small><b>' + hub[1] + '</b></a>') +
      (next ? '<a class="next" href="' + next[0] + '.html"><small>Up next &rarr;</small><b>' + esc(next[1]) + '</b></a>' : '<a class="next" href="' + hub[0] + '.html"><small>Done! &rarr;</small><b>' + hub[1] + '</b></a>');
    main.appendChild(n);
    var f = document.createElement("p"); f.className = "foot"; f.textContent = "One heart, one beat. 🐬"; main.appendChild(f);
  }

  /* ---------- quizzes ---------- */
  function quiz(el){
    var id = el.getAttribute("data-quiz") || pageId();
    load("quizzes").then(function(all){
      var qs = all[id];
      if (!qs || !qs.length){ el.innerHTML = '<div class="todo">Quiz questions for this page go in data/quizzes.json under "' + esc(id) + '".</div>'; return; }
      var done = 0, right = 0;
      var h = '<details class="more selfcheck"><summary>Self-check: ' + qs.length + ' quick questions</summary><div class="quiz">';
      qs.forEach(function(q, qi){
        h += '<div class="q" data-qi="' + qi + '"><p class="qt">' + (qi+1) + '. ' + rich(q.q) + '</p><div class="opts">';
        q.options.forEach(function(o, oi){ h += '<button type="button" data-oi="' + oi + '">' + rich(o) + '</button>'; });
        h += '</div><div class="fb" aria-live="polite" hidden></div></div>';
      });
      h += '<p class="score" aria-live="polite" hidden></p></div></details>';
      el.innerHTML = h;
      el.addEventListener("click", function(e){
        var b = e.target.closest(".opts button"); if (!b || b.disabled) return;
        var qd = b.closest(".q"), q = qs[+qd.getAttribute("data-qi")], oi = +b.getAttribute("data-oi");
        var ok = oi === q.answer, btns = qd.querySelectorAll(".opts button");
        for (var i = 0; i < btns.length; i++){ btns[i].disabled = true; if (i === q.answer) btns[i].classList.add("right"); }
        if (!ok) b.classList.add("wrong");
        var fb = qd.querySelector(".fb"); fb.hidden = false; fb.className = "fb " + (ok ? "good" : "bad");
        var extra = (!ok && q.feedback && q.feedback[oi]) ? " " + rich(q.feedback[oi]) : "";
        fb.innerHTML = "<b>" + (ok ? "Yes!" : "Not quite.") + "</b>" + extra + " " + rich(q.why || "");
        done++; if (ok) right++;
        if (done === qs.length){ var s = el.querySelector(".score"); s.hidden = false; s.textContent = "You got " + right + " of " + qs.length + ". " + (right === qs.length ? "Legend!" : "Rugby is chaos. Try the page again anytime."); }
      });
    }).catch(function(){ loadFail(el, "quizzes.json"); });
  }

  /* ---------- gate screen ---------- */
  function gate(){
    var g = document.createElement("div"); g.id = "gate";
    g.innerHTML = '<form autocomplete="off"><div class="ic" aria-hidden="true">🐬</div><h1>' + esc(CFG.gateTitle || "Phins Rugby") + '</h1>' +
      '<p>' + esc(CFG.gateHint || "") + '</p><label class="sr" for="gate-pw">Team password</label>' +
      '<input id="gate-pw" type="password" placeholder="Team password" required>' +
      '<button class="btn" type="submit">Let me in</button><p class="err" role="alert"></p></form>';
    document.body.appendChild(g);
    var f = g.querySelector("form"), inp = g.querySelector("input");
    f.addEventListener("submit", function(e){
      e.preventDefault();
      if (inp.value.trim().toLowerCase() === String(CFG.password).trim().toLowerCase()){
        memUnlocked = true; sset("phins-unlocked", KEY); root.classList.remove("locked"); g.remove(); start();
      } else { g.querySelector(".err").textContent = "Not quite. Try again!"; inp.select(); }
    });
    setTimeout(function(){ inp.focus(); }, 50);
  }

  // Wrap emoji in big titles so the Sparkle shimmer (gradient text) doesn't turn them into blocks.
  function splitEmoji(){
    var re = /((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u200D|[\u{1F3FB}-\u{1F3FF}])+)/u;
    document.querySelectorAll(".hero h1, .chant").forEach(function(h){
      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function(t){
        var parts = t.nodeValue.split(re); if (parts.length < 2) return;
        var frag = document.createDocumentFragment();
        parts.forEach(function(p, i){ if (!p) return; if (i % 2){ var s = document.createElement("span"); s.className = "emo"; s.textContent = p; frag.appendChild(s); } else frag.appendChild(document.createTextNode(p)); });
        t.parentNode.replaceChild(frag, t);
      });
    });
  }

  var started = false, readyFns = [];
  function start(){
    if (started) return; started = true;
    header(); pager(); tourBar(); splitEmoji(); applyTheme(theme);
    document.querySelectorAll("[data-quiz]").forEach(quiz);
    readyFns.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } });
  }
  function ready(fn){ if (started) fn(); else readyFns.push(fn); }

  document.addEventListener("DOMContentLoaded", function(){ if (isUnlocked()) start(); else gate(); });

  function touring(){ return sget("phins-tour") === "1" || param("tour") === "1"; }
  window.Phins = {touring:touring, esc:esc, rich:rich, load:load, param:param, ready:ready, pageId:pageId, loadFail:loadFail, reduced:reduced, PAGES:PAGES};
})();
