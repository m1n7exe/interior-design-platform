import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PlatformManagement } from "@/entity/PlatformManagement";

export async function requirePlatformManagement(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  return await PlatformManagement.isPlatformManagement(user.id);
}
