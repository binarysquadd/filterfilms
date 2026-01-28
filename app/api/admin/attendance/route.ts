import { getServerSession } from "@/app/lib/firebase/server-auth";
import { attendenceService } from "@/app/lib/services/attendance-service";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await getServerSession();
    if (!session || (session.role !== "admin" && session.role !== "team")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const attendance = await attendenceService.getAllAttendance();
        return NextResponse.json({ attendance });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session || session.role !== "team") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const data = await req.json();
        // Validate required fields
        if (!data.memberId || !data.date || !data.status) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        const newAttendance = await attendenceService.createAttendance({
            memberId: data.memberId,
            memberName: data.memberName,
            date: data.date,
            status: data.status,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            notes: data.notes,
        });
        console.log("Created new attendance record:", newAttendance);
        return NextResponse.json({ attendance: newAttendance }, { status: 201 });
    } catch (error) {
        console.error("Error creating attendance record:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}