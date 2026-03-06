# asli

A browser extension to help people stay protected by identifying and
categorizing official, unofficial and scam websites.

## Data Structure

- `data` folder contains the rules information.
- `data/root` contain verified official authorities and government level
  domains.
- `data/apps` contain third-party applications and organizations portals.
- `data/dead` contain revoked, malicious and fradulent domains.

## Development setup

- [Install deno.](https://docs.deno.com/runtime/getting_started/installation/)
- Run `deno task setup` to install the pre-commit hook.
- Run `deno task build` to generate the build.
- On chrome open `chrome://extensions`, enable developer mode, then load the
  extension by selecting the `dist` folder.

## Attibution

- [Icon](https://www.flaticon.com/free-icons/security)

## Reference

- [gov.in domain guidelines](https://registry.gov.in/pdfdocs/Gov.In_Guidelines.pdf)
