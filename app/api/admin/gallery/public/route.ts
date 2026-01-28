import { galleryService } from "@/app/lib/services/gallery-service";
import { NextResponse } from "next/server";

// GET all galleries - PUBLIC ACCESS
export async function GET() {
    try {
        const galleries = await galleryService.getAllGalleries();
        return NextResponse.json({ galleries });
    } catch (error) {
        console.error("Error fetching galleries:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}