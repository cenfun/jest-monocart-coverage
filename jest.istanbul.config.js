module.exports = {
    collectCoverage: true,
    // istanbul requires `babel` provider
    coverageProvider: 'babel',
    coverageReporters: ['none'],
    reporters: [
        'default',
        ['./lib', {
            // logging: 'debug',
            name: 'Jest Monocart Coverage Report',

            outputDir: './coverage-reports/istanbul',

            reports: [
                'raw',
                'text',
                'html'
            ]
        }]
    ]
};
