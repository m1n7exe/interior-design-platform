import { AdminController } from "@/controller/AdminController";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";

const controller = new AdminController();

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