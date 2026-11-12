import {
  AdminUpdateController,
  AdminDeletionController,
  AdminRetrievalController,
} from "@/controller/AdminController";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { Admin } from "@/entity/Admin";

const updateController = new AdminUpdateController();
const controller = new AdminDeletionController();
const retrievalController = new AdminRetrievalController();



// View one account's profile
export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!(await requireAdmin())) {
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const result = await retrievalController.getAccount(id);

  return Response.json(result, {
    status: result.success ? 200 : 404,
  });
}


export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  // 1. Verify administrator permissions.
  if (!(await requireAdmin())) {
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // 2. Get the target user ID.
  const { id } = await context.params;

  // 3. Validate the request body.
  let body: {
    name?: string;
    email?: string;
    password?: string;
    username?: string | null;
    phoneNumber?: string | null;
    location?: string | null;
    profilePhotoUrl?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name =
    typeof body.name === "string" ? body.name.trim() : undefined;

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;

  const password =
    typeof body.password === "string" ? body.password : undefined;

      // undefined = not provided, null = clear the value
  const readOptional = (value: unknown): string | null | undefined => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === "string") return value.trim() || null;
    return undefined;
  };

  const username = readOptional(body.username);
  const phoneNumber = readOptional(body.phoneNumber);
  const location = readOptional(body.location);
  const profilePhotoUrl = readOptional(body.profilePhotoUrl);

  if (
    [name, email, password, username, phoneNumber, location, profilePhotoUrl].every(
      (value) => value === undefined
    )
  ) {
    return Response.json(
      { success: false, error: "No changes were provided." },
      { status: 400 }
    );
  }

  if (name !== undefined && (!name || name.length > 100)) {
    return Response.json(
      { success: false, error: "Name must be between 1 and 100 characters." },
      { status: 400 }
    );
  }

  if (
    email !== undefined &&
    (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    return Response.json(
      { success: false, error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (password !== undefined && password.length < 8) {
    return Response.json(
      { success: false, error: "Password must contain at least 8 characters." },
      { status: 400 }
    );
  }

    if (username && username.length > 50) {
    return Response.json(
      { success: false, error: "Username must be 50 characters or fewer." },
      { status: 400 }
    );
  }

  if (phoneNumber && phoneNumber.length > 30) {
    return Response.json(
      { success: false, error: "Phone number must be 30 characters or fewer." },
      { status: 400 }
    );
  }

  if (location && location.length > 100) {
    return Response.json(
      { success: false, error: "Location must be 100 characters or fewer." },
      { status: 400 }
    );
  }

  if (profilePhotoUrl && profilePhotoUrl.length > 500) {
    return Response.json(
      { success: false, error: "Profile photo link is too long." },
      { status: 400 }
    );
  }

  // 4. Update the account using the server-side Admin entity.
  try {
    const result = await updateController.updateAccount(id, {
      name,
      email,
      password,
      username,
      phoneNumber,
      location,
      profilePhotoUrl,
    });

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: "Account updated successfully.",
      user: result.user,
    });
  } catch (error) {
    console.error("Admin account update failed:", error);

    return Response.json(
      { success: false, error: "Unable to update account." },
      { status: 500 }
    );
  }
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