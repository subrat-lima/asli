let dataset = { red: [], yellow: [], green: [] };

async function loadDataset() {
  try {
    const url = chrome.runtime.getURL("data.min.json");
    const response = await fetch(url);
    dataset = await response.json();
    console.log("Asli dataset loaded");
  } catch (error) {
    console.error("Failed to load dataset:", error);
  }
}

function isDomainMatch(hostname, domains) {
  for (const domain of domains) {
    if (hostname === domain || hostname.endsWith("." + domain)) {
      return true;
    }
  }
  return false;
}

function checkUrlStatus(url) {
  try {
    const hostname = new URL(url).hostname;

    for (const entry of dataset.red) {
      if (isDomainMatch(hostname, entry.d)) return "red";
    }

    for (const entry of dataset.yellow) {
      if (isDomainMatch(hostname, entry.d)) return "yellow";
    }

    for (const entry of dataset.green) {
      if (isDomainMatch(hostname, entry.d)) return "green";
    }

    return "unknown";
  } catch (_e) {
    return "unknown";
  }
}

function updateUI(tabId, status) {
  const colors = {
    red: "#FF0000",
    yellow: "#FFD700",
    green: "#008000",
    unknown: "#808080",
  };

  chrome.action.setBadgeBackgroundColor({
    color: colors[status],
    tabId: tabId,
  });

  const label = status === "unknown" ? "" : "!";
  chrome.action.setBadgeText({ text: label, tabId: tabId });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const status = checkUrlStatus(tab.url);
    updateUI(tabId, status);
  }
});

chrome.runtime.onInstalled.addListener(loadDataset);
chrome.runtime.onStartup.addListener(loadDataset);
