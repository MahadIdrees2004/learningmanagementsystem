import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Assignment from "@/models/Assignment";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let assignments;
    if (session.user.role === "admin") {
      assignments = await Assignment.find()
        .populate("course", "title code")
        .populate("submissions.student", "name email");
    } else if (session.user.role === "teacher") {
      assignments = await Assignment.find()
        .populate("course", "title code")
        .populate("submissions.student", "name email");
    } else {
      assignments = await Assignment.find({
        "submissions.student": session.user.id,
      })
        .populate("course", "title code")
        .populate("submissions.student", "name email");
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    const assignment = await Assignment.create(body);
    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
