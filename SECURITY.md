# Security Policy

## What this tool does with your data

BUSSID Mod Tuner runs entirely in your browser (or in Node.js for the CLI). The mod file is read into memory, changed, and saved back to your device. **It makes no network requests with your file and has no server.**

The page loads fonts from Google Fonts. That request carries no mod data.

## Supported versions

Only the latest release on the `main` branch receives fixes.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use **GitHub private vulnerability reporting**: open the repository's *Security* tab and choose *Report a vulnerability*. Include what you found, how to reproduce it, and the impact you expect.

You can expect a first reply within a week.

## What counts as a security issue here

- A crafted mod file that makes the page or CLI run code, read other files, or hang the browser.
- Anything that would make the tool send a file or its contents somewhere.
- A flaw in the hosted page that could affect other sites or visitors.

Bugs that only produce a wrong number or a file the game rejects are normal issues, not security reports.

## A note for users

Edited mods can crash the game if the values are extreme. Keep a backup of every original file, and only download mods from authors you trust.
