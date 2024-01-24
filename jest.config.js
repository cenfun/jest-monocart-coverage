module.exports = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageReporters: ['none'],
    reporters: [
        ['./lib', {
            logging: 'debug',
            name: 'Jest Monocart Coverage Report',

            outputDir: './docs',

            reports: [
                'v8',
                'text'
            ]
        }]
    ]
};
