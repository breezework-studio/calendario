# Calendário Sagrado

Jogo de tabuleiro com engrenagens e trabalhadores, para 2 a 4 jogadores (humanos ou computador).
Joga-se no browser, funciona offline e instala-se no telemóvel como app.

**Jogar:** https://breezework-studio.github.io/calendario/

## Estrutura
- `src/engine.js` — regras do jogo e adversário de computador
- `src/ui.js` — tabuleiro, janelas e interação
- `src/template.html` — estilos e esqueleto da página
- `tools/build.py` — junta tudo em `index.html` (o ficheiro que o site serve)
- `tests/` — partidas automáticas (`node tests/sim.js 12`) e teste da interface (`node tests/uitest.js 3`, precisa de `npm i jsdom`)
- `manifest.webmanifest`, `sw.js`, ícones — instalação como app e modo offline

Depois de mudar algo em `src/`, corre `python3 tools/build.py` e testa antes de enviar.

Adaptação pessoal e não comercial; arte e nomes originais.
