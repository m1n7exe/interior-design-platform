import {
  CreateIDPCategoryController,
  SearchIDPCategoryController,
} from "@/controller/IDPCategoryController";

import { requirePlatformManagement } from "@/lib/auth/requirePlatformManagement";

const createController = new CreateIDPCategoryController();
const searchController = new SearchIDPCategoryController();

// Search (or list) IDP categories: GET /api/platform/idp-categories?q=term
export async function GET(request: Request) {
  if (!(await requirePlatformManagement())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q") ?? "";

  const result = await searchController.searchCategories(term);

  return Response.json(result, {
    status: result.success ? 200 : 500,
  });
}

// Create an IDP category
export async function POST(request: Request) {
  if (!(await requirePlatformManagement())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    (body.description != null && typeof body.description !== "string")
  ) {
    return Response.json(
      { error: "Invalid category details" },
      { status: 400 }
    );
  }

  const result = await createController.createCategory(
    body.name,
    body.description ?? null
  );

  return Response.json(result, {
    status: result.success ? 201 : 400,
  });
}
