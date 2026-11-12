import { createClient } from "@/lib/supabase/client";

export abstract class User {
  protected id: string;
  protected name: string;
  protected email: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public abstract getRole(): string;

  public static async login(email: string, password: string) {
    const supabase = createClient();

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Accounts banned through Supabase Auth are rejected here
    if (result.error) {
      if (result.error.message.toLowerCase().includes("banned")) {
        return {
          data: { user: null, session: null },
          error: new Error(
            "Your account has been suspended. Please contact support."
          ),
        };
      }
      return result;
    }

    // Check the status column
    const { data: profile } = await supabase
      .from("users")
      .select("status")
      .eq("id", result.data.user.id)
      .maybeSingle();

    if (profile?.status === "SUSPENDED") {
      await supabase.auth.signOut();

      return {
        data: { user: null, session: null },
        error: new Error(
          "Your account has been suspended. Please contact support."
        ),
      };
    }

    return result;
  }

  public static async logout() {
    const supabase = createClient();

    return await supabase.auth.signOut();
  }
}