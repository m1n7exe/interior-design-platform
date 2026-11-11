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
    role: "CUSTOMER" | "INTERIOR_DESIGNER" | "PLATFORM_MANAGEMENT"
  ) {
    const supabase = createAdminClient();

    const result = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    });

    // Customers and designers need nothing extra
    if (result.error || !result.data.user || role !== "PLATFORM_MANAGEMENT") {
      return result;
    }

    const userId = result.data.user.id;

    // Make sure the public.users row exists with the right role
    const { error: userError } = await supabase
      .from("users")
      .upsert({ id: userId, name, role }, { onConflict: "id" });

    // Link the account to the platform_management table
    const { error: pmError } = userError
      ? { error: userError }
      : await supabase
          .from("platform_management")
          .insert({ user_id: userId });

    // 23505 = already exists (e.g. created by a database trigger)
    const failed = userError ?? (pmError && pmError.code !== "23505" ? pmError : null);

    if (failed) {
      // Roll back so we don't leave a half-created account
      await supabase.auth.admin.deleteUser(userId);

      return {
        data: { user: null },
        error: { message: `Unable to set up Platform Management account: ${failed.message}` },
      };
    }

    return result;
  }

  // Update an existing user account
  public static async updateAccount(
    id: string,
    updates: {
      name?: string;
      email?: string;
      password?: string;
    }
  ) {
    const supabase = createAdminClient();

    // Retrieve existing Auth metadata so the user's role is preserved.
    const { data: existingData, error: fetchError } =
      await supabase.auth.admin.getUserById(id);

    if (fetchError || !existingData.user) {
      return {
        success: false,
        error: fetchError?.message ?? "User not found.",
        user: null,
      };
    }

    const existingMetadata = existingData.user.user_metadata ?? {};

    const authUpdates: {
      email?: string;
      email_confirm?: boolean;
      password?: string;
      user_metadata?: Record<string, unknown>;
    } = {};

    if (updates.email !== undefined) {
      authUpdates.email = updates.email;
      authUpdates.email_confirm = true;
    }

    if (updates.password !== undefined) {
      authUpdates.password = updates.password;
    }

    if (updates.name !== undefined) {
      authUpdates.user_metadata = {
        ...existingMetadata,
        name: updates.name,
      };
    }

    // Update Supabase Auth.
    const { data: updatedData, error: updateError } =
      await supabase.auth.admin.updateUserById(id, authUpdates);

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
        user: null,
      };
    }

    // Keep the public profile name synchronised.
    if (updates.name !== undefined) {
      const { error: profileError } = await supabase
        .from("users")
        .update({ name: updates.name })
        .eq("id", id);

      if (profileError) {
        return {
          success: false,
          error: `Auth updated, but profile name update failed: ${profileError.message}`,
          user: updatedData.user,
        };
      }
    }

    return {
      success: true,
      error: null,
      user: updatedData.user,
    };
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