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

  // Retrieve one account with its full profile
  public static async getAccount(id: string) {
    const supabase = createAdminClient();

    const { data: authData, error: authError } =
      await supabase.auth.admin.getUserById(id);

    if (authError || !authData.user) {
      return {
        data: null,
        error: { message: authError?.message ?? "Account not found." },
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(
        "id, name, role, created_at, username, phone_number, location, profile_photo_url"
      )
      .eq("id", id)
      .maybeSingle();

    if (profileError) {
      return { data: null, error: profileError };
    }

    const authUser = authData.user;

    return {
      data: {
        id,
        email: authUser.email ?? "",
        name: profile?.name ?? authUser.user_metadata?.name ?? "",
        role: profile?.role ?? authUser.user_metadata?.role ?? "",
        createdAt: profile?.created_at ?? authUser.created_at,
        username: profile?.username ?? null,
        phoneNumber: profile?.phone_number ?? null,
        location: profile?.location ?? null,
        profilePhotoUrl: profile?.profile_photo_url ?? null,
      },
      error: null,
    };
  }

  // Update an account's login details and profile information
  public static async updateAccount(
    id: string,
    updates: {
      name?: string;
      email?: string;
      password?: string;
      username?: string | null;
      phoneNumber?: string | null;
      location?: string | null;
      profilePhotoUrl?: string | null;
    }
  ) {
    const supabase = createAdminClient();

    // 1. Profile details stored in public.users
    const profileUpdates: Record<string, string | null> = {};

    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.username !== undefined) profileUpdates.username = updates.username;
    if (updates.phoneNumber !== undefined) profileUpdates.phone_number = updates.phoneNumber;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.profilePhotoUrl !== undefined) profileUpdates.profile_photo_url = updates.profilePhotoUrl;

    if (Object.keys(profileUpdates).length > 0) {
      const { data, error } = await supabase
        .from("users")
        .update(profileUpdates)
        .eq("id", id)
        .select("id");

      if (error) {
        return {
          success: false,
          user: null,
          error:
            error.code === "23505"
              ? "That username is already taken."
              : error.message,
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          user: null,
          error: "Profile record not found for this account.",
        };
      }
    }

    // 2. Login details stored in Supabase Auth
    const { data: existing, error: lookupError } =
      await supabase.auth.admin.getUserById(id);

    if (lookupError || !existing.user) {
      return {
        success: false,
        user: null,
        error: lookupError?.message ?? "Account not found.",
      };
    }

    const authUpdates: {
      email?: string;
      password?: string;
      user_metadata?: Record<string, unknown>;
    } = {};

    if (updates.email !== undefined) authUpdates.email = updates.email;
    if (updates.password !== undefined) authUpdates.password = updates.password;

    if (updates.name !== undefined) {
      authUpdates.user_metadata = {
        ...existing.user.user_metadata,
        name: updates.name,
      };
    }

    if (Object.keys(authUpdates).length === 0) {
      return { success: true, user: existing.user, error: null };
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      id,
      authUpdates
    );

    if (error) {
      return { success: false, user: null, error: error.message };
    }

    return { success: true, user: data.user, error: null };
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