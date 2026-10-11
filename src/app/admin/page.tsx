import { redirect } from "next/navigation";
import AdminDashboard from "@/boundary/AdminDashboard";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminPage() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    redirect("/login");
  }

  return <AdminDashboard />;
}