import "server-only";

import { CustomerServer } from "@/entity/CustomerServer";
import { IDP } from "@/entity/IDP";

export class CustomerFavouritesController {
  public async getFavourites(searchTerm: string = "") {
    const { customerId, error: customerError } =
      await CustomerServer.getAuthenticatedCustomerId();

    if (!customerId) {
      return {
        success: false,
        favourites: [],
        error: customerError,
      };
    }

    const { data: projectIds, error: favouritesError } =
      await CustomerServer.getFavouriteProjectIds(customerId);

    if (favouritesError) {
      return {
        success: false,
        favourites: [],
        error: favouritesError,
      };
    }

    if (!projectIds || projectIds.length === 0) {
      return {
        success: true,
        favourites: [],
        error: null,
      };
    }

    const { data: projects, error: projectsError } =
      await IDP.getProjectsByIds(projectIds, searchTerm);

    if (projectsError) {
      console.error("Favourite project retrieval error:", projectsError);

      return {
        success: false,
        favourites: [],
        error: "Unable to retrieve favourite projects",
      };
    }

    return {
      success: true,
      favourites: (projects ?? []).map((project) => ({
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
      error: null,
    };
  }

  // Search the customer's favourites by title, description or category
  public async searchFavourites(searchTerm: string) {
    return await this.getFavourites(searchTerm.trim().slice(0, 100));
  }

  public async addFavourite(projectId: string) {
    const { customerId, error } =
      await CustomerServer.getAuthenticatedCustomerId();

    if (!customerId) {
      return { success: false, error };
    }

    return await CustomerServer.addFavourite(customerId, projectId);
  }

  public async removeFavourite(projectId: string) {
    const { customerId, error } =
      await CustomerServer.getAuthenticatedCustomerId();

    if (!customerId) {
      return { success: false, error };
    }

    return await CustomerServer.removeFavourite(customerId, projectId);
  }
}