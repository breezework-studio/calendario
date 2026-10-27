/* ===== INTERFACE ===== */
(function(){
'use strict';
const E=window.ENG;
let S=null;
const UI={pending:[],snap:null,snapKey:null,choice:null,busy:false,modal:null,sheet:null,vb:{x:0,y:0,w:1700,h:1000},rotCur:{},anim:null,ptr:{},dragged:false};
const VBW=1700,VBH=1000;
const $=q=>document.querySelector(q);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='calendario_sagrado_save_v1';
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function loadSaved(){ try{ const t=localStorage.getItem(KEY); return t?JSON.parse(t):null; }catch(e){ return null; } }
function clearSaved(){ try{ localStorage.removeItem(KEY); }catch(e){} }
const tok=(p,extra,attrs)=>`<span class="tok ${extra||''}" style="background:${p?p.color:'#8a8a8a'}" ${attrs||''} data-tip="${p?esc(p.name):'Trabalhador neutro'}"></span>`;
const curP=()=>S&&S.phase==='play'&&S.turnIdx<S.n?E.curPid(S):-1;

/* ---------- geometria do tabuleiro ---------- */
const GEO={
 pal:{cx:215,cy:270,teeth:10,rg:78,r1:92,r2:150,a0:88},
 yax:{cx:560,cy:155,teeth:10,rg:78,r1:92,r2:150,a0:144},
 tik:{cx:900,cy:380,teeth:10,rg:78,r1:92,r2:150,a0:214.6},
 uxm:{cx:820,cy:830,teeth:10,rg:78,r1:92,r2:150,a0:-74.2},
 chi:{cx:240,cy:740,teeth:13,rg:100,r1:114,r2:182,a0:4.6}
};
const GCOL={pal:'#86b84f',yax:'#a89d92',tik:'#cc6c3b',uxm:'#dcb437',chi:'#5a96c8'};
const TCOL=['#8b5a33','#c99a1c','#4b8a3c'];
const SHORT={
 pal:[['—'],['🐟','3🌽'],['4🌽'],['5🌽','2🪵'],['7🌽','3🪵'],['9🌽','4🪵'],['✱','livre'],['✱','livre']],
 yax:[['—'],['1🪵'],['1🪨','+1🌽'],['1🪙','+2🌽'],['1💀'],['🪙🪨','+2🌽'],['✱','livre'],['✱','livre']],
 tik:[['—'],['🔧','1 tec'],['🏛','1 edif'],['🔧🔧','1-2 tec'],['🏛🏛','ou 🗿'],['🛕🛕','paga 1'],['✱','livre'],['✱','livre']],
 uxm:[['—'],['🛕','paga 3🌽'],['⇄','mercado'],['👤','+1'],['🏛','em 🌽'],['1🌽→','ação'],['✱','livre'],['✱','livre']]
};
const MONSHORT=['4★ / castanho','4★ / verde','4★ / azul','2★ / edifício','👤 4/5/6 → 6/12/18★','3★ / degrau','★ / monumento','3★ / nível tec.','★ dos templos','4★ / milho','tec. nível 3','3★ / 💀 Chichén','4★ / madeira'];
const TECHSHORT=[['+1🌽 selva','sem peça, +1🐟','+2🌽 selva','↑ templo'],['+1🪵','+1🪨','+1🪙','+2 ▣'],['+1🌽 edif.','+2★ edif.','−1 ▣ / −2🌽','+3★'],['1 à frente','▣→↑templo','+1💀','+1💀']];
const rad=a=>a*Math.PI/180;
const P=(cx,cy,r,a)=>[+(cx+r*Math.cos(rad(a))).toFixed(1),+(cy+r*Math.sin(rad(a))).toFixed(1)];
function seg(r1,r2,a1,a2){ const [x1,y1]=P(0,0,r2,a1),[x2,y2]=P(0,0,r2,a2),[x3,y3]=P(0,0,r1,a2),[x4,y4]=P(0,0,r1,a1);
 return `M${x1},${y1} A${r2},${r2} 0 0 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 0 0 ${x4},${y4} Z`; }
function txt2(x,y,lines,size){ size=size||20; if(lines.length===1) return `<text x="${x}" y="${y}" font-size="${size}" class="c">${esc(lines[0])}</text>`;
 return `<text x="${x}" y="${y-9}" font-size="${size}" class="c">${esc(lines[0])}</text><text x="${x}" y="${y+12}" font-size="${Math.round(size*0.66)}" class="c">${esc(lines[1])}</text>`; }
function effShort(e){ const o=[]; const G='CQK';
 if(e.vp) o.push(`+${e.vp}★`); if(e.corn) o.push(`+${e.corn}🌽`); E.RES.forEach(r=>{ if(e[r]) o.push(`+${e[r]}${E.IC[r]}`); }); if(e.skull) o.push(`+${e.skull}💀`);
 if(e.temples) e.temples.forEach((x,t)=>{ if(x) o.push(`§${t}+${x}`); });
 if(e.templeChoice) o.push(`🛕?+${e.templeChoice}`); if(e.tech!=null) o.push(`¤${e.tech}+1`); if(e.techChoice) o.push(`🔧?×${e.techChoice}`);
 if(e.worker) o.push('+👤'); if(e.farm==='one') o.push('1👤 come grátis'); if(e.farm==='three') o.push('3👤 comem grátis'); if(e.farm==='minus1') o.push('👤 come −1🌽');
 if(e.build) o.push('+🏛'); if(e.market) o.push('⇄ mercado'); if(e.action) o.push('1🌽→ação'); return o; }


/* ---------- símbolos dos deuses (desenho original) ---------- */
function godPaths(t){ const bg=`<circle r="10" fill="${TCOL[t]}" stroke="#fff" stroke-width="1.6"/>`;
 if(t===0) return bg+`<path d="M0,-6.5 C2.6,-2.6 5,0 5,2.6 A5,5 0 0 1 -5,2.6 C-5,0 -2.6,-2.6 0,-6.5Z" fill="#fff"/><path d="M-2.2,2.4 A2.4,2.4 0 0 0 0.6,4.6" fill="none" stroke="${TCOL[t]}" stroke-width="1.2" stroke-linecap="round"/>`;
 if(t===1){ let r=''; for(let i=0;i<8;i++){ const a=i*Math.PI/4; r+=`<line x1="${(4.6*Math.cos(a)).toFixed(2)}" y1="${(4.6*Math.sin(a)).toFixed(2)}" x2="${(7.2*Math.cos(a)).toFixed(2)}" y2="${(7.2*Math.sin(a)).toFixed(2)}" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>`; }
  return bg+r+`<circle r="3.3" fill="#fff"/>`; }
 return bg+`<path d="M-6.2,4.2 C-6.2,-1.6 -1.6,-1.6 -0.6,1.2 C0.4,4 4.4,4 4.4,-1.2" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/><circle cx="4.4" cy="-2.6" r="2.1" fill="#fff"/><circle cx="5" cy="-2.9" r=".55" fill="${TCOL[t]}"/>`; }
function godH(t,cls){ return `<span class="gico ${cls||''}" data-tip="${esc(GODTIP[t])}" aria-label="${E.GOD[t]}"><svg viewBox="-11 -11 22 22">${godPaths(t)}</svg></span>`; }
function godSVG(t,x,y,r){ return `<g transform="translate(${x},${y}) scale(${(r/10).toFixed(3)})" pointer-events="none">${godPaths(t)}</g>`; }

/* ---------- símbolos das tecnologias (desenho original) ---------- */
const TECHCOL=['#5e9a32','#7d746b','#b8562a','#3f78b5'];
function techPaths(t){ const bg=`<rect x="-10" y="-10" width="20" height="20" rx="5" fill="${TECHCOL[t]}" stroke="#fff" stroke-width="1.6"/>`;
 if(t===0) return bg+`<path d="M0,-7 C3,-5 3.4,1 0,5.5 C-3.4,1 -3,-5 0,-7Z" fill="#f6d55c"/><path d="M-1.2,-4 h2.4 M-1.6,-1.5 h3.2 M-1.6,1 h3.2" stroke="#c99a1c" stroke-width=".8"/><path d="M0,7 C-1,3 -4,1 -6,1.6 C-4.6,4 -2.6,5.6 0,7Z M0,7 C1,3 4,1 6,1.6 C4.6,4 2.6,5.6 0,7Z" fill="#fff"/>`;
 if(t===1) return bg+`<path d="M-6.5,-3.2 Q0,-8.5 6.5,-3.2 Q0,-5.6 -6.5,-3.2Z" fill="#fff"/><line x1="0" y1="-5.4" x2="0" y2="7" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/>`;
 if(t===2) return bg+`<path d="M-7,6.5 h14 v-3 h-2.5 v-3 h-2.5 v-3 h-4 v3 h-2.5 v3 h-2.5Z" fill="#fff"/><rect x="-1" y="2.6" width="2" height="3.9" fill="${TECHCOL[t]}"/>`;
 return bg+`<path d="M0,-7.2 L5.6,-1.6 L0,7.2 L-5.6,-1.6Z" fill="#fff"/><path d="M-5.6,-1.6 H5.6 M0,-7.2 L-2,-1.6 L0,7.2 L2,-1.6Z" fill="none" stroke="${TECHCOL[t]}" stroke-width=".9" stroke-linejoin="round"/>`; }
function techH(t,cls){ return `<span class="gico ${cls||''}" data-tip="${esc(TECHTIP[t])}" aria-label="${E.TECHN[t]}"><svg viewBox="-11 -11 22 22">${techPaths(t)}</svg></span>`; }
function techSVG1(t,x,y,r){ return `<g transform="translate(${x},${y}) scale(${(r/10).toFixed(3)})" pointer-events="none">${techPaths(t)}</g>`; }
function rich(s){ return esc(s).replace(/Chaac|Quetzalcóatl|Kukulcán/g,m=>godH(E.GOD.indexOf(m))).replace(/Agricultura|Extração|Arquitetura|Teologia/g,m=>techH(E.TECHN.indexOf(m))); }


const GODTIP=['Chaac (templo castanho, símbolo da chuva)','Quetzalcóatl (templo amarelo, símbolo do sol)','Kukulcán (templo verde, símbolo da serpente)'];
const TECHTIP=['Agricultura: mais milho em Palenque (selva e pesca)','Extração: mais recursos em Yaxchilan e madeira em Palenque','Arquitetura: bónus ao construir edifícios (Tikal e Uxmal)','Teologia: vantagens em Chichén Itzá e caveiras em Yaxchilan'];
function tipGear(g,k){ const gi=E.GI[g];
 if(k===0) return `${gi.name} 0: sem ação. Ao colocar, o trabalhador entra no espaço livre mais baixo; espera que a roda o faça avançar.`;
 if(k>gi.max) return `${gi.name} ${k}: fora do tabuleiro. Um trabalhador que passe da última posição volta para o dono sem ação.`;
 let t=`${gi.name} ${k}: ${E.actLabel(g,k).replace(/[🌽🪵🪨🪙💀★]/gu,m=>({'🌽':' milho','🪵':' madeira','🪨':' pedra','🪙':' ouro','💀':' caveira','★':' pontos'})[m])}.`;
 if(g==='chi'&&k<=9){ const c=E.CHI[k]; t=`Chichén Itzá ${k}: deixa 1 caveira para ganhar ${c.vp} pontos e subir 1 degrau no templo de ${E.GOD[c.t]}${c.r?' e receber 1 recurso à escolha':''}. Cada espaço só aceita uma caveira.${S.chi[k]!=null?` Já ocupado por ${S.players[S.chi[k]].name}.`:''}`; }
 if(k>=gi.free) t+=' Podes escolher qualquer ação desta roda sem pagar.';
 else t+=' Ao recolher daqui podes usar uma ação mais baixa, pagando 1 milho por cada passo atrás.';
 if(g==='pal'&&k>=2&&k<=5) t+=' A selva tem de ser limpa: primeiro recolhe-se a madeira (ou queima-se, descendo 1 templo), depois colhe-se o milho.';
 return t; }
function tipTemple(t,i){ const T=E.TEMPLES[t]; const top=T.vp.length-1;
 let s=`${E.GOD[t]}, ${i===0?'degrau mais baixo':i===1?'degrau inicial':i===top?'topo (só um jogador pode estar aqui)':'degrau '+i}: vale ${T.vp[i]} pontos nos dias 13 e 26.`;
 if(T.res[i]) s+=` Nos dias 7 e 20, quem estiver aqui ou acima recebe ${({stone:'1 pedra',gold:'1 ouro',wood:'1 madeira',skull:'1 caveira'})[T.res[i]]}.`;
 if(i===top) s+=' Chegar ao topo vira o tabuleiro do jogador para o lado claro.';
 return s; }
function tipTech(t,l){ return `${E.TECHN[t]} nível ${l+1}: ${E.TECHLV[t][l]}. ${tcellTip(t,l)}. Custa ${l+1} recurso(s) em Tikal; os níveis acumulam.`; }
function tipDay(d){ const f=E.FOOD[d]; if(f) return `Dia ${d}: dia de comida. Cada trabalhador come 2 milho (ou perdes 3 pontos por cada um). ${f==='mid'?'Os templos dão recursos.':'Os templos dão pontos e bónus'+(d===13?'; muda para a era 2.':'; fim do jogo.')}`;
 const left=[7,13,20,26].find(x=>x>=d)-d; return `Dia ${d}: faltam ${left} dia(s) para o próximo dia de comida.`; }

/* ---------- configuração ---------- */
let setup={n:2,seats:[{name:'',bot:false},{name:'',bot:true},{name:'',bot:true},{name:'',bot:true}]};
function setupHTML(){
 const saved=loadSaved();
 let h=`<div class="setupwrap"><div class="setup"><h1>Calendário Sagrado</h1><p class="sub">Jogo de engrenagens e trabalhadores, para 2 a 4 jogadores. Joga-se na horizontal.</p>`;
 if(saved && !saved.over) h+=`<button class="big primary" data-act="resume">Continuar jogo guardado (dia ${saved.day} de 26)</button>`;
 h+=`<h2>Novo jogo</h2><div class="row">Jogadores: ${[2,3,4].map(n=>`<button class="seg ${setup.n===n?'on':''}" data-act="setn" data-n="${n}">${n}</button>`).join('')}</div>`;
 for(let i=0;i<setup.n;i++){ const st=setup.seats[i];
  h+=`<div class="seat"><span class="tok" style="background:${E.COLORS[i]}"></span>
   <input data-seat="${i}" placeholder="${E.CNAMES[i]}" value="${esc(st.name)}" maxlength="14">
   <button class="seg ${!st.bot?'on':''}" data-act="seat" data-i="${i}" data-bot="0">Humano</button>
   <button class="seg ${st.bot?'on':''}" data-act="seat" data-i="${i}" data-bot="1">Computador</button></div>`; }
 h+=`<button class="big primary" data-act="start">Começar</button>
 <details class="help"><summary>Como se joga (resumo)</summary>${helpHTML()}</details></div></div>`;
 return h;
}
function helpHTML(){ return `<ul>
<li>Em cada turno <b>colocas</b> trabalhadores nas rodas (pagas milho) <b>ou recolhes</b> trabalhadores e fazes as ações onde estão.</li>
<li>Para colocar, toca no centro verde de uma roda (mostra o custo). O trabalhador vai para a posição livre mais baixa. Custo = soma das posições + custo pelo número de trabalhadores (0, 1, 3, 6, 10, 15).</li>
<li>Para recolher, toca num dos teus trabalhadores (a piscar). Podes usar uma ação mais baixa pagando 1🌽 por passo atrás. "✱ livre" permite qualquer ação dessa roda.</li>
<li>Toca no anel de uma roda, num templo, na tabela de tecnologias ou numa carta para ver os detalhes.</li>
<li>No fim de cada ronda o calendário avança 1 dia e as rodas giram: os trabalhadores sobem de posição. Quem passa da última posição volta para ti sem ação.</li>
<li>Há 4 dias de comida (dentes coloridos do calendário: dias 7, 13, 20 e 26; os números nos outros dentes dizem quantos dias faltam): cada trabalhador come 2🌽, senão perdes 3★. Nos dias 7 e 20 (dentes laranja) os templos dão recursos; nos dias 13 e 26 (dentes turquesa) dão pontos.</li>
<li>Com 2🌽 ou menos podes <b>mendigar</b> (ficas com 3🌽 mas desces 1 templo).</li>
<li>Jogador Inicial: ganhas o milho acumulado, passas a primeiro e, com o tabuleiro claro ☀, podes avançar o calendário 2 dias.</li>
<li>No fim: recursos viram milho (🪵2 🪨3 🪙4), cada 4🌽 = 1★, cada 💀 = 3★, mais os monumentos.</li>
<li>Símbolos dos deuses: ${godH(0)} Chaac (templo castanho, chuva) · ${godH(1)} Quetzalcóatl (templo amarelo, sol) · ${godH(2)} Kukulcán (templo verde, serpente).</li>
<li>Símbolos das tecnologias: ${techH(0)} Agricultura · ${techH(1)} Extração · ${techH(2)} Arquitetura · ${techH(3)} Teologia.</li>
<li>Zoom: roda do rato, gesto de pinça ou botões ＋/－; arrasta para mover o tabuleiro.</li></ul>`; }

/* ---------- fluxo ---------- */
function startGame(){
 document.querySelectorAll('[data-seat]').forEach(inp=>{ setup.seats[+inp.dataset.seat].name=inp.value.trim(); });
 const players=setup.seats.slice(0,setup.n).map((st,i)=>({name:st.name||E.CNAMES[i],bot:st.bot}));
 S=E.newGame({players,seed:(Date.now()%2147483647)|0});
 UI.pending=[]; UI.snap=null; UI.rotCur={}; save(); flow();
}
function flow(){
 render();
 if(!S) return;
 if(S.over){ showEnd(); return; }
 if(S.phase==='wealth'){
  const pid=S.players.findIndex(p=>!p.wealthChosen);
  if(S.players[pid].bot){ E.botWealth(S,pid); save(); return flow(); }
  showWealth(pid); return;
 }
 if(S.turnIdx>=S.n){
  if(E.canTwoDays(S)){ const pid=S.startWorker; if(S.players[pid].bot) E.endRound(S,E.botTwo(S)); else { showTwo(pid); return; } }
  else E.endRound(S,false);
  save(); return flow();
 }
 const pid=E.curPid(S), p=S.players[pid];
 if(!S.turn||S.turn.pid!==pid) E.beginTurn(S);
 if(p.bot){ UI.busy=true; render(); setTimeout(()=>{ try{ E.botTurn(S); }catch(e){ console.error(e); } UI.busy=false; save(); flow(); },550); return; }
 const key=S.round+'-'+S.turnIdx;
 if(UI.snapKey!==key){ UI.snapKey=key; UI.snap=E.clone(S); UI.pending=[]; }
 if(E.pityNeeded(S,pid)){ E.doPity(S,pid); E.endTurn(S); save(); return flow(); }
 render();
}
const humanTurn=()=>S&&!S.over&&S.phase==='play'&&S.turnIdx<S.n&&!S.players[E.curPid(S)].bot&&!UI.busy&&!UI.choice&&!UI.modal;
function canPlaceNow(){ if(!humanTurn()) return false; const pid=E.curPid(S);
 if(S.turn.mode==='pick') return false; if(E.forcedBeg(S,pid)) return false;
 return E.availWorkers(S,pid)-UI.pending.length>0; }
function canPickNow(){ if(!humanTurn()) return false; const pid=E.curPid(S);
 return S.turn.mode!=='place' && UI.pending.length===0 && !E.forcedBeg(S,pid); }
function addCost(g){ const pid=curP(); const a=E.planPlacement(S,pid,UI.pending), b=E.planPlacement(S,pid,[...UI.pending,g]); return b.ok?b.cost-(a.ok?a.cost:0):null; }

/* ---------- janelas ---------- */
const isCard=n=>n.bld!=null||n.mon!=null;
function openChoice(title,nodes,cancellable,onDone){ UI.sheet=null; UI.min=false; UI.choice={title,nodes,cancellable,onDone,snap:E.clone(S)};
 if(nodes.length===1&&!cancellable&&!nodes[0].loop&&!isCard(nodes[0])) return runChoice(0);
 renderModal(); }
function runChoice(i){ const c=UI.choice; const pid=E.curPid(S); const nd=c.nodes[i];
 E.logp(S,pid,nd.label); const ch=nd.run(S);
 let title=c.title;
 if(nd.bld!=null) title=`${E.BLD[nd.bld].n}: escolhe o benefício`;
 if(ch.some(n=>n.bld!=null)&&ch.some(n=>n.noArch)) title='Tikal 4: segundo edifício (opcional)';
 else if(ch.some(n=>n.bld!=null)&&nd.bld!=null) title=`${E.BLD[nd.bld].n}: podes construir outro edifício`;
 if(ch.length){ UI.choice={title,nodes:ch,cancellable:false,onDone:c.onDone,snap:c.snap}; render();
  if(ch.length===1&&!ch[0].loop&&!isCard(ch[0])) return runChoice(0); renderModal(); }
 else { UI.choice=null; renderModal(); render(); if(c.onDone) c.onDone(); } }

function monIf(p,mid){ if(!p) return 0; const s2=E.clone(S); const q=s2.players[p.id]; q.monuments.push(mid); s2.monBuilt++; return E.monScore(s2,q,mid); }
function choiceCard(n,i){
 if(n.bld!=null){ const B=E.BLD[n.bld];
  return `<button class="hc hcbtn" style="--c:${BCOL[B.t]}" data-act="choose" data-i="${i}"><div class="hct">${BSHORT[B.t]} · era ${B.a}</div><div class="hcn">${esc(B.n)}</div>
   <div class="hcl">Pagas</div><div class="hcc">${n.paid}</div><div class="hcl">Recebes</div><div class="hce">${rich(E.effText(B.e))}</div>${n.arch?`<div class="hca">${n.arch}</div>`:''}</button>`; }
 const M=E.MON[n.mon]; const p=S.players[curP()];
 return `<button class="hc hcbtn" style="--c:${BCOL[M.t]}" data-act="choose" data-i="${i}"><div class="hct">Monumento ${BSHORT[M.t].toLowerCase()}</div><div class="hcn">${esc(M.n)}</div>
  <div class="hcl">Pagas</div><div class="hcc">${n.paid}</div><div class="hcl">No fim do jogo</div><div class="hce">${rich(M.d)}</div><div class="hca">Se o jogo acabasse agora: ${monIf(p,n.mon)}★</div></button>`; }
function renderModal(){ const m=$('#modal');
 let html=''; const minable=!!(UI.choice||UI.modal);
 if(UI.choice){ const c=UI.choice;
  const cardIdx=c.nodes.map((n,i)=>i).filter(i=>c.nodes[i].bld!=null||c.nodes[i].mon!=null);
  const plain=c.nodes.map((n,i)=>i).filter(i=>!cardIdx.includes(i));
  let note=''; if(c.nodes.some(n=>n.noArch)) note='<p class="hint">Segundo edifício de Tikal 4: não recebe o bónus de arquitetura (só um dos dois edifícios o recebe).</p>';
  else if(c.nodes.some(n=>n.arch)) note='<p class="hint">O bónus de arquitetura aplica-se a este edifício.</p>';
  html=`<h3>${esc(c.title)}</h3><div class="pinfo">${pinfo()}</div>${note}${cardIdx.length?`<div class="hcards choosecards">${cardIdx.map(i=>choiceCard(c.nodes[i],i)).join('')}</div>`:''}${c.select?'<p class="hint">Já está escolhida a ação do espaço onde está o trabalhador (sem custo). Podes tocar noutra antes de confirmar.</p>':''}<div class="opts">${plain.map(i=>`<button class="opt ${c.select&&c.sel===i?'sel':''}" data-act="choose" data-i="${i}">${c.select&&c.sel===i?'✔ ':''}${rich(c.nodes[i].label)}${c.select&&c.nodes[i].here?' <span class="free">sem custo</span>':''}</button>`).join('')}</div>
   ${c.select?`<button class="primary" data-act="doSel" ${c.sel>=0?'':'disabled'}>${c.sel>=0?'Fazer esta ação':'Escolhe uma ação'}</button> `:''}
   <button class="ghost" data-act="cancelChoice">${c.cancellable?'Cancelar':'Voltar atrás (desfaz esta ação)'}</button>`; }
 else if(UI.modal) html=UI.modal;
 else if(UI.sheet&&S) html=sheetHTML(UI.sheet)+'<button class="primary" data-act="closeSheet">Fechar</button>'+(S.over?' <button data-act="showEnd">Voltar aos resultados</button>':'');
 const pill=$('#minpill');
 if(html&&minable&&UI.min){ m.classList.remove('show'); m.innerHTML=''; pill.hidden=false; return; }
 pill.hidden=true;
 if(html){ m.innerHTML=`<div class="box">${minable?'<button class="minbtn small" data-act="minModal" data-tip="Esconde esta janela para veres o tabuleiro. Volta com o botão em baixo.">▾ Ver tabuleiro</button>':''}${html}</div>`; m.classList.add('show'); } else { m.classList.remove('show'); m.innerHTML=''; } }
function pinfo(){ const pid=curP(); if(pid<0) return ''; const p=S.players[pid]; return `${tok(p)} ${esc(p.name)}: 🌽${p.corn} 🪵${p.wood} 🪨${p.stone} 🪙${p.gold} 💀${p.skull}`; }
function showModal(html){ UI.modal=html; UI.sheet=null; UI.min=false; renderModal(); }
function closeModal(){ UI.modal=null; renderModal(); }
function openSheet(sh){ if(UI.choice) return; if(UI.modal){ if(!(S&&S.over)) return; UI.modal=null; } UI.sheet=sh; renderModal(); }

function showWealth(pid){ const p=S.players[pid]; UI.wsel=[];
 const draw=()=>{ showModal(`<h3>${esc(p.name)}: escolhe 2 peças de riqueza inicial</h3>
  ${S.players.filter(q=>!q.bot).length>1?'<p class="hint">Os outros jogadores não devem espreitar.</p>':''}
  <div class="opts">${S.hands[pid].map(ti=>`<button class="opt ${UI.wsel.includes(ti)?'sel':''}" data-act="wtile" data-t="${ti}"><small class="wloc">${E.GI[E.TILES[ti].g].name} ${E.TILES[ti].a}</small> ${rich(E.effText(E.TILES[ti].e))}</button>`).join('')}</div>
  <button class="primary" data-act="wconfirm" ${UI.wsel.length===2?'':'disabled'}>Confirmar</button>`); };
 UI.wdraw=draw; UI.wpid=pid; draw(); }
function showTwo(pid){ const p=S.players[pid];
 showModal(`<h3>${esc(p.name)}: avançar o calendário</h3><p>Tens o tabuleiro do lado claro. Podes avançar 2 dias (e o tabuleiro passa para o lado escuro).</p>
 <div class="opts"><button class="opt" data-act="two" data-v="1">Avançar 1 dia</button><button class="opt" data-act="two" data-v="2">Avançar 2 dias</button></div>`); }
function showEnd(){ const r=S.result;
 showModal(`<h3>Fim do jogo</h3><table class="res"><tr><th></th><th>Antes</th><th>Recursos+🌽</th><th>💀</th><th>Monum.</th><th>Total</th></tr>
 ${r.map((x,i)=>{ const p=S.players[x.id]; return `<tr class="${i===0?'win':''}"><td>${tok(p)} ${esc(p.name)}</td><td>${x.before}</td><td>${x.cornVP}</td><td>${x.skullVP}</td><td>${x.monVP}</td><td><b>${x.total}</b></td></tr>`; }).join('')}</table>
 ${r.some(x=>x.mons.length)?`<p class="hint">Monumentos: ${r.filter(x=>x.mons.length).map(x=>`${esc(S.players[x.id].name)}: ${x.mons.map(m=>`${esc(m.n)} ${m.vp}★`).join(', ')}`).join(' · ')}</p>`:''}
 <p class="hint">"Recursos+🌽": madeira, pedra e ouro viram milho (2, 3 e 4) e cada 4🌽 vale 1★. O detalhe completo de cada jogador está no Registo.</p>
 <p>Vence <b>${esc(S.players[r[0].id].name)}</b>!</p><button class="primary" data-act="newgame">Novo jogo</button> <button data-act="sheet" data-t="log">Ver registo</button> <button class="ghost" data-act="closeModal">Ver tabuleiro</button>`); }

/* ---------- fichas de detalhe ---------- */
function sheetHTML(sh){
 if(sh.t==='gear') return gearSheet(sh.g);
 if(sh.t==='temples') return templeSheet();
 if(sh.t==='tech') return techSheet();
 if(sh.t==='score') return scoreSheet();
 if(sh.t==='market') return marketSheet();
 if(sh.t==='bld'){ const b=E.BLD[sh.id]; return `<h3>${esc(b.n)}</h3><p>${E.BTYPE[b.t]} · era ${b.a}</p><p>Custo: <b>${E.costTxt(b.c)}</b></p><p>${rich(E.effText(b.e))}</p><p class="hint">Constrói-se em Tikal 2, Tikal 4 (1 ou 2 edifícios) ou Uxmal 4 (pago em milho: 2🌽 por recurso).</p>`; }
 if(sh.t==='mon'){ const m=E.MON[sh.id]; return `<h3>${esc(m.n)}</h3><p>Monumento ${E.BTYPE[m.t].toLowerCase()} (conta como ${E.BTYPE[m.t].toLowerCase()})</p><p>Custo: <b>${E.costTxt(m.c)}</b></p><p>${rich(m.d)}</p><p class="hint">Só se constrói em Tikal 4. Pontua no fim do jogo.</p>`; }
 if(sh.t==='start') return `<h3>Espaço do Jogador Inicial</h3><p>Primeiro jogador: ${tok(S.players[S.first])} ${esc(S.players[S.first].name)}</p><p>Milho acumulado: <b>${S.accCorn}🌽</b></p><p>Em cada ronda em que ninguém joga aqui, junta-se 1🌽 num dente do calendário. Quem coloca aqui um trabalhador: recebe todo o milho acumulado no fim do seu turno, passa a primeiro jogador (ou passa a vez de primeiro ao seguinte, se já o era) e, com o tabuleiro claro ☀, pode avançar o calendário 2 dias. O trabalhador volta no fim da ronda.</p>`;
 if(sh.t==='log') return `<h3>Registo</h3><div class="log">${S.log.slice().reverse().map(l=>`<div>${rich(l)}</div>`).join('')}</div>`;
 if(sh.t==='help') return `<h3>Regras (resumo)</h3>${helpHTML()}`;
 if(sh.t==='players') return `<h3>Jogadores</h3><p class="hint">Toca num jogador para ver todas as suas cartas.</p>${playersHTML(false)}`;
 if(sh.t==='player') return playerSheet(sh.p);
 return '';
}

const BCOL={farm:'#d9b12f',civic:'#4b8a3c',tomb:'#8b7a6a',shrine:'#3f7fb8'};
const BSHORT={farm:'Quinta',civic:'Cívico',tomb:'Túmulo',shrine:'Santuário'};
function hcard(col,type,name,cost,eff,extra){ return `<div class="hc" style="--c:${col}"><div class="hct">${type}</div><div class="hcn">${esc(name)}</div><div class="hcc">${cost}</div><div class="hce">${eff}</div>${extra||''}</div>`; }
function playerSheet(pid){ const p=S.players[pid]; const fi=E.feedInfo(p);
 let h=`<div class="psh" style="--pc:${p.color}"><h3>${tok(p)} ${esc(p.name)}${p.bot?' 🤖':''} <span class="vp">${p.vp}★</span></h3>
 <div class="pstats"><span>🌽${p.corn}</span><span>🪵${p.wood}</span><span>🪨${p.stone}</span><span>🪙${p.gold}</span><span>💀${p.skull}</span><span>👤${p.workers} trabalhadores</span><span>come ${fi.cost}🌽 por dia de comida</span><span>${p.light?'☀ lado claro':'🌙 lado escuro'}</span></div>
 <div class="pstats small"><span>Templos: ${E.GOD.map((g,t)=>`${godH(t)} ${g} ${E.TEMPLES[t].vp[p.temples[t]]}★`).join(' · ')}</span></div>
 <div class="pstats small"><span>Tecnologias: ${E.TECHN.map((n,t)=>`${techH(t)} ${n} ${p.tech[t]}`).join(' · ')}</span></div>`;
 const byType=['farm','tomb','civic','shrine'];
 h+=`<h4>Edifícios (${p.buildings.length})</h4>`;
 if(!p.buildings.length) h+='<p class="hint">Ainda não construiu edifícios.</p>';
 else { h+='<div class="hcards">'; byType.forEach(t=>p.buildings.filter(b=>E.BLD[b].t===t).forEach(b=>{ const B=E.BLD[b]; h+=hcard(BCOL[t],BSHORT[t]+' · era '+B.a,B.n,E.costTxt(B.c),rich(E.effText(B.e))); })); h+='</div>';
  h+=`<p class="hint">Por cor: ${byType.map(t=>`${BSHORT[t]} ${p.buildings.filter(b=>E.BLD[b].t===t).length}`).join(' · ')} (os monumentos da mesma cor também contam).</p>`; }
 h+=`<h4>Monumentos (${p.monuments.length})</h4>`;
 if(!p.monuments.length) h+='<p class="hint">Ainda não construiu monumentos.</p>';
 else { h+='<div class="hcards">'; p.monuments.forEach(m=>{ const M=E.MON[m]; h+=hcard(BCOL[M.t],'Monumento',M.n,E.costTxt(M.c),rich(M.d),`<div class="hcv">Agora valeria: <b>${E.monScore(S,p,m)}★</b></div>`); }); h+='</div>'; }
 if(p.wealthChosen){ h+=`<h4>Riqueza inicial</h4><div class="hcards">`; p.wealthChosen.forEach(ti=>{ const T=E.TILES[ti]; h+=hcard('#b8a27a','Peça inicial',E.GI[T.g].name+' '+T.a,'',rich(E.effText(T.e))); }); h+='</div>'; }
 const others=S.players.filter(q=>q.id!==pid);
 h+=`<div class="pnav">${others.map(q=>`<button class="small" data-act="psheet" data-p="${q.id}">${tok(q)} ${esc(q.name)}</button>`).join('')}</div></div>`;
 return h; }
function gearSheet(g){ const gi=E.GI[g]; const pid=curP();
 const ghost=[]; if(UI.pending.length){ const pl=E.planPlacement(S,pid,UI.pending); if(pl.ok) pl.spots.forEach(sp=>{ if(sp.gear===g) ghost.push(sp.pos); }); }
 let btn=''; if(canPlaceNow()){ const c=addCost(g); btn=c!=null?`<button class="primary" data-act="place" data-g="${g}" data-close="1">Colocar aqui (+${c}🌽)</button>`:'<span class="hint">Roda cheia.</span>'; }
 let rows='';
 for(let q=0;q<gi.teeth;q++){ const off=q>gi.max; const ws=S.workers.filter(w=>w.gear===g&&w.pos===q);
  let extra='';
  if(g==='pal'&&q>=2&&q<=5){ const F=S.jungle[q]; extra=` <span class="jg">(selva: ${F.filter(f=>f.wood).length}🪵 ${F.filter(f=>f.corn&&!f.wood).length}🌽 visíveis, ${F.filter(f=>f.corn).length}🌽 no total)</span>`; }
  if(g==='chi'&&q>=1&&q<=9&&S.chi[q]!=null) extra=` <span class="jg">💀 já usado ${tok(S.players[S.chi[q]],'mini')}</span>`;
  const toks=ws.map(w=>{ const p=w.owner>=0?S.players[w.owner]:null; const mine=w.owner===pid&&canPickNow();
   return tok(p,(w.owner<0?'dummy':'')+(mine?' clickable':''),mine?`data-act="pick" data-w="${w.id}"`:''); }).join('')+ghost.filter(x=>x===q).map(()=>tok(S.players[pid],'ghost')).join('');
  rows+=`<div class="pos ${off?'off':''} ${q>=gi.free&&!off?'free':''}"><span class="n">${q}</span><span class="lab">${off?'(fora do tabuleiro)':rich(E.actLabel(g,q))}${extra}</span><span class="ws">${toks}</span></div>`; }
 return `<h3>${gi.name}</h3><div class="pinfo">${pinfo()}</div>${btn}<div class="rows">${rows}</div><p class="hint">Trabalhadores cinzentos tracejados são neutros (bloqueiam espaços).${g==='chi'?' Em Chichén Itzá, o símbolo indica o templo onde sobes: ${godH(0)} Chaac, ${godH(1)} Quetzalcóatl, ${godH(2)} Kukulcán.':''}</p>`; }
function templeSheet(){ let h='<h3>Templos</h3><div class="tsheet">';
 E.TEMPLES.forEach((T,t)=>{ h+=`<div><b style="color:${TCOL[t]}">${godH(t,'big')} ${E.GOD[t]}</b><br><small>Bónus ao mais alto: ${T.bonus[0]}★ (dia 13) · ${T.bonus[1]}★ (dia 26)</small><table class="tt">`;
  for(let i=T.vp.length-1;i>=0;i--){ const ps=S.players.filter(p=>p.temples[t]===i);
   h+=`<tr class="${i===1?'st':''}"><td>${T.vp[i]}★</td><td>${T.res[i]?E.IC[T.res[i]]:''}</td><td>${i===1?'início':i===0?'fundo':i===T.vp.length-1?'topo (só 1)':''}</td><td>${ps.map(p=>tok(p,'mini')).join('')}</td></tr>`; }
  h+='</table></div>'; });
 return h+'</div><p class="hint">Dias 7 e 20: recebes os recursos do teu degrau e de todos abaixo. Dias 13 e 26: ganhas os ★ do teu degrau atual, e o mais alto ganha o bónus (empate: metade). Chegar ao topo vira o teu tabuleiro para o lado claro ☀.</p>'; }
const TCELL=[[['pal'],['pal','water'],['pal']],[['pal','yax'],['yax'],['yax']],[['tik','uxm'],['tik','uxm'],['tik','uxm']],[['chi'],['chi'],['yax']]];
const TCC={pal:'#b7d88f',yax:'#cfc8c0',tik:'#e3a07b',uxm:'#ecd57e',chi:'#9cc1e3',water:'#8fcbec'};
const TCN={pal:'Palenque',yax:'Yaxchilan',tik:'Tikal',uxm:'Uxmal',chi:'Chichén Itzá',water:'pesca em Palenque'};
function tcellBg(t,l){ const c=TCELL[t][l]; return c.length===1?TCC[c[0]]:`linear-gradient(${TCC[c[0]]} 50%, ${TCC[c[1]]} 50%)`; }
function tcellTip(t,l){ return 'Afeta: '+TCELL[t][l].map(k=>TCN[k]).join(' e '); }
function techSheet(){ let h='<h3>Tecnologias</h3><table class="techs"><tr><th></th><th>Nível 1</th><th>Nível 2</th><th>Nível 3</th><th>Bónus</th></tr>';
 E.TECHN.forEach((n,t)=>{ h+=`<tr><th>${techH(t,'big')} ${n}<div>${S.players.map(p=>`<span class="lv">${tok(p,'mini')}${p.tech[t]}</span>`).join('')}</div></th>${E.TECHLV[t].map((x,l)=>`<td style="background:${tcellBg(t,l)}" title="${tcellTip(t,l)}">${rich(x)}</td>`).join('')}<td>${esc(E.TECHBON[t])}</td></tr>`; });
 return h+'</table><p class="hint">Custo: nível 1 = 1 recurso, nível 2 = 2, nível 3 = 3 (madeira, pedra ou ouro, à escolha). Depois do nível 3, cada avanço custa 1 e dá o bónus. Os níveis acumulam. A cor de fundo indica a roda onde o nível atua: verde Palenque (azul = pesca), cinzento Yaxchilan, castanho Tikal, amarelo Uxmal, azul Chichén Itzá.</p>'; }

/* ---------- SVG do tabuleiro ---------- */
function workerSVG(w,x,y,r,pid){ const p=w.owner>=0?S.players[w.owner]:null; const mine=w.owner===pid&&canPickNow();
 return `<circle cx="${x}" cy="${y}" r="${r}" fill="${p?p.color:'#9a9a9a'}" stroke="#1d1a14" stroke-width="2.5" ${w.owner<0?'stroke-dasharray="4 3" fill-opacity=".75"':''} class="${mine?'clk':''}" ${mine?`data-act="pick" data-w="${w.id}"`:''} data-tip="${esc(p?`Trabalhador de ${p.name} em ${E.GI[w.gear].name} ${w.pos}${mine?' (toca para recolher)':''}`:`Trabalhador neutro em ${E.GI[w.gear].name} ${w.pos}: bloqueia o espaço e roda com a engrenagem até ao fim do jogo.`)}"/>`; }
function gearSVG(g){ const G=GEO[g], gi=E.GI[g], st=360/G.teeth, pid=curP();
 let h=`<g transform="translate(${G.cx},${G.cy})">`;
 h+=`<circle r="${G.r2+5}" fill="#3d5643"/>`;
 for(let k=0;k<=gi.max;k++){ const a=G.a0+k*st; const free=k>=gi.free;
  const isChi=g==='chi'&&k>=1&&k<=9;
  const fill=(g==='pal'&&k===1)?'#4aa3d8':GCOL[g]; const op=k===0?0.35:(free?0.7:0.95);
  h+=`<path d="${seg(G.r1,G.r2,a-st/2+1,a+st/2-1)}" fill="${fill}" fill-opacity="${op}" stroke="#1d1a14" stroke-opacity=".4" data-act="gear" data-g="${g}" data-k="${k}" class="segp" data-tip="${esc(tipGear(g,k))}"/>`;
  const [tx,ty]=P(0,0,(G.r1+G.r2)/2+4,a);
  let lab; if(g==='chi') lab=k===0?['—']:k>=10?['✱','livre']:[`${E.CHI[k].vp}★`,E.CHI[k].r?'+▣':'']; else lab=SHORT[g][k];
  if(lab[1]==='') lab=[lab[0]];
  if(isChi){ const c=E.CHI[k]; const [vx,vy]=P(0,0,(G.r1+G.r2)/2+14,a); const [gx,gy]=P(0,0,(G.r1+G.r2)/2-12,a);
   h+=`<g pointer-events="none"><text x="${vx}" y="${vy}" font-size="19" class="c" fill="#fff" font-weight="700">${c.vp}★</text>`;
   const dx=c.r?-12:0; h+=godSVG(c.t,gx+dx,gy,11);
   if(c.r) h+=`<text x="${gx+12}" y="${gy+1}" font-size="13" class="c" fill="#fff">+▣</text>`;
   h+='</g>'; }
  else h+=`<g class="nolab" pointer-events="none" fill="${g==='chi'?'#fff':'#1d1a14'}">${txt2(tx,ty,lab,g==='chi'?19:20)}</g>`;
  const [nx,ny]=P(0,0,G.r1+9,a); h+=`<text x="${nx}" y="${ny}" font-size="11" class="c sn" pointer-events="none">${k}</text>`;
  if(isChi&&S.chi[k]!=null){ const [sx,sy]=P(0,0,G.r2+13,a); h+=`<circle cx="${sx}" cy="${sy}" r="12" fill="${S.players[S.chi[k]].color}" stroke="#1d1a14" stroke-width="2"/><text x="${sx}" y="${sy+1}" font-size="13" class="c" pointer-events="none">💀</text>`; }
  if(g==='pal'&&k>=2&&k<=5) h+=jungleSVG(k,a,G);
 }
 // engrenagem que roda
 const rot=+(S.day*st).toFixed(2); const cur=UI.rotCur[g]!=null?UI.rotCur[g]:rot;
 h+=`<g class="rot" data-key="${g}" data-rot="${rot}" transform="rotate(${cur})">`;
 h+=`<circle r="${G.rg}" fill="#e9dcbc" stroke="#6b5a3a" stroke-width="3"/>`;
 for(let i=0;i<G.teeth;i++){ const a=G.a0+i*st; h+=`<rect x="-9" y="${G.rg-6}" width="18" height="17" rx="4" fill="#e9dcbc" stroke="#6b5a3a" stroke-width="2.5" transform="rotate(${(a-90).toFixed(1)})"/>`;
  const [sx,sy]=P(0,0,G.rg-17,a); h+=`<circle cx="${sx}" cy="${sy}" r="11" fill="#d5c59e"/>`; }
 h+=`<circle r="${G.rg-5}" fill="#e9dcbc"/>`;
 for(let i=0;i<G.teeth;i++){ const [sx,sy]=P(0,0,G.rg-17,G.a0+i*st); h+=`<circle cx="${sx}" cy="${sy}" r="11" fill="#d5c59e"/>`; }
 S.workers.filter(w=>w.gear===g).forEach(w=>{ const tooth=((w.pos-S.day)%G.teeth+G.teeth)%G.teeth; const [x,y]=P(0,0,G.rg-17,G.a0+tooth*st); h+=workerSVG(w,x,y,13,pid); });
 if(UI.pending.length&&pid>=0){ const pl=E.planPlacement(S,pid,UI.pending); if(pl.ok) pl.spots.forEach(sp=>{ if(sp.gear!==g) return; const tooth=((sp.pos-S.day)%G.teeth+G.teeth)%G.teeth; const [x,y]=P(0,0,G.rg-17,G.a0+tooth*st);
  h+=`<circle cx="${x}" cy="${y}" r="13" fill="${S.players[pid].color}" fill-opacity=".45" stroke="#1d1a14" stroke-width="2.5" stroke-dasharray="3 3"/>`; }); }
 h+='</g>';
 // centro: botão de colocar ou nome
 const hr=g==='chi'?46:38; const c=canPlaceNow()?addCost(g):null;
 if(c!=null) h+=`<g data-act="place" data-g="${g}" class="hub"><circle r="${hr}" fill="#2e8b57" stroke="#fff" stroke-width="3" class="pulse"/><text y="-6" font-size="13" class="c" fill="#fff">Colocar</text><text y="15" font-size="19" class="c" fill="#fff">+${c}🌽</text></g>`;
 else h+=`<g data-act="gear" data-g="${g}" class="hub"><circle r="${hr}" fill="#f6efdc" stroke="#6b5a3a" stroke-width="2"/><text y="5" font-size="${g==='chi'?14:15}" class="c" fill="#3a2f1e" font-weight="700">${gi.name}</text></g>`;
 return h+'</g>'; }
function jungleSVG(k,a,G){ const F=S.jungle[k]; const [cx,cy]=P(0,0,G.r2+30,a); const n=F.length; const cols=n>2?2:n; const rows=Math.ceil(n/2); const s=17;
 let h=`<g transform="translate(${cx-cols*s/2-1},${cy-rows*s/2-1})" data-act="gear" data-g="pal" data-tip="${esc(`Selva de Palenque ${k}: ${F.filter(f=>f.wood).length} peça(s) com madeira, ${F.filter(f=>f.corn&&!f.wood).length} só com milho, ${F.filter(f=>!f.corn&&!f.wood).length} vazia(s). A madeira tapa o milho: só se colhe o milho depois de tirar a madeira.`)}">`;
 F.forEach((f,i)=>{ const x=(i%2)*(s+2), y=Math.floor(i/2)*(s+2);
  const fill=f.wood?'#6e4320':f.corn?'#e6c23c':'#cdbf9e';
  h+=`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="3" fill="${fill}" stroke="#1d1a14" stroke-width="1.5" ${!f.wood&&!f.corn?'stroke-dasharray="3 2"':''}/>`;
  h+=`<text x="${x+s/2}" y="${y+s/2+1}" font-size="11" class="c" pointer-events="none">${f.wood?'🪵':f.corn?'🌽':''}</text>`; });
 return h+'</g>'; }
function calSVG(){ const R=168,T=26,st=360/T; const rot=+(-S.day*st).toFixed(2); const cur=UI.rotCur.cal!=null?UI.rotCur.cal:rot;
 let h=`<g transform="translate(560,500)"><circle r="${R+26}" fill="#2f4535"/>`;
 h+=`<g class="rot" data-key="cal" data-rot="${rot}" transform="rotate(${cur})">`;
 for(let k=0;k<T;k++){ const a=180+k*st; const f=E.FOOD[k===0?26:k];
  h+=`<rect x="-12" y="${R-8}" width="24" height="26" rx="5" fill="${f==='mid'?'#b5651d':f==='end'?'#1f9c94':'#e9dcbc'}" stroke="#6b5a3a" stroke-width="2.5" transform="rotate(${(a-90).toFixed(1)})" data-tip="${esc(tipDay(k===0?26:k))}"/>`; }
 for(let i=1;i<=Math.min(S.accCorn,25);i++){ const k=((S.day-i)%T+T)%T; const [cx,cy]=P(0,0,R+5,180+k*st);
  h+=`<circle cx="${cx}" cy="${cy}" r="12" fill="#f2c94c" stroke="#8a6d1a" stroke-width="2"/><text x="${cx}" y="${cy+1}" font-size="13" class="c">🌽</text>`; }
 h+=`<circle r="${R}" fill="#e9dcbc" stroke="#6b5a3a" stroke-width="3"/><circle r="${R-48}" fill="none" stroke="#cbb88f" stroke-width="2"/>`;
 for(let k=0;k<T;k++){ const a=180+k*st; const [x,y]=P(0,0,R-22,a); const d=k===0?26:k; const f=E.FOOD[d]; const left=[7,13,20,26].find(x=>x>=d)-d;
  h+=`<text x="${x}" y="${y}" font-size="${f?15:13}" class="c" fill="${f?(f==='mid'?'#9a4f12':'#127a73'):'#6b5a3a'}" font-weight="${f?700:400}" transform="rotate(${(a+90).toFixed(1)} ${x} ${y})">${f?(f==='mid'?'▣':'★'):left}</text>`; }
 h+=`</g>`;
 h+=`<polygon points="-${R+42},-16 -${R+42},16 -${R+8},0" fill="#f3d36b" stroke="#1d1a14" stroke-width="2.5"/>`;
 const nf=E.nextFoodIn(S);
 h+=`<circle r="70" fill="#f6efdc" stroke="#6b5a3a" stroke-width="2"/><text y="-26" font-size="15" class="c" fill="#6b5a3a">Dia</text><text y="0" font-size="30" class="c" font-weight="700" fill="#2b2418">${S.day}<tspan font-size="15" fill="#6b5a3a">/26</tspan></text>
  <text y="28" font-size="16" class="c">${S.accCorn>0?`🌽×${S.accCorn}`:''}</text><text y="48" font-size="11" class="c" fill="#6b5a3a">${nf===0?'comida nesta ronda!':`comida em ${nf}`}</text>`;
 return h+'</g>'; }
function startSVG(){ const pid=curP(); const w=S.startWorker; const cx=92,cy=500; const c=(canPlaceNow()&&w===null)?addCost('start'):null; const fp=S.players[S.first];
 let h=`<g transform="translate(${cx},${cy})">`;
 if(c!=null&&!UI.pending.includes('start')) h+=`<g data-act="place" data-g="start" class="hub"><circle r="54" fill="#2e8b57" stroke="#fff" stroke-width="3" class="pulse"/><text y="-12" font-size="12" class="c" fill="#fff">Jogador inicial</text><text y="12" font-size="19" class="c" fill="#fff">+${c}🌽</text></g>`;
 else { h+=`<g data-act="startinfo" data-tip="Espaço do Jogador Inicial: dá o milho acumulado no calendário, passa a primeiro jogador e, com o tabuleiro claro, permite avançar 2 dias."><circle r="54" fill="#f1d77e" stroke="#6b5a3a" stroke-width="3"/><text y="-22" font-size="12" class="c" fill="#3a2f1e" font-weight="700">Jogador</text><text y="-7" font-size="12" class="c" fill="#3a2f1e" font-weight="700">inicial</text></g>`;
  if(w!==null) h+=`<circle cy="20" r="14" fill="${S.players[w].color}" stroke="#1d1a14" stroke-width="2.5"/>`;
  else if(UI.pending.includes('start')) h+=`<circle cy="20" r="14" fill="${S.players[pid].color}" fill-opacity=".45" stroke="#1d1a14" stroke-width="2.5" stroke-dasharray="3 3"/>`; }
 h+=`<g transform="translate(40,-44)" pointer-events="none"><circle r="15" fill="${fp.color}" stroke="#fff" stroke-width="2.5"/><text y="1" font-size="12" class="c" fill="#fff" font-weight="700">1.º</text></g>`;
 return h+'</g>'; }
function templesSVG(){ const x0=1095,y0=10,W=190,gap=8,SH=40,maxN=9; let h='';
 E.TEMPLES.forEach((T,t)=>{ const n=T.vp.length; const x=x0+t*(W+gap); const top=y0+40+(maxN-n)*SH;
  h+=`<g data-act="temples">`;
  h+=`<rect x="${x}" y="${top-40}" width="${W}" height="36" rx="8" fill="${TCOL[t]}" data-tip="${esc(`Templo de ${E.GOD[t]}. Bónus para quem estiver mais alto: ${T.bonus[0]} pontos no dia 13 e ${T.bonus[1]} no dia 26 (empate: metade cada).`)}"/>${godSVG(t,x+18,top-22,13)}<text x="${x+W/2+8}" y="${top-27}" font-size="15" class="c" fill="#fff" font-weight="700">${E.GOD[t]}</text><text x="${x+W/2+8}" y="${top-10}" font-size="12" class="c" fill="#fff">bónus ${T.bonus[0]} · ${T.bonus[1]}</text>`;
  for(let i=n-1;i>=0;i--){ const y=top+(n-1-i)*SH; const inset=Math.max(0,(n-1-i))*4;
   const fill=i===n-1?'#f3d36b':i===1?'#efe2bf':i===0?'#d9cbb0':'#f6efdc';
   h+=`<g data-tip="${esc(tipTemple(t,i))}"><rect x="${x+inset}" y="${y}" width="${W-2*inset}" height="${SH-3}" rx="4" fill="${fill}" stroke="${TCOL[t]}" stroke-width="2"/>`;
   h+=`<text x="${x+inset+24}" y="${y+SH/2}" font-size="15" class="c" font-weight="700" fill="#2b2418">${T.vp[i]}★</text>`;
   if(T.res[i]) h+=`<text x="${x+inset+56}" y="${y+SH/2}" font-size="17" class="c">${E.IC[T.res[i]]}</text>`;
   const ps=S.players.filter(p=>p.temples[t]===i); ps.forEach((p,j)=>{ h+=`<circle cx="${x+W-inset-16-j*20}" cy="${y+SH/2-1}" r="9" fill="${p.color}" stroke="#1d1a14" stroke-width="2"/>`; }); h+='</g>'; }
  h+='</g>'; });
 return h; }
function techSVG(){ const x0=1095,y0=458,NW=100,CW=98,RH=52; let h=`<g data-act="tech"><rect x="${x0-4}" y="${y0-26}" width="${NW+5*CW+8}" height="${4*RH+30}" rx="10" fill="#f6efdc" opacity=".97"/>`;
 h+=`<text x="${x0+4}" y="${y0-9}" font-size="14" font-weight="700" fill="#2b2418">Tecnologias</text>`;
 ['1','2','3','bónus'].forEach((l,i)=>{ h+=`<text x="${x0+NW+CW*(i+1)+CW/2}" y="${y0-9}" font-size="12" class="c" fill="#6b5a3a">${l}</text>`; });
 E.TECHN.forEach((n,t)=>{ const y=y0+t*RH;
  h+=`<g data-tip="${esc(TECHTIP[t])}"><rect x="${x0}" y="${y+4}" width="${NW-4}" height="${RH-8}" fill="transparent"/>`+techSVG1(t,x0+13,y+RH/2,10)+`<text x="${x0+28}" y="${y+RH/2}" font-size="12" fill="#2b2418" dominant-baseline="middle" font-weight="600">${n}</text></g>`;
  for(let l=0;l<5;l++){ const x=x0+NW+l*CW;
   h+=`<g data-tip="${esc(l===0?`${E.TECHN[t]}: ainda sem nível.`:l===4?`${E.TECHN[t]}, bónus: ${E.TECHBON[t]}. Depois do nível 3, cada avanço custa 1 recurso e dá este bónus.`:tipTech(t,l-1))}">`;
   if(l>=1&&l<=3){ const c=TCELL[t][l-1]; const hh=(RH-4)/c.length;
    h+=`<clipPath id="tc${t}${l}"><rect x="${x}" y="${y+2}" width="${CW-4}" height="${RH-4}" rx="5"/></clipPath><g clip-path="url(#tc${t}${l})">`+c.map((k,i)=>`<rect x="${x}" y="${y+2+i*hh}" width="${CW-4}" height="${hh}" fill="${TCC[k]}"/>`).join('')+`</g><rect x="${x}" y="${y+2}" width="${CW-4}" height="${RH-4}" rx="5" fill="none" stroke="#a8956c"/>`; }
   else h+=`<rect x="${x}" y="${y+2}" width="${CW-4}" height="${RH-4}" rx="5" fill="${l===4?'#f3d36b':'#e2d6b8'}" stroke="#cbb88f"/>`;
   if(l>0) h+=`<text x="${x+CW/2-2}" y="${y+18}" font-size="12" class="c" fill="#3a2f1e">${esc(TECHSHORT[t][l-1])}</text>`;
   const ps=S.players.filter(p=>Math.min(p.tech[t],3)===l&&l<4); ps.forEach((p,j)=>{ h+=`<circle cx="${x+14+j*20}" cy="${y+RH-16}" r="8" fill="${p.color}" stroke="#1d1a14" stroke-width="2"/>`; }); h+='</g>'; } });
 return h+'</g>'; }
function wrap(text,max){ const words=text.split(' '); const lines=[]; let cur='';
 words.forEach(w=>{ if((cur+' '+w).trim().length>max&&cur){ lines.push(cur); cur=w; } else cur=(cur+' '+w).trim(); }); if(cur) lines.push(cur); return lines; }
function cardsSVG(){ const x0=1095,W=590; let h='';
 const cw=W/6;
 h+=`<text x="${x0}" y="${697}" font-size="14" font-weight="700" fill="#f3ead6">Edifícios — era ${S.age} (${(S.age===1?S.deck1:S.deck2).length} no baralho)</text>`;
 const BC={farm:'#d9b12f',civic:'#4b8a3c',tomb:'#8b7a6a',shrine:'#3f7fb8'};
 S.slots.forEach((bid,i)=>{ const x=x0+i*cw, y=706, ch=152;
  if(bid==null){ h+=`<rect x="${x+2}" y="${y}" width="${cw-6}" height="${ch}" rx="7" fill="none" stroke="#6f8a76" stroke-dasharray="5 4"/>`; return; }
  const b=E.BLD[bid];
  h+=`<g data-act="bld" data-id="${bid}" data-tip="${esc(`${b.n} (${E.BTYPE[b.t]}). Custo: ${E.costTxt(b.c)}. Efeito: ${E.effText(b.e)}. Toca para ver em grande.`)}"><rect x="${x+2}" y="${y}" width="${cw-6}" height="${ch}" rx="7" fill="#fffaf0" stroke="${BC[b.t]}" stroke-width="4"/>`;
  h+=`<rect x="${x+2}" y="${y}" width="${cw-6}" height="20" rx="7" fill="${BC[b.t]}"/><text x="${x+cw/2-1}" y="${y+11}" font-size="11" class="c" fill="#fff">${({farm:"Quinta",civic:"Cívico",tomb:"Túmulo",shrine:"Santuário"})[b.t]}</text>`;
  wrap(b.n,13).slice(0,2).forEach((l,j)=>{ h+=`<text x="${x+cw/2-1}" y="${y+34+j*15}" font-size="12" class="c" font-weight="700" fill="#2b2418">${esc(l)}</text>`; });
  h+=`<text x="${x+cw/2-1}" y="${y+76}" font-size="16" class="c">${E.costTxt(b.c)}</text>`;
  { const ls=effShort(b.e); const isI=l=>l[0]==='§'||l[0]==='¤'; const gods=ls.filter(isI); const rest=ls.filter(l=>!isI(l)); let row=0;
  if(gods.length){ const gw=34; const x0g=x+cw/2-1-(gods.length*gw)/2+gw/2; gods.forEach((l,gi)=>{ const gx=x0g+gi*gw; h+=(l[0]==='§'?godSVG(+l[1],gx-7,y+98,8):techSVG1(+l[1],gx-7,y+98,8))+`<text x="${gx+8}" y="${y+98}" font-size="11.5" class="c" fill="#3a2f1e">${esc(l.slice(2))}</text>`; }); row=1; }
  rest.slice(0,4-row).forEach((l,j)=>{ h+=`<text x="${x+cw/2-1}" y="${y+98+(j+row)*15}" font-size="11.5" class="c" fill="#3a2f1e">${esc(l)}</text>`; }); }
  h+='</g>'; });
 h+=`<text x="${x0}" y="${880}" font-size="14" font-weight="700" fill="#f3ead6">Monumentos (Tikal 4)</text>`;
 S.monuments.forEach((mid,i)=>{ const x=x0+i*cw, y=888, ch=104; if(mid==null){ h+=`<rect x="${x+2}" y="${y}" width="${cw-6}" height="${ch}" rx="7" fill="none" stroke="#6f8a76" stroke-dasharray="5 4"/>`; return; }
  const m=E.MON[mid];
  h+=`<g data-act="mon" data-id="${mid}" data-tip="${esc(`Monumento ${m.n}. Custo: ${E.costTxt(m.c)}. No fim do jogo: ${m.d}. Só se constrói em Tikal 4.`)}"><rect x="${x+2}" y="${y}" width="${cw-6}" height="${ch}" rx="7" fill="#f7ead2" stroke="${BC[m.t]}" stroke-width="4"/>`;
  wrap(m.n,13).slice(0,2).forEach((l,j)=>{ h+=`<text x="${x+cw/2-1}" y="${y+16+j*14}" font-size="11.5" class="c" font-weight="700" fill="#2b2418">${esc(l)}</text>`; });
  const mc=E.costTxt(m.c); const nIc=Object.values(m.c).reduce((a,b)=>a+b,0); h+=`<text x="${x+cw/2-1}" y="${y+54}" font-size="${nIc>6?10:nIc>5?11.5:12.5}" class="c">${mc}</text>`;
  wrap(MONSHORT[mid],14).slice(0,2).forEach((l,j)=>{ h+=`<text x="${x+cw/2-1}" y="${y+76+j*14}" font-size="11.5" class="c" fill="#3a2f1e">${esc(l)}</text>`; });
  h+='</g>'; });
 return h; }
function boardSVG(){ const v=UI.vb;
 return `<svg id="svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
 <rect x="0" y="0" width="${VBW}" height="${VBH}" fill="#24382b"/>
 <rect x="1080" y="0" width="620" height="${VBH}" fill="#1d2e23"/>
 ${calSVG()}${E.GEARS.map(gearSVG).join('')}${startSVG()}${marketSVG()}${scoreSVG()}${templesSVG()}${techSVG()}${cardsSVG()}</svg>`; }


function refBox(x,y,w,h,title,rows,act,tip){ let s=`<g ${act?`data-act="${act}"`:''} data-tip="${esc(tip||'')}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f6efdc" stroke="#b8a27a" stroke-width="2"/>`;
 s+=`<text x="${x+w/2}" y="${y+18}" font-size="14" class="c" font-weight="700" fill="#2b2418">${title}</text>`;
 rows.forEach((r,i)=>{ s+=`<text x="${x+w/2}" y="${y+44+i*25}" font-size="16" class="c" fill="#2b2418">${r}</text>`; });
 return s+'</g>'; }
function marketSVG(){ return refBox(755,22,170,124,'Mercado ⇄',['🪵 ⇄ 2🌽','🪨 ⇄ 3🌽','🪙 ⇄ 4🌽'],'market','Mercado (Uxmal 2): troca recursos por milho ou milho por recursos, nestes valores, quantas vezes quiseres.'); }
function scoreSVG(){ return refBox(452,812,192,176,'Fim do jogo',['🪵=2🌽 🪨=3🌽 🪙=4🌽','4🌽 = 1★','💀 = 3★','🗿 = ★ do monumento'],'score','Pontuação final: recursos viram milho, cada 4 milho vale 1 ponto, cada caveira 3 pontos e cada monumento o que diz a carta. Toca para ver a pontuação atual.')+`<text x="548" y="980" font-size="11" class="c" fill="#7a6b52" pointer-events="none">toca para ver a pontuação atual</text>`; }
function finalNow(p){ const conv=p.wood*2+p.stone*3+p.gold*4; const cornVP=Math.floor((p.corn+conv)/4); const skullVP=p.skull*3; const mons=p.monuments.map(m=>({n:E.MON[m].n,vp:E.monScore(S,p,m)})); const monVP=mons.reduce((a,x)=>a+x.vp,0);
 return {conv,cornVP,skullVP,mons,monVP,total:p.vp+cornVP+skullVP+monVP}; }
function scoreSheet(){ const rows=S.players.map(p=>({p,f:finalNow(p)})).sort((a,b)=>b.f.total-a.f.total);
 return `<h3>Pontuação se o jogo acabasse agora</h3><table class="res"><tr><th></th><th>Pontos atuais</th><th>Recursos+🌽 → ★</th><th>💀 → ★</th><th>Monumentos</th><th>Total</th></tr>
 ${rows.map(({p,f},i)=>`<tr class="${i===0?'win':''}"><td>${tok(p)} ${esc(p.name)}</td><td>${p.vp}</td><td title="${p.corn}🌽 + ${f.conv}🌽 dos recursos">${f.cornVP}</td><td>${f.skullVP}</td><td title="${f.mons.map(m=>m.n+': '+m.vp+'★').join(', ')}">${f.monVP}</td><td><b>${f.total}</b></td></tr>`).join('')}</table>
 <p class="hint">No fim do jogo: madeira, pedra e ouro trocam-se por 2, 3 e 4🌽; cada 4🌽 vale 1★; cada caveira que ainda tenhas vale 3★; cada monumento vale o que diz a carta. Esta conta ainda não inclui os pontos dos templos do último dia de comida (dia 26).</p>`; }
function marketSheet(){ return `<h3>Mercado</h3><table class="res"><tr><th>Recurso</th><th>Vender (recebes)</th><th>Comprar (pagas)</th></tr><tr><td>🪵 Madeira</td><td>2🌽</td><td>2🌽</td></tr><tr><td>🪨 Pedra</td><td>3🌽</td><td>3🌽</td></tr><tr><td>🪙 Ouro</td><td>4🌽</td><td>4🌽</td></tr></table><p class="hint">Usa-se em Uxmal 2 (e em edifícios com o símbolo do mercado). Podes fazer quantas trocas quiseres nessa ação. Caveiras não se trocam.</p>`; }

/* ---------- painel lateral ---------- */
function playersHTML(full){ const cur=curP();
 return S.players.map(p=>{ const fi=E.feedInfo(p); const on=E.ownOnGears(S,p.id);
  return `<div class="pl ${p.id===cur?'cur':''}" style="border-color:${p.color}" data-act="psheet" data-p="${p.id}" title="Ver as cartas de ${esc(p.name)}"><div class="pn">${tok(p)} <b>${esc(p.name)}</b>${p.bot?' 🤖':''}${p.id===S.first?' <span class="badge">1.º</span>':''} <span class="vp">${p.vp}★</span></div>
  <div class="st"><span data-tip="Milho: paga a colocação de trabalhadores e a comida">🌽${p.corn}</span> <span data-tip="Madeira (vale 2 milho)">🪵${p.wood}</span> <span data-tip="Pedra (vale 3 milho)">🪨${p.stone}</span> <span data-tip="Ouro (vale 4 milho)">🪙${p.gold}</span> <span data-tip="Caveiras de cristal: usam-se em Chichén Itzá; no fim valem 3 pontos cada">💀${p.skull}</span></div>
  <div class="st small">👤${E.availWorkers(S,p.id)} livres · ${on} nas rodas · ${p.workers} total · come ${fi.cost}🌽 · ${p.light?'☀':'🌙'}</div>
  ${!full?`<div class="st small more">🏛 ${p.buildings.length} edifícios · 🗿 ${p.monuments.length} monumentos · <u>ver cartas</u></div>`:''}${full&&(p.buildings.length||p.monuments.length)?`<div class="st small">🏛 ${p.buildings.map(b=>esc(E.BLD[b].n)).concat(p.monuments.map(m=>'<b>'+esc(E.MON[m].n)+'</b>')).join(', ')}</div>`:''}</div>`; }).join(''); }
function turnHTML(){
 if(S.over) return `<div class="turn"><p>Jogo terminado.</p><button class="primary" data-act="showEnd">Resultados</button></div>`;
 if(S.phase==='wealth') return `<div class="turn"><p>A escolher as peças de riqueza inicial.</p>${UI.min?'<div class="btns"><button class="primary" data-act="restoreModal">Voltar às peças</button></div>':''}</div>`;
 if(S.phase!=='play'||S.turnIdx>=S.n) return '<div class="turn"><p>…</p></div>';
 const pid=E.curPid(S), p=S.players[pid];
 if(p.bot) return `<div class="turn" style="border-color:${p.color}"><p>${tok(p)} 🤖 <b>${esc(p.name)}</b> está a jogar…</p><p class="last">${rich(S.log[S.log.length-1]||'')}</p></div>`;
 let msg='', btns='';
 if(E.canBeg(S,pid)&&UI.pending.length===0) btns+=`<button class="${E.forcedBeg(S,pid)?'primary':''}" data-act="beg">Mendigar milho</button>`;
 if(E.forcedBeg(S,pid)) msg='Não tens milho para colocar nenhum trabalhador: tens de mendigar.';
 else if(UI.pending.length){ const pl=E.planPlacement(S,pid,UI.pending); const ok=pl.ok&&pl.cost<=p.corn;
  msg=`A colocar ${UI.pending.length} trabalhador(es): custo <b>${pl.cost}🌽</b>${ok?'':' — <b class="warn">milho insuficiente</b>'}. Toca noutros centros verdes para colocar mais.`;
  btns+=`<button class="primary" data-act="confirm" ${ok?'':'disabled'}>Confirmar</button><button data-act="undo">Desfazer</button>`; }
 else if(S.turn.mode==='pick'){ msg='Podes recolher mais trabalhadores (a piscar) ou terminar o turno.'; btns+=`<button class="primary" data-act="endturn">Terminar turno</button>`; }
 else { const own=E.ownOnGears(S,pid), av=E.availWorkers(S,pid);
  msg=own&&av?'Toca no centro verde de uma roda para <b>colocar</b>, ou num trabalhador teu a piscar para o <b>recolher</b>.':own?'Sem trabalhadores livres: toca num trabalhador teu a piscar para o recolher.':'Toca no centro verde de uma roda para colocar trabalhadores.'; }
 if(UI.snap&&(S.turn.acted||S.turn.begged)) btns+=`<button class="ghost" data-act="restart">Recomeçar turno</button>`;
 return `<div class="turn" style="border-color:${p.color}"><p>${tok(p)} Vez de <b>${esc(p.name)}</b> · 🌽${p.corn}</p><p>${msg}</p><div class="btns">${btns}</div></div>`; }
function sideHTML(){ const nf=E.nextFoodIn(S);
 return `<aside id="side"><div class="sh"><b>Dia ${S.day}/26</b> · Era ${S.age} · ${nf===0?'<b class="warn">comida nesta ronda</b>':`comida em ${nf}`}</div>
 ${turnHTML()}<div class="pls">${playersHTML(false)}</div>
 <div class="sbtns"><button class="small zb" data-act="zin" title="Aproximar">＋</button><button class="small zb" data-act="zout" title="Afastar">－</button><button class="small zb" data-act="zreset" data-tip="Ver o tabuleiro todo">⤢</button><button class="small zb" data-act="fullscreen" data-tip="Ecrã inteiro (esconde as barras do browser)">⛶</button><button class="small zb" data-act="hideSide" data-tip="Esconder este painel para o tabuleiro ocupar o ecrã todo">⇥</button><button class="small" data-act="sheet" data-t="players">Detalhes</button><button class="small" data-act="sheet" data-t="log">Registo</button><button class="small" data-act="sheet" data-t="help">Regras</button><button class="small" data-act="menu">Menu</button></div>
 <div class="slog">${S.log.slice(-12).reverse().map(l=>`<div>${rich(l)}</div>`).join('')}</div></aside>`; }


function floatHTML(){ const nf=E.nextFoodIn(S); const pid=curP(); const p=pid>=0?S.players[pid]:null;
 return `<button class="fside" data-act="showSide" data-tip="Mostrar o painel lateral">☰</button>
 <div class="fbar">${p?`${tok(p)} <b>${esc(p.name)}</b> · 🌽${p.corn} 🪵${p.wood} 🪨${p.stone} 🪙${p.gold} 💀${p.skull} · `:''}Dia ${S.day}/26${nf===0?' · <b class="warn">comida</b>':''}${turnBtns()}</div>`; }
function turnBtns(){ const d=document.createElement('div'); d.innerHTML=turnHTML(); const b=d.querySelector('.btns'); return b&&b.children.length?`<span class="fbtns">${b.innerHTML}</span>`:''; }
async function goFull(){ const el=document.documentElement;
 try{ if(!(document.fullscreenElement||document.webkitFullscreenElement)){ const f=el.requestFullscreen||el.webkitRequestFullscreen; if(!f) throw new Error('x'); await f.call(el,{navigationUI:'hide'}); try{ await screen.orientation.lock('landscape'); }catch(e){} }
  else { const x=document.exitFullscreen||document.webkitExitFullscreen; await x.call(document); } }
 catch(e){ showModal('<h3>Ecrã inteiro indisponível aqui</h3><p>Este browser (ou a moldura onde o jogo está aberto) não deixa ocupar o ecrã inteiro. Abre o jogo pelo teu endereço próprio (GitHub Pages) e usa “Adicionar ao ecrã principal”: assim abre sempre em ecrã inteiro e na horizontal. Também podes esconder o painel lateral com ⇥.</p><button class="primary" data-act="closeModal">OK</button>'); } }
function openPick(wid){ const pid=curP(); const nodes=E.pickGen(pid,wid)(S);
 let def=nodes.findIndex(n=>n.here); if(def<0&&nodes.length===1) def=0;
 if(def>0){ const [d]=nodes.splice(def,1); nodes.unshift(d); def=0; }
 const w=S.workers.find(x=>x.id===wid);
 openChoice(`Recolher de ${E.GI[w.gear].name} ${w.pos}`,nodes,true,()=>{ S.turn.mode='pick'; S.turn.acted=true; render(); });
 if(UI.choice){ UI.choice.select=true; UI.choice.sel=def; renderModal(); } }
/* ---------- renderização ---------- */
function render(){ const app=$('#app');
 if(!S){ app.className='setupmode'; app.innerHTML=setupHTML(); return; }
 app.className='game';
 app.className='game'+(UI.sideHidden?' noside':'');
 app.innerHTML=`<div id="board">${boardSVG()}</div>${UI.sideHidden?floatHTML():sideHTML()}<div class="rotate-hint">Roda o telemóvel para a horizontal ↻</div>`;
 bindBoard(); animateRot();
 if(UI.sheet) renderModal(); }
function animateRot(){ const els=[...document.querySelectorAll('.rot')]; if(UI.anim) cancelAnimationFrame(UI.anim);
 const items=els.map(el=>({el,key:el.getAttribute('data-key'),to:+el.getAttribute('data-rot'),from:UI.rotCur[el.getAttribute('data-key')]}));
 items.forEach(it=>{ if(it.from==null){ it.from=it.to; UI.rotCur[it.key]=it.to; } });
 if(items.every(it=>it.from===it.to)) return;
 const t0=performance.now(), D=900;
 const step=now=>{ const k=Math.min(1,(now-t0)/D); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  items.forEach(it=>{ const v=it.from+(it.to-it.from)*e; UI.rotCur[it.key]=v; it.el.setAttribute('transform',`rotate(${v.toFixed(2)})`); });
  if(k<1) UI.anim=requestAnimationFrame(step); else UI.anim=null; };
 UI.anim=requestAnimationFrame(step); }

/* ---------- zoom e arrastar ---------- */
function clampVB(){ const v=UI.vb; v.w=Math.min(VBW,Math.max(320,v.w)); v.h=v.w*VBH/VBW; v.x=Math.min(VBW-v.w,Math.max(0,v.x)); v.y=Math.min(VBH-v.h,Math.max(0,v.y)); }
function applyVB(){ clampVB(); const svg=$('#svg'); if(svg) svg.setAttribute('viewBox',`${UI.vb.x} ${UI.vb.y} ${UI.vb.w} ${UI.vb.h}`); }
function toSvg(cx,cy){ const svg=$('#svg'); const r=svg.getBoundingClientRect(); const v=UI.vb; const sc=Math.min(r.width/v.w,r.height/v.h)||1;
 const ox=r.left+(r.width-v.w*sc)/2, oy=r.top+(r.height-v.h*sc)/2; return {x:v.x+(cx-ox)/sc,y:v.y+(cy-oy)/sc,sc}; }
function zoomAt(f,cx,cy){ const v=UI.vb; const p=cx==null?{x:v.x+v.w/2,y:v.y+v.h/2}:toSvg(cx,cy); const nw=Math.min(VBW,Math.max(320,v.w*f)); const k=nw/v.w;
 v.x=p.x-(p.x-v.x)*k; v.y=p.y-(p.y-v.y)*k; v.w=nw; applyVB(); }
function bindBoard(){ const b=$('#board'); if(!b) return;
 b.addEventListener('wheel',e=>{ e.preventDefault(); zoomAt(e.deltaY>0?1.15:1/1.15,e.clientX,e.clientY); },{passive:false});
 b.addEventListener('pointerdown',e=>{ if(e.target.closest('.zoom')) return; UI.ptr[e.pointerId]={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY}; UI.dragged=false; });
 b.addEventListener('pointermove',e=>{ const p=UI.ptr[e.pointerId]; if(!p) return; const ids=Object.keys(UI.ptr);
  if(ids.length===2){ const [a,c]=ids.map(i=>UI.ptr[i]); const d0=Math.hypot(a.x-c.x,a.y-c.y); p.x=e.clientX; p.y=e.clientY; const d1=Math.hypot(a.x-c.x,a.y-c.y);
   if(d0>0&&d1>0){ zoomAt(d0/d1,(a.x+c.x)/2,(a.y+c.y)/2); } UI.dragged=true; return; }
  const dx=e.clientX-p.x, dy=e.clientY-p.y; if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>8) UI.dragged=true;
  if(UI.dragged&&UI.vb.w<VBW){ const sc=toSvg(e.clientX,e.clientY).sc; UI.vb.x-=dx/sc; UI.vb.y-=dy/sc; applyVB(); }
  p.x=e.clientX; p.y=e.clientY; });
 const up=e=>{ delete UI.ptr[e.pointerId]; };
 b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('pointerleave',up); }

/* ---------- eventos ---------- */
function attr(el,n){ return el.getAttribute('data-'+n); }
document.addEventListener('click',e=>{ const t=e.target.closest('[data-act]'); if(!t||t.disabled) return;
 if(UI.dragged&&t.closest('#svg')){ UI.dragged=false; return; }
 const act=attr(t,'act'); const pid=curP();
 const syncNames=()=>document.querySelectorAll('[data-seat]').forEach(inp=>setup.seats[+inp.dataset.seat].name=inp.value.trim());
 switch(act){
  case 'setn': syncNames(); setup.n=+attr(t,'n'); render(); break;
  case 'seat': syncNames(); setup.seats[+attr(t,'i')].bot=attr(t,'bot')==='1'; render(); break;
  case 'start': startGame(); break;
  case 'resume': S=loadSaved(); UI.pending=[]; UI.snapKey=null; UI.rotCur={}; flow(); break;
  case 'menu': showModal('<h3>Voltar ao menu?</h3><p>O jogo fica guardado no início deste turno e podes continuá-lo depois.</p><div class="opts"><button class="primary" data-act="menuYes">Voltar ao menu</button><button data-act="closeModal">Continuar a jogar</button></div>'); break;
  case 'menuYes': if(UI.snap&&!S.over) S=UI.snap; save(); S=null; UI.choice=null; UI.sheet=null; UI.modal=null; renderModal(); render(); break;
  case 'sheet': openSheet({t:attr(t,'t')}); break;
  case 'psheet': UI.sheet=null; openSheet({t:'player',p:+attr(t,'p')}); break;
  case 'gear': { const g=attr(t,'g'), k=attr(t,'k'); if(k!=null&&canPickNow()){ const w=S.workers.find(x=>x.owner===pid&&x.gear===g&&x.pos===+k); if(w){ openPick(w.id); break; } } openSheet({t:'gear',g}); break; }
  case 'temples': openSheet({t:'temples'}); break;
  case 'tech': openSheet({t:'tech'}); break;
  case 'score': openSheet({t:'score'}); break;
  case 'market': openSheet({t:'market'}); break;
  case 'bld': openSheet({t:'bld',id:+attr(t,'id')}); break;
  case 'mon': openSheet({t:'mon',id:+attr(t,'id')}); break;
  case 'startinfo': openSheet({t:'start'}); break;
  case 'closeSheet': UI.sheet=null; renderModal(); break;
  case 'closeModal': closeModal(); break;
  case 'showEnd': showEnd(); break;
  case 'newgame': clearSaved(); S=null; closeModal(); render(); break;
  case 'zin': zoomAt(1/1.35); break;
  case 'zout': zoomAt(1.35); break;
  case 'zreset': UI.vb={x:0,y:0,w:VBW,h:VBH}; applyVB(); break;
  case 'place': if(!canPlaceNow()) return; UI.pending.push(attr(t,'g')); if(!E.planPlacement(S,pid,UI.pending).ok) UI.pending.pop(); if(attr(t,'close')) UI.sheet=null; renderModal(); render(); break;
  case 'undo': UI.pending.pop(); render(); break;
  case 'confirm': if(E.commitPlacement(S,pid,UI.pending)){ UI.pending=[]; finishTurn(); } break;
  case 'endturn': finishTurn(); break;
  case 'restart': S=E.clone(UI.snap); UI.pending=[]; render(); break;
  case 'beg': openChoice('Mendigar milho',[E.begNode(pid)],true,()=>render()); break;
  case 'pick': if(!canPickNow()) return; openPick(+attr(t,'w')); break;
  case 'fullscreen': goFull(); break;
  case 'hideSide': UI.sideHidden=true; try{localStorage.setItem('cs_side','0');}catch(e){} render(); break;
  case 'showSide': UI.sideHidden=false; try{localStorage.setItem('cs_side','1');}catch(e){} render(); break;
  case 'minModal': UI.min=true; renderModal(); render(); break;
  case 'restoreModal': UI.min=false; renderModal(); render(); break;
  case 'choose': if(UI.choice&&UI.choice.select){ UI.choice.sel=+attr(t,'i'); renderModal(); break; } runChoice(+attr(t,'i')); break;
  case 'doSel': if(UI.choice&&UI.choice.sel>=0){ const i=UI.choice.sel; UI.choice.select=false; runChoice(i); } break;
  case 'cancelChoice': if(UI.choice&&UI.choice.snap) S=UI.choice.snap; UI.choice=null; renderModal(); render(); break;
  case 'wtile': { const ti=+attr(t,'t'); const i=UI.wsel.indexOf(ti); if(i>=0) UI.wsel.splice(i,1); else if(UI.wsel.length<2) UI.wsel.push(ti); UI.wdraw(); break; }
  case 'wconfirm': E.chooseWealth(S,UI.wpid,UI.wsel); closeModal(); save(); flow(); break;
  case 'two': closeModal(); E.endRound(S,attr(t,'v')==='2'); save(); flow(); break;
 }
});
$('#modal').addEventListener('click',e=>{ if(e.target.id==='modal'&&UI.sheet&&!UI.choice&&!UI.modal){ UI.sheet=null; renderModal(); } });

/* ---------- dicas (rato, botão direito, toque longo) ---------- */
const TIP={el:null,timer:null,long:false,sx:0,sy:0,shownAt:0};
function tipBox(){ if(!TIP.el){ TIP.el=document.createElement('div'); TIP.el.id='tip'; TIP.el.hidden=true; document.body.appendChild(TIP.el); } return TIP.el; }
function showTip(txt,x,y){ const b=tipBox(); b.textContent=txt; b.hidden=false; TIP.shownAt=Date.now();
 const W=window.innerWidth,H=window.innerHeight; const r=b.getBoundingClientRect();
 let lx=x+14, ly=y+16; if(lx+r.width>W-8) lx=Math.max(8,x-r.width-14); if(ly+r.height>H-8) ly=Math.max(8,y-r.height-14);
 b.style.left=lx+'px'; b.style.top=ly+'px'; }
function hideTip(){ clearTimeout(TIP.timer); if(TIP.el) TIP.el.hidden=true; }
const tipOf=t=>{ const el=t&&t.closest&&t.closest('[data-tip]'); const v=el&&el.getAttribute('data-tip'); return v||null; };
document.addEventListener('mouseover',e=>{ const v=tipOf(e.target); clearTimeout(TIP.timer); if(!v){ if(TIP.el&&!TIP.el.hidden&&Date.now()-TIP.shownAt>50) hideTip(); return; }
 TIP.timer=setTimeout(()=>showTip(v,e.clientX,e.clientY),350); });
document.addEventListener('mouseout',e=>{ if(!e.relatedTarget||!tipOf(e.relatedTarget)) hideTip(); });
document.addEventListener('contextmenu',e=>{ const v=tipOf(e.target); if(!v) return; e.preventDefault(); clearTimeout(TIP.timer); showTip(v,e.clientX,e.clientY); });
document.addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse'){ if(!e.target.closest('#tip')) hideTip(); return; }
 if(TIP.el&&!TIP.el.hidden){ hideTip(); }
 const v=tipOf(e.target); TIP.long=false; TIP.sx=e.clientX; TIP.sy=e.clientY; clearTimeout(TIP.timer);
 if(v) TIP.timer=setTimeout(()=>{ TIP.long=true; showTip(v,TIP.sx,TIP.sy-40); },480); },true);
document.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse'&&Math.hypot(e.clientX-TIP.sx,e.clientY-TIP.sy)>10) clearTimeout(TIP.timer); },true);
document.addEventListener('pointerup',()=>{ clearTimeout(TIP.timer); },true);
document.addEventListener('click',e=>{ if(TIP.long){ TIP.long=false; e.preventDefault(); e.stopPropagation(); } },true);
window.addEventListener('scroll',hideTip,true);
function finishTurn(){ E.endTurn(S); UI.snap=null; UI.snapKey=null; UI.pending=[]; save(); flow(); }
try{ UI.sideHidden=localStorage.getItem('cs_side')==='0'; }catch(e){}
try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); }catch(e){}
render();
})();
