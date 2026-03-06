import { checkUrlStatus } from "./checker.js";

const browserApi = globalThis.browser || globalThis.chrome;
let dataset = { red: [], yellow: [], green: [] };

const COLORS = {
  red: "#FF0000",
  yellow: "#FFD700",
  green: "#008000",
  unknown: "#808080",
};

async function loadDataset() {
  try {
    const response = await fetch(browserApi.runtime.getURL("data.min.json"));
    dataset = await response.json();
    console.log("Asli dataset loaded");
  } catch (error) {
    console.error("Failed to load dataset:", error);
  }
}

function updateUI(tabId, status) {
  browserApi.action.setBadgeBackgroundColor({
    color: COLORS[status] || COLORS.unknown,
    tabId,
  });

  browserApi.action.setBadgeText({
    text: status === "unknown" ? "" : "!",
    tabId,
  });
}

function handleTabUpdate(tabId, url) {
  const result = checkUrlStatus(url, dataset);
  updateUI(tabId, result.status);

  if (result.action === "block" || result.action === "notify") {
    const hostname = new URL(url).hostname;
    const params = new URLSearchParams({
      host: hostname,
      cat: result.category,
      why: result.reason,
      target: url,
    });

    const blockUrl = `${browserApi.runtime.getURL("blocked.html")}?${params}`;
    browserApi.tabs.update(tabId, { url: blockUrl });
  }
}

browserApi.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  if (changeInfo.status === "loading") {
    handleTabUpdate(tabId, tab.url);
  } else if (changeInfo.status === "complete") {
    updateUI(tabId, checkUrlStatus(tab.url, dataset).status);
  }
});

browserApi.runtime.onInstalled.addListener(loadDataset);
browserApi.runtime.onStartup.addListener(loadDataset);
