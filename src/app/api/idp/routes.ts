import { NextRequest, NextResponse } from "next/server";
import { CustomerFavouritesController } from "@/controller/CustomerFavouritesController";

const controller = new CustomerFavouritesController();

function getStatus(error: string | null) {
  if (error === "Unauthenticated") return 401;
  if (error === "Customer profile not found") return 403;

  return 500;
}

// GET: Retrieve favourite project IDs.
export async function GET() {
  try {
    const result = await controller.getFavourites();

    return NextResponse.json(result, {
      status: result.success ? 200 : getStatus(result.error),
    });
  } catch (error) {
    console.error("Get favourites error:", error);

    return NextResponse.json(
      {
        success: false,
        favourites: [],
        error: "Failed to retrieve favourites",
      },
      { status: 500 }
    );
  }
}

// POST: Add a favourite.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await controller.addFavourite(body.projectId);

    return NextResponse.json(result, {
      status: result.success ? 200 : getStatus(result.error),
    });
  } catch (error) {
    console.error("Add favourite error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add favourite",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a favourite.
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await controller.removeFavourite(body.projectId);

    return NextResponse.json(result, {
      status: result.success ? 200 : getStatus(result.error),
    });
  } catch (error) {
    console.error("Remove favourite error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove favourite",
      },
      { status: 500 }
    );
  }
}
