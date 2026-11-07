import type { Config, CoverageReporter, ReporterContext } from "@jest/reporters";
import type {
    CoverageReportOptions,
    ReportDescription,
    V8CoverageEntry,
    Watermarks,
    CoverageResults,
    CoverageSummary,
    MetricsSummary,
    CoverageFile,
    CoverageRange,
    AddedResults
} from "monocart-coverage-reports";

declare class MonocartCoverageReporter extends CoverageReporter {
    constructor(
        globalConfig: Config.GlobalConfig,
        reporterOptions?: CoverageReportOptions,
        reporterContext?: ReporterContext
    );
}

export default MonocartCoverageReporter;

export type {
    CoverageReportOptions,
    ReportDescription,
    V8CoverageEntry,
    Watermarks,
    CoverageResults,
    CoverageSummary,
    MetricsSummary,
    CoverageFile,
    CoverageRange,
    AddedResults
}
