import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getMergedDataset } from "./merge.js";
import process from "node:process";

const DIST_DIR = "./dist";

function ensureOutputDirectory(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function writeMinifiedData(targetPath) {
  const dataset = getMergedDataset();
  writeFileSync(targetPath, JSON.stringify(dataset));
}

function writeMetadata(targetDir) {
  const timestampPath = join(targetDir, "metadata.json");
  const metadata = { timestamp: Date.now() };
  writeFileSync(timestampPath, JSON.stringify(metadata));
}

function main() {
  try {
    ensureOutputDirectory(DIST_DIR);

    const dataOutput = join(DIST_DIR, "data.min.json");
    writeMinifiedData(dataOutput);
    writeMetadata(DIST_DIR);
    console.log(
      "Data Build Success: /dist/data.min.json and metadata.json are ready.",
    );
  } catch (error) {
    console.error("Data Build Failed: " + error.message);
    process.exit(1);
  }
}

main();
