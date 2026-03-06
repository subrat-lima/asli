# asli

A browser extension to help common man stay protected by identifying and
distinguishing between official, unofficial and scam websites.

## Data Structure

- `data` folder contains the rule information.
- `data/root` contains verified official authorities and government level
  domains.
- `data/apps` contains third-party applications and organizational portals.
- `data/dead` contains revoked, malicious and fraudulent domains.

## Development Setup

1. [Install Deno](https://docs.deno.com/runtime/getting_started/installation/).
2. Run `deno task setup` to install the local pre-commit hooks.
3. Run `deno task app` to build the extension assets.
4. Run `deno task data` to generate the latest datasets.

To test the extension:

- On Chrome: Open `chrome://extensions`, enable **Developer mode**, and click
  **Load unpacked**. Select the `dist` folder.
- On Firefox: Open `about:debugging#/runtime/this-firefox` and click **Load
  Temporary Add-on**. Select the `dist/manifest.json`.

## Versioning & Release

This project uses an automated release workflow:

- Run `deno task release [patch|minor|major]` to automatically bump versions,
  commit, and trigger store deployments.

## Attribution

- [Icon](https://www.flaticon.com/free-icons/security)

## Reference

- [gov.in domain guidelines](https://registry.gov.in/pdfdocs/Gov.In_Guidelines.pdf)
