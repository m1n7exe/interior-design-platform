import "server-only";

import { createClient } from "@/lib/supabase/server";

export class IDP {
  private id: string;
  private designerId: string;
  private title: string;
  private description: string;
  private category: string;
  private budget: number | null;
  private status: string;
  private coverImage: string | null;
  private images: string[];
  private createdAt: string;

  constructor(
    id: string,
    designerId: string,
    title: string,
    description: string,
    category: string,
    budget: number | null,
    status: string,
    coverImage: string | null,
    images: string[],
    createdAt: string
  ) {
    this.id = id;
    this.designerId = designerId;
    this.title = title;
    this.description = description;
    this.category = category;
    this.budget = budget;
    this.status = status;
    this.coverImage = coverImage;
    this.images = images;
    this.createdAt = createdAt;
  }

  // Getters

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

  // Convert database records into IDP entities

  private static mapToEntities(data: any[]): IDP[] {
    return data.map(
      (project) =>
        new IDP(
          project.id,
          project.designer_id,
          project.title,
          project.description ?? "",
          project.category,
          project.budget === null
            ? null
            : Number(project.budget),
          project.status,
          project.cover_image,
          project.images ?? [],
          project.created_at
        )
    );
  }

  // Retrieve all interior designer projects

  public static async getProjects() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("interior_designer_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return {
      data: IDP.mapToEntities(data ?? []),
      error: null,
    };
  }

  // Retrieve projects belonging to a specific designer

  public static async getProjectsByDesigner(designerId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("interior_designer_projects")
      .select("*")
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

  // Retrieve projects using a list of project IDs

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
      .select("*")
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
}