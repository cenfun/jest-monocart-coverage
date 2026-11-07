# Installation and Jest integration

## Dependency model

`jest-monocart-coverage@2.x` is a Jest custom reporter:

- `jest` runs tests and collects coverage.
- `@jest/reporters` provides the `CoverageReporter` base class (peer dependency, normally installed with Jest).
- `monocart-coverage-reports@3.x` renders the report.
- The reporter does not replace Jest, collect coverage itself, or change `coverageProvider`.

| Provider | Data handed to Monocart | Recommended reports | Untested files |
| --- | --- | --- | --- |
| `v8` (recommended) | Native V8 entries | `v8`, `console-details`, `console-summary` | MCR `all` |
| `babel` | Istanbul coverage map | `html`, `text`, `lcovonly`, etc. | Jest `collectCoverageFrom`, plus MCR `all` |

With V8 coverage, native `v8` plus `console-details`/`console-summary` is sufficient. No Istanbul report types are needed. The default recommendation is `['v8', 'console-summary']`.

## V8 integration

```js
// jest.config.js
module.exports = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],

    reporters: [
        'default',
        ['jest-monocart-coverage', {
            name: 'My Jest Coverage Report',
            outputDir: './coverage-reports/v8',
            reports: ['v8', 'console-summary'],
            all: './src',
            sourcePath: {
                'src/': ''
            }
        }]
    ]
};
```

Run `npx jest`, `npx jest --runInBand` (useful for coverage races), or `npx jest -c jest.config.js`. Use `['./lib', options]` instead of the package name when developing this repository.

For per-file terminal details, use `reports: ['v8', 'console-details', 'console-summary']`.

## Istanbul / babel integration

```js
// jest.config.js
module.exports = {
    collectCoverage: true,
    coverageProvider: 'babel',
    coverageReporters: ['none'],

    reporters: [
        'default',
        ['jest-monocart-coverage', {
            outputDir: './coverage-reports/istanbul',
            reports: ['html', 'text', 'lcovonly']
        }]
    ]
};
```

With `babel`, the reporter calls Jest's `_addUntestedFiles` and source-map store, then passes an Istanbul coverage map to Monocart. Use Istanbul-compatible report types; native `v8` reports are intended for V8 input.

## ESM Jest config

The package exposes both CommonJS and ESM entries. An ESM Jest config can use the package name directly:

```js
// jest.config.mjs
export default {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],
    reporters: [
        'default',
        ['jest-monocart-coverage', {
            outputDir: './coverage-reports',
            reports: ['v8', 'console-summary']
        }]
    ]
};
```

Do not convert the whole host project to ESM just for this reporter.

## Where Monocart options come from

Options are the second element of the reporter tuple and are passed directly to `new CoverageReport(options)`:

```js
reporters: [
    'default',
    ['jest-monocart-coverage', {
        outputDir: './coverage-reports',
        reports: ['v8', 'console-summary']
    }]
]
```

The reporter does **not** call `CoverageReport.loadConfig()` and does **not** discover `mcr.config.*`. A named `mcr.config.js` has no effect unless the Jest config loads it. To share options, export a plain object:

```js
// mcr.options.cjs
module.exports = {
    outputDir: './coverage-reports',
    reports: ['v8', 'console-summary']
};
```

```js
// jest.config.js
const mcrOptions = require('./mcr.options.cjs');

module.exports = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],
    reporters: [
        'default',
        ['jest-monocart-coverage', mcrOptions]
    ]
};
```

## Jest options that matter

| Option | Effect with this reporter |
| --- | --- |
| `collectCoverage` | Must be true; otherwise the reporter is disabled. `--coverage=false` makes it a no-op. |
| `coverageProvider` | Selects the reporter path: `v8` native entries or `babel` Istanbul data. |
| `coverageReporters` | Controls Jest's built-in output only. Use `['none']` to avoid duplicate reports. |
| `collectCoverageFrom` | Affects Jest's coverage map and the babel untested-file path; it does not populate the V8 MCR report. |
| `coverageThreshold` | Enforced by Jest's built-in coverage reporter, using Jest's coverage map. |
| `reporters` | Must include this reporter; add `'default'` to keep normal Jest output. |
| `rootDir` | Affects Jest paths and source-map resolution; may require MCR `baseDir`/`sourcePath`. |

## Thresholds

```js
module.exports = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],
    coverageThreshold: {
        global: {
            lines: 80,
            branches: 70
        }
    },
    reporters: [
        'default',
        ['jest-monocart-coverage', {
            outputDir: './coverage-reports',
            reports: ['v8', 'console-summary']
        }]
    ]
};
```

Jest evaluates thresholds against its own coverage map. Monocart reports use MCR options. `collectCoverageFrom` and Jest ignore patterns affect the Jest map; MCR `all` and V8 filters affect the MCR report. A scope mismatch can produce a passing MCR report and a failing threshold, or the reverse. MCR `watermarks` do not enforce thresholds.

## Watch mode, shards, and repeated runs

- Use a unique MCR `outputDir` for each independent Jest process or shard.
- Do not let concurrent jobs generate and clean the same output directory.
- MCR `clean` removes previous artifacts (default true); the reporter calls `cleanCache()` before adding data.
- For cross-shard merging, export MCR `raw` data and merge it with MCR input options instead of averaging rendered reports.
- In watch mode, verify the report reflects the latest run; do not trust stale artifacts.
- Diagnose races with `jest --runInBand` before changing reporter code.

For detailed MCR report and merge behavior, use the Monocart coverage reports documentation.
