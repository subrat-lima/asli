import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const SRC_DIR = "./src";
const DIST_DIR = "./dist";

function prepareOutputDirectory(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
  mkdirSync(path);
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

  const iconDir = join(targetDir, "icons");
  if (!existsSync(iconDir)) {
    mkdirSync(iconDir, { recursive: true });
  }
  const iconFile = join(sourceDir, "icons", "icon.png");
  if (existsSync(iconFile)) {
    copyFileSync(iconFile, join(iconDir, "icon.png"));
  }
}

function main() {
  try {
    prepareOutputDirectory(DIST_DIR);

    transferStaticAssets(SRC_DIR, DIST_DIR);
    console.log("Build Success: /dist is ready.");
  } catch (error) {
    console.error("Build Failed: " + error.message);
    process.exit(1);
  }
}

main();
