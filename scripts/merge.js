import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, parse } from "node:path";

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

  if (!existsSync(dirPath)) return entries;

  const files = readdirSync(dirPath);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const raw = readFileSync(join(dirPath, file), "utf-8");
      const parsed = parseFile(file, raw);
      entries.push(parsed);
    }
  }

  return entries;
}

export function getMergedDataset() {
  const dataset = {};

  for (const folder in SCHEMA) {
    const statusKey = SCHEMA[folder];
    dataset[statusKey] = getEntriesFromFolder(folder);
  }

  return dataset;
}
