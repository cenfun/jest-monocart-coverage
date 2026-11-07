# Repository architecture and maintenance

Use this reference when changing `jest-monocart-coverage` itself, not for host-project setup.

## Supported line

`jest-monocart-coverage` 2.x and later:

- Node.js `>= 22.15.0`
- Jest `>= 29` (CI uses Jest 30)
- `monocart-coverage-reports` 3.x
- V8 or Istanbul/babel coverage

There is no build step; `lib/` is published as-is. Version 1.x used MCR 2 and older Node.js versions and is out of scope.

## Repository map

| Area | Files |
| --- | --- |
| CommonJS reporter | `lib/index.js` |
| ESM re-export | `lib/index.mjs` |
| Public types | `lib/index.d.ts` |
| V8 test config | `jest.config.js` |
| Istanbul/babel test config | `jest.config.istanbul.js` |
| `all` + Istanbul config | `jest.config.all.js` |
| Fixtures | `src/`, `test/`, `global-teardown.js` |
| Package metadata | `package.json` |
| User docs | `README.md`, `CHANGELOG.md` |
| Agent skill | `skills/jest-monocart-coverage/` |
| CI | `.github/workflows/static.yml` |

The npm package ships `lib/` and `skills/`, not the test fixtures.

## Reporter architecture

### Module loading

- `lib/index.js` is CommonJS and requires `@jest/reporters`.
- MCR 3.x is ESM-only, loaded lazily with:

```js
const importMCR = () => import('monocart-coverage-reports');
```

- `lib/index.mjs` re-exports the CommonJS class.
- `lib/index.d.ts` declares the default reporter class and re-exports MCR types.

Keep the dynamic import. A synchronous `require('monocart-coverage-reports')` is not the supported contract.

### Construction

```js
class MonocartCoverageReporter extends CoverageReporter {
    constructor(globalConfig, reporterOptions, reporterContext) {
        super(globalConfig, reporterContext);
        // ...
    }
}
```

Jest calls custom reporters with `(globalConfig, reporterOptions, reporterContext)`, while `CoverageReporter` expects `(globalConfig, context)`. Preserve that mapping when upgrading Jest.

The constructor stores MCR options and `coverageProvider`; when `collectCoverage` is false, the reporter is disabled.

### `onTestResult`

The reporter delegates to the base class:

- `testResult.v8Coverage` → `_v8CoverageResults`
- `testResult.coverage` → `_coverageMap`

Jest's internal coverage reporter also receives these results.

### `onRunComplete` — V8

1. Return early if there are no V8 results.
2. Create `CoverageReport`, call `cleanCache()`.
3. For each V8 result:
   - Apply `codeTransformResult.wrapperLength` as `result.scriptOffset`.
   - Set `result.source` from `codeTransformResult.code` when available.
   - Add to Monocart.
4. Call `generate()`.

`scriptOffset` accounts for Jest's module wrapper. The source enables inline sourcemap resolution. If `codeTransformResult` is absent, leave the result for MCR to resolve from the URL.

The V8 path does not call Jest's `_addUntestedFiles`; use MCR `all`.

### `onRunComplete` — Istanbul/babel

1. Call `_addUntestedFiles(testContexts)` (honors `collectCoverageFrom`).
2. Transform `_coverageMap` through `_sourceMapStore`.
3. Pass `_sourceMapStore.sourceFinder` to MCR options.
4. Create `CoverageReport`, clean cache, add data, generate.

Keep the source-map store and source finder wiring.

### Jest's built-in reporter

Jest always creates its internal `CoverageReporter` when `collectCoverage` is true. It handles Jest `coverageReporters`, `coverageDirectory`, and `coverageThreshold`. This package generates the MCR report in parallel, which is why `coverageReporters: ['none']` is recommended for MCR-only output.

### MCR options

The reporter does not call `CoverageReport.loadConfig()`. It uses `reporterOptions` from the Jest config tuple. Shared config must be loaded by the host and passed in.

When adding MCR options, update the public types, README, this skill, and relevant tests.

## Changing behavior safely

Update all applicable places:

1. `lib/index.js`
2. `lib/index.mjs` and `lib/index.d.ts` if exports/types change
3. `package.json` dependencies, exports, files, engines
4. `README.md`, `CHANGELOG.md`
5. This skill and references
6. Focused tests/configs

Do not change only reporter code when the user-facing contract changes.

## Validation

```sh
npm test
npm run test:istanbul
npm run test:all
npm run test:issue
npx eslint .
npm pack --dry-run
```

- `npm test` — default V8 config.
- `npm run test:istanbul` — babel/Istanbul config.
- `npm run test:all` — `all` and additional reports.
- `npm run test:issue` — `--runInBand`, used by CI.
- CI matrix: Node.js `22.15.0`, `22.x`, `24.x`.

There is no lint script in `package.json`; invoke ESLint directly or add one deliberately.

## Consumer smoke test

Validate packaging and resolution from a packed tarball:

```sh
npm pack
# install the tarball into a temporary project with jest@30
# run a V8 test and a babel/Istanbul test
# test CJS jest.config.js and ESM jest.config.mjs
```

Useful checks:

```sh
node -p "require.resolve('jest-monocart-coverage')"
node -p "require.resolve('jest-monocart-coverage/package.json')"
node -p "require.resolve('jest-monocart-coverage/skills/jest-monocart-coverage/SKILL.md')"
```

Remove the tarball and temporary project afterward.

## Packaging the skill

```text
skills/jest-monocart-coverage/
├── SKILL.md
└── references/
```

`package.json` must ship it:

```json
{
    "files": ["lib", "skills"],
    "exports": {
        "./skills/*": "./skills/*"
    }
}
```

Verify with `npm pack --dry-run` (all skill files present) and, from a consumer, the `require.resolve` command above.

Skill maintenance checklist:

- [ ] Frontmatter `name` matches the directory.
- [ ] Description states what the skill does and when it applies.
- [ ] Relative links resolve.
- [ ] Packed tarball includes `SKILL.md` and all references.
- [ ] Examples match current Jest/MCR/Node versions.
- [ ] No unpublished or removed APIs.
- [ ] Docs state that MCR config files are not auto-discovered.

## Regression checks

- V8 reports and V8 `all`.
- Istanbul/babel collection with `collectCoverageFrom`.
- `coverageReporters: ['none']` and intentional Jest reporters.
- Jest `coverageThreshold` still enforced.
- `collectCoverage: false` and `--coverage=false`.
- CJS and ESM Jest configs.
- Jest 29/30 compatibility when the supported range changes.
- `sourcePath` for absolute, relative, and Windows paths.
- V8 filters versus babel scope differences.
- Empty runs and missing/invalid output.
- Packed-package install for V8, babel, CJS, and ESM.
- Skill packaging and installed-path resolution.

Do not claim compatibility with versions that were not validated.
