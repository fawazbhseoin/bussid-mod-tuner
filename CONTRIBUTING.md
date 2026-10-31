# Contributing

Thanks for helping. This project is small on purpose: one HTML page, one logic file, no dependencies.

## Ways to help

- **Report a mod that does not open.** This is the most useful report. See below for how to do it without sharing the mod.
- **Confirm what a value does in the game.** If you know what a setting really changes, update [docs/FORMAT.md](docs/FORMAT.md) and open a pull request.
- **Fix a bug or add a feature** from the ideas list in the issues.
- **Improve the interface:** translations, accessibility, phone layout.

## Reporting a mod that does not open

Please do **not** attach someone else's mod to an issue. Instead include:

1. The mod's name and where it came from (a link is fine).
2. The message the page shows (for example "Not found in this mod: antiRoll").
3. The output of this command on the mod, which lists readable text and never contains the 3D model:
   ```bash
   strings -n 4 yourmod.bussidmod | grep -n -i -E "force|maxSpeed|maxRPM|tireFriction|ratio|shiftNextSpeed" | head -40
   ```
4. The file size and, if you can, the game version.

## Development setup

You need Node.js 18 or newer. There is nothing to install.

```bash
git clone https://github.com/fawazbhseoin/bussid-mod-tuner.git
cd bussid-mod-tuner
npm test
npm run build
```

Open `index.html` in a browser to try your changes.

## How the code is organised

- `src/core.js` holds the logic that finds and edits values. It has no browser or Node specifics, so the page and the CLI share it.
- `src/page.html` is the page. It contains a `/*CORE*/` marker where `core.js` is inlined at build time.
- `index.html` is the built output and is committed so the project works on GitHub Pages with no build step.

**Edit `src/`, then run `npm run build`, then commit both.** A test fails if `index.html` is out of date.

## Pull request checklist

- [ ] `npm test` passes.
- [ ] `npm run build` was run and `index.html` is committed.
- [ ] New logic has a test. Use the synthetic fixture in `tests/fixture.js`, never a real mod.
- [ ] The page still works at 400 px width, in light and dark mode, in both looks (Clean and Neon).
- [ ] No new runtime dependencies. If you need one, explain why in the pull request.
- [ ] No third-party mods, textures or models are added to the repository.

## Style

- Plain JavaScript, no framework, no build tooling beyond `scripts/build.js`.
- Keep user-facing text short and plain. Say what happened and what to do next.
- Every edit must keep the file size the same (floats are overwritten in place). A change that moves bytes needs a design discussion first.

## Licence

By contributing you agree that your work is released under the [MIT License](LICENSE).
