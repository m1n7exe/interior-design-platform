import "server-only";

import { IDP } from "@/entity/IDP";
import { IDPCategory } from "@/entity/IDPCategory";

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
    images: string[],
    status?: string
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

    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
      throw new Error("Budget must be a valid non-negative number.");
    }

    if (!Array.isArray(images)) {
      throw new Error("Project images must be an array.");
    }

    if (status !== undefined && !["DRAFT", "PUBLISHED"].includes(status)) {
      throw new Error("Project status must be DRAFT or PUBLISHED.");
    }

    const { data, error } = await IDP.createProject(
      designerId,
      title.trim(),
      description,
      categoryId,
      category,
      budget,
      coverImage,
      images,
      status
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
  public async getMarketplaceProjects() {
    const [{ data, error }, categoryResult] = await Promise.all([
      IDP.getProjects(),
      IDPCategory.searchCategories(""),
    ]);

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
        archivedAt: project.getArchivedAt(),
      })),
      categories: (categoryResult.data ?? []).map((category) =>
        category.getName()
      ),
      error: error?.message ?? null,
    };
  }

  public async getDesignerProjects(designerId: string) {
    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    const { data, error } = await IDP.getProjectsByDesigner(designerId);

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
        archivedAt: project.getArchivedAt(),
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
    images: string[],
    status?: string
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

    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
      throw new Error("Budget must be a valid non-negative number.");
    }

    if (!Array.isArray(images)) {
      throw new Error("Project images must be an array.");
    }

    if (status !== undefined && !["DRAFT", "PUBLISHED"].includes(status)) {
      throw new Error("Project status must be DRAFT or PUBLISHED.");
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
      images,
      status
    );

    return {
      success: !error,
      project: data ?? null,
      error: error?.message ?? null,
    };
  }
}

// Archive / Restore IDP Controller
export class IDPArchiveController {
  public async setArchived(
    id: string,
    designerId: string,
    archived: boolean
  ) {
    if (!id) {
      throw new Error("Project ID is required.");
    }

    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    const { data, error } = await IDP.setArchived(
      id,
      designerId,
      archived
    );

    return {
      success: !error && !!data,
      project: data ?? null,
      error:
        error?.message ??
        (!data
          ? "Project not found or you do not have permission to update it."
          : null),
    };
  }
}

// Project View Controller
export class IDPViewController {
  public async recordProjectView(projectId: string, viewerId: string) {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    if (!viewerId) {
      throw new Error("Viewer ID is required.");
    }

    const { data, error } = await IDP.recordProjectView(projectId, viewerId);

    return {
      success: !error && !!data,
      error: error?.message ?? null,
    };
  }

  public async getTotalViewsByDesigner(designerId: string) {
    if (!designerId) {
      throw new Error("Designer ID is required.");
    }

    const { count, error } = await IDP.getTotalViewsByDesigner(designerId);

    return {
      success: !error,
      totalViews: count,
      error: error?.message ?? null,
    };
  }
}

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
