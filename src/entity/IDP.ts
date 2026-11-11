import "server-only";

import { createClient } from "@/lib/supabase/server";

export class IDP {
  private id: string;
  private designerId: string;
  private title: string;
  private description: string;
  private categoryId: string;
  private category: string;
  private budget: number | null;
  private status: string;
  private coverImage: string | null;
  private images: string[];
  private createdAt: string;
  private archivedAt: string | null;

  constructor(
    id: string,
    designerId: string,
    title: string,
    description: string,
    categoryId: string,
    category: string,
    budget: number | null,
    status: string,
    coverImage: string | null,
    images: string[],
    createdAt: string,
    archivedAt: string | null
  ) {
    this.id = id;
    this.designerId = designerId;
    this.title = title;
    this.description = description;
    this.categoryId = categoryId;
    this.category = category;
    this.budget = budget;
    this.status = status;
    this.coverImage = coverImage;
    this.images = images;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getDesignerId(): string {
    return this.designerId;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getCategoryId(): string {
    return this.categoryId;
  }

  public getCategory(): string {
    return this.category;
  }

  public getBudget(): number | null {
    return this.budget;
  }

  public getStatus(): string {
    return this.status;
  }

  public getCoverImage(): string | null {
    return this.coverImage;
  }

  public getImages(): string[] {
    return this.images;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getArchivedAt(): string | null {
    return this.archivedAt;
  }

  private static mapToEntities(data: any[]): IDP[] {
    return data.map(
      (project) =>
        new IDP(
          project.id,
          project.designer_id,
          project.title,
          project.description ?? "",
          project.category_id,
          project.idp_categories?.name ?? "",
          project.budget === null ? null : Number(project.budget),
          project.status,
          project.cover_image,
          project.images ?? [],
          project.created_at,
          project.archived_at ?? null
        )
    );
  }

  public static async createProject(
    designerId: string,
    title: string,
    description: string | null,
    categoryId: string,
    category: string,
    budget: number | null,
    coverImage: string | null,
    images: string[],
    status?: string
  ) {
    const supabase = await createClient();

    return await supabase
      .from("interior_designer_projects")
      .insert({
        designer_id: designerId,
        title,
        description,
        category_id: categoryId,
        category,
        budget,
        cover_image: coverImage,
        images,
        ...(status ? { status } : {}),
      })
      .select()
      .single();
  }

  // Retrieve published, non-archived projects for the customer marketplace.
  public static async getProjects() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("interior_designer_projects")
      .select(`
        *,
        idp_categories (
          name
        )
      `)
      .eq("status", "PUBLISHED")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return {
      data: IDP.mapToEntities(data ?? []),
      error: null,
    };
  }

  public static async getProjectsByDesigner(designerId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("interior_designer_projects")
      .select(`
        *,
        idp_categories (
          name
        )
      `)
      .eq("designer_id", designerId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return {
      data: IDP.mapToEntities(data ?? []),
      error: null,
    };
  }

  public static async getProjectsByIds(projectIds: string[]) {
    if (!projectIds.length) {
      return {
        data: [],
        error: null,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("interior_designer_projects")
      .select(`
        *,
        idp_categories (
          name
        )
      `)
      .in("id", projectIds);

    if (error) {
      return {
        data: null,
        error,
      };
    }

    return {
      data: IDP.mapToEntities(data ?? []),
      error: null,
    };
  }

  public static async updateProject(
    id: string,
    designerId: string,
    title: string,
    description: string | null,
    categoryId: string,
    category: string,
    budget: number | null,
    coverImage: string | null,
    images: string[],
    status?: string
  ) {
    const supabase = await createClient();

    return await supabase
      .from("interior_designer_projects")
      .update({
        title,
        description,
        category_id: categoryId,
        category,
        budget,
        cover_image: coverImage,
        images,
        ...(status ? { status } : {}),
      })
      .eq("id", id)
      .eq("designer_id", designerId)
      .select()
      .single();
  }

  public static async setArchived(
    id: string,
    designerId: string,
    archived: boolean
  ) {
    const supabase = await createClient();

    return await supabase
      .from("interior_designer_projects")
      .update({
        archived_at: archived ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("designer_id", designerId)
      .select("id, archived_at")
      .maybeSingle();
  }

  public static async deleteProject(id: string, designerId: string) {
    const supabase = await createClient();

    return await supabase
      .from("interior_designer_projects")
      .delete()
      .eq("id", id)
      .eq("designer_id", designerId)
      .select("id")
      .maybeSingle();
  }

  public static async recordProjectView(
    projectId: string,
    viewerId: string
  ) {
    const supabase = await createClient();

    return await supabase
      .from("idp_project_views")
      .insert({
        project_id: projectId,
        viewer_id: viewerId,
      })
      .select("id")
      .single();
  }

  public static async getTotalViewsByDesigner(designerId: string) {
    const supabase = await createClient();

    const { data: projects, error: projectError } = await supabase
      .from("interior_designer_projects")
      .select("id")
      .eq("designer_id", designerId);

    if (projectError) {
      return { count: 0, error: projectError };
    }

    const projectIds = (projects ?? []).map((project) => project.id);

    if (projectIds.length === 0) {
      return { count: 0, error: null };
    }

    const { count, error } = await supabase
      .from("idp_project_views")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds);

    return {
      count: count ?? 0,
      error,
    };
  }
}
