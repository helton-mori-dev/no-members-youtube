"use strict";
// Badge no ícone da extensão: mostra quantos vídeos de membros foram ocultos na
// aba.
const BADGE_BG = "#006926";
function badgeText(n) {
    if (n === 0)
        return "";
    return n > 99 ? "99+" : String(n);
}
function badgeTitle(n) {
    if (n === 0)
        return "Nenhum vídeo de membros oculto nesta aba";
    if (n === 1)
        return "1 vídeo de membros oculto nesta aba";
    return `${n} vídeos de membros ocultos nesta aba`;
}
chrome.runtime.onMessage.addListener((message, sender) => {
    const tabId = sender.tab?.id;
    const ocultos = message?.ocultos;
    if (tabId === undefined || typeof ocultos !== "number")
        return;
    // A aba pode ter sido fechada entre o envio e a entrega: ignora a falha.
    const ignore = () => { };
    chrome.action.setBadgeText({ tabId, text: badgeText(ocultos) }).catch(ignore);
    chrome.action
        .setBadgeBackgroundColor({ tabId, color: BADGE_BG })
        .catch(ignore);
    chrome.action.setTitle({ tabId, title: badgeTitle(ocultos) }).catch(ignore);
});
