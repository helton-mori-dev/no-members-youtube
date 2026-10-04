# Ocultar vídeos de membros — para YouTube™

Extensão Chrome (Manifest V3) que oculta vídeos **"Só para membros"** no
YouTube: na home, nos resultados de busca, nas sugestões ao lado do player e
nas páginas de canal (incluindo prateleiras inteiras de conteúdo para membros).

> Projeto independente, **não afiliado nem endossado pelo YouTube/Google**.
> YouTube™ é marca registrada da Google LLC.

Sem frameworks — só TypeScript e CSS

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

## Empacotar

```sh
npm run package
```

Roda o build e gera duas saídas em `build/`:

- **`build/extensao/`** — a pasta sem compactação, com exatamente os arquivos
  que vão para a loja. Carregue daqui quando quiser testar o mesmo conjunto que
  será publicado, e não a pasta do projeto inteira.
- **`build/youtube-hide-members-<versão>.zip`** — o arquivo a enviar no painel
  da Chrome Web Store. O `manifest.json` fica na raiz do zip, como o painel
  exige.

O script falha se algum arquivo da lista não existir ou se o manifest passar a
referenciar um arquivo que não está sendo empacotado.

Antes de publicar, suba o `version` do `manifest.json`: o Chrome recusa upload
cuja versão não seja maior que a já publicada.

## Changelog

As mudanças de cada versão estão em [CHANGELOG.md](CHANGELOG.md).
