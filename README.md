# Asli

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/subrat-lima/asli)](https://github.com/subrat-lima/asli/releases)
[![Build Status](https://github.com/subrat-lima/asli/actions/workflows/build-data.yml/badge.svg)](https://github.com/subrat-lima/asli/actions)

A browser extension to help the common man stay protected by identifying and
distinguishing between official, unofficial and scam websites.

## Install

- **Firefox**:
  [Available on Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/asli/)
- **Chrome**:
  [Available on Web Store](https://chromewebstore.google.com/detail/asli/ddccfpeejambeenfjpkcabkcmkjnbogg)

---

## Data Structure

- `data/` folder contains the rule information.
- `data/root/`: Verified official authorities and government level domains.
- `data/apps/`: Third-party applications and organizational portals.
- `data/dead/`: Revoked, malicious and fraudulent domains.

---

## Development Setup

1. **Install Deno**:
   [Follow the official guide](https://docs.deno.com/runtime/getting_started/installation/).
2. **Setup Hooks**: Run `deno task setup` to install local pre-commit hooks.
3. **Build Assets**: Run `deno task app` to build the extension assets.
4. **Generate Data**: Run `deno task data` to generate the latest datasets.

### Testing the Extension:

- **Chrome**: Open `chrome://extensions`, enable **Developer mode**, and click
  **Load unpacked**. Select the `dist/` folder.
- **Firefox**: Open `about:debugging#/runtime/this-firefox` and click **Load
  Temporary Add-on**. Select `dist/manifest.json`.

---

## Contributing

Contributions to the website database are welcome!

- **Adding Domains**: To add or update a website, create a JSON file in the
  appropriate `data/` sub-folder.
- **Data Updates**: Pushing changes to the `data/` folder in the `main` branch
  will automatically update the live database for all users without requiring a
  new extension release.
- **Code Changes**: For bug fixes or new features in the extension logic, please
  submit a Pull Request.

---

## Versioning & Release

This project uses an automated release workflow for extension updates:

- Run `deno task release [patch|minor|major]` to automatically bump versions,
  commit, and trigger store deployments.

---

## Attribution & References

- **Icon**:
  [Security icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/security)
- **Guidelines**:
  [gov.in domain guidelines](https://registry.gov.in/pdfdocs/Gov.In_Guidelines.pdf)
