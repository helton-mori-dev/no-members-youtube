# Changelog

Mudanças relevantes desta extensão, versão a versão. O formato segue o
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento
segue o [SemVer](https://semver.org/lang/pt-BR/).

## [1.1.0] — 2026-10-03

### Adicionado

- Badge no ícone da extensão com a quantidade de vídeos de membros ocultos na
  aba atual. A contagem é por aba, some quando não há nada oculto e vira `99+`
  acima de 99. O tooltip do ícone traz o mesmo número por extenso.
- `npm run package`: gera `build/extensao/` (para "Carregar sem compactação")
  e o zip de envio à Chrome Web Store, com o manifest na raiz e apenas os
  arquivos que o Chrome carrega.

### Corrigido

- README: o passo de "Carregar sem compactação" mandava selecionar a pasta
  `dist/`, onde não existe `manifest.json`. O correto é a raiz do projeto.

## [1.0.0] — 2026-09-29

Primeira versão publicada.

### Adicionado

- Ocultação de vídeos "Só para membros" na home, nos resultados de busca, nas
  sugestões ao lado do player e nas páginas de canal.
- Ocultação de prateleiras inteiras dedicadas a conteúdo de membros e do chip
  "Só para membros" na barra de filtros da aba Vídeos.
- Detecção em duas camadas: CSS puro para o layout antigo, em que o selo tem
  classe própria, e content script comparando o texto do selo no layout novo
  (português, inglês e espanhol).
- Reverificação contínua dos cards: como o YouTube recicla nós do DOM ao rolar,
  a marcação é desfeita quando um card deixa de ser de membros.
- Ocultação da célula inteira da grade, para os vídeos seguintes ocuparem o
  espaço sem deixar buraco no layout.
