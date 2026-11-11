/* Ref signal stick figures, drawn from the arm angles in data/signals.json.
   If a signal has a second pose (a2 / b2), the arm moves between the two poses (unless reduced motion is on). */
(function(){
  "use strict";
  var UP = 17, FORE = 15;
  function pt(x, y, deg, len){ var r = deg * Math.PI / 180; return [x + Math.cos(r) * len, y - Math.sin(r) * len]; }
  function pts(sx, sy, ang){ var e = pt(sx, sy, ang[0], UP), h = pt(e[0], e[1], ang[1], FORE); return {s:sx + ',' + sy + ' ' + e[0].toFixed(1) + ',' + e[1].toFixed(1) + ' ' + h[0].toFixed(1) + ',' + h[1].toFixed(1), hand:h}; }
  function arm(sx, sy, ang, ang2, hold, cls){
    var p1 = pts(sx, sy, ang), anim = "";
    if (ang2 && !(window.Phins && Phins.reduced)){
      var p2 = pts(sx, sy, ang2);
      anim = hold ? '<animate attributeName="points" dur="2.6s" repeatCount="indefinite" values="' + p1.s + ';' + p2.s + ';' + p2.s + ';' + p1.s + '" keyTimes="0;0.25;0.85;1"/>'
                  : '<animate attributeName="points" dur="1.3s" repeatCount="indefinite" values="' + p1.s + ';' + p2.s + ';' + p1.s + '"/>';
    }
    var shown = (ang2 && window.Phins && Phins.reduced) ? pts(sx, sy, ang2) : p1;
    return {svg:'<polyline class="' + cls + '" points="' + shown.s + '">' + anim + '</polyline>', hand:shown.hand};
  }
  function figure(sig, label){
    var A = arm(59, 39, sig.a || [-100,-95], sig.a2, sig.hold, "fa"), B = arm(41, 39, sig.b || [-100,-95], sig.b2, sig.hold, "fb");
    var hx = A.hand[0], hy = A.hand[1], x = "";
    if (sig.a2 && sig.hold){ var f = pts(59, 39, sig.a2).hand; hx = f[0]; hy = f[1]; }
    switch (sig.extra){
      case "card": x = '<rect x="' + (hx-5) + '" y="' + (hy-9) + '" width="10" height="13" rx="1.5" fill="#f2c200" stroke="#7a6100"/>'; break;
      case "flag": x = '<line x1="' + B.hand[0] + '" y1="' + B.hand[1] + '" x2="' + B.hand[0] + '" y2="' + (B.hand[1]-18) + '" class="fp"/><rect x="' + (B.hand[0]-14) + '" y="' + (B.hand[1]-18) + '" width="14" height="10" fill="#f2c200" stroke="#7a6100"/>'; break;
      case "ball-chest": x = '<ellipse cx="50" cy="49" rx="7" ry="4.5" fill="none" class="fp" stroke-dasharray="2 2"/>'; break;
      case "wave": x = '<path d="M' + (hx-12) + ' ' + (hy-7) + ' h24 m-24 0 l4 -3 m-4 3 l4 3 m20 -3 l-4 -3 m4 3 l-4 3" class="fx"/>'; break;
      case "neck": x = '<path d="M60 31 h-20 m0 0 l3 -3 m-3 3 l3 3" class="fx"/>'; break;
    }
    return '<svg class="fig" viewBox="0 0 100 100" role="img" aria-label="' + Phins.esc(label || sig.name) + ' signal: ' + Phins.esc(sig.desc || "") + '">' +
      '<circle cx="50" cy="22" r="8" class="fh"/><line x1="50" y1="30" x2="50" y2="64" class="fp"/>' +
      '<line x1="41" y1="39" x2="59" y2="39" class="fp"/><polyline points="42,92 50,64 58,92" class="fp" fill="none"/>' +
      B.svg + A.svg + x + '</svg>';
  }
  window.PhinsFigure = figure;
})();
