import "server-only";

import { IDP } from "@/entity/IDP";

// Handles retrieval of projects for the customer marketplace
export class IDPRetrievalController {
  public async getMarketplaceProjects() {
    const { data, error } = await IDP.getProjects();

    return {
      success: !error,
      projects: (data ?? []).map((project) => ({
        id: project.getId(),
        designerId: project.getDesignerId(),
        title: project.getTitle(),
        description: project.getDescription(),
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