import { User } from "./User";
import { createClient } from "@/lib/supabase/client";

export class Customer extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email);
  }

  public getRole(): string {
    return "CUSTOMER";
  }

  public static async register(
    name: string,
    email: string,
    password: string
  ) {
    const supabase = createClient();

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "CUSTOMER",
        },
      },
    });
  }
}