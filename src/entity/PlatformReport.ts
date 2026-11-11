import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ReportPeriod = "daily" | "weekly" | "monthly";

export type ReportData = {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  newUsers: number;
  newCustomers: number;
  newDesigners: number;
  newProjects: number;
  newFavourites: number;
  newCategories: number;
  totalUsers: number;
  totalProjects: number;
  totalCategories: number;
  projectsByCategory: { category: string; count: number }[];
};

// Reports use Singapore time (UTC+8) for day boundaries
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export class PlatformReport {
  // daily = since midnight today, weekly = since Monday, monthly = since the 1st
  private static getRange(period: ReportPeriod) {
    const end = new Date();
    const sgt = new Date(end.getTime() + SGT_OFFSET_MS);

    let startSgt = Date.UTC(
      sgt.getUTCFullYear(),
      sgt.getUTCMonth(),
      sgt.getUTCDate()
    );

    if (period === "weekly") {
      const daysSinceMonday = (sgt.getUTCDay() + 6) % 7;
      startSgt -= daysSinceMonday * DAY_MS;
    }

    if (period === "monthly") {
      startSgt = Date.UTC(sgt.getUTCFullYear(), sgt.getUTCMonth(), 1);
    }

    return { start: new Date(startSgt - SGT_OFFSET_MS), end };
  }

  // Generate a platform activity report for the given period

  public static async generate(period: ReportPeriod) {
    const supabase = createAdminClient();
    const { start, end } = PlatformReport.getRange(period);
    const from = start.toISOString();

    const results = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", from),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", from).eq("role", "CUSTOMER"),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", from).eq("role", "INTERIOR_DESIGNER"),
      supabase.from("interior_designer_projects").select("id", { count: "exact", head: true }).gte("created_at", from),
      supabase.from("customer_favourites").select("id", { count: "exact", head: true }).gte("created_at", from),
      supabase.from("idp_categories").select("id", { count: "exact", head: true }).gte("created_at", from),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("interior_designer_projects").select("id", { count: "exact", head: true }),
      supabase.from("idp_categories").select("id", { count: "exact", head: true }),
      supabase.from("interior_designer_projects").select("idp_categories(name)").gte("created_at", from),
    ]);

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      return { data: null, error: failed.error };
    }

    const [
      newUsers,
      newCustomers,
      newDesigners,
      newProjects,
      newFavourites,
      newCategories,
      totalUsers,
      totalProjects,
      totalCategories,
      projectRows,
    ] = results;

    const rows = (projectRows.data ?? []) as unknown as {
      idp_categories: { name: string } | null;
    }[];

    const counts = new Map<string, number>();

    for (const row of rows) {
      const name = row.idp_categories?.name ?? "Uncategorised";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const report: ReportData = {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      newUsers: newUsers.count ?? 0,
      newCustomers: newCustomers.count ?? 0,
      newDesigners: newDesigners.count ?? 0,
      newProjects: newProjects.count ?? 0,
      newFavourites: newFavourites.count ?? 0,
      newCategories: newCategories.count ?? 0,
      totalUsers: totalUsers.count ?? 0,
      totalProjects: totalProjects.count ?? 0,
      totalCategories: totalCategories.count ?? 0,
      projectsByCategory: Array.from(counts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
    };

    return { data: report, error: null };
  }
}
