import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Assignment from "@/models/Assignment";

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; assignmentId: string } }
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

    // Only allow instructor or admin to grade
    if (
      session.user.role !== "admin" &&
      course.instructor.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignment = await Assignment.findById(params.assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const { submissionId, grade, feedback } = await request.json();

    // Find and update the submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Update submission
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';

    await assignment.save();

    return NextResponse.json({
      message: "Submission graded successfully",
      submission
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
