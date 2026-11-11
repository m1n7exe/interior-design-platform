import "server-only";

import { IDPCategory } from "@/entity/IDPCategory";

// Convert an IDPCategory entity into a plain object for the boundary
function toPlain(category: IDPCategory) {
  return {
    id: category.getId(),
    name: category.getName(),
    description: category.getDescription(),
    createdAt: category.getCreatedAt(),
    updatedAt: category.getUpdatedAt(),
  };
}

// Validate and tidy the fields shared by create and update
function validate(name: string, description: string | null) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { error: "Category name is required." };
  }

  if (trimmedName.length > 100) {
    return { error: "Category name must be 100 characters or fewer." };
  }

  const trimmedDescription = description?.trim() || null;

  if (trimmedDescription && trimmedDescription.length > 500) {
    return { error: "Description must be 500 characters or fewer." };
  }

  return { name: trimmedName, description: trimmedDescription };
}

// Create IDP Category Controller
export class CreateIDPCategoryController {
  public async createCategory(
    name: string,
    description: string | null
  ) {
    const input = validate(name, description);

    if (input.error !== undefined) {
      return { success: false, category: null, error: input.error };
    }

    const { data, error } = await IDPCategory.createCategory(
      input.name,
      input.description
    );

    return {
      success: !error && !!data,
      category: data ? toPlain(data) : null,
      error: error?.message ?? null,
    };
  }
}

// View IDP Category Controller
export class ViewIDPCategoryController {
  public async getCategory(id: string) {
    if (!id) {
      return {
        success: false,
        notFound: false,
        category: null,
        error: "Category ID is required.",
      };
    }

    const { data, error } = await IDPCategory.getCategoryById(id);

    return {
      success: !error && !!data,
      notFound: !error && !data,
      category: data ? toPlain(data) : null,
      error: error?.message ?? (!data ? "IDP category not found." : null),
    };
  }
}

// Update IDP Category Controller
export class UpdateIDPCategoryController {
  public async updateCategory(
    id: string,
    name: string,
    description: string | null
  ) {
    if (!id) {
      return {
        success: false,
        notFound: false,
        category: null,
        error: "Category ID is required.",
      };
    }

    const input = validate(name, description);

    if (input.error !== undefined) {
      return {
        success: false,
        notFound: false,
        category: null,
        error: input.error,
      };
    }

    const { data, error } = await IDPCategory.updateCategory(
      id,
      input.name,
      input.description
    );

    return {
      success: !error && !!data,
      notFound: !error && !data,
      category: data ? toPlain(data) : null,
      error: error?.message ?? (!data ? "IDP category not found." : null),
    };
  }
}

// Delete IDP Category Controller
export class DeleteIDPCategoryController {
  public async deleteCategory(id: string) {
    if (!id) {
      return {
        success: false,
        notFound: false,
        error: "Category ID is required.",
      };
    }

    const { data, error } = await IDPCategory.deleteCategory(id);

    return {
      success: !error && !!data,
      notFound: !error && !data,
      error: error?.message ?? (!data ? "IDP category not found." : null),
    };
  }
}

// Search IDP Category Controller
export class SearchIDPCategoryController {
  public async searchCategories(term: string) {
    const { data, error } = await IDPCategory.searchCategories(term);

    return {
      success: !error,
      categories: (data ?? []).map(toPlain),
      error: error?.message ?? null,
    };
  }
}
