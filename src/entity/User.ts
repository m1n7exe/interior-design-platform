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

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  public static async logout() {
    const supabase = createClient();

    return await supabase.auth.signOut();
  }
}