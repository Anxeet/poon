const screens = [...document.querySelectorAll('.screen')];
function show(id){
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  window.scrollTo({top:0,behavior:'smooth'});
  burst(window.innerWidth/2,window.innerHeight/2, id==='yes-screen'?65:20);
}
const stories = [
  ["Some people make<br>ordinary moments <em>glow.</em>","And somehow, you have a way of doing that without even trying."],
  ["A smile can stay<br>long after the moment <em>ends.</em>","I don't know if you realise it, but your smile has a way of making a day feel lighter."],
  ["The little things<br>become <em>memories.</em>","A photo, a laugh, a random conversation — sometimes the simplest things mean the most."],
  ["And there's one<br>thing I want to <em>ask.</em>","So, no dramatic speech. Just an honest little question from me to you."]
];
let storyIndex=0;
document.getElementById('begin').addEventListener('click',()=>{storyIndex=0;updateStory();show('story')});
function updateStory(){
  document.getElementById('counter').textContent=String(storyIndex+1).padStart(2,'0');
  document.getElementById('story-title').innerHTML=stories[storyIndex][0];
  document.getElementById('story-copy').textContent=stories[storyIndex][1];
}
document.getElementById('next-story').addEventListener('click',()=>{
  storyIndex++;
  if(storyIndex<stories.length){updateStory();burst(window.innerWidth/2,window.innerHeight/2,16)}
  else show('particle-scene');
});
document.getElementById('to-question').addEventListener('click',()=>show('letter'));
document.getElementById('yes').addEventListener('click',()=>{show('yes-screen');confettiBurst()});
document.getElementById('not-yet').addEventListener('click',()=>show('wait-screen'));
document.getElementById('back-question').addEventListener('click',()=>show('question'));
document.getElementById('replay').addEventListener('click',()=>{storyIndex=0;show('intro')});

// Soft particle field: no libraries or build tools required.
const canvas=document.getElementById('particles'),ctx=canvas.getContext('2d');
let w,h,dpr,particles=[];
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);w=innerWidth;h=innerHeight;
  canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  particles=Array.from({length:Math.min(150,Math.floor(w*h/8500))},()=>({
    x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.7+.35,
    speed:Math.random()*.24+.06,alpha:Math.random()*.55+.12,phase:Math.random()*6.28
  }));
}
function animate(t){
  ctx.clearRect(0,0,w,h);
  for(const p of particles){
    p.y-=p.speed;p.phase+=.008;
    if(p.y< -5){p.y=h+5;p.x=Math.random()*w}
    const a=p.alpha*(.65+.35*Math.sin(p.phase));
    ctx.beginPath();ctx.arc(p.x+Math.sin(p.phase)*5,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,145,190,${a})`;ctx.shadowBlur=10;ctx.shadowColor='#ff72ae';ctx.fill();
  }
  requestAnimationFrame(animate);
}
window.addEventListener('resize',resize);resize();requestAnimationFrame(animate);

function burst(x,y,count){
  for(let i=0;i<count;i++){
    const el=document.createElement('span');el.className='spark';
    el.textContent=Math.random()>.45?'✦':'·';el.style.left=x+'px';el.style.top=y+'px';
    el.style.fontSize=(8+Math.random()*15)+'px';
    el.style.setProperty('--dx',(Math.random()-.5)*260+'px');
    document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
  }
}
function confettiBurst(){
  const symbols=['♥','✦','✧','♡','·'];
  for(let i=0;i<100;i++)setTimeout(()=>{
    const el=document.createElement('span');el.className='spark';
    el.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    el.style.left=Math.random()*innerWidth+'px';el.style.top=(innerHeight*.65+Math.random()*innerHeight*.3)+'px';
    el.style.fontSize=(10+Math.random()*20)+'px';
    el.style.setProperty('--dx',(Math.random()-.5)*160+'px');
    document.body.appendChild(el);setTimeout(()=>el.remove(),1400);
  },i*12);
}


// Particle typography, heart and photo reveal. Uses the first uploaded portrait.
const artCanvas=document.getElementById('particle-art');
const artCtx=artCanvas.getContext('2d');
const particleCaption=document.getElementById('particle-caption');
const particleDescription=document.getElementById('particle-description');
const particleNext=document.getElementById('particle-next');
const photoForParticles=new Image();
photoForParticles.src='assets/poonam-red-saree.jpg';
let artW=0,artH=0,artDpr=1,artParticles=[],artTargets=[],artMode=0,artAnim=null;
function resizeArt(){
  const r=artCanvas.getBoundingClientRect();artDpr=Math.min(devicePixelRatio||1,2);
  artW=r.width;artH=r.height;artCanvas.width=artW*artDpr;artCanvas.height=artH*artDpr;
  artCtx.setTransform(artDpr,0,0,artDpr,0,0);
  if(artMode===0) setParticleTargets(makeTextTargets('POONAM'));
}
function sampleText(text){
  const off=document.createElement('canvas'),c=off.getContext('2d');
  off.width=700;off.height=260;c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
  c.font='700 145px Georgia, serif';c.fillText(text,350,132);
  return sampleCanvas(off,5,artW*.82,artH*.68);
}
function sampleCanvas(canvas,step,maxW,maxH){
  const c=canvas.getContext('2d'),data=c.getImageData(0,0,canvas.width,canvas.height).data;
  const scale=Math.min(maxW/canvas.width,maxH/canvas.height),ox=(artW-canvas.width*scale)/2,oy=(artH-canvas.height*scale)/2,pts=[];
  for(let y=0;y<canvas.height;y+=step)for(let x=0;x<canvas.width;x+=step){
    if(data[(y*canvas.width+x)*4+3]>100)pts.push({x:ox+x*scale,y:oy+y*scale});
  }
  return pts;
}
function makeTextTargets(t){return sampleText(t)}
function makeHeartTargets(){
  const pts=[],cx=artW/2,cy=artH/2-4,s=Math.min(artW,artH)*.017;
  for(let a=0;a<Math.PI*2;a+=.035){
    const x=16*Math.pow(Math.sin(a),3),y=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);
    pts.push({x:cx+x*s,y:cy-y*s});
  }
  // Fill the heart with softly distributed interior points.
  for(let i=0;i<650;i++){
    const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random());
    const x=16*Math.pow(Math.sin(a),3)*r,y=(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*r;
    pts.push({x:cx+x*s,y:cy-y*s});
  }
  return pts;
}
function makePhotoTargets(){
  if(!photoForParticles.complete||!photoForParticles.naturalWidth)return makeHeartTargets();
  const off=document.createElement('canvas'),c=off.getContext('2d');
  const maxW=Math.min(artW*.52,300),maxH=artH*.78,scale=Math.min(maxW/photoForParticles.width,maxH/photoForParticles.height);
  off.width=Math.max(1,Math.floor(photoForParticles.width*scale));off.height=Math.max(1,Math.floor(photoForParticles.height*scale));
  c.drawImage(photoForParticles,0,0,off.width,off.height);
  const pts=sampleCanvas(off,3,off.width,off.height);
  return pts;
}
function morphTo(targets){
  if(!artParticles.length){
    artParticles=Array.from({length:Math.max(900,targets.length)},()=>({x:Math.random()*artW,y:Math.random()*artH,tx:artW/2,ty:artH/2,v:Math.random()*6+3,size:Math.random()*1.5+.5}));
  }
  const count=Math.max(artParticles.length,targets.length);
  while(artParticles.length<count)artParticles.push({x:Math.random()*artW,y:Math.random()*artH,tx:0,ty:0,v:5,size:1});
  for(let i=0;i<artParticles.length;i++){
    const p=artParticles[i],t=targets[i%targets.length];
    p.tx=t.x+(Math.random()-.5)*1.3;p.ty=t.y+(Math.random()-.5)*1.3;
  }
  if(!artAnim)drawArt();
}
function drawArt(){
  artAnim=requestAnimationFrame(drawArt);
  artCtx.clearRect(0,0,artW,artH);
  for(const p of artParticles){
    p.x+=(p.tx-p.x)*.075;p.y+=(p.ty-p.y)*.075;
    const shimmer=.65+.35*Math.sin((p.x+p.y)*.025+performance.now()*.002);
    artCtx.beginPath();artCtx.arc(p.x,p.y,p.size,0,Math.PI*2);
    artCtx.fillStyle=`rgba(255,${125+Math.floor(shimmer*65)},${177+Math.floor(shimmer*60)},${.45+shimmer*.5})`;
    artCtx.shadowBlur=7;artCtx.shadowColor='#ff6eae';artCtx.fill();
  }
}
function setParticleScene(mode){
  artMode=mode;
  if(mode===0){
    particleCaption.textContent='POONAM';particleDescription.textContent='A name that deserves its own constellation.';particleNext.innerHTML='Let it bloom <span>✦</span>';morphTo(makeTextTargets('POONAM'));
  }else if(mode===1){
    particleCaption.textContent='A little heart, made of a thousand wishes';particleDescription.textContent='Every glowing point is a little reminder that you are special.';particleNext.innerHTML='And now, a memory <span>→</span>';morphTo(makeHeartTargets());
  }else{
    particleCaption.textContent='One of my favourite views';particleDescription.textContent='A little moment of you, appearing one glowing piece at a time.';particleNext.innerHTML='Keep going <span>♡</span>';morphTo(makePhotoTargets());
  }
}
particleNext.addEventListener('click',()=>{
  if(artMode<2)setParticleScene(artMode+1);
  else show('gallery');
});
const particleObserver=new MutationObserver(()=>{
  if(document.getElementById('particle-scene').classList.contains('active')){
    resizeArt();setParticleScene(0);
  }
});
particleObserver.observe(document.getElementById('particle-scene'),{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',resizeArt);
photoForParticles.onload=()=>{if(artMode===2)morphTo(makePhotoTargets())};

// Interactive envelope reveals the handwritten-style letter.
const envelope=document.getElementById('envelope');
const letterNext=document.getElementById('letter-next');
const letterHint=document.getElementById('letter-hint');
envelope.addEventListener('click',()=>{
  envelope.classList.add('open');
  letterHint.textContent='A small note, from me to you ♡';
  letterNext.disabled=false;
  burst(window.innerWidth/2,window.innerHeight*.52,35);
});
letterNext.addEventListener('click',()=>show('question'));

// Music starts only after the visitor chooses to begin the experience.
const song=document.getElementById('love-song');
const musicToggle=document.getElementById('music-toggle');
const musicLabel=document.getElementById('music-label');
function syncMusicButton(){
  const playing=!song.paused;
  musicToggle.classList.toggle('playing',playing);
  musicLabel.textContent=playing?'Now playing':'Play our song';
  musicToggle.setAttribute('aria-label',playing?'Pause music':'Play music');
}
async function playSong(){
  try{await song.play();}catch(err){musicLabel.textContent='Tap to play song';}
  syncMusicButton();
}
document.getElementById('begin').addEventListener('click',playSong);
musicToggle.addEventListener('click',async()=>{
  if(song.paused) await playSong();
  else {song.pause();syncMusicButton();}
});
song.addEventListener('play',syncMusicButton);
song.addEventListener('pause',syncMusicButton);
