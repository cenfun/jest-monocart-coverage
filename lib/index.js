const { CoverageReport } = require('monocart-coverage-reports');
const istanbulCoverage = require('istanbul-lib-coverage');
const libSourceMaps = require('istanbul-lib-source-maps');

class V8CoverageReporter {
    constructor(globalConfig, reporterOptions, reporterContext) {
        this.globalConfig = globalConfig;
        this.reporterOptions = reporterOptions || {};

        if (!this.reporterOptions.outputDir && globalConfig.coverageDirectory) {
            this.reporterOptions.outputDir = globalConfig.coverageDirectory;
        }

        // coverage cache
        this.v8CoverageDataList = [];
        this.istanbulCoverageMap = istanbulCoverage.createCoverageMap({});
    }

    onTestResult(_test, testResult) {

        // v8 coverage data
        if (testResult.v8Coverage) {
            this.v8CoverageDataList.push(testResult.v8Coverage);
            return;
        }

        // istanbul coverage data
        if (testResult.coverage) {
            this.istanbulCoverageMap.merge(testResult.coverage);
        }

    }

    async onRunComplete(testContexts, results) {

        // generate v8 coverage reports
        if (this.globalConfig.coverageProvider === 'v8') {
            const coverageReport = new CoverageReport(this.reporterOptions);
            for (const list of this.v8CoverageDataList) {
                const v8CoverageData = list.map((item) => {
                    const { codeTransformResult, result } = item;
                    const { code, wrapperLength } = codeTransformResult;
                    // console.log(codeTransformResult);
                    result.scriptOffset = wrapperLength;
                    result.source = code;
                    return result;
                });
                await coverageReport.add(v8CoverageData);
            }
            await coverageReport.generate();
            return;
        }


        // generate istanbul coverage reports
        const sourceMapStore = libSourceMaps.createSourceMapStore();
        const coverageData = await sourceMapStore.transformCoverage(this.istanbulCoverageMap);
        this.reporterOptions.sourceFinder = sourceMapStore.sourceFinder;
        const coverageReport = new CoverageReport(this.reporterOptions);
        await coverageReport.add(coverageData);
        await coverageReport.generate();
    }

}

module.exports = V8CoverageReporter;
