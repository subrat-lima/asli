import { checkUrlStatus } from "./checker.js";

const browserApi = globalThis.browser || globalThis.chrome;
let dataset = { red: [], yellow: [], green: [] };

const GITHUB_SOURCE =
  "https://raw.githubusercontent.com/subrat-lima/asli/gh-pages/data.min.json";
const GITHUB_METADATA_SOURCE =
  "https://raw.githubusercontent.com/subrat-lima/asli/gh-pages/metadata.json";

async function getCachedStorageData() {
  try {
    return await browserApi.storage.local.get([
      "dataset",
      "lastFetchTime",
      "metadataTimestamp",
    ]);
  } catch (err) {
    console.warn("Failed to read from local storage:", err);
    return {};
  }
}

function isDataFresh(lastFetchTime) {
  if (!lastFetchTime) return false;
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  return now - lastFetchTime < oneDayInMs;
}

async function checkRemoteMetadata(storedMeta) {
  try {
    const metaRes = await fetch(GITHUB_METADATA_SOURCE, { cache: "no-store" });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      return {
        hasChanged: !storedMeta || meta.timestamp !== storedMeta,
        newTimestamp: meta.timestamp,
      };
    }
  } catch (metaErr) {
    console.warn("Could not fetch remote metadata.", metaErr);
  }
  return { hasChanged: true, newTimestamp: null };
}

async function fetchAndCacheRemoteDataset(newMetaTimestamp) {
  try {
    const remote = await fetch(GITHUB_SOURCE, { cache: "no-store" });
    if (!remote.ok) throw new Error(`HTTP ${remote.status}`);
    const remoteData = await remote.json();
    dataset = remoteData; // Update active memory

    await browserApi.storage.local.set({
      dataset: remoteData,
      lastFetchTime: Date.now(),
      metadataTimestamp: newMetaTimestamp,
    });
    console.log("Success: New remote dataset pulled from GitHub and cached.");
  } catch (error) {
    console.warn(
      "Could not sync remote dataset. Proceeding with local version.",
      error,
    );
  }
}

async function loadDataset() {
  try {
    const localRes = await fetch(browserApi.runtime.getURL("data.min.json"));
    const localMetaRes = await fetch(
      browserApi.runtime.getURL("metadata.json"),
    );
    const localDataset = await localRes.json();
    const localMeta = await localMetaRes.json();

    const stored = await getCachedStorageData();

    if (
      stored.dataset && stored.metadataTimestamp &&
      stored.metadataTimestamp > localMeta.timestamp
    ) {
      dataset = stored.dataset;
      console.log("Cached dataset is newer than bundle. Using cache.");
    } else {
      dataset = localDataset;
      console.log("Local bundle is newer (or equal). Using bundle.");
      // Seed storage with bundled data if cache is old
      if (
        !stored.metadataTimestamp ||
        localMeta.timestamp > stored.metadataTimestamp
      ) {
        await browserApi.storage.local.set({
          dataset: localDataset,
          metadataTimestamp: localMeta.timestamp,
        });
      }
    }

    if (isDataFresh(stored.lastFetchTime)) {
      console.log("Dataset is fresh. Skipping remote fetch today.");
      return;
    }

    const metaData = await checkRemoteMetadata(
      stored.metadataTimestamp || localMeta.timestamp,
    );

    if (!metaData.hasChanged) {
      console.log("Remote dataset has not changed. Skipping data fetch.");
      await browserApi.storage.local.set({ lastFetchTime: Date.now() });
      return;
    }

    await fetchAndCacheRemoteDataset(metaData.newTimestamp);
  } catch (error) {
    console.warn("Dataset loading failed:", error);
  }
}

function updateUI(tabId, _status) {
  browserApi.action.setBadgeText({
    text: "",
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

browserApi.runtime.onInstalled.addListener(() => {
  loadDataset();
  browserApi.alarms.create("syncDataset", { periodInMinutes: 1440 });
});

browserApi.runtime.onStartup.addListener(() => {
  loadDataset();
});

browserApi.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncDataset") {
    console.log("Alarm triggered: Syncing dataset");
    loadDataset();
  }
});
