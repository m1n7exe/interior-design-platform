import "server-only";

import { createClient } from "@/lib/supabase/server";
import { Admin } from "@/entity/Admin";

export async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  return await Admin.isAdmin(user.id);
}