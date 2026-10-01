import { createClient } from "@/lib/supabase/client";

export type UserRole = "CUSTOMER" | "INTERIOR_DESIGNER";

export class UserRepository {
  private supabase = createClient();

  public async createUser(
    id: string,
    name: string,
    role: UserRole
  ): Promise<void> {
    const { error } = await this.supabase
      .from("users")
      .insert({
        id,
        name,
        role,
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  public async createCustomer(
    userId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from("customers")
      .insert({
        user_id: userId,
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  public async createInteriorDesigner(
    userId: string,
    companyName: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from("interior_designers")
      .insert({
        user_id: userId,
        company_name: companyName,
      });

    if (error) {
      throw new Error(error.message);
    }
  }
}