module.exports = {

    // Enable coverage
    collectCoverage: true,
    coverageDirectory: './coverage-reports/jest',
    collectCoverageFrom: [
        'src/**/*.js'
    ],
    // Recommended to use `v8` to support the generation of native v8 coverage reports.
    // coverageProvider: 'v8',
    // Monocart can also support all coverage reports, so there is no need to set up reports here.
    // coverageReporters: ['none'],
    coverageReporters: [
        ['lcov'],
        ['json'],
        ['text'],
        ['text-summary']
    ],

    reporters: [
        // If custom reporters are specified, the default Jest reporter will be overridden. If you wish to keep it, 'default' must be passed as a reporters name:
        'default',

        // Monocart custom reporter to generate coverage reports.
        ['./lib', {
            // logging: 'debug',
            name: 'Jest Monocart Coverage Report',

            outputDir: './coverage-reports/all',

            all: './src',

            sourcePath: {
                'src/': ''
            },

            reports: [
                ['raw'],
                ['lcov'],
                ['json'],
                ['text'],
                ['text-summary']
                // ['console-details'],
                // ['console-summary']
            ],

            onEnd: () => {
                console.log('onEnd');
            }
        }]
    ],

    globalTeardown: './global-teardown.js'

};
