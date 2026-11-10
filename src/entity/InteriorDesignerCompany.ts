import { createClient } from "@/lib/supabase/client";

export class InteriorDesignerCompany {
  // Creates or registers company information
  public static async create(
    userId: string,
    companyName: string,
    bio: string | null,
    logoUrl: string | null,
    website: string | null,
    phone: string | null,
    email: string | null,
    address: string | null,
    yearsOfExperience: number | null,
    specialisations: string[]
  ) {
    const supabase = createClient();

    return await supabase
      .from("interior_designers")
      .upsert(
        {
          user_id: userId,
          company_name: companyName,
          bio,
          logo_url: logoUrl,
          website,
          phone,
          email,
          address,
          years_of_experience: yearsOfExperience,
          specialisations,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();
  }

  // Retrieves company information using the designer's user ID
  public static async getByUserId(userId: string) {
    const supabase = createClient();

    return await supabase
      .from("interior_designers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
  }

  // Updates existing company information
  public static async update(
    userId: string,
    companyName: string,
    bio: string | null,
    logoUrl: string | null,
    website: string | null,
    phone: string | null,
    email: string | null,
    address: string | null,
    yearsOfExperience: number | null,
    specialisations: string[]
  ) {
    const supabase = createClient();

    return await supabase
      .from("interior_designers")
      .update({
        company_name: companyName,
        bio,
        logo_url: logoUrl,
        website,
        phone,
        email,
        address,
        years_of_experience: yearsOfExperience,
        specialisations,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();
  }

  // Clears company information while retaining the designer's account record
  public static async delete(userId: string) {
    const supabase = createClient();

    return await supabase
      .from("interior_designers")
      .update({
        company_name: null,
        bio: null,
        logo_url: null,
        website: null,
        phone: null,
        email: null,
        address: null,
        years_of_experience: null,
        specialisations: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }
}