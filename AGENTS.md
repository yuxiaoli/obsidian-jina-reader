# Repository Guidelines

## Project Structure & Module Organization

The plugin source lives in `src/`. `main.ts` registers commands and coordinates note updates; `jinaReader.ts` and `jinaSearch.ts` handle Jina APIs; `urlDetection.ts` finds URLs; `settings.ts` defines settings and their UI; and `dotenv.ts` parses vault configuration. Root metadata (`manifest.json`, `versions.json`) describes the plugin. `esbuild.config.mjs` bundles `src/main.ts` into the generated, tracked `main.js`. Installation and release scripts live in `scripts/`. There is no test directory or stylesheet.

## Build, Test, and Development Commands

- `npm ci`: install the exact dependency versions in `package-lock.json`.
- `npm run dev`: start esbuild in watch mode with inline source maps.
- `npm run build`: produce the production `main.js` bundle.
- `npx tsc --noEmit`: run strict TypeScript checks without writing output.
- `npm run install-plugin -- "C:\path\to\vault"`: build and copy plugin files into an Obsidian vault.
- `npm run publish-plugin`: build and stage release artifacts under `release/`.

## Coding Style & Naming Conventions

Use TypeScript with four-space indentation, semicolons, and double-quoted strings, matching `src/`. Keep strict null handling and avoid introducing implicit `any`; prefer explicit union types such as `"replace" | "insert_below"`. Use PascalCase for classes and interfaces, camelCase for functions and variables, and descriptive lower-camel-case module names. Keep Obsidian UI concerns in `main.ts` or `settings.ts` and isolate pure parsing/detection logic in focused modules. No formatter or lint script is configured, so preserve the surrounding style and rely on TypeScript plus the production build.

## Testing Guidelines

Automated tests and coverage thresholds are not configured. Before submitting changes, run `npx tsc --noEmit` and `npm run build`. Install into a test vault and verify affected commands, URL detection, API failures and timeouts, and concurrent note-edit confirmation. If adding tests, place them beside the module as `*.test.ts` and add the runner command to `package.json`.

## Commit & Pull Request Guidelines

Recent history uses short, imperative subjects and Conventional Commit-style prefixes where applicable, for example `refactor: fetch URL only from selected text`. Keep each commit focused. Pull requests should explain the user-visible change, note validation commands and manual Obsidian checks, link relevant issues, and include screenshots only for settings or modal changes. Call out updates to `manifest.json`, `versions.json`, or generated `main.js`.

## Security & Configuration

Never commit API keys or vault data. The root `.env` is ignored; use placeholder values in documentation. Treat configurable Reader endpoints as untrusted input and retain explicit timeout and error handling.
