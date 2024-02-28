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

            outputDir: './docs/istanbul',

            reports: [
                'raw',
                'text',
                'html'
            ]
        }]
    ]
};
