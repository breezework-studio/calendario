"""Junta src/engine.js, src/ui.js e src/template.html num único index.html (site + app instalável)."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src = root / 'src'
html = (src / 'template.html').read_text(encoding='utf-8')
html = html.replace('/*ENGINE*/', (src / 'engine.js').read_text(encoding='utf-8'))
html = html.replace('/*UI*/', (src / 'ui.js').read_text(encoding='utf-8'))
html = html.replace('<meta name="theme-color" content="#13201a">',
    '<meta name="theme-color" content="#13201a">\n<link rel="manifest" href="manifest.webmanifest">\n'
    '<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-192.png">', 1)
html = html.replace('</body>', "<script>if('serviceWorker' in navigator && location.protocol.startsWith('http')) "
    "navigator.serviceWorker.register('sw.js').catch(()=>{});</script>\n</body>", 1)
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html gerado')
