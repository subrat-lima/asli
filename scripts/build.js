import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getMergedDataset } from "./merge.js";
import process from "node:process";

const DIST_DIR = "./dist";

function prepareOutputDirectory(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
  mkdirSync(path);
}

function writeMinifiedData(targetPath) {
  const dataset = getMergedDataset();
  writeFileSync(targetPath, JSON.stringify(dataset));
}

function main() {
  try {
    prepareOutputDirectory(DIST_DIR);

    const dataOutput = join(DIST_DIR, "data.min.json");
    writeMinifiedData(dataOutput);
    console.log("Build Success: /dist is ready.");
  } catch (error) {
    console.error("Build Failed: " + error.message);
    process.exit(1);
  }
}

main();
