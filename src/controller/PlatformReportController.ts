import "server-only";

import { PlatformReport, type ReportPeriod } from "@/entity/PlatformReport";

async function generateReport(period: ReportPeriod) {
  const { data, error } = await PlatformReport.generate(period);

  return {
    success: !error,
    report: data ?? null,
    error: error?.message ?? null,
  };
}

// Daily Report Controller
export class DailyReportController {
  public async generateReport() {
    return await generateReport("daily");
  }
}

// Weekly Report Controller
export class WeeklyReportController {
  public async generateReport() {
    return await generateReport("weekly");
  }
}

// Monthly Report Controller
export class MonthlyReportController {
  public async generateReport() {
    return await generateReport("monthly");
  }
}
