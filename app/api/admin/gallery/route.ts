
import { getServerSession } from "@/app/lib/firebase/server-auth";
import { galleryService } from "@/app/lib/services/gallery-service";
import { NextResponse } from "next/server";

// GET all galleries
export async function GET() {
    const session = await getServerSession();
    const allowedRoles = ["admin", "customer", "team"];
    if (!session || !allowedRoles.includes(session.role)) {
        return NextResponse.json({ error: `Unauthorized not having required role${session ? `: ${session.role}` : ''}` }, { status: 401 });
    }
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

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const data = await req.json();
        // Create new gallery
        const newGallery = await galleryService.createGallery({
            type: data.type,
            url: data.url,
            thumbnail: data.thumbnail,
            title: data.title,
            category: data.category,
            eventType: data.eventType,
        });
        return NextResponse.json({ gallery: newGallery }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating gallery:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}