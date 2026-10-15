import { AdminController } from "@/controller/AdminController";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";

const controller = new AdminController();

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!(await requireAdmin())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  let body: {
    name?: unknown;
    email?: unknown;
    role?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.email !== "string" ||
    !body.email.trim() ||
    !body.email.includes("@") ||
    !["CUSTOMER", "INTERIOR_DESIGNER"].includes(
      body.role as string
    )
  ) {
    return Response.json(
      { error: "Invalid account details" },
      { status: 400 }
    );
  }

  // Do not allow this endpoint to modify administrator accounts.
  const { Admin } = await import("@/entity/Admin");

  if (await Admin.isAdmin(id)) {
    return Response.json(
      { error: "Administrator accounts cannot be edited here." },
      { status: 403 }
    );
  }

  const result = await controller.updateAccount(
    id,
    body.name.trim(),
    body.email.trim(),
    body.role as "CUSTOMER" | "INTERIOR_DESIGNER"
  );

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}
export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!(await requireAdmin())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.id === id) {
    return Response.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  // Check whether the target account is another administrator.
  const { Admin } = await import("@/entity/Admin");

  if (await Admin.isAdmin(id)) {
    return Response.json(
      { error: "Administrator accounts cannot be deleted." },
      { status: 403 }
    );
  }

  const result = await controller.deleteAccount(id);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}