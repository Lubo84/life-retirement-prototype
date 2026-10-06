// A decorative pointer companion. Native cursor and hit targets stay intact.
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const halo=document.createElement('div');
halo.className='cursorHalo';
halo.setAttribute('aria-hidden','true');
document.body.append(halo);
let frame=0,x=0,y=0,drawX=0,drawY=0,visible=false;
const enabled=()=>finePointer.matches&&!reducedMotion.matches;
function hide(){visible=false;halo.classList.remove('visible','interactive');cancelAnimationFrame(frame);frame=0;}
function draw(){frame=0;if(!visible||!enabled())return;drawX+=(x-drawX)*.22;drawY+=(y-drawY)*.22;halo.style.transform=`translate3d(${drawX}px,${drawY}px,0)`;if(Math.abs(x-drawX)+Math.abs(y-drawY)>.2)frame=requestAnimationFrame(draw);}
window.addEventListener('pointermove',event=>{if(!enabled()||event.pointerType!=='mouse')return; x=event.clientX;y=event.clientY;if(!visible){drawX=x;drawY=y;visible=true;halo.classList.add('visible');}halo.classList.toggle('interactive',Boolean(event.target.closest('button,a,input,select,summary,[role="radio"]')));if(!frame)frame=requestAnimationFrame(draw);},{passive:true});
document.addEventListener('pointerleave',hide);
window.addEventListener('blur',hide);
document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
window.addEventListener('pointerdown',()=>{if(!enabled())return;halo.classList.add('pressed');});
window.addEventListener('pointerup',()=>halo.classList.remove('pressed'));
finePointer.addEventListener('change',hide);
reducedMotion.addEventListener('change',hide);
window.addEventListener('pagehide',hide,{once:true});
