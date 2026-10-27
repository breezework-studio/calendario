const E=require('../src/engine.js');
const games=+process.argv[2]||6;
let t0=Date.now(), errs=0;
for(let g=0;g<games;g++){
  const n=2+(g%3);
  const s=E.newGame({players:Array.from({length:n},(_,i)=>({bot:true})),seed:1000+g});
  try{
    for(let i=0;i<n;i++) E.botWealth(s,i);
    let guard=0;
    while(!s.over && guard++<2000){
      if(s.turnIdx>=s.n){ E.endRound(s, E.canTwoDays(s)?E.botTwo(s):false); continue; }
      E.botTurn(s);
    }
    if(!s.over) throw new Error('não terminou');
    console.log(`jogo ${g} (${n}j) ronda ${s.round} dia ${s.day}:`, s.result.map(r=>`${s.players[r.id].name}=${r.total}`).join(' '),
      '| edifícios', s.players.map(p=>p.buildings.length).join('/'), 'mon', s.players.map(p=>p.monuments.length).join('/'),
      'trab', s.players.map(p=>p.workers).join('/'), 'tec', s.players.map(p=>p.tech.join('')).join(' '));
  }catch(e){ errs++; console.log('ERRO jogo',g,e.stack); console.log(s.log.slice(-8).join('\n')); }
}
console.log('tempo', (Date.now()-t0)/1000,'s', 'erros', errs);
