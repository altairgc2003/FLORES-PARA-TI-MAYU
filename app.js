const canvas = document.querySelector('#universe');
const ctx = canvas.getContext('2d');
const intro = document.querySelector('#intro');
const hint = document.querySelector('.hint');
const phrases = [
  '🌻 Como el girasol, miro hacia ti', '🌼 Gracias por ser mi sol de siempre',
  '🌻 Contigo hasta lo simple brilla', '🌼 Hoy el amarillo lleva tu nombre',
  '🌻 Esta flor te recuerda cuánto vales', '🌼 Tu amistad, mi lugar favorito',
  '🌻 Un girasol para quien ilumina', '🌼 Gracias por quedarte siempre',
  '🌻 Contigo el día pesa menos', '🌼 Tu risa le hace bien a mis días',
  '🌻 Pétalos dorados solo para ti', '🌼 Feliz día, pienso en ti con cariño',
  '🌻 Contigo todo lugar es bonito', '🌼 Un ramo de gracias por estar ahí',
  '🌻 El amarillo también dice te quiero', '🌼 Gracias por sumar luz a mis días'
];
let w, h, dpr, stars, words, time = 0, zoom = 1, angle = 0.2, tilt = 0.12;
let dragging = false, previous = null;

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({length: Math.min(900, Math.floor(w * h / 1200))}, () => ({
    x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.25 + .15, a: Math.random()
  }));
  words = Array.from({length: 72}, (_, i) => ({
    text: phrases[i % phrases.length], theta: Math.random() * Math.PI * 2,
    radius: 155 + Math.random() * Math.min(w, h) * .34,
    y: (Math.random() - .5) * Math.min(w, h) * .65, speed: .00015 + Math.random() * .00035,
    size: 11 + Math.random() * 5, shade: 42 + Math.random() * 16
  }));
}
function ellipsePoint(r, a, y) {
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  const ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(tilt), st = Math.sin(tilt);
  const rx = x * ca - z * sa, rz = x * sa + z * ca;
  return { x: w / 2 + rx, y: h / 2 + y * ct - rz * st, z: rz * ct + y * st };
}
function drawGalaxy() {
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createRadialGradient(w/2,h/2,10,w/2,h/2,Math.max(w,h)*.72);
  bg.addColorStop(0, '#1b0c1c'); bg.addColorStop(.28, '#110d24'); bg.addColorStop(.67, '#07050f'); bg.addColorStop(1, '#000104');
  ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
  stars.forEach(s => { const a = .2 + .75 * ((Math.sin(time*.0007 + s.a*10)+1)/2); ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fillRect(s.x,s.y,s.r,s.r); });
  const centerX = w/2, centerY = h/2;
  const halo = ctx.createRadialGradient(centerX,centerY,8,centerX,centerY,180*zoom);
  halo.addColorStop(0,'rgba(0,0,0,1)'); halo.addColorStop(.2,'rgba(8,5,5,.98)'); halo.addColorStop(.45,'rgba(255,166,0,.16)'); halo.addColorStop(1,'rgba(255,159,0,0)');
  ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(centerX,centerY,210*zoom,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.translate(centerX,centerY); ctx.rotate(tilt); ctx.scale(1, .34); ctx.rotate(time*.00012 + angle*.18);
  for(let i=0;i<36;i++) { const r = (74+i*2.25)*zoom; ctx.strokeStyle = i%4===0?'rgba(94,42,0,.35)':`rgba(255,${170+i*2},${35+i*2},.85)`; ctx.lineWidth=2.5+Math.random()*1.4; ctx.beginPath(); ctx.ellipse(0,0,r,r*.68,0,0,Math.PI*2); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle='#020105'; ctx.beginPath(); ctx.arc(centerX,centerY,43*zoom,0,Math.PI*2); ctx.fill();
  const core = ctx.createRadialGradient(centerX-10,centerY-10,3,centerX,centerY,52*zoom); core.addColorStop(0,'#1c1530'); core.addColorStop(.5,'#050307'); core.addColorStop(1,'#000'); ctx.fillStyle=core; ctx.beginPath();ctx.arc(centerX,centerY,43*zoom,0,Math.PI*2);ctx.fill();
}
function drawWords() {
  const placed = words.map(word => { word.theta += word.speed * (1 + zoom*.15); const p = ellipsePoint(word.radius*zoom, word.theta, word.y*zoom); return {...word,...p}; }).sort((a,b)=>a.z-b.z);
  placed.forEach(word => { const depth = Math.max(.35, Math.min(1, .55 + word.z/(word.radius*2))); ctx.save(); ctx.globalAlpha = .35 + depth*.6; ctx.font = `${word.size*depth}px "Indie Flower", cursive`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.shadowBlur=12; ctx.shadowColor='#ffb300'; ctx.fillStyle=`hsl(${word.shade},100%,${68+depth*20}%)`; ctx.fillText(word.text,word.x,word.y); ctx.restore(); });
}
function frame(now) { time = now; drawGalaxy(); drawWords(); requestAnimationFrame(frame); }
function start() { intro.classList.add('leave'); hint.style.opacity = '0'; setTimeout(()=>hint.remove(),900); }
intro.addEventListener('click', start); intro.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') start(); });
canvas.addEventListener('pointerdown', e => { dragging=true; previous={x:e.clientX,y:e.clientY}; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => { if(!dragging) return; angle += (e.clientX-previous.x)/260; tilt = Math.max(-.58,Math.min(.58,tilt+(e.clientY-previous.y)/420)); previous={x:e.clientX,y:e.clientY}; });
canvas.addEventListener('pointerup', () => dragging=false);
canvas.addEventListener('wheel', e => { zoom=Math.max(.62,Math.min(1.65,zoom-e.deltaY*.00065)); }, {passive:true});
addEventListener('resize', resize); resize(); requestAnimationFrame(frame);
