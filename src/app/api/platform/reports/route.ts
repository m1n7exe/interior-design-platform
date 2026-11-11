import {
  DailyReportController,
  WeeklyReportController,
  MonthlyReportController,
} from "@/controller/PlatformReportController";

import { requirePlatformManagement } from "@/lib/auth/requirePlatformManagement";

const dailyController = new DailyReportController();
const weeklyController = new WeeklyReportController();
const monthlyController = new MonthlyReportController();

// Generate a report: GET /api/platform/reports?type=daily|weekly|monthly
export async function GET(request: Request) {
  if (!(await requirePlatformManagement())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let result;

  switch (type) {
    case "daily":
      result = await dailyController.generateReport();
      break;

    case "weekly":
      result = await weeklyController.generateReport();
      break;

    case "monthly":
      result = await monthlyController.generateReport();
      break;

    default:
      return Response.json(
        { error: "Report type must be daily, weekly or monthly." },
        { status: 400 }
      );
  }

  return Response.json(result, {
    status: result.success ? 200 : 500,
  });
}
