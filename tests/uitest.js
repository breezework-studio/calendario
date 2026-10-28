const {JSDOM}=require('jsdom');
const html=require('fs').readFileSync(__dirname+'/../index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',
 beforeParse(w){ w.setTimeout=(f)=>setImmediate(f); w.confirm=()=>true; w.onerror=(m)=>{console.log('ERRO JS',m);process.exitCode=1;}; w.console.error=(...a)=>{console.log('console.error',...a);process.exitCode=1;}; }});
const w=dom.window, d=w.document;
const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const q=s=>d.querySelector(s), qa=s=>[...d.querySelectorAll(s)];
let rnd=1; const R=n=>{rnd=(rnd*1103515245+12345)%2147483648; return rnd%n;};
// setup: 3 players, seat0 human
click(q('[data-act=setn][data-n="'+(process.argv[2]||3)+'"]'));
click(q('[data-act=start]'));
let steps=0, humanTurns=0;
function tick(){
 if(steps++>20000){ console.log('demasiados passos', q('.turn')&&q('.turn').textContent, 'modal', q('#modal').className, q('#modal').textContent.slice(0,200)); process.exit(1); }
 const m=q('#modal.show');
 if(m){
  if(q('[data-act=wtile]')){ const t=qa('[data-act=wtile]'); click(t[0]); click(qa('[data-act=wtile]')[1]); click(q('[data-act=wconfirm]')); return setImmediate(tick); }
  if(q('[data-act=firstOk]')){ click(q('[data-act=firstOk]')); return setImmediate(tick); }
  if(q('[data-act=two]')){ click(qa('[data-act=two]')[R(2)]); return setImmediate(tick); }
  if(q('[data-act=choose]')){ const o=qa('[data-act=choose]'); click(o[R(o.length)]); const ds=q('[data-act=doSel]'); if(ds&&!ds.disabled) click(ds); return setImmediate(tick); }
  if(q('.res')){ console.log('FIM:', q('.res').textContent.replace(/\s+/g,' ')); console.log('turnos humanos',humanTurns); return; }
 }
 const bar=q('.turn'); if(!bar) return setTimeout(tick,5);
 if(/a jogar/.test(bar.textContent)) return setTimeout(tick,5);
 const beg=q('[data-act=beg].primary'); if(beg){ click(beg); return setImmediate(tick); }
 const end=q('[data-act=endturn]'); if(end){ humanTurns++; click(end); return setImmediate(tick); }
 const conf=q('[data-act=confirm]'); if(conf){ if(conf.disabled){ click(q('[data-act=undo]')); } else { humanTurns++; click(conf);} return setImmediate(tick); }
 const picks=qa('[data-act=pick]').concat(R(3)?[]:qa('path[data-act=gear]')), places=qa('[data-act=place]');
 if(picks.length && (R(2)||!places.length)){ click(picks[R(picks.length)]); return setImmediate(tick); }
 if(places.length){ click(places[R(places.length)]); return setImmediate(tick); }
 const res=q('[data-act=showEnd]'); if(res){ click(res); return setImmediate(tick); }
 console.log('preso:', bar.textContent); console.log(q('.log').textContent.slice(0,500)); process.exit(1);
}
setTimeout(tick,10);
