/* Open Play: one phase step by step (starting from a ruck that's already formed), plus the 1-3-3-1. */
Phins.ready(function(){
  PhinsShape(document.getElementById("shapesvg"), document.getElementById("shaperow"), document.getElementById("shapeinfo"));
  var box = document.getElementById("phaseplay");
  Phins.load("plays").then(function(p){ if (p.phase) PhinsPlay(box, p.phase); }).catch(function(){ Phins.loadFail(box, "plays.json"); });
});
