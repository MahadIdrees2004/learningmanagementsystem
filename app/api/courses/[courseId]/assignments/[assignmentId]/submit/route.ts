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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if student is enrolled in the course
    if (!course.enrolledStudents.includes(session.user.id)) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 401 }
      );
    }

    const assignment = await Assignment.findById(params.assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check if assignment is past due
    if (new Date(assignment.dueDate) < new Date()) {
      return NextResponse.json(
        { error: "Assignment is past due" },
        { status: 400 }
      );
    }

    // Check if student has already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === session.user.id
    );
    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this assignment" },
        { status: 400 }
      );
    }

    const { content, attachments } = await request.json();

    // Add submission
    assignment.submissions.push({
      student: session.user.id,
      content,
      attachments,
      submittedAt: new Date(),
      status: new Date(assignment.dueDate) < new Date() ? 'late' : 'submitted'
    });

    await assignment.save();

    return NextResponse.json({
      message: "Assignment submitted successfully",
      submission: assignment.submissions[assignment.submissions.length - 1]
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
