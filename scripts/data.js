import { join } from "@std/path";
import { getMergedDataset } from "./merge.js";

const DIST_DIR = "./dist";

function ensureOutputDirectory(path) {
  try {
    Deno.mkdirSync(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) throw error;
  }
}

function writeMinifiedData(targetPath) {
  const dataset = getMergedDataset();
  Deno.writeTextFileSync(targetPath, JSON.stringify(dataset));
}

function writeMetadata(targetDir) {
  const timestampPath = join(targetDir, "metadata.json");
  const metadata = { timestamp: Date.now() };
  Deno.writeTextFileSync(timestampPath, JSON.stringify(metadata));
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
    Deno.exit(1);
  }
}

main();
