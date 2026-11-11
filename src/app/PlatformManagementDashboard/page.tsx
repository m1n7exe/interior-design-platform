import { redirect } from "next/navigation";
import PlatformManagementDashboard from "@/boundary/PlatformManagementDashboard";
import { requirePlatformManagement } from "@/lib/auth/requirePlatformManagement";

export default async function PlatformManagementPage() {
  const isPlatformManagement = await requirePlatformManagement();

  if (!isPlatformManagement) {
    redirect("/login");
  }

  return <PlatformManagementDashboard />;
}
