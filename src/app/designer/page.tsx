
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DesignerDashboard from "@/boundary/DesignerDashboard";

export default async function DesignerPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Read the role from the same database table as the login page.
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/login");
  }

  const role = profile.role?.toUpperCase();

  // Only interior designers may access this page.
  if (role !== "INTERIOR_DESIGNER") {
    if (role === "ADMIN") {
      redirect("/admin");
    }

    if (role === "CUSTOMER") {
      redirect("/CustomerDashboard");
    }

    redirect("/login");
  }

  return (
    <DesignerDashboard
      designerName={user.user_metadata?.name ?? "Designer"}
      designerEmail={user.email ?? ""}
    />
  );
}
