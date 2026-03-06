import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { getMergedDataset } from "./merge.js";
import process from "node:process";

const SRC_DIR = "./src";
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

function writeMetadata(targetDir) {
  const timestampPath = join(targetDir, "metadata.json");
  const metadata = { timestamp: Date.now() };
  writeFileSync(timestampPath, JSON.stringify(metadata));
}

function transferStaticAssets(sourceDir, targetDir) {
  const assets = [
    "manifest.json",
    "background.js",
    "checker.js",
    "blocked.html",
    "blocked.css",
    "blocked.js",
  ];

  for (const file of assets) {
    const srcPath = join(sourceDir, file);
    const destPath = join(targetDir, file);

    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  try {
    prepareOutputDirectory(DIST_DIR);

    const dataOutput = join(DIST_DIR, "data.min.json");
    writeMinifiedData(dataOutput);
    writeMetadata(DIST_DIR);
    transferStaticAssets(SRC_DIR, DIST_DIR);
    console.log("Build Success: /dist is ready.");
  } catch (error) {
    console.error("Build Failed: " + error.message);
    process.exit(1);
  }
}

main();
