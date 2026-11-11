import "server-only";

import { User } from "./User";
import { createAdminClient } from "@/lib/supabase/admin";

export class PlatformManagement extends User {
  constructor(
    id: string,
    name: string,
    email: string
  ) {
    super(id, name, email);
  }

  public getRole(): string {
    return "PLATFORM_MANAGEMENT";
  }

  // Check whether a user belongs to Platform Management
  public static async isPlatformManagement(
    userId: string
  ): Promise<boolean> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("platform_management")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    return !error && data !== null;
  }
}
