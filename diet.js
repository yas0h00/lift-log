/* Lift Log: Diet tab, step counter and treadmill presets. Self-contained; data lives in localStorage. */
(function(){
var K='liftlog.diet.v1', KS='liftlog.steps.v1';
var T={kcal:2100,p:170,c:230,f:55}, STEPS=[8000,10000];
/* per 100 g raw/dry */
var FOODS=[
  {n:'Oats (dry)',k:389,p:16.9,c:66.3,f:6.9},
  {n:'Rice (dry)',k:365,p:7.1,c:80,f:.7},
  {n:'Soya chunks (dry)',k:345,p:52,c:33,f:.5},
  {n:'Potato (raw)',k:77,p:2,c:17.5,f:.1},
  {n:'Chicken breast (raw)',k:100,p:20.7,c:0,f:2},
  {n:'Egg whites (raw)',k:52,p:10.9,c:.7,f:.2}
];
var PRE=[
  {n:'Protein scoop (35 g)',k:120,p:25,c:3,f:1.5},
  {n:'Soya chunks 50 g',k:172,p:26,c:16.5,f:.3},
  {n:'2 eggs + 4 whites',k:205,p:24,c:2,f:10},
  {n:'Potato 150 g raw',k:115,p:3,c:26,f:.2},
  {n:'Chicken 150 g raw',k:150,p:31,c:0,f:3},
  {n:'1 tsp oil / ghee',k:45,p:0,c:0,f:5}
];
var $=function(s,r){return (r||document).querySelector(s)};
function ymd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function today(){return ymd(new Date())}
function load(k){try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}if(window.LLSync)window.LLSync.touch()}
function r1(n){return Math.round(n*10)/10}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
var D=load(K), SP=load(KS);
(function prune(){var keep=Object.keys(D).sort().slice(-365),o={};keep.forEach(function(d){o[d]=D[d]});D=o;
  var ks=Object.keys(SP).sort().slice(-365),s={};ks.forEach(function(d){s[d]=SP[d]});SP=s})();

var grid=$('.grid');if(!grid)return;
var s=document.createElement('section');
s.className='panel dietp';s.dataset.tab='diet';s.setAttribute('aria-labelledby','h-diet');
s.innerHTML=
'<div class="phead"><h2 id="h-diet">Diet</h2><span class="hint" id="dtDate"></span></div>'+
'<div id="dtBars"></div>'+
'<div class="field"><span class="lbl">Quick add</span><div class="chips" id="dtPre">'+
  PRE.map(function(p,i){return '<button type="button" class="chip" data-pre="'+i+'">'+p.n+'</button>'}).join('')+'</div></div>'+
'<div class="field"><span class="lbl">Raw-weight calculator</span>'+
  '<div class="row2"><select id="dtFood" aria-label="Food">'+FOODS.map(function(f,i){return '<option value="'+i+'">'+f.n+'</option>'}).join('')+'</select>'+
  '<div class="stepper"><input type="number" id="dtG" inputmode="decimal" step="any" placeholder="grams" aria-label="Raw weight in grams"></div></div>'+
  '<p class="hint" id="dtCalc">Enter the weight from your food scale.</p>'+
  '<button type="button" class="btn small" data-dt="addCalc">Add to today</button></div>'+
'<div class="field"><span class="lbl">Today\'s food</span><div id="dtList"></div></div>'+
'<div class="phead" style="margin-top:18px"><h2>Steps</h2></div>'+
'<div id="dtStepBar"></div>'+
'<div class="bwrow"><input type="number" id="dtSt" inputmode="numeric" step="100" placeholder="Steps today" aria-label="Steps today"><button type="button" class="btn small" data-dt="saveSteps">Save</button></div>'+
'<div class="chips"><button type="button" class="chip" data-st="1000">+1,000</button><button type="button" class="chip" data-st="2000">+2,000</button><button type="button" class="chip" data-st="5000">+5,000</button></div>';
grid.appendChild(s);

function tot(d){var t={k:0,p:0,c:0,f:0};(D[d]||[]).forEach(function(e){t.k+=e.k;t.p+=e.p;t.c+=e.c;t.f+=e.f});return t}
function bar(label,v,max,unit,over){
  var pct=Math.min(100,max?v/max*100:0);
  return '<div class="dtrow"><span class="dtl">'+label+'</span><div class="dtbar" role="img" aria-label="'+label+' '+Math.round(v)+' of '+max+' '+unit+'"><i class="'+(over&&v>max?'over':'')+'" style="width:'+pct+'%"></i></div><span class="dtv">'+Math.round(v)+' / '+max+' '+unit+'</span></div>';
}
function paint(){
  var t=today(),x=tot(t);
  $('#dtDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
  $('#dtBars').innerHTML=bar('Calories',x.k,T.kcal,'kcal',1)+bar('Protein',x.p,T.p,'g')+bar('Carbs',x.c,T.c,'g',1)+bar('Fat',x.f,T.f,'g',1);
  var L=D[t]||[];
  $('#dtList').innerHTML=L.length?L.map(function(e){return '<div class="hol"><span>'+e.n+' · '+Math.round(e.k)+' kcal · P'+r1(e.p)+' C'+r1(e.c)+' F'+r1(e.f)+'</span><button type="button" class="linkbtn" data-dt="del" data-id="'+e.id+'">Delete</button></div>'}).join(''):'<p class="hint">Nothing logged yet. Tap a preset above.</p>';
  var n=SP[t]||0;
  $('#dtStepBar').innerHTML=bar('Steps',n,STEPS[1],'',0)+'<p class="hint">'+(n>=STEPS[1]?'Top of your range. Nice.':n>=STEPS[0]?'Minimum reached. Target is '+STEPS[0].toLocaleString()+'–'+STEPS[1].toLocaleString()+'.':'Aim for '+STEPS[0].toLocaleString()+'–'+STEPS[1].toLocaleString()+' steps a day.')+'</p>';
}
function calc(){
  var f=FOODS[+$('#dtFood').value],g=parseFloat($('#dtG').value);
  if(!(g>0)){$('#dtCalc').textContent='Enter the weight from your food scale.';return null}
  var m=g/100,o={n:f.n+' '+g+' g',k:f.k*m,p:f.p*m,c:f.c*m,f:f.f*m};
  $('#dtCalc').textContent=Math.round(o.k)+' kcal · P'+r1(o.p)+' C'+r1(o.c)+' F'+r1(o.f);return o;
}
function add(m){var t=today();D[t]=D[t]||[];D[t].push({id:id(),n:m.n,k:r1(m.k),p:r1(m.p),c:r1(m.c),f:r1(m.f)});save(K,D);paint()}
function steps(v){SP[today()]=Math.max(0,Math.min(100000,Math.round(v)));save(KS,SP);paint()}

s.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.pre!=null)add(PRE[+b.dataset.pre]);
  else if(b.dataset.st)steps((SP[today()]||0)+Number(b.dataset.st));
  else if(b.dataset.dt==='addCalc'){var o=calc();if(o){add(o);$('#dtG').value='';calc()}}
  else if(b.dataset.dt==='del'){var t=today();D[t]=(D[t]||[]).filter(function(x){return x.id!==b.dataset.id});save(K,D);paint()}
  else if(b.dataset.dt==='saveSteps'){var v=parseInt($('#dtSt').value,10);if(v>=0){steps(v);$('#dtSt').value=''}}
});
$('#dtG').addEventListener('input',calc);$('#dtFood').addEventListener('change',calc);
document.addEventListener('visibilitychange',function(){if(!document.hidden)paint()});
paint();

/* shared with backup/import and cloud sync in app.js */
(function(){
  var rx=/^\d{4}-\d{2}-\d{2}$/;
  function num(v,max){return typeof v==='number'&&isFinite(v)&&v>=0&&v<=max}
  function okE(e){return e&&typeof e.id==='string'&&typeof e.n==='string'&&e.n.length<=80&&num(e.k,5000)&&num(e.p,1000)&&num(e.c,1000)&&num(e.f,1000)}
  function cleanD(o){var r={};if(!o||typeof o!=='object')return r;Object.keys(o).forEach(function(k){if(rx.test(k)&&Array.isArray(o[k]))r[k]=o[k].filter(okE).map(function(e){return {id:e.id,n:e.n,k:e.k,p:e.p,c:e.c,f:e.f}})});return r}
  function cleanS(o){var r={};if(!o||typeof o!=='object')return r;Object.keys(o).forEach(function(k){if(rx.test(k)&&num(o[k],100000))r[k]=Math.round(o[k])});return r}
  window.LLDiet={
    get:function(){return {diet:D,steps:SP}},
    replace:function(o){D=cleanD(o&&o.diet);SP=cleanS(o&&o.steps);save(K,D);save(KS,SP);paint()},
    countNew:function(o){var n={d:0,s:0},nd=cleanD(o&&o.diet),ns=cleanS(o&&o.steps);
      Object.keys(nd).forEach(function(k){var h={};(D[k]||[]).forEach(function(e){h[e.id]=1});nd[k].forEach(function(e){if(!h[e.id])n.d++})});
      Object.keys(ns).forEach(function(k){if(!(ns[k]<=(SP[k]||0)))n.s++});return n},
    merge:function(o){var nd=cleanD(o&&o.diet),ns=cleanS(o&&o.steps);
      Object.keys(nd).forEach(function(k){var h={};D[k]=D[k]||[];D[k].forEach(function(e){h[e.id]=1});nd[k].forEach(function(e){if(!h[e.id]){h[e.id]=1;D[k].push(e)}})});
      Object.keys(ns).forEach(function(k){if(ns[k]>(SP[k]||0))SP[k]=ns[k]});
      save(K,D);save(KS,SP);paint()}
  };
})();

/* treadmill presets in the Cardio panel: fill minutes and distance (km = km/h x minutes / 60) */
var q=$('[data-cdq="15"]');
if(q&&q.parentNode){
  var row=document.createElement('div');row.className='field';
  row.innerHTML='<span class="lbl">Treadmill presets · 5 km/h · 3% incline</span><div class="chips">'+
    '<button type="button" class="chip" data-tm="15">Walk 15 min</button>'+
    '<button type="button" class="chip" data-tm="20">Walk 20 min</button></div>';
  q.parentNode.parentNode.appendChild(row);
  row.addEventListener('click',function(e){
    var b=e.target.closest('[data-tm]');if(!b)return;
    var m=+b.dataset.tm,w=$('[data-cdt="walk"]');if(w)w.click();
    $('#cdMin').value=m;$('#cdKm').value=r1(5*m/60);var inc=$('#cdInc');if(inc&&!inc.value)inc.value=3;
  });
}
})();
