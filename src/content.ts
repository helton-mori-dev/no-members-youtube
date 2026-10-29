// Textos de selo/título que identificam conteúdo de membros.Para cobrir outro idioma, acrescentar a entrada aqui.
const MEMBERS_TEXTS = [
  "members only",
  "members-only",
  "só para membros",
  "somente para membros",
  "apenas para membros",
  "exclusivos para membros",
  "solo para miembros",
];

const HIDDEN_ATTR = "data-oculta-membros";

// Posto no <html> enquanto a página é de um canal liberado pelo popup. Desliga a
// camada de CSS puro do hide.css, que não passa pelo content script.
const LIBERADO_ATTR = "data-membros-liberados";

const MEMBERS_RX = new RegExp(
  MEMBERS_TEXTS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i",
);

// Cards de vídeo nos vários layouts do YouTube (Polymer antigo + view models novos)
const CONTAINER_SELECTOR = [
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-playlist-video-renderer",
  "ytd-playlist-panel-video-renderer",
  "ytd-rich-grid-media",
  "yt-lockup-view-model",
  "ytm-rich-item-renderer",
  "ytm-video-with-context-renderer",
  "ytm-compact-video-renderer",
].join(",");

// Células de grade que embrulham um card: esconder só o miolo (ex.: o
// yt-lockup-view-model dentro de um ytd-rich-item-renderer) deixaria a casca
// ocupando a célula — um buraco na grade. Marca sempre o embrulho externo.
const CELL_SELECTOR = ["ytd-rich-item-renderer", "ytm-rich-item-renderer"].join(",");

// Prateleira de marca da home. Às vezes é a propaganda de assinatura de um
// canal ("Curta benefícios como vídeos exclusivos para membros..."), só com
// vídeos de membros; às vezes não, por isso a checagem em isMembersShelf.
const BRAND_SHELF_SELECTOR = "ytd-brand-video-shelf-renderer";

// Prateleiras inteiras (ex.: "Vídeos só para membros" na página do canal)
const SHELF_SELECTOR = [
  "ytd-shelf-renderer",
  "ytd-rich-section-renderer",
  "grid-shelf-view-model",
  BRAND_SHELF_SELECTOR,
].join(",");

// Chips da barra de filtros (ex.: "Só para membros" na aba Vídeos do canal).
// É o embrulho externo, e não o botão, para o chip não deixar um vão na barra.
const CHIP_SELECTOR = [
  ".ytChipBarViewModelChipWrapper",
  "yt-chip-cloud-chip-renderer",
].join(",");

// Elementos onde os selos aparecem dentro de um card
const BADGE_SELECTOR = [
  ".badge-style-type-members-only",
  "ytd-badge-supported-renderer",
  "badge-shape",
  ".yt-badge-shape",
  "ytm-badge",
].join(",");

function isMembersBadge(badge: Element): boolean {
  return (
    badge.classList.contains("badge-style-type-members-only") ||
    badge.querySelector(".badge-style-type-members-only") !== null ||
    MEMBERS_RX.test(badge.textContent ?? "")
  );
}

function shelfTitle(shelf: Element): string {
  return (
    shelf.querySelector("#title, .shelf-title-text, h2")?.textContent ?? ""
  );
}

// A prateleira de assinatura tem o título vazio e o texto de membros só no
// subtítulo, que muda de idioma; o botão "Conheça" apontando para
// /channel_memberships não muda. Vale também para a ytd-rich-section-renderer
// que a embrulha, para a seção inteira sumir sem deixar um vão na home.
function isMembersShelf(shelf: Element): boolean {
  if (MEMBERS_RX.test(shelfTitle(shelf))) return true;
  const brand = shelf.matches(BRAND_SHELF_SELECTOR)
    ? shelf
    : shelf.querySelector(BRAND_SHELF_SELECTOR);
  return brand?.querySelector('a[href^="/channel_memberships"]') != null;
}

function chipLabel(chip: Element): string {
  return (
    chip.querySelector("[aria-label]")?.getAttribute("aria-label") ??
    chip.textContent ??
    ""
  );
}

function shouldHide(el: Element): boolean {
  if (el.matches(SHELF_SELECTOR)) return isMembersShelf(el);
  if (el.matches(CHIP_SELECTOR)) return MEMBERS_RX.test(chipLabel(el));
  for (const badge of el.querySelectorAll(BADGE_SELECTOR)) {
    if (isMembersBadge(badge)) return true;
  }
  return false;
}

// Conta só vídeos: prateleiras e chips também carregam HIDDEN_ATTR, mas não são
// vídeos e não devem entrar no número do badge.
function hiddenVideoCount(): number {
  let n = 0;
  for (const el of document.querySelectorAll(`[${HIDDEN_ATTR}]`)) {
    if (el.matches(CONTAINER_SELECTOR)) n += 1;
  }
  return n;
}

// Manda a contagem para o service worker, que a põe no badge do ícone. O scan
// roda a cada frame, então só envia quando o estado realmente muda.
let lastReported = "";
function reportCount(liberado: boolean): void {
  const ocultos = hiddenVideoCount();
  const state = `${ocultos}|${liberado}`;
  if (state === lastReported) return;
  lastReported = state;
  try {
    chrome.runtime.sendMessage({ ocultos, liberado }).catch(() => {
      // Sem receptor no momento: solta a trava para o próximo scan reenviar.
      lastReported = "";
    });
  } catch {
    // Extensão recarregada: este content script ficou órfão, nada a fazer.
  }
}

// Vazio até o storage responder: nesse intervalo tudo é ocultado, e um canal
// liberado reaparece em seguida (melhor que mostrar e esconder depois).
let liberados = new Set<string>();

function canalLiberado(): boolean {
  const key = channelKey(location.href);
  return key !== null && liberados.has(key);
}

function scan(): void {
  // Checado a cada scan, e não só no carregamento: a navegação interna do
  // YouTube troca de canal (ou sai dele) sem recarregar a página.
  if (canalLiberado()) {
    document.documentElement.setAttribute(LIBERADO_ATTR, "");
    for (const el of document.querySelectorAll(`[${HIDDEN_ATTR}]`)) {
      el.removeAttribute(HIDDEN_ATTR);
    }
    reportCount(true);
    return;
  }
  document.documentElement.removeAttribute(LIBERADO_ATTR);

  // Cards individuais com selo de membros
  for (const badge of document.querySelectorAll(BADGE_SELECTOR)) {
    if (!isMembersBadge(badge)) continue;
    const card = badge.closest(CONTAINER_SELECTOR);
    if (!card) continue;
    (card.closest(CELL_SELECTOR) ?? card).setAttribute(HIDDEN_ATTR, "");
  }

  // Prateleiras dedicadas a conteúdo de membros
  for (const shelf of document.querySelectorAll(SHELF_SELECTOR)) {
    if (isMembersShelf(shelf)) shelf.setAttribute(HIDDEN_ATTR, "");
  }

  // Chip que filtra a lista por conteúdo de membros
  for (const chip of document.querySelectorAll(CHIP_SELECTOR)) {
    if (MEMBERS_RX.test(chipLabel(chip))) chip.setAttribute(HIDDEN_ATTR, "");
  }

  // O YouTube recicla nós de DOM ao rolar e ao navegar: um card escondido pode
  // passar a exibir outro vídeo. Reverifica e desfaz a marcação se o selo sumiu.
  for (const el of document.querySelectorAll(`[${HIDDEN_ATTR}]`)) {
    if (!shouldHide(el)) el.removeAttribute(HIDDEN_ATTR);
  }

  reportCount(false);
}

// Agrupa rajadas de mutações num único scan por frame
let scanScheduled = false;
function scheduleScan(): void {
  if (scanScheduled) return;
  scanScheduled = true;
  requestAnimationFrame(() => {
    scanScheduled = false;
    scan();
  });
}

new MutationObserver(scheduleScan).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

// Dispara a cada navegação interna
window.addEventListener("yt-navigate-finish", scheduleScan);

function refreshLiberados(): void {
  loadLiberados()
    .then((set) => {
      liberados = set;
      scheduleScan();
    })
    .catch(() => {
      // Storage indisponível (ou script órfão): segue com a lista que tinha.
    });
}

refreshLiberados();

// Mudança feita em outra aba (ou em outro Chrome, via sync) vale sem recarregar
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && LIBERADOS_KEY in changes) refreshLiberados();
});

scheduleScan();
