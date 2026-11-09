import { NextRequest, NextResponse } from "next/server";

import { CustomerFavouritesController } from "@/controller/CustomerFavouritesController";

const controller = new CustomerFavouritesController();

// GET: Retrieve customer favourites
export async function GET() {
  try {
    const result = await controller.getFavourites();

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          favourites: [],
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      favourites: result.favourites ?? [],
      error: null,
    });
  } catch (error) {
    console.error("GET favourites error:", error);

    return NextResponse.json(
      {
        success: false,
        favourites: [],
        error: "Unable to retrieve favourites.",
      },
      { status: 500 }
    );
  }
}

// POST: Add a favourite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project ID.",
        },
        { status: 400 }
      );
    }

    const result = await controller.addFavourite(projectId);

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      error: null,
    });
  } catch (error) {
    console.error("POST favourites error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to add favourite.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a favourite
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project ID.",
        },
        { status: 400 }
      );
    }

    const result = await controller.removeFavourite(projectId);

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      error: null,
    });
  } catch (error) {
    console.error("DELETE favourites error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to remove favourite.",
      },
      { status: 500 }
    );
  }
}