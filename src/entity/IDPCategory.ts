import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type IDPCategoryRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export class IDPCategory {
  private id: string;
  private name: string;
  private description: string | null;
  private createdAt: string;
  private updatedAt: string;

  constructor(
    id: string,
    name: string,
    description: string | null,
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }

  // Convert database records into IDPCategory entities

  private static mapToEntity(row: IDPCategoryRow): IDPCategory {
    return new IDPCategory(
      row.id,
      row.name,
      row.description,
      row.created_at,
      row.updated_at
    );
  }

  // Escape LIKE wildcards so names are compared literally

  private static escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
  }

  // Check whether another category already uses this name

  private static async nameExists(
    name: string,
    excludeId?: string
  ): Promise<boolean> {
    const supabase = createAdminClient();

    let query = supabase
      .from("idp_categories")
      .select("id")
      .ilike("name", IDPCategory.escapeLike(name));

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.limit(1);

    return (data ?? []).length > 0;
  }

  // Create a new IDP category

  public static async createCategory(
    name: string,
    description: string | null
  ) {
    if (await IDPCategory.nameExists(name)) {
      return {
        data: null,
        error: { message: "An IDP category with this name already exists." },
      };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("idp_categories")
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: IDPCategory.mapToEntity(data as IDPCategoryRow),
      error: null,
    };
  }

  // Retrieve a single IDP category

  public static async getCategoryById(id: string) {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("idp_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return {
      data: data ? IDPCategory.mapToEntity(data as IDPCategoryRow) : null,
      error: null,
    };
  }

  // Search IDP categories by name or description (empty term returns all)

  public static async searchCategories(term: string) {
    const supabase = createAdminClient();

    let query = supabase
      .from("idp_categories")
      .select("*")
      .order("name", { ascending: true });

    // Remove characters that have special meaning in a PostgREST filter
    const cleaned = term.replace(/[,()%*\\]/g, " ").trim();

    if (cleaned) {
      query = query.or(
        `name.ilike.%${cleaned}%,description.ilike.%${cleaned}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return {
      data: ((data ?? []) as IDPCategoryRow[]).map(IDPCategory.mapToEntity),
      error: null,
    };
  }

  // Update an existing IDP category

  public static async updateCategory(
    id: string,
    name: string,
    description: string | null
  ) {
    if (await IDPCategory.nameExists(name, id)) {
      return {
        data: null,
        error: { message: "An IDP category with this name already exists." },
      };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("idp_categories")
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: null };
    }

    // Projects also store the category name as text, so keep it in sync
    await supabase
      .from("interior_designer_projects")
      .update({ category: name })
      .eq("category_id", id);

    return {
      data: IDPCategory.mapToEntity(data as IDPCategoryRow),
      error: null,
    };
  }

  // Delete an IDP category that is not in use

  public static async deleteCategory(id: string) {
    const supabase = createAdminClient();

    const { count, error: countError } = await supabase
      .from("interior_designer_projects")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      return { data: null, error: countError };
    }

    if ((count ?? 0) > 0) {
      return {
        data: null,
        error: {
          message: `This category is used by ${count} project(s) and cannot be deleted.`,
        },
      };
    }

    return await supabase
      .from("idp_categories")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
  }
}
