"use strict";
// Canais em que o usuário desativou a extensão pelo popup. Compartilhado entre
// o content script e o popup: os dois carregam dist/canal.js antes do próprio
// script.
// chrome.storage.sync, e não localStorage: o popup e o content script vivem em
// origens diferentes (o localStorage do content script é o do youtube.com), e
// assim a lista ainda acompanha o usuário entre os Chromes em que ele entra.
const LIBERADOS_KEY = "canaisLiberados";
// Chave do canal a partir da URL, ou null fora de uma página de canal. Cobre
// /@handle, /channel/<id>, /c/<nome> e /user/<nome>, com ou sem aba (/videos,
// /shorts...). Handles e nomes não diferenciam maiúsculas; o id do canal sim.
//
// Limitação: o mesmo canal aberto por /@handle e por /channel/<id> dá duas
// chaves diferentes, porque a URL sozinha não liga uma à outra.
function channelKey(url) {
    let u;
    try {
        u = new URL(url);
    }
    catch {
        return null;
    }
    if (u.hostname !== "www.youtube.com" && u.hostname !== "m.youtube.com") {
        return null;
    }
    // Handles com acento chegam codificados (%C3%A9...): decodifica antes de
    // passar para minúsculas, senão "É" escaparia da conversão.
    const [first, second] = u.pathname
        .split("/")
        .filter(Boolean)
        .map((s) => {
        try {
            return decodeURIComponent(s);
        }
        catch {
            return s;
        }
    });
    if (first?.startsWith("@") && first.length > 1)
        return first.toLowerCase();
    if (first === "channel" && second)
        return `channel/${second}`;
    if ((first === "c" || first === "user") && second) {
        return `${first}/${second.toLowerCase()}`;
    }
    return null;
}
async function loadLiberados() {
    const data = await chrome.storage.sync.get(LIBERADOS_KEY);
    const list = data[LIBERADOS_KEY];
    if (!Array.isArray(list))
        return new Set();
    return new Set(list.filter((k) => typeof k === "string"));
}
async function setLiberado(key, liberado) {
    const liberados = await loadLiberados();
    if (liberado)
        liberados.add(key);
    else
        liberados.delete(key);
    await chrome.storage.sync.set({ [LIBERADOS_KEY]: [...liberados] });
}
