# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-10-31

### Changed
- README now links the live tool at https://fawazbhseo.in/tools/bussid-mod-tuner/ and explains how to use it, with a short FAQ.
- Hosting instructions cover cPanel and Hostinger-style hosts, GitHub Pages and running from disk.

## [1.0.0] - 2026-10-31

### Added
- Browser tool that opens a `.bussidmod` vehicle file, shows engine, handling and gear values, and saves an edited copy. The file never leaves the device.
- Fast preset (300 km/h) and **Fit gears to top speed**.
- Clean and Neon looks, with the choice remembered.
- Command-line version in `tools/cli.js`.
- Tests with a synthetic fixture, and a check that `index.html` matches a fresh build.
- Documentation of the file layout in `docs/FORMAT.md`.
