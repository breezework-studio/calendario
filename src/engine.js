/* ===== MOTOR DE REGRAS ===== */
(function(){
'use strict';
const RES=['wood','stone','gold'];
const IC={corn:'🌽',wood:'🪵',stone:'🪨',gold:'🪙',skull:'💀',vp:'★'};
const RN={wood:'madeira',stone:'pedra',gold:'ouro'};
const MK={wood:2,stone:3,gold:4};
const GEARS=['pal','yax','tik','uxm','chi'];
const GI={
 pal:{name:'Palenque',teeth:10,max:7,free:6},
 yax:{name:'Yaxchilan',teeth:10,max:7,free:6},
 tik:{name:'Tikal',teeth:10,max:7,free:6},
 uxm:{name:'Uxmal',teeth:10,max:7,free:6},
 chi:{name:'Chichén Itzá',teeth:13,max:10,free:10}
};
const WCOST=[0,0,1,3,6,10,15];
const GOD=['Chaac','Quetzalcóatl','Kukulcán'];
// índice 0 = degrau de baixo, 1 = degrau inicial
const TEMPLES=[
 {vp:[-1,0,2,4,6,7,8],res:[null,null,'stone',null,'stone',null,null],bonus:[6,2]},
 {vp:[-2,0,1,2,4,6,9,12,13],res:[null,null,null,'gold',null,'gold',null,null,null],bonus:[2,6]},
 {vp:[-3,0,1,3,5,7,9,10],res:[null,null,'wood',null,'wood','skull',null,null],bonus:[4,4]}
];
const TECHN=['Agricultura','Extração','Arquitetura','Teologia'];
const TECHBON=['subir 1 templo','2 recursos','+3★','+1💀'];
const TECHLV=[
 ['+1🌽 ao colher na selva','Colher sem peça; +1🌽 a pescar','+2🌽 ao colher na selva'],
 ['+1🪵 em Yaxchilan/Palenque','+1🪨 em Yaxchilan','+1🪙 em Yaxchilan'],
 ['+1🌽 por edifício','+2★ por edifício','Edifício: −1 recurso (Tikal) / −2🌽 (Uxmal)'],
 ['Chichén: ação 1 à frente','Após Chichén: 1 recurso → +1 templo','+1💀 em Yaxchilan 4']
];
const FOOD={7:'mid',13:'end',20:'mid',26:'end'};
const PAL_CORN=[0,3,4,5,7,9], PAL_WOOD=[0,0,0,2,3,4];
const CHI=[null,{vp:4,t:0},{vp:5,t:0},{vp:6,t:0},{vp:7,t:2},{vp:8,t:2},{vp:8,t:2,r:1},{vp:10,t:1},{vp:11,t:1,r:1},{vp:13,t:1,r:1}];

const BLD=[
 {a:1,t:'farm',n:'Milharal',c:{wood:1},e:{farm:'one'}},
 {a:1,t:'farm',n:'Milharal',c:{wood:1},e:{farm:'one'}},
 {a:1,t:'farm',n:'Milharal',c:{wood:1},e:{farm:'one'}},
 {a:1,t:'farm',n:'Celeiro Comunal',c:{wood:4},e:{farm:'minus1'}},
 {a:1,t:'farm',n:'Celeiro Comunal',c:{wood:4},e:{farm:'minus1'}},
 {a:1,t:'tomb',n:'Altar dos Construtores',c:{wood:1,gold:1},e:{templeChoice:1,build:1}},
 {a:1,t:'tomb',n:'Altar do Sol e da Chuva',c:{wood:2,stone:1},e:{temples:[1,1,0]}},
 {a:1,t:'tomb',n:'Altar da Chuva e da Serpente',c:{wood:1,stone:2},e:{temples:[1,0,1]}},
 {a:1,t:'civic',n:'Casa dos Mineiros',c:{wood:2,stone:1},e:{gold:1,tech:1}},
 {a:1,t:'civic',n:'Casa dos Lavradores',c:{wood:3,stone:1},e:{stone:1,tech:0}},
 {a:1,t:'civic',n:'Casa da Semente',c:{wood:2},e:{tech:0}},
 {a:1,t:'civic',n:'Casa das Ferramentas',c:{wood:1,stone:1},e:{corn:1,tech:1}},
 {a:1,t:'shrine',n:'Santuário da Serpente',c:{stone:1,gold:1},e:{temples:[0,0,1],tech:3}},
 {a:1,t:'shrine',n:'Santuário dos Arquitetos',c:{gold:1},e:{tech:2}},
 {a:2,t:'tomb',n:'Grande Altar',c:{wood:1,stone:2,gold:1},e:{temples:[1,1,1],vp:3}},
 {a:2,t:'farm',n:'Socalcos',c:{wood:2},e:{farm:'three'}},
 {a:2,t:'farm',n:'Socalcos',c:{wood:2},e:{farm:'three'}},
 {a:2,t:'farm',n:'Socalcos',c:{wood:2},e:{farm:'three'}},
 {a:2,t:'tomb',n:'Bairro Novo',c:{wood:1,stone:1,gold:1},e:{worker:1,vp:6}},
 {a:2,t:'tomb',n:'Praça do Mercado',c:{stone:3},e:{market:1,vp:6}},
 {a:2,t:'tomb',n:'Posto de Comércio',c:{wood:2,stone:1,gold:1},e:{action:1,vp:2}},
 {a:2,t:'tomb',n:'Palácio',c:{wood:1,gold:2},e:{vp:8}},
 {a:2,t:'shrine',n:'Observatório',c:{stone:1,gold:2},e:{techChoice:2}},
 {a:2,t:'civic',n:'Academia das Caveiras',c:{wood:2,stone:2},e:{skull:1,techChoice:1}},
 {a:2,t:'civic',n:'Academia da Pedra',c:{wood:3},e:{stone:1,techChoice:1}},
 {a:2,t:'civic',n:'Academia do Milho',c:{wood:3,stone:1},e:{corn:6,techChoice:1}},
 {a:2,t:'civic',n:'Academia do Ouro',c:{wood:2,stone:1},e:{gold:1,techChoice:1}},
 {a:2,t:'shrine',n:'Santuário dos Mestres',c:{stone:1,gold:1},e:{tech:2,vp:3}},
 {a:2,t:'shrine',n:'Santuário da Chuva',c:{stone:2},e:{temples:[2,0,0],vp:2}},
 {a:2,t:'shrine',n:'Santuário da Serpente Verde',c:{gold:2},e:{temples:[0,0,2],vp:3}},
 {a:2,t:'shrine',n:'Santuário do Sol',c:{gold:3},e:{temples:[0,2,0],vp:4}},
 {a:2,t:'shrine',n:'Santuário dos Sábios',c:{stone:2,gold:1},e:{temples:[1,0,1],tech:3}}
];
const BTYPE={farm:'Quinta',civic:'Cívico (verde)',tomb:'Túmulo (castanho)',shrine:'Santuário (azul)'};
const cnt=(p,t)=>p.buildings.filter(b=>BLD[b].t===t).length;
const monCnt=(p,t)=>p.monuments.filter(m=>MON[m].t===t).length;
const MON=[
 {n:'Necrópole',t:'tomb',c:{wood:3,stone:2,gold:1},d:'4★ por cada túmulo (castanho) teu, edifício ou monumento (este conta)',f:(s,p)=>4*(cnt(p,'tomb')+monCnt(p,'tomb'))},
 {n:'Fórum',t:'civic',c:{wood:2,stone:3,gold:1},d:'4★ por cada edifício cívico (verde) teu, edifício ou monumento (este conta)',f:(s,p)=>4*(cnt(p,'civic')+monCnt(p,'civic'))},
 {n:'Basílica',t:'shrine',c:{stone:2,gold:3},d:'4★ por cada santuário (azul) teu, edifício ou monumento (este conta)',f:(s,p)=>4*(cnt(p,'shrine')+monCnt(p,'shrine'))},
 {n:'Grande Cidade',t:'tomb',c:{wood:1,stone:3,gold:2},d:'2★ por cada edifício e monumento teu',f:(s,p)=>2*(p.buildings.length+p.monuments.length)},
 {n:'Casa do Povo',t:'civic',c:{wood:3,gold:3},d:'Trabalhadores em jogo: 3→0★, 4→6★, 5→12★, 6→18★',f:(s,p)=>[0,0,0,0,6,12,18][p.workers]},
 {n:'Escadaria Sagrada',t:'shrine',c:{stone:3,gold:3},d:'Escolhe um templo: 3★ por degrau acima do início',f:(s,p)=>3*Math.max(0,...p.temples.map(x=>x-1))},
 {n:'Avenida dos Monumentos',t:'tomb',c:{wood:2,stone:2,gold:2},d:'Por monumento construído por qualquer jogador (este conta): 6★ (2j), 5★ (3j), 4★ (4j)',f:(s,p)=>s.monBuilt*({2:6,3:5,4:4}[s.n])},
 {n:'Biblioteca',t:'civic',c:{wood:2,stone:1,gold:3},d:'3★ por cada nível de tecnologia',f:(s,p)=>3*p.tech.reduce((a,b)=>a+b,0)},
 {n:'Altar dos Três Deuses',t:'shrine',c:{stone:4,gold:3},d:'Volta a pontuar os ★ do degrau atual em cada templo (sem bónus)',f:(s,p)=>p.temples.reduce((a,x,t)=>a+TEMPLES[t].vp[x],0)},
 {n:'Celeiro Sagrado',t:'tomb',c:{wood:1,stone:1,gold:4},d:'4★ por cada peça de milho colhida',f:(s,p)=>4*p.cornTiles},
 {n:'Torre dos Sábios',t:'civic',c:{wood:1,stone:1,gold:3},d:'Tecnologias no nível 3: 1→9★, 2→20★, 3 ou 4→33★',f:(s,p)=>[0,9,20,33,33][p.tech.filter(x=>x>=3).length]},
 {n:'Cenote Sagrado',t:'shrine',c:{gold:4,skull:1},d:'3★ por cada caveira em Chichén Itzá (de qualquer jogador)',f:(s,p)=>3*s.chi.filter(x=>x!=null).length},
 {n:'Serração',t:'tomb',c:{wood:1,gold:4},d:'4★ por cada peça de madeira recolhida (queimadas não contam)',f:(s,p)=>4*p.woodTiles}
];
const TILES=[
 {e:{corn:4,wood:1,skull:1},g:'chi',a:0},{e:{corn:5,stone:1,tech:3},g:'chi',a:3},{e:{corn:4,wood:3},g:'chi',a:5},
 {e:{corn:2,wood:2,tech:3},g:'chi',a:7},{e:{corn:7,wood:2},g:'chi',a:10},
 {e:{corn:5,stone:1,temples:[1,0,0]},g:'uxm',a:1},{e:{corn:3,wood:1,farm:'one'},g:'uxm',a:3},{e:{worker:1},g:'uxm',a:5},{e:{corn:8,gold:1},g:'uxm',a:7},
 {e:{wood:1,temples:[0,0,1],tech:1},g:'yax',a:1},{e:{corn:2,wood:2,temples:[0,0,1]},g:'yax',a:3},{e:{corn:4,wood:1,tech:1},g:'yax',a:5},{e:{corn:3,wood:2,stone:1},g:'yax',a:7},
 {e:{corn:3,temples:[0,1,0],tech:0},g:'pal',a:1},{e:{corn:5,gold:1,temples:[0,1,0]},g:'pal',a:3},{e:{stone:1,gold:1,tech:0},g:'pal',a:5},{e:{corn:9,stone:1},g:'pal',a:7},
 {e:{corn:2,temples:[1,0,0],tech:2},g:'tik',a:1},{e:{corn:6,stone:2},g:'tik',a:3},{e:{corn:3,gold:1,tech:2},g:'tik',a:5},{e:{corn:6,wood:1,stone:1},g:'tik',a:7}
];
const COLORS=['#d6453a','#e8b923','#2f7fd8','#45a845'];
const CNAMES=['Vermelho','Amarelo','Azul','Verde'];

/* ---------- utilitários ---------- */
function rnd(s){ s.seed=(s.seed+0x6D2B79F5)|0; let t=s.seed; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }
function shuffle(s,a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd(s)*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
const N=(label,run,x)=>Object.assign({label,run},x||{});
const DONE=()=>[];
const costTxt=c=>[...RES,'skull'].filter(r=>c[r]).map(r=>IC[r].repeat(c[r])).join('')||'grátis';
const blocks=p=>p.wood+p.stone+p.gold;
const canPay=(p,c)=>[...RES,'skull'].every(r=>(p[r]||0)>=(c[r]||0));
const pay=(p,c)=>[...RES,'skull'].forEach(r=>p[r]-=(c[r]||0));
function log(s,msg){ s.log.push(msg); if(s.log.length>120) s.log.shift(); }
function logp(s,pid,msg){ log(s,`${s.players[pid].name}: ${msg}`); }
const curPid=s=>(s.first+s.turnIdx)%s.n;
const occupied=(s,g,pos)=>s.workers.some(w=>w.gear===g&&w.pos===pos);
const ownOnGears=(s,pid)=>s.workers.filter(w=>w.owner===pid).length;
function availWorkers(s,pid){ return s.players[pid].workers-ownOnGears(s,pid)-(s.startWorker===pid?1:0); }
const canAnger=p=>p.temples.some(x=>x>0);
const topOf=t=>TEMPLES[t].vp.length-1;

function effText(e){
 const out=[];
 if(e.corn) out.push(`+${e.corn}🌽`);
 RES.forEach(r=>{ if(e[r]) out.push(`+${e[r]}${IC[r]}`); });
 if(e.skull) out.push(`+${e.skull}💀`);
 if(e.vp) out.push(`+${e.vp}★`);
 if(e.temples) e.temples.forEach((x,t)=>{ if(x) out.push(`${GOD[t]} +${x}`); });
 if(e.templeChoice) out.push(`+${e.templeChoice} templo à escolha`);
 if(e.tech!=null) out.push(`${TECHN[e.tech]} +1`);
 if(e.techChoice) out.push(e.techChoice===1?'+1 tecnologia à escolha':'2 níveis de tecnologia (numa ou em duas)');
 if(e.worker) out.push('+1 trabalhador');
 if(e.farm==='one') out.push('1 trabalhador come de graça');
 if(e.farm==='three') out.push('3 trabalhadores comem de graça');
 if(e.farm==='minus1') out.push('cada trabalhador come −1🌽');
 if(e.build) out.push('podes construir 1 edifício (como Tikal 2)');
 if(e.market) out.push('usar o mercado');
 if(e.action) out.push('pagar 1🌽 e fazer 1 ação noutra roda');
 return out.join(', ');
}
function actLabel(g,a){
 const gi=GI[g]; if(a===0) return 'sem ação'; if(a>gi.max) return '';
 if(a>=gi.free) return 'qualquer ação desta roda';
 if(g==='pal') return ['','Pescar 3🌽','4🌽 (milho)','5🌽 ou 2🪵','7🌽 ou 3🪵','9🌽 ou 4🪵'][a];
 if(g==='yax') return ['','1🪵','1🪨 +1🌽','1🪙 +2🌽','1💀','1🪙 1🪨 +2🌽'][a];
 if(g==='tik') return ['','1 tecnologia','1 edifício','1–2 tecnologias','1–2 edifícios ou 1 monumento','2 templos diferentes (paga 1 recurso)'][a];
 if(g==='uxm') return ['','3🌽 → 1 templo','Mercado','+1 trabalhador','Edifício pago em 🌽','1🌽 → ação noutra roda'][a];
 const c=CHI[a]; return `💀 → ${c.vp}★ + ${GOD[c.t]}${c.r?' + 1 recurso':''}`;
}

/* ---------- novo jogo ---------- */
function newGame(cfg){
 const n=cfg.players.length;
 const s={seed:(cfg.seed|0)||12345,n,day:0,round:1,first:0,turnIdx:0,players:[],workers:[],wid:1,startWorker:null,accCorn:0,
  pendingFood:null,endCount:0,age:1,skullBank:13,chi:Array(10).fill(null),jungle:{},deck1:[],deck2:[],slots:[],monuments:[],
  monBuilt:0,log:[],phase:'wealth',over:false,turn:null,hands:[],dummyTiles:[],result:null};
 for(let i=0;i<n;i++) s.players.push({id:i,name:cfg.players[i].name||CNAMES[i],bot:!!cfg.players[i].bot,color:COLORS[i],
  corn:0,wood:0,stone:0,gold:0,skull:0,vp:0,temples:[1,1,1],tech:[0,0,0,0],workers:3,light:true,buildings:[],monuments:[],
  farms:[],cornTiles:0,woodTiles:0,wealthChosen:null});
 const fp=n===4?4:n===3?3:2;
 for(let a=2;a<=5;a++){ s.jungle[a]=[]; for(let i=0;i<fp;i++) s.jungle[a].push({wood:a>=3,corn:true}); }
 BLD.forEach((b,i)=>(b.a===1?s.deck1:s.deck2).push(i)); shuffle(s,s.deck1); shuffle(s,s.deck2);
 for(let i=0;i<6;i++) s.slots.push(s.deck1.pop());
 s.monuments=shuffle(s,MON.map((m,i)=>i)).slice(0,{2:4,3:5,4:6}[n]);
 const tiles=shuffle(s,TILES.map((t,i)=>i));
 for(let i=0;i<n;i++) s.hands.push(tiles.splice(0,4));
 if(n<4){
  const lim=n===3?6:12; let placed=0; const firstOn={};
  while(placed<lim && tiles.length){
   const ti=tiles.shift(); const T=TILES[ti]; s.dummyTiles.push(ti);
   if(!occupied(s,T.g,T.a)){ s.workers.push({id:s.wid++,owner:-1,gear:T.g,pos:T.a}); placed++; }
   if(!firstOn[T.g]){ firstOn[T.g]=1;
    if(T.g!=='chi' && placed<lim){ const op=(T.a+5)%10; if(!occupied(s,T.g,op)){ s.workers.push({id:s.wid++,owner:-1,gear:T.g,pos:op}); placed++; } } }
  }
 }
 s.first=Math.floor(rnd(s)*n);
 log(s,`Novo jogo com ${n} jogadores. Começa ${s.players[s.first].name}.`);
 return s;
}
function chooseWealth(s,pid,arr){
 const p=s.players[pid]; p.wealthChosen=arr.slice();
 arr.forEach(ti=>runAuto(s,pid,effGen(pid,TILES[ti].e,DONE)));
 logp(s,pid,`riqueza inicial: ${arr.map(ti=>effText(TILES[ti].e)).join(' | ')}`);
 if(s.players.every(q=>q.wealthChosen)){ s.phase='play'; s.turnIdx=0; beginTurn(s); }
}
function runAuto(s,pid,gen){ let ns=gen(s); while(ns.length) ns=ns[0].run(s); }

/* ---------- templos ---------- */
function canUp(s,pid,t){ const p=s.players[pid]; const i=p.temples[t], top=topOf(t);
 if(i>=top) return false; if(i+1===top && s.players.some(q=>q.id!==pid && q.temples[t]===top)) return false; return true; }
function templeUp(s,pid,t){ if(!canUp(s,pid,t)) return false; const p=s.players[pid]; p.temples[t]++; if(p.temples[t]===topOf(t)) p.light=true; return true; }
function templeChoice(pid,n,k){ return s=>{ const out=[];
 for(let t=0;t<3;t++) if(canUp(s,pid,t)) out.push(N(`Subir no templo de ${GOD[t]}`, s=>{ templeUp(s,pid,t); return n>1?templeChoice(pid,n-1,k)(s):k(s); }));
 return out.length?out:k(s); }; }
function templeDown(pid,k){ return s=>{ const out=[]; const p=s.players[pid];
 for(let t=0;t<3;t++) if(p.temples[t]>0) out.push(N(`Descer no templo de ${GOD[t]}`, s=>{ s.players[pid].temples[t]--; return k(s); }));
 return out.length?out:k(s); }; }

/* ---------- recursos ---------- */
function payAny(pid,n,k){ return s=>{ const p=s.players[pid]; const out=[];
 for(let a=0;a<=n;a++) for(let b=0;b<=n-a;b++){ const c={wood:a,stone:b,gold:n-a-b}; if(canPay(p,c)) out.push(N(`Pagar ${costTxt(c)}`, s=>{ pay(s.players[pid],c); return k(s); })); }
 return out; }; }
function gain1(pid,k){ return s=>RES.map(r=>N(`Receber 1 ${RN[r]} ${IC[r]}`, s=>{ s.players[pid][r]++; return k(s); })); }
function gain2(pid,k){ return s=>{ const out=[]; for(let a=0;a<=2;a++) for(let b=0;b<=2-a;b++){ const c={wood:a,stone:b,gold:2-a-b};
 out.push(N(`Receber ${costTxt(c)}`, s=>{ const P=s.players[pid]; RES.forEach(r=>P[r]+=c[r]); return k(s); })); } return out; }; }
function market(pid,k){ const g=s=>{ const p=s.players[pid]; const out=[];
 RES.forEach(r=>{ if(p[r]>0) out.push(N(`Vender 1 ${RN[r]} → +${MK[r]}🌽`, s=>{ const P=s.players[pid]; P[r]--; P.corn+=MK[r]; return g(s); },{loop:1})); });
 RES.forEach(r=>{ if(p.corn>=MK[r]) out.push(N(`Comprar 1 ${RN[r]} por ${MK[r]}🌽`, s=>{ const P=s.players[pid]; P[r]++; P.corn-=MK[r]; return g(s); },{loop:1})); });
 out.push(N('Terminar trocas', k)); return out; }; return g; }

/* ---------- tecnologia ---------- */
function techBonus(pid,t,k){ return s=>{ const P=s.players[pid];
 if(t===0) return templeChoice(pid,1,k)(s);
 if(t===1) return gain2(pid,k)(s);
 if(t===2){ P.vp+=3; return k(s); }
 if(s.skullBank>0){ s.skullBank--; P.skull++; } return k(s); }; }
function techAdv(pid,t,paid,k){ return s=>{ const p=s.players[pid]; const c=p.tech[t]<3?p.tech[t]+1:1;
 const doIt=s=>{ const P=s.players[pid]; if(P.tech[t]<3){ P.tech[t]++; return k(s); } return techBonus(pid,t,k)(s); };
 return paid?payAny(pid,c,doIt)(s):doIt(s); }; }
function techChoice(pid,n,paid,k,canStop){ return s=>{ const p=s.players[pid]; const out=[];
 for(let t=0;t<4;t++){ const lv=p.tech[t]; const c=lv<3?lv+1:1; if(paid && blocks(p)<c) continue;
  const lab=lv<3?`${TECHN[t]} → nível ${lv+1}${paid?` (paga ${c} recurso${c>1?'s':''})`:''}`:`${TECHN[t]}: bónus ${TECHBON[t]}${paid?' (paga 1 recurso)':''}`;
  const after=n>1?techChoice(pid,n-1,paid,k,true):k;
  out.push(N(lab, s=>techAdv(pid,t,paid,after)(s))); }
 if(canStop){ if(!out.length) return k(s); out.push(N('Não avançar mais', k)); }
 return out; }; }

/* ---------- edifícios e monumentos ---------- */
function finishBuild(pid,i,applyArch,k){ return s=>{ const P=s.players[pid]; const bid=s.slots[i]; s.slots[i]=null; P.buildings.push(bid);
 if(applyArch){ if(P.tech[2]>=1) P.corn++; if(P.tech[2]>=2) P.vp+=2; }
 return effGen(pid,BLD[bid].e,k)(s); }; }
function build(pid,mode,k){ return s=>{ const p=s.players[pid]; const out=[]; const arch=p.tech[2]; const useArch=mode!=='tikNoArch';
 s.slots.forEach((bid,i)=>{ if(bid==null) return; const b=BLD[bid];
  if(mode==='uxm'){ const nb=RES.reduce((a,r)=>a+(b.c[r]||0),0); const cost=Math.max(0,2*nb-(arch>=3?2:0));
   if(p.corn>=cost) out.push(N(`Construir ${b.n} por ${cost}🌽`, s=>{ s.players[pid].corn-=cost; return finishBuild(pid,i,true,k)(s); },{bld:bid,paid:`${cost}🌽`,arch:archTxt(arch,true)}));
   return; }
  let vars=[b.c];
  if(useArch && arch>=3){ vars=RES.filter(r=>b.c[r]).map(r=>{ const c=Object.assign({},b.c); c[r]--; return c; }); }
  const seen={}; vars.forEach(c=>{ const key=costTxt(c); if(seen[key]) return; seen[key]=1;
   if(canPay(p,c)) out.push(N(`Construir ${b.n} (paga ${key})`, s=>{ pay(s.players[pid],c); return finishBuild(pid,i,useArch,k)(s); },{bld:bid,paid:key,arch:archTxt(arch,useArch),noArch:!useArch&&arch>0})); });
 });
 return out; }; }
function archTxt(a,use){ if(!use||a<1) return ''; return 'Arquitetura: +1🌽'+(a>=2?' +2★':''); }
function buildOpt(pid,k){ return s=>{ const ns=build(pid,'tik',k)(s); return ns.length?[...ns,N('Não construir',k)]:k(s); }; }
function tik4(pid,k){ return s=>{ const p=s.players[pid]; const arch=p.tech[2]; const out=[];
 const second=mode=>s=>{ const ns=build(pid,mode,k)(s); return ns.length?[...ns,N('Não construir um segundo edifício',k)]:k(s); };
 if(arch>0){
  build(pid,'tik',second('tikNoArch'))(s).forEach(n=>out.push(n));
 } else build(pid,'tik',second('tik'))(s).forEach(n=>out.push(n));
 s.monuments.forEach((mid,i)=>{ if(mid==null) return; const m=MON[mid];
  if(canPay(p,m.c)) out.push(N(`Construir monumento ${m.n} (paga ${costTxt(m.c)})`, s=>{ const P=s.players[pid]; pay(P,m.c); s.monuments[i]=null; P.monuments.push(mid); s.monBuilt++; return k(s); },{mon:mid,paid:costTxt(m.c)})); });
 return out; }; }

/* ---------- efeitos (edifícios / riqueza inicial) ---------- */
function effGen(pid,e,k){ return s=>{ const P=s.players[pid];
 if(e.corn) P.corn+=e.corn; RES.forEach(r=>{ if(e[r]) P[r]+=e[r]; });
 if(e.skull){ const g=Math.min(e.skull,s.skullBank); s.skullBank-=g; P.skull+=g; }
 if(e.vp) P.vp+=e.vp;
 if(e.worker && P.workers<6) P.workers++;
 if(e.farm) P.farms.push(e.farm);
 if(e.temples) e.temples.forEach((x,t)=>{ for(let i=0;i<x;i++) templeUp(s,pid,t); });
 let g=k;
 if(e.action) g=(kk=>s=>{ if(s.players[pid].corn<1) return kk(s); const ns=act(pid,'uxm',5,kk)(s); return ns.length?[...ns,N('Não usar',kk)]:kk(s); })(g);
 if(e.market) g=market(pid,g);
 if(e.build) g=buildOpt(pid,g);
 if(e.techChoice) g=techChoice(pid,e.techChoice,false,g,false);
 if(e.tech!=null) g=techAdv(pid,e.tech,false,g);
 if(e.templeChoice) g=templeChoice(pid,e.templeChoice,g);
 return g(s); }; }

/* ---------- ações das rodas ---------- */
function avail(s,pid,g,a){ return act(pid,g,a,DONE)(clone(s)).length>0; }
function freeChoice(pid,g,k){ return s=>{ const out=[]; const lim=g==='chi'?9:5;
 for(let a=1;a<=lim;a++) if(avail(s,pid,g,a)) out.push(N(`${GI[g].name} ${a}: ${actLabel(g,a)}`, s=>act(pid,g,a,k)(s)));
 return out; }; }
const agriBonus=p=>(p.tech[0]>=1?1:0)+(p.tech[0]>=3?2:0);
function act(pid,g,a,k){ return s=>{ const p=s.players[pid]; const gi=GI[g];
 if(a<=0) return [];
 if(a>=gi.free) return freeChoice(pid,g,k)(s);
 const simple=(lab,fn)=>[N(lab, s=>{ fn(s.players[pid],s); return k(s); })];
 if(g==='pal'){
  if(a===1){ const c=3+(p.tech[0]>=2?1:0); return simple(`Pescar: +${c}🌽`,P=>P.corn+=c); }
  const F=s.jungle[a]; const cAmt=PAL_CORN[a]+agriBonus(p); const wAmt=PAL_WOOD[a]+(p.tech[1]>=1?1:0);
  const wi=F.findIndex(f=>f.wood), ci=F.findIndex(f=>!f.wood&&f.corn); const out=[];
  if(wi>=0){
   out.push(N(`Recolher madeira: +${wAmt}🪵`, s=>{ const P=s.players[pid]; s.jungle[a][wi].wood=false; P.wood+=wAmt; P.woodTiles++; return k(s); }));
   if(canAnger(p)) out.push(N(`Queimar a floresta: +${cAmt}🌽 (zanga os deuses: desce 1 templo)`, s=>{ const P=s.players[pid]; const f=s.jungle[a][wi]; f.wood=false; f.corn=false; P.corn+=cAmt; P.cornTiles++; return templeDown(pid,k)(s); }));
  }
  if(ci>=0) out.push(N(`Colher milho: +${cAmt}🌽`, s=>{ const P=s.players[pid]; s.jungle[a][ci].corn=false; P.corn+=cAmt; P.cornTiles++; return k(s); }));
  else if(p.tech[0]>=2) out.push(N(`Colher milho sem peça: +${cAmt}🌽`, s=>{ s.players[pid].corn+=cAmt; return k(s); }));
  return out;
 }
 if(g==='yax'){ const R=p.tech[1];
  if(a===1){ const w=1+(R>=1?1:0); return simple(`+${w}🪵`,P=>P.wood+=w); }
  if(a===2){ const st=1+(R>=2?1:0); return simple(`+${st}🪨 +1🌽`,P=>{P.stone+=st;P.corn+=1;}); }
  if(a===3){ const go=1+(R>=3?1:0); return simple(`+${go}🪙 +2🌽`,P=>{P.gold+=go;P.corn+=2;}); }
  if(a===4){ if(s.skullBank<=0) return []; const n=Math.min(s.skullBank,1+(p.tech[3]>=3?1:0)); return simple(`+${n}💀`,(P,s)=>{ s.skullBank-=n; P.skull+=n; }); }
  const go=1+(R>=3?1:0), st=1+(R>=2?1:0); return simple(`+${go}🪙 +${st}🪨 +2🌽`,P=>{P.gold+=go;P.stone+=st;P.corn+=2;});
 }
 if(g==='tik'){
  if(a===1) return techChoice(pid,1,true,k,false)(s);
  if(a===2) return build(pid,'tik',k)(s);
  if(a===3) return techChoice(pid,2,true,k,false)(s);
  if(a===4) return tik4(pid,k)(s);
  if(blocks(p)<1) return [];
  return [[0,1],[0,2],[1,2]].map(([x,y])=>N(`Subir em ${GOD[x]} e ${GOD[y]} (paga 1 recurso)`, s=>payAny(pid,1,s=>{ templeUp(s,pid,x); templeUp(s,pid,y); return k(s); })(s)));
 }
 if(g==='uxm'){
  if(a===1){ if(p.corn<3) return []; return [N('Pagar 3🌽 e subir 1 templo', s=>{ s.players[pid].corn-=3; return templeChoice(pid,1,k)(s); })]; }
  if(a===2) return market(pid,k)(s);
  if(a===3){ if(p.workers>=6) return []; return simple('+1 trabalhador',P=>P.workers++); }
  if(a===4) return build(pid,'uxm',k)(s);
  if(p.corn<1) return []; const out=[];
  ['pal','yax','tik','uxm'].forEach(g2=>{ for(let b=1;b<=5;b++){ if(g2==='uxm'&&b===5) continue;
   const t=clone(s); t.players[pid].corn-=1; if(!act(pid,g2,b,DONE)(t).length) continue;
   out.push(N(`Pagar 1🌽 → ${GI[g2].name} ${b}: ${actLabel(g2,b)}`, s=>{ s.players[pid].corn-=1; return act(pid,g2,b,k)(s); })); } });
  return out;
 }
 // Chichén Itzá
 if(p.skull<1 || s.chi[a]!=null) return [];
 const c=CHI[a];
 return [N(`Colocar 💀: +${c.vp}★, ${GOD[c.t]} +1${c.r?', +1 recurso':''}`, s=>{ const P=s.players[pid]; P.skull--; s.chi[a]=pid; P.vp+=c.vp; templeUp(s,pid,c.t);
  const after=s=>{ const Q=s.players[pid]; if(Q.tech[3]>=2 && blocks(Q)>0) return [N('Teologia: gastar 1 recurso para subir 1 templo', s=>payAny(pid,1,templeChoice(pid,1,k))(s)), N('Não gastar', k)]; return k(s); };
  return c.r?gain1(pid,after)(s):after(s); })];
}; }

/* ---------- recolher trabalhador ---------- */
function removeW(s,wid){ s.workers=s.workers.filter(w=>w.id!==wid); }
function pickGen(pid,wid){ return s=>{ const w=s.workers.find(x=>x.id===wid); if(!w) return []; const p=s.players[pid];
 const g=w.gear, q=w.pos, gi=GI[g]; const cands=new Map();
 const add=(a,c)=>{ if(!cands.has(a)||cands.get(a)>c) cands.set(a,c); };
 if(g!=='chi'){ if(q>=gi.free){ for(let a=1;a<gi.free;a++) add(a,0); } else for(let a=1;a<=q;a++) add(a,q-a); }
 else { if(q>=10){ for(let a=1;a<=9;a++) add(a,0); } else { for(let a=1;a<=q;a++) add(a,q-a);
  if(p.tech[3]>=1){ if(q+1<=9) add(q+1,0); else for(let a=1;a<=9;a++) add(a,0); } } }
 const out=[];
 [...cands.entries()].sort((x,y)=>x[0]-y[0]).forEach(([a,c])=>{
  if(p.corn<c) return; const t=clone(s); removeW(t,wid); t.players[pid].corn-=c; if(!act(pid,g,a,DONE)(t).length) return;
  const lab=`${gi.name} ${a}: ${actLabel(g,a)}${c?` (paga ${c}🌽 para recuar)`:''}${g==='chi'&&a===q+1&&q<10?' (Teologia)':''}`;
  out.push(N(lab, s=>{ removeW(s,wid); s.players[pid].corn-=c; s.turn.picks++; return act(pid,g,a,DONE)(s); },{pa:a,pc:c,here:a===q&&c===0}));
 });
 out.push(N('Recolher sem fazer ação', s=>{ removeW(s,wid); s.turn.picks++; return []; },{none:1}));
 return out; }; }

/* ---------- turnos ---------- */
function beginTurn(s){ s.turn={pid:curPid(s),acted:false,mode:null,begged:false,placedStart:false,picks:0}; }
function nextFreePos(s,g,extra){ const occ=new Set(s.workers.filter(w=>w.gear===g).map(w=>w.pos)); (extra||[]).forEach(x=>occ.add(x));
 for(let q=0;q<=GI[g].max;q++) if(!occ.has(q)) return q; return -1; }
function planPlacement(s,pid,list){ const extra={}; let cost=0; const spots=[]; let st=false;
 for(const g of list){ if(g==='start'){ if(s.startWorker!==null||st) return {ok:false}; st=true; spots.push({gear:'start',pos:0}); continue; }
  const q=nextFreePos(s,g,extra[g]); if(q<0) return {ok:false}; (extra[g]=extra[g]||[]).push(q); cost+=q; spots.push({gear:g,pos:q}); }
 if(list.length>6) return {ok:false}; cost+=WCOST[list.length]; return {ok:true,cost,spots}; }
function minCost1(s,pid){ let m=99; GEARS.forEach(g=>{ const q=nextFreePos(s,g); if(q>=0) m=Math.min(m,q); }); if(s.startWorker===null) m=0; return m; }
function placeRaw(s,pid,list){ const pl=planPlacement(s,pid,list); if(!pl.ok) return false; const p=s.players[pid]; p.corn-=pl.cost;
 pl.spots.forEach(sp=>{ if(sp.gear==='start'){ s.startWorker=pid; if(s.turn) s.turn.placedStart=true; } else s.workers.push({id:s.wid++,owner:pid,gear:sp.gear,pos:sp.pos}); });
 return pl; }
function commitPlacement(s,pid,list){ const pl=planPlacement(s,pid,list); const p=s.players[pid];
 if(!pl.ok||!list.length||pl.cost>p.corn||list.length>availWorkers(s,pid)) return false;
 placeRaw(s,pid,list); s.turn.acted=true; s.turn.mode='place';
 logp(s,pid,`coloca ${pl.spots.map(sp=>sp.gear==='start'?'no Espaço do Jogador Inicial':`${GI[sp.gear].name} ${sp.pos}`).join(', ')} (custo ${pl.cost}🌽)`);
 return true; }
const canBeg=(s,pid)=>{ const p=s.players[pid]; return p.corn<=2 && canAnger(p) && !s.turn.acted && !s.turn.begged; };
const forcedBeg=(s,pid)=>ownOnGears(s,pid)===0 && minCost1(s,pid)>s.players[pid].corn && canBeg(s,pid);
const pityNeeded=(s,pid)=>!s.turn.acted && ownOnGears(s,pid)===0 && minCost1(s,pid)>s.players[pid].corn && !canBeg(s,pid);
function begNode(pid){ return N('Mendigar milho (fica com 3🌽 e desce 1 templo)', s=>{ s.players[pid].corn=3; s.turn.begged=true; return templeDown(pid,DONE)(s); }); }
function doPity(s,pid){ let best=null; GEARS.forEach(g=>{ const q=nextFreePos(s,g); if(q>=0&&(!best||q<best.q)) best={g,q}; });
 const p=s.players[pid]; const g=(s.startWorker===null)?'start':best.g; placeRaw(s,pid,[g]); p.corn=0; s.turn.acted=true; s.turn.mode='place';
 logp(s,pid,`os deuses têm pena: coloca 1 trabalhador em ${g==='start'?'Jogador Inicial':GI[g].name} e entrega todo o milho`); }
function refill(s){ const deck=s.age===1?s.deck1:s.deck2; for(let i=0;i<6;i++) if(s.slots[i]==null && deck.length) s.slots[i]=deck.pop(); }
function endTurn(s){ const pid=s.turn.pid; refill(s);
 if(s.turn.placedStart && s.accCorn>0){ s.players[pid].corn+=s.accCorn; logp(s,pid,`recolhe ${s.accCorn}🌽 acumulado no calendário`); s.accCorn=0; }
 s.turnIdx++; if(s.turnIdx<s.n) beginTurn(s); }

/* ---------- fim da ronda / calendário ---------- */
function canTwoDays(s){ if(s.startWorker===null) return false; const p=s.players[s.startWorker]; if(!p.light) return false;
 if(s.day+2>26) return false; return !s.workers.some(w=>w.owner>=0 && w.pos===GI[w.gear].max-1); }
function advanceWorkers(s,days){ for(let d=0;d<days;d++){ s.workers.forEach(w=>w.pos++);
 s.workers=s.workers.filter(w=>{ if(w.owner<0){ w.pos%=GI[w.gear].teeth; return true; } return w.pos<=GI[w.gear].max; }); } }
function feedInfo(p){ let free=0,m=0; p.farms.forEach(f=>{ if(f==='one') free+=1; else if(f==='three') free+=3; else m++; });
 const per=m>=2?0:(m===1?1:2); const need=Math.max(0,p.workers-free); return {per,need,cost:per*need}; }
function doFood(s,type){
 log(s,`— Dia de comida (${type==='mid'?'meio da era':'fim da era'}) —`);
 s.players.forEach(p=>{ const fi=feedInfo(p); let fed=fi.need; if(fi.per>0){ fed=Math.min(fi.need,Math.floor(p.corn/fi.per)); p.corn-=fed*fi.per; }
  const un=fi.need-fed; if(un>0) p.vp-=3*un; log(s,`${p.name} paga ${fed*fi.per}🌽 de comida${un?` e perde ${3*un}★ (${un} sem comer)`:''}`); });
 if(type==='end' && s.endCount===0){ s.slots=[]; for(let i=0;i<6;i++) s.slots.push(s.deck2.length?s.deck2.pop():null); s.age=2; log(s,'Começa a 2.ª era: novos edifícios.'); }
 if(type==='mid'){ let need=0; const gains=s.players.map(p=>{ const g={wood:0,stone:0,gold:0,skull:0};
   TEMPLES.forEach((T,t)=>{ for(let i=2;i<=p.temples[t];i++){ const r=T.res[i]; if(r) g[r]++; } }); need+=g.skull; return g; });
  const ok=need<=s.skullBank;
  s.players.forEach((p,i)=>{ const g=gains[i]; RES.forEach(r=>p[r]+=g[r]); if(ok){ p.skull+=g.skull; s.skullBank-=g.skull; }
   const txt=RES.filter(r=>g[r]).map(r=>`${g[r]}${IC[r]}`).concat(ok&&g.skull?[`${g.skull}💀`]:[]).join(' ');
   if(txt) log(s,`${p.name} recebe dos deuses: ${txt}`); });
 } else {
  const gainsVP=s.players.map(()=>0); const det=s.players.map(()=>[]);
  TEMPLES.forEach((T,t)=>{ const mx=Math.max(...s.players.map(p=>p.temples[t])); const top=s.players.filter(p=>p.temples[t]===mx); const b=T.bonus[s.endCount];
   s.players.forEach(p=>{ const v=T.vp[p.temples[t]]; gainsVP[p.id]+=v; det[p.id].push(`${GOD[t]} ${v}★`); });
   top.forEach(p=>{ const v=top.length>1?Math.floor(b/2):b; gainsVP[p.id]+=v; det[p.id].push(`bónus ${GOD[t]} +${v}★${top.length>1?' (empate)':''}`); }); });
  s.players.forEach(p=>{ p.vp+=gainsVP[p.id]; log(s,`${p.name} recebe ${gainsVP[p.id]}★ dos templos: ${det[p.id].join(', ')}`); });
  s.endCount++;
 }
}
function endRound(s,two){
 const ft=s.pendingFood||FOOD[s.day]; s.pendingFood=null;
 if(ft) doFood(s,ft);
 const final=s.day>=26;
 const sp=s.startWorker;
 if(sp!==null){ s.startWorker=null; if(s.first===sp){ s.first=(sp+1)%s.n; } else s.first=sp; log(s,`Jogador inicial: ${s.players[s.first].name}`); }
 else s.accCorn++;
 if(final){ advanceWorkers(s,1); finalScoring(s); return; }
 let days=1;
 if(two && sp!==null && canTwoDaysFor(s,sp)){ days=2; s.players[sp].light=false; if(FOOD[s.day+1]) s.pendingFood=FOOD[s.day+1]; logp(s,sp,'avança o calendário 2 dias'); }
 advanceWorkers(s,days); s.day+=days; s.round++; s.turnIdx=0; beginTurn(s);
}
function canTwoDaysFor(s,pid){ const p=s.players[pid]; return p.light && s.day+2<=26 && !s.workers.some(w=>w.owner>=0 && w.pos===GI[w.gear].max-1); }
function monScore(s,p,mid){ return MON[mid].f(s,p); }
function finalScoring(s){
 s.over=true; s.phase='over';
 s.result=s.players.map(p=>{ const r={id:p.id,before:p.vp};
  const conv=p.wood*2+p.stone*3+p.gold*4; r.res=conv; const corn=p.corn+conv; r.cornVP=Math.floor(corn/4); r.skullVP=p.skull*3;
  r.mons=p.monuments.map(m=>({n:MON[m].n,vp:monScore(s,p,m)})); r.monVP=r.mons.reduce((a,x)=>a+x.vp,0);
  r.left={corn:p.corn,wood:p.wood,stone:p.stone,gold:p.gold,skull:p.skull};
  p.vp+=r.cornVP+r.skullVP+r.monVP; r.total=p.vp; r.tie=ownOnGears(s,p.id); return r; });
 log(s,'— Pontuação final —');
 s.result.forEach(r=>{ const p=s.players[r.id]; const L=r.left;
  const resTxt=RES.filter(k=>L[k]).map(k=>`${L[k]}${IC[k]}`).join(' ');
  log(s,`${p.name}: tinha ${r.before}★ antes da pontuação final.`);
  log(s,`${p.name}: ${resTxt?`recursos ${resTxt} = ${r.res}🌽; `:''}milho ${L.corn}🌽${r.res?` + ${r.res}🌽 = ${L.corn+r.res}🌽`:''} → ${r.cornVP}★ (cada 4🌽 = 1★${(L.corn+r.res)%4?`, sobram ${(L.corn+r.res)%4}🌽`:''}).`);
  log(s,`${p.name}: ${L.skull?`${L.skull}💀 → ${r.skullVP}★ (3★ cada).`:'sem caveiras → 0★.'}`);
  if(r.mons.length) r.mons.forEach(m=>log(s,`${p.name}: monumento ${m.n} → ${m.vp}★.`)); else log(s,`${p.name}: sem monumentos → 0★.`);
  log(s,`${p.name}: total ${r.before} + ${r.cornVP} + ${r.skullVP} + ${r.monVP} = ${r.total}★.`); });
 s.result.sort((a,b)=>b.total-a.total||b.tie-a.tie);
 log(s,`Fim do jogo! Vence ${s.players[s.result[0].id].name} com ${s.result[0].total}★.`);
}

/* ===== ADVERSÁRIO DE COMPUTADOR ===== */
function fdInfo(s){ let mids=0,ends=0; for(const d in FOOD){ if(+d>=s.day && +d>0){ if(FOOD[d]==='mid') mids++; else ends++; } }
 if(s.pendingFood){ if(s.pendingFood==='mid') mids++; else ends++; } return {mids,ends,all:mids+ends}; }
function nextFoodIn(s){ if(s.pendingFood||FOOD[s.day]&&s.day>0) return 0; for(let d=s.day;d<=26;d++) if(FOOD[d]) return d-s.day; return 99; }
function evaluate(s,pid){
 const p=s.players[pid]; if(s.over) return p.vp;
 const rem=26-s.day, f=Math.max(0,rem)/26, fi=fdInfo(s), late=rem<=1;
 let v=p.vp;
 const fe=feedInfo(p), feed=fe.cost, nf=nextFoodIn(s);
 if(late){ v+=p.corn*0.25; }
 else { const hi=nf<=4?1.8:1.25; const a=Math.min(p.corn,feed); const b=Math.min(Math.max(0,p.corn-feed),feed*Math.max(0,Math.min(fi.all,3)-1)); v+=a*hi+b*0.6+Math.max(0,p.corn-a-b)*0.3; }
 if(late){ v+=p.wood*0.5+p.stone*0.75+p.gold; } else { v+=p.wood*1.0+p.stone*1.35+p.gold*1.75; }
 const open=s.chi.slice(1).filter(x=>x==null).length;
 v+=p.skull*((rem>1&&open>0)?5:3);
 TEMPLES.forEach((T,t)=>{ const i=p.temples[t]; v+=T.vp[i]*fi.ends;
  let rv=0; for(let j=2;j<=i;j++) if(T.res[j]) rv+=T.res[j]==='skull'?4:1.4; v+=rv*fi.mids;
  if(fi.ends>0){ const oth=Math.max(...s.players.filter(q=>q.id!==pid).map(q=>q.temples[t])); const b=T.bonus[s.endCount]||0;
   if(i>oth) v+=b*0.8; else if(i===oth) v+=b*0.35; }
  if(!late) v+=(i-1)*0.4; });
 if(p.light&&rem>2) v+=1;
 p.tech.forEach(l=>{ v+=l*(0.6+4.5*f); });
 v+=(p.workers-3)*(4.5*f);
 if(!late && p.corn<feed) v-=(feed-p.corn)*(nf<=3?1.4:nf<=6?0.7:0.3);
 const noFarm=Math.max(0,p.workers)*2; v+=(noFarm-feed)*Math.min(fi.all,4)*0.55;
 p.monuments.forEach(m=>{ v+=monScore(s,p,m); });
 v+=p.buildings.length*0.4;
 const D=(CACHE&&CACHE.pid===pid)?CACHE.D:null;
 s.workers.forEach(w=>{ if(w.owner!==pid) return; const gi=GI[w.gear]; const q=w.pos;
  let val;
  if(D) val=0.3+potential(s,D,w.gear,q,rem);
  else { val=q>=gi.max?0.3:(1.1+0.6*Math.min(q,gi.free)); if(w.gear==='chi'&&p.skull===0) val*=0.4; if(rem<=0) val=0; else if(rem<gi.free-q) val*=0.6; }
  v+=val; });
 if(s.startWorker===pid && s.turn && s.turn.pid===pid) v+=s.accCorn*0.6+0.6;
 return v;
}
let CACHE=null;
function actDeltas(s,pid){ const saved=CACHE; CACHE=null; const base=evaluate(s,pid); const D={};
 GEARS.forEach(g=>{ const lim=g==='chi'?9:5; D[g]=[-1e9];
  for(let a=1;a<=lim;a++){ const ns=act(pid,g,a,DONE)(clone(s)); D[g].push(ns.length?greedy(s,pid,ns,0).v-base:-1e9); }
  D[g].free=Math.max(...D[g].slice(1)); });
 CACHE=saved; return D; }
function potential(s,D,g,q,rem){ const gi=GI[g]; const d=D[g]; let best=0;
 for(let t=1;q+t<=gi.max && t<=rem;t++){ const pos=q+t; let b;
  if(pos>=gi.free) b=d.free; else { b=-1e9; for(let a=1;a<=pos;a++) b=Math.max(b,d[a]-(pos-a)*0.45); }
  best=Math.max(best,b*Math.pow(0.9,t)); }
 if(g==='chi') best=Math.max(best,0.4);
 return best; }
function greedy(s,pid,nodes,depth){ let best=null;
 for(let i=0;i<nodes.length;i++){ const s2=clone(s); const ch=nodes[i].run(s2); let v;
  if(!ch.length) v=evaluate(s2,pid); else if(depth>0) v=greedy(s2,pid,ch,depth-1).v; else v=chain(s2,pid,ch);
  if(!best||v>best.v) best={v,path:[i]}; }
 return best||{v:evaluate(s,pid),path:[]}; }
function chain(s,pid,nodes){ let st=0; while(nodes.length&&st<6){ let bv=-1e9,bs=null,bc=null;
  for(let i=0;i<nodes.length;i++){ const s2=clone(s); const ch=nodes[i].run(s2); const v=evaluate(s2,pid); if(v>bv){bv=v;bs=s2;bc=ch;} }
  s=bs; nodes=bc; st++; } return evaluate(s,pid); }
function runBot(s,pid,nodes){ let loops=0;
 while(nodes.length){ let nd;
  if(loops>=6 && nodes.some(n=>!n.loop)) nd=nodes.find(n=>!n.loop);
  else { const r=greedy(s,pid,nodes,1); nd=nodes[r.path[0]]; }
  if(nd.loop) loops++;
  logp(s,pid,nd.label); nodes=nd.run(s); } }
function botPlace(s,pid){ const p=s.players[pid]; const base=evaluate(s,pid); let list=[], cur=base; const av=availWorkers(s,pid);
 while(list.length<av){ let best=null;
  for(const g of [...GEARS,'start']){ const L=[...list,g]; const pl=planPlacement(s,pid,L); if(!pl.ok||pl.cost>p.corn) continue;
   const t=clone(s); placeRaw(t,pid,L); const v=evaluate(t,pid); if(!best||v>best.v) best={v,g}; }
  if(!best) break; if(list.length>0 && best.v<=cur+0.15) break; list.push(best.g); cur=best.v; }
 return {list,v:cur-base}; }
function bestPick(s,pid){ const base=evaluate(s,pid); let best=null;
 s.workers.filter(w=>w.owner===pid).forEach(w=>{ const ns=pickGen(pid,w.id)(s); const r=greedy(s,pid,ns,1); const d=r.v-base; if(!best||d>best.d) best={d,wid:w.id}; });
 return best; }
function botTurn(s){
 const pid=curPid(s); const p=s.players[pid]; if(!s.turn||s.turn.pid!==pid) beginTurn(s);
 if(canBeg(s,pid)){ const bn=begNode(pid);
  if(forcedBeg(s,pid)) runBot(s,pid,[bn]);
  else { const base=evaluate(s,pid); const r=greedy(s,pid,[bn],1); if(r.v>base+0.4) runBot(s,pid,[bn]); } }
 if(pityNeeded(s,pid)){ doPity(s,pid); endTurn(s); return; }
 CACHE={pid,D:actDeltas(s,pid)};
 try{ botMain(s,pid); } finally { CACHE=null; }
 endTurn(s);
}
function botMain(s,pid){ const p=s.players[pid];
 const own=ownOnGears(s,pid), av=availWorkers(s,pid), mc=minCost1(s,pid);
 let mode, pl=null;
 if(own===0) mode='place'; else if(av===0||mc>p.corn) mode='pick';
 else { pl=botPlace(s,pid); const pk=bestPick(s,pid); mode=(pk&&pk.d>pl.v)?'pick':'place'; }
 if(mode==='place'){ pl=pl||botPlace(s,pid); if(!pl.list.length||!commitPlacement(s,pid,pl.list)){ mode='pick'; } }
 if(mode==='pick'){ let first=true;
  while(true){ const pk=bestPick(s,pid); if(!pk) break; if(!first&&pk.d<0.3) break; runBot(s,pid,pickGen(pid,pk.wid)(s)); first=false; CACHE={pid,D:actDeltas(s,pid)}; }
  s.turn.acted=true; s.turn.mode='pick'; }
}
function botWealth(s,pid){ const h=s.hands[pid]; let best=null;
 for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){ const t=clone(s); const P=t.players[pid];
  [h[i],h[j]].forEach(ti=>runAuto(t,pid,effGen(pid,TILES[ti].e,DONE))); const v=evaluate(t,pid)+P.corn*0.3; if(!best||v>best.v) best={v,pair:[h[i],h[j]]}; }
 chooseWealth(s,pid,best.pair); }
function botTwo(s){ const pid=s.startWorker; return ownOnGears(s,pid)>=2; }

const API={RES,IC,RN,MK,GEARS,GI,WCOST,GOD,TEMPLES,TECHN,TECHBON,TECHLV,FOOD,CHI,BLD,BTYPE,MON,TILES,COLORS,CNAMES,
 clone,N,DONE,costTxt,effText,actLabel,newGame,chooseWealth,curPid,beginTurn,availWorkers,ownOnGears,planPlacement,commitPlacement,
 minCost1,canBeg,forcedBeg,pityNeeded,begNode,doPity,pickGen,endTurn,canTwoDays,endRound,feedInfo,monScore,logp,
 botTurn,botWealth,botTwo,evaluate,nextFoodIn,fdInfo};
if(typeof module!=='undefined') module.exports=API; else window.ENG=API;
})();
