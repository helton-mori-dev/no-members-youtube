// Monta o pacote da extensão em build/: a pasta sem compactação, que é o que o
// Chrome aceita em "Carregar sem compactação", e o zip de envio para a loja.
//
//   - o manifest.json precisa ficar na RAIZ do zip, nunca dentro de uma
//     subpasta (compactar a pasta do projeto pelo Explorer erra justamente
//     nisso e o upload é recusado);
//
// O script também confere que todo arquivo citado no manifest está na lista
// FILES, para que uma referência nova não fique de fora do pacote em silêncio.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZipArchive } from "archiver";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "build");
const STAGE = path.join(OUT_DIR, "extensao");

// Tudo que o Chrome realmente carrega, e só isso.
const FILES = [
  "manifest.json",
  "dist/content.js",
  "dist/background.js",
  "styles/hide.css",
  "icons/icon16.png",
  "icons/icon48.png",
  "icons/icon128.png",
];

// Caminhos que o manifest referencia. Padrões com "*" ficam de fora: são globs,
// não arquivos, e não fazem sentido comparar com a lista.
function manifestRefs(manifest) {
  const refs = Object.values(manifest.icons ?? {});
  if (manifest.background?.service_worker) {
    refs.push(manifest.background.service_worker);
  }
  if (manifest.action?.default_popup) refs.push(manifest.action.default_popup);
  for (const cs of manifest.content_scripts ?? []) {
    refs.push(...(cs.js ?? []), ...(cs.css ?? []));
  }
  return refs.filter((r) => !r.includes("*"));
}

function falhar(msg) {
  console.error(`\npackage: ${msg}\n`);
  process.exit(1);
}

const ler = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const manifest = ler("manifest.json");
const pkg = ler("package.json");

const ausentes = FILES.filter((f) => !fs.existsSync(path.join(ROOT, f)));
if (ausentes.length) {
  falhar(
    `arquivo(s) ausente(s): ${ausentes.join(", ")}. Rode "npm run build".`,
  );
}

const naoEmpacotados = manifestRefs(manifest).filter((r) => !FILES.includes(r));
if (naoEmpacotados.length) {
  falhar(
    `o manifest referencia arquivo(s) fora da lista FILES deste script: ` +
      `${naoEmpacotados.join(", ")}. Acrescente-o(s) e rode de novo.`,
  );
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// Apagada a cada build: sobra de um build anterior seria carregada pelo Chrome
// junto com o resto, mascarando um arquivo que deixou de existir.
fs.rmSync(STAGE, { recursive: true, force: true });
for (const f of FILES) {
  const destino = path.join(STAGE, f);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(path.join(ROOT, f), destino);
  console.log(`  + ${f}`);
}

const zipPath = path.join(OUT_DIR, `${pkg.name}-${manifest.version}.zip`);
const saida = fs.createWriteStream(zipPath);
const zip = new ZipArchive({ zlib: { level: 9 } });
zip.on("warning", (e) => falhar(e.message));
zip.on("error", (e) => falhar(e.message));
saida.on("close", () => {
  console.log(`\npasta  ${path.relative(ROOT, STAGE)}`);
  console.log(`       → Chrome: "Carregar sem compactação", aponte para ela`);
  console.log(
    `\nzip    ${path.relative(ROOT, zipPath)} — ${zip.pointer()} bytes`,
  );
  console.log(`       → loja: suba este arquivo (versão ${manifest.version})`);
});

zip.pipe(saida);
zip.directory(STAGE, false); // conteúdo na raiz do zip, espelhando a pasta
zip.finalize();
