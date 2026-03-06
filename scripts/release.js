const MANIFEST_PATH = "./src/manifest.json";

function getManifest() {
  const content = Deno.readTextFileSync(MANIFEST_PATH);
  return JSON.parse(content);
}

function saveManifest(manifest) {
  Deno.writeTextFileSync(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2) + "\n",
  );
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

function run(cmd, args) {
  const commandStr = `${cmd} ${args.join(" ")}`;
  console.log(`> ${commandStr}`);
  const command = new Deno.Command(cmd, {
    args,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { success } = command.outputSync();
  if (!success) {
    console.error(`Command failed: ${commandStr}`);
    Deno.exit(1);
  }
}

function main() {
  const type = Deno.args[0] || "patch";
  if (!["major", "minor", "patch"].includes(type)) {
    console.error("Usage: deno task release [major|minor|patch]");
    Deno.exit(1);
  }

  // 1. Run checks
  console.log("Checking project status...");
  run("deno", ["task", "format"]);

  // 2. Check for clean working tree
  const gitStatusCmd = new Deno.Command("git", {
    args: ["status", "--porcelain"],
  });
  const { stdout } = gitStatusCmd.outputSync();
  const status = new TextDecoder().decode(stdout);

  if (status.trim().length > 0) {
    console.error(
      "Error: You have uncommitted changes. Please commit or stash them first.",
    );
    Deno.exit(1);
  }

  // 3. Update version
  const manifest = getManifest();
  const oldVersion = manifest.version;
  const newVersion = incrementVersion(oldVersion, type);
  manifest.version = newVersion;

  console.log(`Bumping version: ${oldVersion} -> ${newVersion} (${type})`);
  saveManifest(manifest);

  // 4. Commit and Tag
  run("git", ["add", MANIFEST_PATH]);
  run("git", ["commit", "-m", `chore: bump version to v${newVersion}`]);
  run("git", ["push", "origin", "main"]);

  // 5. Create GitHub Release
  run("gh", [
    "release",
    "create",
    `v${newVersion}`,
    "--title",
    `Release v${newVersion}`,
    "--generate-notes",
  ]);

  console.log(`\nSuccessfully released v${newVersion}!`);
}

main();
