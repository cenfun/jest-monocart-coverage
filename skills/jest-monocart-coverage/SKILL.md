---
name: jest-monocart-coverage
description: Integrate, configure, debug, and maintain jest-monocart-coverage 2.x, a Jest 29/30 custom reporter that generates Monocart reports from Jest V8 or Istanbul coverage. Use for reporters setup, collectCoverage/coverageProvider, MCR options (outputDir, reports, all, sourcePath, filters), missing or wrong coverage, thresholds, sourcemaps, and repository maintenance. Also applies to Chinese requests about Jest 覆盖率、Monocart 报告、V8 coverage、Istanbul coverage、覆盖率配置和覆盖率排错.
---

# Jest Monocart Coverage

## Language and loading

- Reply in the user's language. Equivalent requests in any language use the same workflow.
- This package is a **Jest custom reporter**. It does not replace Jest or collect coverage itself.
- Copy the whole skill directory, including `references/`, and resolve links relative to `SKILL.md`.
- The npm package includes the skill but does not register it with an agent. From the host project root:

```sh
node -p "require.resolve('jest-monocart-coverage/skills/jest-monocart-coverage/SKILL.md')"
node -p "require.resolve('jest-monocart-coverage/package.json')"
```

Read the resolved `SKILL.md`, then only the references needed for the task. This skill covers the **2.x line and later** only.

## Version requirements

- Node.js `>= 22.15.0`
- Jest `>= 29` (tested with Jest 30)
- `@jest/reporters` `>= 29` (provided by Jest)
- `monocart-coverage-reports` 3.x, which is ESM-only
- Coverage provider: `v8` (recommended) or `babel` (Istanbul)

The reporter loads MCR with a dynamic `import()`. Do not replace it with `require('monocart-coverage-reports')`. Do not apply this skill to the 1.x line (MCR 2, older Node.js) or silently upgrade a host runtime.

## Workflow

1. Inspect the host `package.json`, Jest version, `collectCoverage`, `coverageProvider`, `reporters`, `coverageReporters`, and CI commands.
2. Choose V8 or Istanbul integration from [integration.md](references/integration.md).
3. Put Monocart options in the reporter tuple. This reporter does **not** discover `mcr.config.*`; pass a plain object or load one from the Jest config. See [configuration.md](references/configuration.md).
4. Run a small representative test and inspect the file list, mapped paths, summaries, and report artifacts.
5. For missing, empty, duplicate, or incorrectly mapped coverage, use [troubleshooting.md](references/troubleshooting.md) before changing reporter code.
6. For repository changes, tests, packaging, and releases, read [maintenance.md](references/maintenance.md).

## Quick start: V8

```sh
npm install --save-dev jest-monocart-coverage
```

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

Run `npx jest`. The report path comes from MCR `outputDir`; Jest `coverageReporters` controls Jest's own output only.

For detailed per-file terminal output, use `reports: ['v8', 'console-details', 'console-summary']`. With V8 coverage, no Istanbul report types are needed. For `babel`/Istanbul, set `coverageProvider: 'babel'` and use Istanbul-compatible report types such as `html`, `text`, or `lcovonly`.

## Essential contracts and pitfalls

- **`reporters`, not `coverageReporters`.** A repo-wide mistake is putting this package in `coverageReporters`; it will not run.
- **Keep `'default'`** in `reporters` unless the normal Jest console reporter is intentionally replaced.
- **Jest still runs its built-in coverage reporter.** It generates Jest `coverageReporters` output and enforces `coverageThreshold`. Set `coverageReporters: ['none']` to avoid duplicate output.
- **V8 filters do not scope Istanbul input.** `entryFilter` and `outputFilter` are V8-only; `sourceFilter` also filters files added by MCR `all`. None of them remove files already in a babel/Istanbul coverage map. For babel, use Jest `collectCoverageFrom` and ignore patterns.
- **Untested files differ by provider.** For V8, this reporter does not call Jest's untested-file collection; use MCR `all`. For babel, Jest `collectCoverageFrom` contributes, and MCR `all` can add more.
- **Threshold scope can differ.** Jest thresholds use Jest's coverage map; the MCR report uses MCR options. A passing MCR report and a failing threshold can both be correct.
- **Configure `sourcePath`.** Absolute or transformed paths need stable rewrites. This repository maps fixtures with `sourcePath: { 'src/': '' }`.
- **No automatic MCR config discovery.** A `mcr.config.*` file has no effect unless the Jest config loads it and passes the object to the reporter.
- **Use a dedicated `outputDir`** and do not share it across concurrent Jest processes or shards.
- **Empty output is not success.** Validate fresh, nonempty report artifacts.

## Delivery checklist

- [ ] Node.js `>= 22.15.0`, Jest `>= 29`, package on 2.x.
- [ ] Reporter configured in `reporters`; `'default'` retained if wanted.
- [ ] `collectCoverage: true`, correct `coverageProvider`, and intentional `coverageReporters`.
- [ ] MCR options configured once, with a dedicated `outputDir`.
- [ ] `all`, filters, and `sourcePath` match the intended provider and scope.
- [ ] Sourcemaps and paths match the code Jest actually ran.
- [ ] Threshold results and MCR report scope both checked when thresholds are used.
- [ ] Report artifacts are fresh and nonempty; commands and outcomes reported to the user.
