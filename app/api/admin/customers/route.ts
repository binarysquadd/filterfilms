// app/api/admin/customers/route.ts

import { getServerSession } from "@/app/lib/firebase/server-auth";
import { userService } from "@/app/lib/services/user-service.server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();

  // Authentication
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authorization - Only admins can view customers
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
  }

  try {
    // Fetch all users with role 'customer'
    const allUsers = await userService.getAllUsers();
    const customers = allUsers.filter(user => user.role === "customer");
    
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}