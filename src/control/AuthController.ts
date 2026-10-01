import { createClient } from "@/lib/supabase/client";

export class AuthController {
  private supabase = createClient();

  public async registerCustomer(
    name: string,
    email: string,
    password: string
  ) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "CUSTOMER",
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("User account could not be created.");
    }

    return data.user;
  }

  public async registerInteriorDesigner(
    name: string,
    email: string,
    password: string,
    companyName: string
  ) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "INTERIOR_DESIGNER",
          company_name: companyName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("User account could not be created.");
    }

    return data.user;
  }

  public async login(
    email: string,
    password: string
  ) {
    const { data, error } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }

  public async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }
}