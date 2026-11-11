import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  IDPCreationController,
  IDPRetrievalController,
} from "@/controller/IDPController";

// Authenticate the user and verify their designer role.
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

// GET: Retrieve the authenticated designer's projects and available categories.
export async function GET() {
  try {
    const auth = await getAuthenticatedDesigner();

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const controller = new IDPRetrievalController();

    const [projectResult, categoryResult] = await Promise.all([
      controller.getDesignerProjects(auth.user.id),

      auth.supabase
        .from("idp_categories")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

    if (!projectResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: projectResult.error,
        },
        { status: 500 }
      );
    }

    if (categoryResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: categoryResult.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: projectResult.projects,
      categories: categoryResult.data ?? [],
    });
  } catch (error) {
    console.error("Retrieve designer projects error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve designer projects.",
      },
      { status: 500 }
    );
  }
}

// POST: Create a project for the authenticated designer.
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedDesigner();

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

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

    // Retrieve the actual category name from the database.
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

    const controller = new IDPCreationController();

    const result = await controller.createProject(
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
      status: result.success ? 201 : 500,
    });
  } catch (error) {
    console.error("Create designer project error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create project.",
      },
      { status: 500 }
    );
  }
}