import { NextResponse } from "next/server";
import { IDPRetrievalController } from "@/controller/IDPController";

const controller = new IDPRetrievalController();

export async function GET() {
  try {
    const result = await controller.getMarketplaceProjects();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Marketplace retrieval error:", error);

    return NextResponse.json(
      {
        success: false,
        projects: [],
        error: "Failed to retrieve marketplace projects",
      },
      { status: 500 }
    );
  }
}