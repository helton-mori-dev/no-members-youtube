# Ocultar vídeos de membros — para YouTube™

Extensão Chrome que oculta vídeos **"Só para membros"** automaticamente no
YouTube: na home, nos resultados de busca, nas sugestões ao lado do player e
nas páginas de canal (incluindo prateleiras inteiras de conteúdo para membros).

> Projeto independente, **não afiliado nem endossado pelo YouTube/Google**.
> YouTube™ é marca registrada da Google LLC.

Sem frameworks — só TypeScript e CSS

## Instalar

Instale pela Chrome Web Store:
**[Ocultar vídeos de membros — para YouTube™](https://chromewebstore.google.com/detail/ocultar-v%C3%ADdeos-de-membros/pbghldleajanejdddhkcbmokhigcinmo)**

Funciona no Chrome e nos navegadores baseados em chromium (Edge, Brave, Opera).

## Desativar em um canal

Se quiser ver os vídeos de membros de um canal específico, entre na página de um canal, clique no ícone da extensão e desligue o toggle
**Ativa neste canal**. A aba recarrega com os vídeos de membros daquele canal
visíveis, e o badge do ícone passa a mostrar `OFF`. Para voltar a ocultar,
ative o toggle na página do canal.

A exceção vale só nas páginas do canal: na home, na busca e nas sugestões, os
vídeos de membros dele continuam ocultos. Como o canal é identificado pela URL,
abri-lo por `/@handle` e por `/channel/<id>` conta como dois canais diferentes.

## Build

```sh
npm install
npm run build
```

## Testar no Chrome

1. Rode o build, se não existir a pasta dist
2. Abra `chrome://extensions`.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e selecione a pasta raiz do projeto
   — a que contém o `manifest.json`, e não a `dist/`.
5. Abra o YouTube — os vídeos de membros somem. Após editar o código,
   clique no ícone de recarregar da extensão em `chrome://extensions`.

## Gerar os pacotes

```sh
npm run package
```

Roda o build e gera duas saídas em `build/`:

- **`build/extensao/`** — a pasta sem compactação, com exatamente os arquivos
  que vão para a chrome store. Carregue daqui quando quiser testar o mesmo conjunto que
  será publicado, e não a pasta do projeto inteira.
- **`build/youtube-hide-members-<versão>.zip`** — o arquivo a enviar no painel
  da Chrome Web Store. O `manifest.json` fica na raiz do zip, como o painel
  exige.

## Changelog

As mudanças de cada versão estão em [CHANGELOG.md](CHANGELOG.md).
