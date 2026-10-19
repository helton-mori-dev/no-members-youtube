// Popup do ícone da extensão: liga e desliga a ocultação no canal aberto na aba
// atual. A URL da aba vem da permissão activeTab, concedida ao abrir o popup.

function popupEl<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function renderEstado(ativa: boolean): void {
  popupEl("estado").textContent = ativa
    ? "Vídeos de membros ocultos neste canal."
    : "Desativada: vídeos de membros visíveis neste canal.";
}

async function initPopup(): Promise<void> {
  const toggle = popupEl<HTMLInputElement>("toggle");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const key = tab?.url ? channelKey(tab.url) : null;
  if (tab?.id === undefined || key === null) {
    popupEl("estado").textContent =
      "Abra a página de um canal no YouTube para desativar a extensão só nele.";
    return; // o toggle fica desabilitado
  }
  const tabId = tab.id;

  popupEl("nome").textContent =
    tab.title?.replace(/\s+-\s+YouTube$/, "") || key;
  popupEl("chave").textContent = key;
  popupEl("canal").hidden = false;

  toggle.checked = !(await loadLiberados()).has(key);
  toggle.disabled = false;
  renderEstado(toggle.checked);

  toggle.addEventListener("change", async () => {
    toggle.disabled = true;
    try {
      await setLiberado(key, !toggle.checked);
      renderEstado(toggle.checked);
      await chrome.tabs.reload(tabId);
    } catch {
      toggle.checked = !toggle.checked;
      popupEl("estado").textContent = "Não foi possível salvar. Tente de novo.";
    }
    toggle.disabled = false;
  });
}

initPopup().catch(() => {
  popupEl("estado").textContent = "Não foi possível ler a aba atual.";
});
