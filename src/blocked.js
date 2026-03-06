function getParam(urlParams, key, fallback) {
  return urlParams.get(key) || fallback;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function handleExit() {
  const api = globalThis.browser || globalThis.chrome;
  if (api && api.tabs) {
    api.tabs.create({});
    api.tabs.getCurrent((t) => (t && t.id ? api.tabs.remove(t.id) : close()));
    return;
  }

  const isFirefox = navigator.userAgent.includes("Firefox");
  location.href = isFirefox ? "about:home" : "chrome://newtab/";
}

function handleProceed(urlParams) {
  const target = urlParams.get("target");
  if (!target) return;

  const joiner = target.includes("?") ? "&" : "?";
  location.href = target + joiner + "asli_bypass=true";
}

function init() {
  const params = new URLSearchParams(location.search);

  setText("host", getParam(params, "host", "Unknown Domain"));
  setText("category", getParam(params, "cat", "Unverified"));
  setText("reason", getParam(params, "why", "Site not in trusted database"));

  document.getElementById("exit").onclick = handleExit;
  document.getElementById("proceed").onclick = () => handleProceed(params);
}

document.addEventListener("DOMContentLoaded", init);
