import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    if (course.enrolledStudents.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Add student to the course
    course.enrolledStudents.push(session.user.id);
    await course.save();    // Get the updated course with populated instructor
    const updatedCourse = await Course.findById(course._id)
      .populate("instructor", "name email")
      .populate("enrolledStudents", "name email");

    return NextResponse.json({
      message: "Successfully enrolled in the course",
      course: {
        _id: updatedCourse._id,
        title: updatedCourse.title,
        code: updatedCourse.code,
        instructor: updatedCourse.instructor,
        enrolledStudents: updatedCourse.enrolledStudents.length
      }
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
