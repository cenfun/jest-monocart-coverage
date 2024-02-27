module.exports = {
    collectCoverage: true,
    coverageProvider: 'babel',
    coverageReporters: ['none'],
    reporters: [
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
