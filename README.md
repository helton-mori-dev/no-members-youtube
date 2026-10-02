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
4. Clique em **Carregar sem compactação** e selecione a pasta dist.
5. Abra o YouTube — os vídeos de membros somem. Após editar o código,
   clique no ícone de recarregar da extensão em `chrome://extensions`.
