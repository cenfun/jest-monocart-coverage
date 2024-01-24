# jest-monocart-coverage
[![](https://img.shields.io/npm/v/jest-monocart-coverage)](https://www.npmjs.com/package/jest-monocart-coverage)
[![](https://badgen.net/npm/dw/jest-monocart-coverage)](https://www.npmjs.com/package/jest-monocart-coverage)
![](https://img.shields.io/github/license/cenfun/jest-monocart-coverage)


> A [Jest](https://github.com/jestjs/jest/) custom reporter for [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports)

## Install
```sh
npm i jest-monocart-coverage
```

## Usage
```js
// jest.config.js
const config = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],
    reporters: [
        ['jest-monocart-coverage', {
            name: 'My Unit Coverage Report',
            reports: [
                ['v8'],
                ['console-summary'],
                ['lcovonly']
            ],
            outputDir: './coverage-reports/unit'
        }]
    ],
};
export default config;
```
Check repo [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports) for more options.


