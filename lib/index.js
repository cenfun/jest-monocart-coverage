const { CoverageReport } = require('monocart-coverage-reports');

class V8CoverageReporter {
    constructor(globalConfig, reporterOptions, reporterContext) {
        this._config = {
            injectGlobals: true,
            sandboxInjectedGlobals: [],
            ... globalConfig
        };
        this._context = reporterContext;
        this.coverageReport = new CoverageReport(reporterOptions);
        this.coverageReport.cleanCache();
    }

    async onTestResult(_test, testResult) {
        if (!testResult.v8Coverage) {
            return;
        }
        const coverageData = testResult.v8Coverage.map((item) => {
            const { codeTransformResult, result } = item;
            const { code, wrapperLength } = codeTransformResult;

            // console.log(codeTransformResult);

            result.scriptOffset = wrapperLength;
            result.source = code;

            // const fs = require('fs');
            // const path = require('path');
            // fs.writeFileSync(path.resolve('.sum.js'), result.source);

            return result;
        });

        await this.coverageReport.add(coverageData);

    }

    async onRunComplete(testContexts, results) {
        await this.coverageReport.generate();
    }

}

module.exports = V8CoverageReporter;
