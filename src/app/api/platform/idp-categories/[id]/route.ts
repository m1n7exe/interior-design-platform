import {
  ViewIDPCategoryController,
  UpdateIDPCategoryController,
  DeleteIDPCategoryController,
} from "@/controller/IDPCategoryController";

import { requirePlatformManagement } from "@/lib/auth/requirePlatformManagement";

const viewController = new ViewIDPCategoryController();
const updateController = new UpdateIDPCategoryController();
const deleteController = new DeleteIDPCategoryController();

type RouteContext = {
  params: Promise<{ id: string }>;
};

// View an IDP category
export async function GET(request: Request, context: RouteContext) {
  if (!(await requirePlatformManagement())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const result = await viewController.getCategory(id);

  return Response.json(result, {
    status: result.success ? 200 : result.notFound ? 404 : 400,
  });
}

// Update an IDP category
export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requirePlatformManagement())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

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

  const result = await updateController.updateCategory(
    id,
    body.name,
    body.description ?? null
  );

  return Response.json(result, {
    status: result.success ? 200 : result.notFound ? 404 : 400,
  });
}

// Delete an IDP category
export async function DELETE(request: Request, context: RouteContext) {
  if (!(await requirePlatformManagement())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const result = await deleteController.deleteCategory(id);

  return Response.json(result, {
    status: result.success ? 200 : result.notFound ? 404 : 400,
  });
}
