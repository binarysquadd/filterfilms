import { contactService } from "@/app/lib/services/contact-service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const messages = await contactService.getAll();
        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        // Create new contact message
        const newMessage = await contactService.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            eventDate: data.eventDate,
            message: data.message,
        });
        return NextResponse.json({ message: newMessage }, { status: 201 });
    }catch (error) {
        console.error("Error creating contact message:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }    
}