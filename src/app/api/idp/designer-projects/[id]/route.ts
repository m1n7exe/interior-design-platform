import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  IDPUpdateController,
  IDPDeletionController,
} from "@/controller/IDPController";

async function getAuthenticatedDesigner() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      status: 401,
      error: "Unauthenticated",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.role?.toUpperCase() !== "INTERIOR_DESIGNER"
  ) {
    return {
      supabase,
      user: null,
      status: 403,
      error: "Unauthorised",
    };
  }

  return {
    supabase,
    user,
    status: 200,
    error: null,
  };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH: Update an existing project belonging to the authenticated designer.
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await getAuthenticatedDesigner();

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const categoryId =
      typeof body.categoryId === "string" ? body.categoryId : "";

    const budget =
      body.budget === null || body.budget === ""
        ? null
        : Number(body.budget);

    const coverImage =
      typeof body.coverImage === "string"
        ? body.coverImage.trim() || null
        : null;

    const images = Array.isArray(body.images) ? body.images : [];
    const status =
      body.status === undefined ? undefined : body.status;

    if (
      status !== undefined &&
      status !== "DRAFT" &&
      status !== "PUBLISHED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Project status must be DRAFT or PUBLISHED.",
        },
        { status: 400 }
      );
    }
    if (!title || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Project title and category are required.",
        },
        { status: 400 }
      );
    }

    if (
      budget !== null &&
      (!Number.isFinite(budget) || budget < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    if (!images.every((image: unknown) => typeof image === "string")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project images.",
        },
        { status: 400 }
      );
    }

    const { data: category, error: categoryError } = await auth.supabase
      .from("idp_categories")
      .select("id, name")
      .eq("id", categoryId)
      .maybeSingle();

    if (categoryError || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select a valid project category.",
        },
        { status: 400 }
      );
    }

    const controller = new IDPUpdateController();

    const result = await controller.updateProject(
      id,
      auth.user.id,
      title,
      description,
      category.id,
      category.name,
      budget,
      coverImage,
      images,
      status
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Update designer project error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update project.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete an existing project belonging to the authenticated designer.
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await getAuthenticatedDesigner();

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await context.params;

    const controller = new IDPDeletionController();

    const result = await controller.deleteProject(
      id,
      auth.user.id
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    console.error("Delete designer project error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete project.",
      },
      { status: 500 }
    );
  }
}