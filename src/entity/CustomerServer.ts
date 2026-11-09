import "server-only";

import { createClient } from "@/lib/supabase/server";

export class CustomerServer {

  /**
   * Authenticate the current user and verify their customer profile.
   */
  public static async getAuthenticatedCustomerId() {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        customerId: null,
        error: "Unauthenticated",
      };
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError) {
      console.error("Customer verification error:", customerError);

      return {
        customerId: null,
        error: "Unable to verify customer profile",
      };
    }

    if (!customer) {
      return {
        customerId: null,
        error: "Customer profile not found",
      };
    }

    return {
      customerId: customer.user_id,
      error: null,
    };
  }

  /**
   * Retrieve all favourite project IDs belonging to a customer.
   */
  public static async getFavouriteProjectIds(customerId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("customer_favourites")
      .select("project_id")
      .eq("customer_id", customerId);

    if (error) {
      console.error("Favourite retrieval error:", error);

      return {
        data: null,
        error: "Unable to retrieve favourites",
      };
    }

    return {
      data: data.map((favourite) => favourite.project_id),
      error: null,
    };
  }

  /**
   * Add a project to a customer's favourites.
   */
  public static async addFavourite(
    customerId: string,
    projectId: string
  ) {
    const validatedProjectId = projectId?.trim();

    if (!validatedProjectId) {
      return {
        success: false,
        error: "Project ID is required",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("customer_favourites")
      .upsert(
        {
          customer_id: customerId,
          project_id: validatedProjectId,
        },
        {
          onConflict: "customer_id,project_id",
          ignoreDuplicates: true,
        }
      );

    if (error) {
      console.error("Favourite insertion error:", error);

      return {
        success: false,
        error: "Unable to add project to favourites",
      };
    }

    return {
      success: true,
      error: null,
    };
  }

  /**
   * Remove a project from a customer's favourites.
   */
  public static async removeFavourite(
    customerId: string,
    projectId: string
  ) {
    const validatedProjectId = projectId?.trim();

    if (!validatedProjectId) {
      return {
        success: false,
        error: "Project ID is required",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("customer_favourites")
      .delete()
      .eq("customer_id", customerId)
      .eq("project_id", validatedProjectId);

    if (error) {
      console.error("Favourite deletion error:", error);

      return {
        success: false,
        error: "Unable to remove project from favourites",
      };
    }

    return {
      success: true,
      error: null,
    };
  }
}