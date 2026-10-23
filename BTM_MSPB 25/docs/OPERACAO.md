# Apresentação Morro de São Paulo & Boipeba — BTM 2026

## Como abrir
Dê dois cliques em `index.html` (Chrome ou Safari). Funciona sem internet. Mantenha a pasta inteira junta.

## Atalhos
- → / espaço / passador: avançar · ← voltar
- F: tela cheia · P: modo apresentador (notas, cronômetro, lista de cenas)
- R: reiniciar a cena · K: pausar/retomar · 1–9 e 0: ir para a cena · End: última · ?: ajuda

## Editar números (sem mexer no código)
Abra `data/dados.js` num editor de texto.
- Indicadores: troque `valor`. `valor: null` esconde o item da tela.
- **Pendente:** número oficial de visitantes por ano (hoje `null`).
- Tempos de acesso: `acesso` (minutos e rótulo).
- Retrato do palestrante: copie a foto para `assets/img/` e preencha `retrato: 'assets/img/nome-da-foto.jpg'`.

## Vídeos
Coloque os trechos em `assets/video/` (MP4 H.264, 1080p, 8–15 s, sem áudio). A troca de foto por vídeo em cada cena é a próxima etapa.

## Cena de origem (slide 05)
Mapa com o contorno do Brasil traçado a partir de coordenadas geográficas (versão simplificada). Os percentuais ficam em `data/dados.js`, bloco `origem`. A espessura de cada fluxo e o tamanho de cada ponto são proporcionais ao percentual do estado.

## Dados que precisam de confirmação antes do BTM
Veja `docs/FONTES.md`.

## Moodboard de experiências (slide 08)
Uma cena só, com 18 passos comandados pelo apresentador (→ avança, ← volta): abertura, Morro (7 experiências), Boipeba (5), Cairu Sede e fechamento.
Textos e fotos de cada passo ficam em `js/apresentacao.js`, na lista `MB_STEPS` (campo `hero` = foto principal, `sats` = fotos de apoio).
Para trocar uma foto: copie o arquivo para `assets/img/` com o mesmo nome do que vai substituir.
Fotos que precisam ser substituídas antes do BTM: ostras em Canavieiras (baixa resolução, local não confirmado) e as fotos de Cairu (baixa resolução).

Vídeos ficam em `assets/video/` em duas versões (WebM e MP4, sem áudio). O navegador usa a que conseguir tocar.
