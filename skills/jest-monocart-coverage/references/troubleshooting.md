# Troubleshooting

Diagnose in this order: versions → reporter selection → collection → MCR options → file scope → sourcemaps → thresholds/CI. Do not change reporter internals before verifying host integration.

## Symptom table

| Symptom | Likely cause | First check |
| --- | --- | --- |
| `Could not resolve a module for a custom reporter` | Reporter missing or wrong config key | Package installed and listed in `reporters`, not `coverageReporters` |
| `No v8 coverage data collected` | No V8 entries reached the reporter | `collectCoverage`, `coverageProvider: 'v8'`, tests actually running |
| No Monocart report | Reporter inactive, wrong `outputDir`, or MCR returned early | Jest output, MCR `logging`, configured `outputDir` |
| Report contains tests/`node_modules` | Scope not configured | V8: MCR filters. Babel: Jest `collectCoverageFrom`/ignore patterns |
| Empty report but tests passed | Wrong provider, filters excluded everything, missing `all` | MCR debug output and raw entry URLs |
| Never-imported files missing | V8 path does not use Jest `collectCoverageFrom` | Configure MCR `all` |
| Duplicate coverage output | Jest `coverageReporters` still generating files | Set `coverageReporters: ['none']` or separate outputs |
| Threshold differs from MCR report | Jest and MCR use different file scopes | Compare Jest map scope with MCR `all`/filters |
| ESM / `require is not defined` error | MCR 3.x is ESM-only | Keep the reporter's dynamic `import()` |
| Node engine error | Node.js older than `22.15.0` | Upgrade Node.js; 2.x does not support older runtimes |
| Paths absolute/duplicated/wrong | `sourcePath`/`baseDir` missing | Inspect mapped paths and add a rewrite |
| `Failed to load Sourcemap` | Sourcemap configuration | Prefer `sourceMap: true` over `inlineSourceMap: true` when appropriate |
| Normal Jest output disappeared | Custom reporters replaced the default | Add `'default'` to `reporters` |
| Old report still visible | Stale artifacts or generation skipped | Validate fresh output and metrics |

## 1. Confirm reporter activation

```js
module.exports = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],
    reporters: [
        'default',
        ['jest-monocart-coverage', { /* MCR options */ }]
    ]
};
```

- Install in the project that runs Jest, not only a parent workspace.
- Keep the package in `reporters`.
- Use `./lib` only when developing this repository.
- Add `'default'` to keep normal Jest output.

If resolution fails:

```sh
node -p "require.resolve('jest-monocart-coverage')"
node -p "require.resolve('jest-monocart-coverage/package.json')"
```

## 2. Verify collection

- `collectCoverage` must be true; `--coverage=false` is a no-op.
- Use `v8` for native V8 reports and `babel` for Istanbul data.
- Ensure tests import/execute the code under test.
- Zero-test suites can legitimately produce no coverage.
- Reproduce coverage problems with a passing test first.

`No v8 coverage data collected` means no V8 results reached the reporter. It differs from MCR receiving data but filtering it all out.

## 3. Inspect MCR input

For V8, temporarily broaden filters and enable debug logging:

```js
['jest-monocart-coverage', {
    logging: 'debug',
    reports: ['v8', 'console-details', 'console-summary'],
    outputDir: './coverage-reports/debug',
    entryFilter: {
        '*': true
    }
}]
```

Inspect which entry URLs appear, whether expected sources are present, whether sourcemaps match the tested build, and what `coverage-data.js` contains. Tighten filters before final CI. Remove debug artifacts before publishing.

For babel, `entryFilter` and `outputFilter` do not apply; inspect Jest's coverage map and `collectCoverageFrom` instead.

## 4. Missing or empty data

1. Reporter active (section 1).
2. Tests ran and imported the target code.
3. Provider matches the expected data and report types.
4. V8 filters did not exclude everything.
5. V8: `all` configured when untested files are expected.
6. Babel: `collectCoverageFrom` configured when untested files are expected.
7. Report read from MCR `outputDir`, not Jest `coverageDirectory`.
8. Report is fresh, not a previous artifact.

Do not fabricate source strings or coverage counts.

## 5. Duplicate or unexpected reports

- `coverageReporters` configures Jest output and `coverageDirectory`.
- The reporter tuple configures MCR `reports` and `outputDir`.
- `coverageReporters: ['none']` still runs Jest's internal threshold check but skips configured report files.
- Adding `html`/`lcov` to `coverageReporters` does not configure Monocart.

If both outputs are intentional, document which is authoritative and why their scopes may differ.

## 6. Incorrect file scope

- V8: `entryFilter` and `outputFilter` control collected V8 entries; `sourceFilter` also affects files added by `all`.
- Babel: these filters do not remove files already in Jest's Istanbul coverage map; use Jest's coverage options.
- V8: Jest `collectCoverageFrom` does not populate the MCR report; use `all`.
- Babel: the reporter calls `_addUntestedFiles`, so `collectCoverageFrom` contributes.
- Ordered filters use first-match-wins; a broad exclude can remove everything.
- `outputFilter` cannot restore entries excluded earlier.

Compare Jest threshold scope and MCR scope explicitly. A mismatch is a configuration issue, not automatically a coverage bug.

## 7. Sourcemaps and paths

- Produce sourcemaps for the exact transformed build.
- Use MCR `logging: 'debug'` to inspect mapped source paths.
- Do not use maps from another revision.
- Configure `sourcePath`/`baseDir` for absolute or transformed paths.
- Do not collapse unrelated files to basenames.
- Normalize Windows separators consistently.
- For inline-map failures, prefer `sourceMap: true` over `inlineSourceMap: true` when appropriate.

## 8. Thresholds

- Jest `coverageThreshold` uses Jest's coverage map and `collectCoverageFrom`.
- MCR `watermarks` do not enforce thresholds; use MCR `onEnd` for report-level checks.
- If thresholds fail unexpectedly, inspect Jest's file list and mapped lines.
- Removing thresholds is a diagnostic step, not a permanent fix.
- Test both passing and failing threshold runs when changing this behavior.

## 9. Versions and module formats

- Node.js `>= 22.15.0`.
- MCR 3.x is ESM-only; keep the dynamic `import()`.
- The package exposes both `require` and `import` entries.
- CJS Jest config uses `module.exports`; ESM config can use `jest.config.mjs`.
- Do not add `"type": "module"` to the host project just for one config file.
- Keep `jest` and `@jest/reporters` aligned.
- Jest 29 and 30 are supported by the 2.x line; older versions are not validated.

## 10. Stale artifacts and CI

- Validate fresh output, not just file existence.
- Preserve failing test exit codes.
- Upload artifacts on failure without marking the job successful.
- Keep raw inputs until merge validation passes.
- For shards, use unique `outputDir` values or merge MCR raw data deliberately.

## 11. When to inspect source

Inspect `lib/index.js` and `lib/index.mjs` only after checking host integration. See [maintenance.md](maintenance.md).

Do not patch `node_modules` or alter coverage counts. Reproduce with a focused test first.
