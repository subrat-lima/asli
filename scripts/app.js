import { join } from "@std/path";

const SRC_DIR = "./src";
const DIST_DIR = "./dist";

function prepareOutputDirectory(path) {
  try {
    Deno.removeSync(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
  Deno.mkdirSync(path, { recursive: true });
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

    try {
      Deno.copyFileSync(srcPath, destPath);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        console.warn(`Could not copy ${file}: ${error.message}`);
      }
    }
  }

  const iconDir = join(targetDir, "icons");
  try {
    Deno.mkdirSync(iconDir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) throw error;
  }

  const icons = [
    "icon.png",
    "icon16.png",
    "icon32.png",
    "icon48.png",
    "icon128.png",
  ];
  for (const icon of icons) {
    const srcPath = join(sourceDir, "icons", icon);
    const destPath = join(iconDir, icon);
    try {
      Deno.copyFileSync(srcPath, destPath);
    } catch (_error) {
      // Icon might not exist, skip silently
    }
  }
}

function main() {
  try {
    prepareOutputDirectory(DIST_DIR);
    transferStaticAssets(SRC_DIR, DIST_DIR);
    console.log("Build Success: /dist is ready.");
  } catch (error) {
    console.error("Build Failed: " + error.message);
    Deno.exit(1);
  }
}

main();
