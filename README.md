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

    // Enable coverage
    collectCoverage: true,
    // Recommended to use `v8` to support the generation of native v8 coverage reports.
    coverageProvider: 'v8',
    // Monocart can also support all coverage reports, so there is no need to set up reports here.
    coverageReporters: ['none'],

    reporters: [
        // If custom reporters are specified, the default Jest reporter will be overridden. If you wish to keep it, 'default' must be passed as a reporters name:
        'default',

        // Monocart custom reporter to generate coverage reports. 
        ['jest-monocart-coverage', {
            name: 'My Unit Coverage Report',
            reports: [
                ['v8'],
                ['console-summary'],
                ['lcovonly']
            ],
            outputDir: './coverage-reports/unit'
        }]
    ]
    
};
export default config;
```
Check [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports) for more coverage options.


