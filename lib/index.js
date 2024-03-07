const { CoverageReporter } = require('@jest/reporters');
const { CoverageReport } = require('monocart-coverage-reports');
class MonocartCoverageReporter extends CoverageReporter {
    constructor(globalConfig, reporterOptions, reporterContext) {
        super(globalConfig, reporterContext);
        this.disabled = !globalConfig.collectCoverage;
        this.coverageProvider = globalConfig.coverageProvider;
        this.reporterOptions = reporterOptions;
    }

    onTestResult() {
        if (this.disabled) {
            return;
        }
        super.onTestResult.apply(this, arguments);
    }

    async onRunComplete(testContexts, results) {
        if (this.disabled) {
            return;
        }

        // generate v8 coverage reports
        if (this.coverageProvider === 'v8') {
            if (!this._v8CoverageResults.length) {
                console.log('No v8 coverage data collected');
                return;
            }
            const coverageReport = new CoverageReport(this.reporterOptions);
            coverageReport.cleanCache();
            for (const list of this._v8CoverageResults) {
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
        await this._addUntestedFiles(testContexts);

        const coverageData = await this._sourceMapStore.transformCoverage(this._coverageMap);
        this.reporterOptions.sourceFinder = this._sourceMapStore.sourceFinder;
        const coverageReport = new CoverageReport(this.reporterOptions);
        coverageReport.cleanCache();
        await coverageReport.add(coverageData);
        await coverageReport.generate();
    }

}

module.exports = MonocartCoverageReporter;
