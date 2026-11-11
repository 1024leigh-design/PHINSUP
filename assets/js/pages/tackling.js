/* Safe tackling, step by step (side view). The ball carrier runs left; the tackler comes in from the left.
   Zones on the ball carrier show where to aim: green = best target, yellow = chest, red = above the shoulders (illegal). */
Phins.ready(function(){
  var box = document.getElementById("tackleplay");
  // tackler: hip position + lean (degrees) + legs bent; carrier: fall angle
  var STEPS = [
    {name:"Target", text:"Aim low. **Waist to thighs** is the best target, and the safest. **Above the line of the shoulders is a high tackle**: illegal and dangerous.", hip:[110,160], lean:0, bend:0, arms:false, fall:0, wrong:false},
    {name:"Get low", text:"Bend your knees and get low as you close in. **Eyes open, chin up.**", hip:[196,176], lean:42, bend:1, arms:false, fall:0, wrong:false},
    {name:"Cheek to cheek", text:"Your head goes to the **side of their butt/hip**, never in front of their body.", hip:[236,180], lean:74, bend:1, arms:false, fall:0, wrong:true},
    {name:"Wrap", text:"**Wrap with your arms** around their thighs and hold on.", hip:[236,180], lean:74, bend:1, arms:true, fall:0, wrong:false},
    {name:"Drive", text:"**Drive with your legs.** Short, powerful steps through the tackle, and they go down.", hip:[262,186], lean:70, bend:1, arms:true, fall:48, wrong:false}
  ];
  var h = '<div class="play">' +
    '<div class="btnrow"><button type="button" class="btn small" data-act="next">Next step &rarr;</button><button type="button" class="btn small ghost" data-act="restart">Start over</button></div>' +
    '<div class="numrow steps-pills">' + STEPS.map(function(s, i){ return '<button type="button" data-step="' + i + '" aria-pressed="false">' + (i+1) + '. ' + s.name + '</button>'; }).join("") + '</div>' +
    '<svg class="playsvg tksvg" viewBox="0 0 420 260" role="img" aria-label="Side view of a safe tackle, step by step. The caption describes each step.">' +
      '<rect x="0" y="0" width="420" height="260" rx="12" class="pcfield"/><line x1="0" y1="232" x2="420" y2="232" class="tline"/>' +
      // ball carrier (facing left), rotates about their feet when they fall
      '<g id="tk-carrier" style="transform-origin:300px 232px">' +
        '<rect x="270" y="52" width="70" height="40" class="z zred"/><rect x="270" y="92" width="70" height="36" class="z zyel"/><rect x="270" y="128" width="70" height="62" class="z zgrn"/>' +
        '<line x1="300" y1="150" x2="288" y2="230" class="limb"/><line x1="300" y1="150" x2="314" y2="230" class="limb"/>' +
        '<rect x="286" y="84" width="28" height="70" rx="11" class="torso carrier"/><circle cx="296" cy="70" r="12" class="headc carrier"/>' +
        '<ellipse cx="282" cy="112" rx="9" ry="6" class="ballk"/>' +
        '<path class="tkarms" d="M292 150 C 268 160, 270 192, 300 194 C 326 194, 330 166, 314 154"/>' +
        '<text x="344" y="74" class="zl">Illegal</text><text x="344" y="114" class="zl">Chest</text><text x="344" y="162" class="zl">Best target</text>' +
      '</g>' +
      // tackler: legs are separate so the torso can lean from the hip
      '<g id="tk-tackler" class="tk">' +
        '<g class="tklegs"><line x1="0" y1="0" x2="-14" y2="52" class="limb tkl"/><line x1="0" y1="0" x2="14" y2="52" class="limb tkl"/></g>' +
        '<g class="tkup"><rect x="-14" y="-70" width="28" height="70" rx="11" class="torso tackler"/><circle cx="0" cy="-84" r="12" class="headc tackler"/>' +
          '</g>' +
      '</g>' +
      '<g id="tk-wrong"><circle cx="262" cy="160" r="12" class="wrongh"/><path d="M252 150 l20 20 M272 150 l-20 20" class="wrongx"/><text x="262" y="214" text-anchor="middle" class="zl wrongt">Never in front</text></g>' +
    '</svg>' +
    '<div class="infopanel playcap" aria-live="polite"></div>' +
    '<p class="tklegend"><span class="sw zgrn"></span>Best target <span class="sw zyel"></span>Chest <span class="sw zred"></span>Above the shoulders: illegal</p></div>';
  box.innerHTML = h;
  var cur = 0, tk = document.getElementById("tk-tackler"), up = tk.querySelector(".tkup"), legs = tk.querySelectorAll(".tkl"), cap = box.querySelector(".playcap");
  function go(i){
    cur = i; var s = STEPS[i];
    tk.style.transform = "translate(" + s.hip[0] + "px," + s.hip[1] + "px)";
    up.style.transform = "rotate(" + s.lean + "deg)";
    legs[0].setAttribute("x2", s.bend ? -30 : -14); legs[0].setAttribute("y2", s.bend ? 44 : 52);
    legs[1].setAttribute("x2", s.bend ? 4 : 14);
    box.querySelector(".tkarms").style.opacity = s.arms ? 1 : 0;
    document.getElementById("tk-wrong").style.opacity = s.wrong ? 1 : 0;
    document.getElementById("tk-carrier").style.transform = "rotate(" + s.fall + "deg)";
    box.querySelector(".tksvg").classList.toggle("zonesdim", i > 0);
    cap.innerHTML = '<b>' + (i+1) + '. ' + STEPS[i].name + ':</b> ' + Phins.rich(s.text);
    var bs = box.querySelectorAll("[data-step]"); for (var b = 0; b < bs.length; b++) bs[b].setAttribute("aria-pressed", b === i ? "true" : "false");
    box.querySelector('[data-act="next"]').disabled = i >= STEPS.length - 1;
  }
  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-step],[data-act]"); if (!b) return;
    if (b.hasAttribute("data-step")) go(+b.getAttribute("data-step"));
    else if (b.getAttribute("data-act") === "next" && cur < STEPS.length - 1) go(cur + 1);
    else if (b.getAttribute("data-act") === "restart") go(0);
  });
  go(0);
});
