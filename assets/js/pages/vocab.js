/* Quick Vocab: tabs of definition cards plus a search that filters across every tab. ?q=word and ?tab=id work. */
Phins.ready(function(){
  var tabsEl = document.getElementById("tabs"), out = document.getElementById("vcards"), inp = document.getElementById("q"), count = document.getElementById("count");
  var data, cur;
  Phins.load("vocab").then(function(d){
    data = d;
    tabsEl.innerHTML = d.tabs.map(function(t, i){
      return '<button type="button" role="tab" id="tab-' + t.id + '" aria-controls="vcards" data-tab="' + t.id + '">' + Phins.esc(t.label) + '</button>';
    }).join("");
    var q = Phins.param("q"), tab = Phins.param("tab");
    cur = (d.tabs.filter(function(t){ return t.id === tab; })[0] || d.tabs[0]).id;
    if (q){ inp.value = q; }
    show();
  }).catch(function(){ Phins.loadFail(out, "vocab.json"); });

  tabsEl.addEventListener("click", function(e){ var b = e.target.closest("[data-tab]"); if (!b) return; cur = b.getAttribute("data-tab"); inp.value = ""; show(); });
  tabsEl.addEventListener("keydown", function(e){
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var ids = data.tabs.map(function(t){ return t.id; }), i = ids.indexOf(cur);
    i = (i + (e.key === "ArrowRight" ? 1 : ids.length - 1)) % ids.length; cur = ids[i]; inp.value = ""; show();
    document.getElementById("tab-" + cur).focus();
  });
  inp.addEventListener("input", show);
  document.getElementById("searchform").addEventListener("submit", function(e){ e.preventDefault(); show(); });

  function show(){
    var q = inp.value.trim(), btns = tabsEl.querySelectorAll("[data-tab]");
    for (var i = 0; i < btns.length; i++){
      var on = !q && btns[i].getAttribute("data-tab") === cur;
      btns[i].setAttribute("aria-selected", on ? "true" : "false");
      btns[i].setAttribute("tabindex", btns[i].getAttribute("data-tab") === cur ? "0" : "-1");
    }
    if (q){
      var hits = PhinsVocab.search(data, q);
      out.setAttribute("aria-labelledby", "");
      count.textContent = hits.length ? hits.length + " match" + (hits.length === 1 ? "" : "es") + " across all tabs" : 'No match for "' + q + '". Try a shorter word.';
      out.innerHTML = hits.map(function(x){ return PhinsVocab.card(x.t, x.tab.label); }).join("");
    } else {
      var t = data.tabs.filter(function(t){ return t.id === cur; })[0];
      out.setAttribute("aria-labelledby", "tab-" + cur);
      count.textContent = t.terms.length + " cards";
      out.innerHTML = t.terms.map(function(x){ return PhinsVocab.card(x); }).join("");
    }
  }
});
