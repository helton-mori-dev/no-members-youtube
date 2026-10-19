// Badge no ícone da extensão: mostra quantos vídeos de membros foram ocultos na
// aba, ou "OFF" quando a aba está num canal em que o usuário desativou a
// extensão.

const BADGE_BG = "#006926";
const BADGE_BG_OFF = "#5f6368";

function badgeText(n: number): string {
  if (n === 0) return "";
  return n > 99 ? "99+" : String(n);
}

function badgeTitle(n: number): string {
  if (n === 0) return "Nenhum vídeo de membros oculto nesta aba";
  if (n === 1) return "1 vídeo de membros oculto nesta aba";
  return `${n} vídeos de membros ocultos nesta aba`;
}

chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab?.id;
  const msg = message as { ocultos?: unknown; liberado?: unknown } | null;
  const ocultos = msg?.ocultos;
  if (tabId === undefined || typeof ocultos !== "number") return;
  const liberado = msg?.liberado === true;

  const text = liberado ? "OFF" : badgeText(ocultos);
  const color = liberado ? BADGE_BG_OFF : BADGE_BG;
  const title = liberado
    ? "Desativada neste canal: vídeos de membros visíveis"
    : badgeTitle(ocultos);

  // A aba pode ter sido fechada entre o envio e a entrega: ignora a falha.
  const ignore = (): void => {};
  chrome.action.setBadgeText({ tabId, text }).catch(ignore);
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(ignore);
  chrome.action.setTitle({ tabId, title }).catch(ignore);
});
