# Monocart configuration for the Jest reporter

All Monocart options are passed as the second element of the Jest reporter tuple. The reporter does not collect CSS coverage.

## Configuration sources

There are two supported forms:

1. An inline object in `reporters: [['jest-monocart-coverage', { ... }]]`.
2. A plain local object loaded by the Jest config and passed in the same tuple.

`mcr.config.*` files are **not auto-discovered**. See [integration.md](integration.md#where-monocart-options-come-from).

## Common options

```js
['jest-monocart-coverage', {
    name: 'Jest Coverage',
    outputDir: './coverage-reports',
    reports: ['v8', 'console-summary'],
    clean: true,
    cleanCache: true
}]
```

| Option | Meaning |
| --- | --- |
| `name` | Report title. |
| `outputDir` | Final report directory. Use a dedicated path, never a source directory. |
| `reports` | MCR report list; supports strings and descriptors such as `['v8', { inline: true }]`. |
| `clean` | Removes old report artifacts during generation. Defaults to true. |
| `cleanCache` | Removes MCR's cached input. The reporter also calls `cleanCache()` before adding data. |
| `logging` | `off`, `error`, `info`, or `debug`. Debug can retain raw/cache/source-map artifacts. |
| `entryFilter` | Filters collected V8 entry URLs before conversion. V8 only. |
| `sourceFilter` | Filters V8 sources and files added by `all`. |
| `outputFilter` | Filters final `sourcePath` entries after V8 conversion/merging. V8 only. |
| `filter` | Shorthand for `entryFilter` + `sourceFilter`; not the same as `outputFilter`. |
| `sourcePath` | Rewrites source paths before report output. |
| `all` | Adds empty coverage for never-imported files. |
| `baseDir` | Base directory for normalizing relative source paths. |
| `watermarks` | Report color thresholds; does **not** enforce CI thresholds. |
| `onEntry` | Hook executed per V8 entry. |
| `onEnd` | Receives generated results; useful for validation or failing CI. |

Use the installed MCR declarations for the full list. Do not pass c8/nyc/Jest options such as `checkCoverage`, `include`, or `exclude` as Monocart options.

## Reports

Recommended for V8 coverage:

```js
reports: ['v8', 'console-details', 'console-summary']
```

- `v8` — interactive native report.
- `console-details` — detailed per-file terminal output.
- `console-summary` — concise terminal summary.

The default recommendation is the minimal pair:

```js
reports: ['v8', 'console-summary']
```

With V8 coverage, no Istanbul report types are needed. For `babel`, use Istanbul-compatible reports such as `html`, `text`, `lcovonly`, or `text-summary`.

`coverageReporters: ['none']` only disables Jest's own report files; it does not configure Monocart.

## Filtering

`entryFilter` and `outputFilter` are V8-only. `sourceFilter` applies to V8 sources and to files added by `all`. None of these filters remove files already present in an Istanbul/babel coverage map. For babel projects, control scope with Jest `collectCoverageFrom`, `coveragePathIgnorePatterns`, and related Jest options.

### Input filtering

```js
{
    entryFilter: {
        '**/node_modules/**': false,
        '**/src/**': true
    },
    sourceFilter: {
        '**/node_modules/**': false,
        '**/src/**': true
    }
}
```

- `entryFilter` receives collected URLs/entries; excluding a bundle also excludes its sources.
- `sourceFilter` receives unpacked source paths and is also used for MCR `all` untested files.
- Ordered pattern objects use first-match-wins; put exclusions before broader inclusions.
- `sourceFilter` does not remove collected entries that have no sourcemap.

### Final filtering

```js
{
    outputFilter: {
        '**/node_modules/**': false,
        '**/src/**': true
    }
}
```

`outputFilter` runs after V8 conversion, merging, and `all`. It cannot restore entries removed earlier. Do not combine input and output filtering for the same scope without a reason.

### Scope differs from Jest

Jest `collectCoverageFrom` and `coverageThreshold` use Jest's coverage map. They do not define the V8 MCR report list.

- V8: use MCR `all` for never-imported files; Jest `collectCoverageFrom` does not add them to the MCR report.
- Babel: the reporter calls Jest's `_addUntestedFiles`, so `collectCoverageFrom` contributes; MCR `all` can add more.
- If both Jest thresholds and MCR reports matter, compare their file scopes explicitly.

## Source paths

Jest V8 entries often use absolute or transformed paths. Configure `sourcePath` or `baseDir` so report paths are stable.

Object form:

```js
{
    sourcePath: {
        'src/': ''
    }
}
```

Function form:

```js
const path = require('node:path');

{
    sourcePath: (filePath, info) => {
        if (!filePath.includes('/') && info.distFile) {
            return `${path.dirname(info.distFile)}/${filePath}`;
        }
        return filePath;
    }
}
```

Use the function form when sourcemap `sources` are relative to a `distFile`. Do not collapse paths to basenames; unrelated `index.js` files can collide. Normalize Windows separators consistently. For monorepos or differing working directories, set `baseDir` or a deliberate rewrite.

## Untested files

```js
{
    all: {
        dir: ['./src'],
        filter: {
            '**/*.test.js': false,
            '**/*.spec.js': false,
            '**/*.js': true
        }
    }
}
```

A string is sufficient for common cases:

```js
{
    all: './src'
}
```

This repository's V8 config uses `all: './src'` and `sourcePath: { 'src/': '' }`. For babel, Jest `collectCoverageFrom` already adds untested files; `all` can still add files Jest did not instrument.

## CI validation

```js
{
    outputDir: './coverage-reports',
    reports: ['v8', 'console-summary'],
    onEnd(results) {
        if (!results) {
            throw new Error('No coverage report was generated');
        }
        const lines = results.summary?.lines;
        if (!lines || !(lines.total > 0) || typeof lines.pct !== 'number') {
            throw new Error('Coverage summary is missing or empty');
        }
        if (lines.pct < 80) {
            throw new Error(`Line coverage ${lines.pct}% is below 80%`);
        }
    }
}
```

- `watermarks` is presentation only.
- Jest `coverageThreshold` is a separate gate using Jest's coverage map.
- Preserve test failures; do not turn a failed run into a successful coverage run.
- Validate fresh, nonempty output; do not trust an old report file.
- Do not upload source-containing reports without permission.

For other MCR report types, raw exports, merging, and detailed report behavior, use the Monocart coverage reports documentation.
