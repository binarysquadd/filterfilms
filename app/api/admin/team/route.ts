import { getServerSession } from "@/app/lib/firebase/server-auth";
import { userService } from "@/app/lib/services/user-service.server";
import { NextResponse } from "next/server";

// GET all team members
export async function GET() {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const team = await userService.getTeamMembers();
    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new team member
export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    console.log("Creating team member with data:", data);

    // Check if email already exists
    const existingUser = await userService.getUserByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user with team role
    const newMember = await userService.createUser({
      email: data.email,
      name: data.name,
      image: data.photo,
      role: 'team',
      teamProfile: {
        specialization: data.specialization,
        experience: data.experience,
        bio: data.bio,
        instagram: data.instagram,
        phoneNumber: data.phoneNumber,
        department: data.department,
        joiningDate: data.joiningDate || new Date().toISOString(),
      },
    });

    console.log("Created team member:", newMember);

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}