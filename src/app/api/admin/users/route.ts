import { AdminController } from "@/controller/AdminController";
import { requireAdmin } from "@/lib/auth/requireAdmin";


const controller = new AdminController();

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const result = await controller.getAccounts();

  return Response.json(result);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await request.json();

  if (
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.email !== "string" ||
    !body.email.trim() ||
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    !["CUSTOMER", "INTERIOR_DESIGNER"].includes(body.role)
  ) {
    return Response.json(
      { error: "Invalid account details" },
      { status: 400 }
    );
  }

  const result = await controller.createAccount(
    body.name,
    body.email,
    body.password,
    body.role
  );

  return Response.json(
    result,
    { status: result.success ? 201 : 400 }
  );
}