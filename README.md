# jest-monocart-coverage
[![](https://img.shields.io/npm/v/jest-monocart-coverage)](https://www.npmjs.com/package/jest-monocart-coverage)
[![](https://badgen.net/npm/dw/jest-monocart-coverage)](https://www.npmjs.com/package/jest-monocart-coverage)
![](https://img.shields.io/github/license/cenfun/jest-monocart-coverage)


> A [Jest](https://github.com/jestjs/jest/) custom reporter for [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports)

## Install
```sh
npm i jest-monocart-coverage
```

## Requirements
- Node.js `>= 22.15.0` (required by `monocart-coverage-reports` v3, which is ESM only)
- Jest `>= 29` (tested with Jest 30)

> Upgrading from v1? See the [Changelog](./CHANGELOG.md). Version 2 uses `monocart-coverage-reports` v3, so Node.js 18/20 and versions of Node.js 22 earlier than 22.15.0 are no longer supported.

## Usage
```js
// jest.config.js
const config = {

    // Enable coverage
    collectCoverage: true,
    // Recommended to use `v8` to support the generation of native v8 coverage reports.
    coverageProvider: 'v8',
    // Monocart generates the report, so disable Jest's own coverage reporters.
    coverageReporters: ['none'],

    reporters: [
        // If custom reporters are specified, the default Jest reporter will be overridden. If you wish to keep it, 'default' must be passed as a reporters name:
        'default',

        // Monocart custom reporter to generate coverage reports. 
        ['jest-monocart-coverage', {
            name: 'My Unit Coverage Report',
            reports: ['v8', 'console-summary'],
            outputDir: './coverage-reports/unit'
        }]
    ]
    
};
module.exports = config;
```
Check [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports) for more coverage options.

For per-file terminal details, use `reports: ['v8', 'console-details', 'console-summary']`. With `coverageProvider: 'v8'`, no Istanbul report types are needed.

## The Execution Order of Hooks
- For Jest: custom reporter `onEnd` -> `globalTeardown`
- For Playwright: `globalTeardown` -> coverage `onEnd` -> custom reporter `onEnd`

## Common issues
- Resolve full path of the file with option `sourcePath` (issue [#5](https://github.com/cenfun/jest-monocart-coverage/issues/5))

```js
const path = require("path")

// MCR coverage options
{

    sourcePath: (filePath, info)=> {
        if (!filePath.includes('/') && info.distFile) {
            return `${path.dirname(info.distFile)}/${filePath}`;
        }
        return filePath;
    }
  
}
```

- Failed to load Sourcemap (issue [#6](https://github.com/cenfun/jest-monocart-coverage/issues/6))

Using `sourceMap` instead of `inlineSourceMap` in `tsconfig.json`
```json
{
    "compilerOptions": {
        "sourceMap": true,
        "inlineSourceMap": false
    }
}
```

## AI Agent Skill

The reusable [Jest Monocart Coverage skill](skills/jest-monocart-coverage/SKILL.md) helps AI coding agents configure the reporter, choose V8 or Istanbul coverage, set Monocart options and filters, debug missing or incorrectly mapped coverage, handle thresholds, and maintain this repository. It uses a main `SKILL.md` with task-specific references loaded on demand.

The npm package includes `skills/jest-monocart-coverage/`. Copy this **entire directory**, including `references/`, into your agent's supported skills location, or ask the agent to read `SKILL.md` directly. Installing the package does not automatically register the skill or modify agent settings. The instructions are in English; requests and responses can use any language.

From the host project root, locate the installed skill and package manifest:

```sh
node -p "require.resolve('jest-monocart-coverage/skills/jest-monocart-coverage/SKILL.md')"
node -p "require.resolve('jest-monocart-coverage/package.json')"
```

Read the resolved skill, then follow its relative reference links. It supports the 2.x line and later only. These commands resolve files; they do not import Markdown as JavaScript.

## Changelog

- [CHANGELOG.md](./CHANGELOG.md)
