import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Assignment from "@/models/Assignment";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const assignments = await Assignment.find({ course: params.courseId })
      .populate("submissions.student", "name email")
      .sort({ dueDate: 1 });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Only allow instructor or admin to add assignments
    if (
      session.user.role !== "admin" &&
      course.instructor.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentData = await request.json();
    const assignment = await Assignment.create({
      ...assignmentData,
      course: params.courseId,
      createdBy: session.user.id,
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
