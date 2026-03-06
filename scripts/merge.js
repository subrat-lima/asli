import { join, parse } from "@std/path";

const DATA_DIR = "./data";
const SCHEMA = { "dead": "red", "apps": "yellow", "root": "green" };

function parseFile(fileName, rawContent) {
  const json = JSON.parse(rawContent);
  return {
    i: parse(fileName).name,
    d: json.domains,
    k: json.keywords,
  };
}

function getEntriesFromFolder(folderName) {
  const entries = [];
  const dirPath = join(DATA_DIR, folderName);

  try {
    const dirInfo = Deno.statSync(dirPath);
    if (!dirInfo.isDirectory) return entries;
  } catch (_error) {
    return entries;
  }

  for (const entry of Deno.readDirSync(dirPath)) {
    if (entry.isFile && entry.name.endsWith(".json")) {
      const raw = Deno.readTextFileSync(join(dirPath, entry.name));
      const parsed = parseFile(entry.name, raw);
      entries.push(parsed);
    }
  }

  return entries;
}

export function getMergedDataset() {
  const dataset = {};

  for (const [folder, statusKey] of Object.entries(SCHEMA)) {
    dataset[statusKey] = getEntriesFromFolder(folder);
  }

  return dataset;
}
