import { AdminStatusController } from "@/controller/AdminController";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { Admin } from "@/entity/Admin";

const statusController = new AdminStatusController();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  if (body.status !== "ACTIVE" && body.status !== "SUSPENDED") {
    return Response.json({ success: false, error: "Invalid status." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.id === id) {
    return Response.json(
      { success: false, error: "You cannot suspend your own account." },
      { status: 400 }
    );
  }

  if (await Admin.isAdmin(id)) {
    return Response.json(
      { success: false, error: "Administrator accounts cannot be suspended." },
      { status: 403 }
    );
  }

  const result = await statusController.setStatus(id, body.status);

  return Response.json(result, { status: result.success ? 200 : 400 });
}