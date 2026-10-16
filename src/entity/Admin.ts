import "server-only";

import { User } from "./User";
import { createAdminClient } from "@/lib/supabase/admin";

export class Admin extends User {
  constructor(
    id: string,
    name: string,
    email: string
  ) {
    super(id, name, email);
  }

  public getRole(): string {
    return "ADMIN";
  }

  // Check whether a user is an administrator
 public static async isAdmin(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && data !== null;
}

  // Create a new user account
  public static async createAccount(
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "INTERIOR_DESIGNER"
  ) {
    const supabase = createAdminClient();

    return await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    });
  }

  // Update an existing user account
  public static async updateAccount(
    id: string,
    name: string,
    email: string,
    role: "CUSTOMER" | "INTERIOR_DESIGNER"
  ) {
    const supabase = createAdminClient();

    return await supabase.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        name,
        role,
      },
    });
  }

  // Delete an existing user account
  public static async deleteAccount(id: string) {
    const supabase = createAdminClient();

    return await supabase.auth.admin.deleteUser(id);
  }

  // Retrieve all user accounts (paginated by Supabase)
  public static async getAccounts() {
    const supabase = createAdminClient();

    return await supabase.auth.admin.listUsers();
  }
}