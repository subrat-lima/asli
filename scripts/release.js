import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import process from "node:process";

const MANIFEST_PATH = "./src/manifest.json";

function getManifest() {
  const content = readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(content);
}

function saveManifest(manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

function incrementVersion(version, type) {
  const parts = version.split(".").map(Number);
  if (type === "major") {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === "minor") {
    parts[1]++;
    parts[2] = 0;
  } else {
    parts[2]++;
  }
  return parts.join(".");
}

function run(command) {
  console.log(`> ${command}`);
  try {
    return execSync(command, { encoding: "utf-8", stdio: "inherit" });
  } catch (_error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

function main() {
  const type = process.argv[2] || "patch";
  if (!["major", "minor", "patch"].includes(type)) {
    console.error("Usage: deno task release [major|minor|patch]");
    process.exit(1);
  }

  // 1. Run checks
  console.log("Checking project status...");
  run("deno task format");

  // 2. Check for clean working tree
  const status = execSync("git status --porcelain", { encoding: "utf-8" });
  if (status.trim().length > 0) {
    console.error(
      "Error: You have uncommitted changes. Please commit or stash them first.",
    );
    process.exit(1);
  }

  // 3. Update version
  const manifest = getManifest();
  const oldVersion = manifest.version;
  const newVersion = incrementVersion(oldVersion, type);
  manifest.version = newVersion;

  console.log(`Bumping version: ${oldVersion} -> ${newVersion} (${type})`);
  saveManifest(manifest);

  // 4. Commit and Tag
  run(`git add ${MANIFEST_PATH}`);
  run(`git commit -m "chore: bump version to v${newVersion}"`);
  run("git push origin main");

  // 5. Create GitHub Release
  run(
    `gh release create v${newVersion} --title "Release v${newVersion}" --generate-notes`,
  );

  console.log(`\nSuccessfully released v${newVersion}!`);
}

main();
