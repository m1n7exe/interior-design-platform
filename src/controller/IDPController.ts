import "server-only";

import { IDP } from "@/entity/IDP";

// Create IDP Controller
export class IDPCreationController {
  public async createProject(
    designerId: string,
    title: string,
    description: string | null,
    categoryId: string,
    category: string,
    budget: number | null,
    coverImage: string | null,
    images: string[]
  ) {
    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    if (!title.trim()) {
      throw new Error("Project title is required.");
    }

    if (!categoryId || !category) {
      throw new Error("Project category is required.");
    }

    if (
      budget !== null &&
      (!Number.isFinite(budget) || budget < 0)
    ) {
      throw new Error("Budget must be a valid non-negative number.");
    }

    if (!Array.isArray(images)) {
      throw new Error("Project images must be an array.");
    }

    const { data, error } = await IDP.createProject(
      designerId,
      title.trim(),
      description,
      categoryId,
      category,
      budget,
      coverImage,
      images
    );

    return {
      success: !error,
      project: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Retrieve IDP Controller
export class IDPRetrievalController {
  // Retrieve projects for the customer marketplace
  public async getMarketplaceProjects() {
    const { data, error } = await IDP.getProjects();

    return {
      success: !error,
      projects: (data ?? []).map((project) => ({
        id: project.getId(),
        designerId: project.getDesignerId(),
        title: project.getTitle(),
        description: project.getDescription(),
        categoryId: project.getCategoryId(),
        category: project.getCategory(),
        budget: project.getBudget(),
        status: project.getStatus(),
        coverImage: project.getCoverImage(),
        images: project.getImages(),
        createdAt: project.getCreatedAt(),
      })),
      error: error?.message ?? null,
    };
  }

  // Retrieve projects belonging to a specific designer
  public async getDesignerProjects(designerId: string) {
    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    const { data, error } =
      await IDP.getProjectsByDesigner(designerId);

    return {
      success: !error,
      projects: (data ?? []).map((project) => ({
        id: project.getId(),
        designerId: project.getDesignerId(),
        title: project.getTitle(),
        description: project.getDescription(),
        categoryId: project.getCategoryId(),
        category: project.getCategory(),
        budget: project.getBudget(),
        status: project.getStatus(),
        coverImage: project.getCoverImage(),
        images: project.getImages(),
        createdAt: project.getCreatedAt(),
      })),
      error: error?.message ?? null,
    };
  }
}

// Update IDP Controller
export class IDPUpdateController {
  public async updateProject(
    id: string,
    designerId: string,
    title: string,
    description: string | null,
    categoryId: string,
    category: string,
    budget: number | null,
    coverImage: string | null,
    images: string[]
  ) {
    if (!id) {
      throw new Error("Project ID is required.");
    }

    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    if (!title.trim()) {
      throw new Error("Project title is required.");
    }

    if (!categoryId || !category) {
      throw new Error("Project category is required.");
    }

    if (
      budget !== null &&
      (!Number.isFinite(budget) || budget < 0)
    ) {
      throw new Error("Budget must be a valid non-negative number.");
    }

    if (!Array.isArray(images)) {
      throw new Error("Project images must be an array.");
    }

    const { data, error } = await IDP.updateProject(
      id,
      designerId,
      title.trim(),
      description,
      categoryId,
      category,
      budget,
      coverImage,
      images
    );

    return {
      success: !error,
      project: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Delete IDP Controller
// Delete IDP Controller
export class IDPDeletionController {
  public async deleteProject(id: string, designerId: string) {
    if (!id) {
      throw new Error("Project ID is required.");
    }

    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    const { data, error } = await IDP.deleteProject(id, designerId);

    return {
      success: !error && !!data,
      error:
        error?.message ??
        (!data
          ? "Project not found or you do not have permission to delete it."
          : null),
    };
  }
}