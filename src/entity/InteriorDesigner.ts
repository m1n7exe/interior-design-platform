import { User } from "./User";
import { createClient } from "@/lib/supabase/client";

export class InteriorDesigner extends User {
  private companyName: string;

  constructor(
    id: string,
    name: string,
    email: string,
    companyName: string
  ) {
    super(id, name, email);
    this.companyName = companyName;
  }

  public getCompanyName(): string {
    return this.companyName;
  }

  public getRole(): string {
    return "INTERIOR_DESIGNER";
  }

  public static async register(
    name: string,
    email: string,
    password: string,
    companyName: string
  ) {
    const supabase = createClient();

    return await supabase.auth.signUp({
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
  }
}