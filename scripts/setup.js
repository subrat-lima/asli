const HOOK_SOURCE = "hooks/pre-commit";
const HOOK_TARGET = ".git/hooks/pre-commit";

try {
  Deno.copyFileSync(HOOK_SOURCE, HOOK_TARGET);
  Deno.chmodSync(HOOK_TARGET, 0o755);
  console.log("pre-commit hooks installed.");
} catch (error) {
  console.error("setup failed: make sure you are in the project root.");
  console.error(error.message);
  Deno.exit(1);
}
