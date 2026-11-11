import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { IDPViewController } from "@/controller/IDPController";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate the viewer.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthenticated.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const projectId =
      typeof body.projectId === "string"
        ? body.projectId
        : "";

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "Project ID is required.",
        },
        { status: 400 }
      );
    }

    // Retrieve the project's owner.
    const { data: project, error: projectError } = await supabase
      .from("interior_designer_projects")
      .select("id, designer_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError || !project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found.",
        },
        { status: 404 }
      );
    }

    // Do not count views made by the project's own designer.
    if (project.designer_id === user.id) {
      return NextResponse.json({
        success: true,
        recorded: false,
        message: "Designer views are not counted.",
      });
    }

    const controller = new IDPViewController();

    const result = await controller.recordProjectView(
      projectId,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Unable to record project view.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recorded: true,
    });
  } catch (error) {
    console.error("Record project view error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record project view.",
      },
      { status: 500 }
    );
  }
}