import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let query = {};
    if (session.user.role === "student") {
      query = { enrolledStudents: session.user.id };
    } else if (session.user.role === "teacher") {
      query = { instructor: session.user.id };
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .select("title code description department enrolledStudents")
      .sort({ createdAt: -1 })
      .limit(5);

    // Transform the courses to include the enrolled students count
    const transformedCourses = courses.map(course => ({
      _id: course._id,
      title: course.title,
      code: course.code,
      description: course.description,
      department: course.department,
      instructor: course.instructor,
      enrolledStudents: course.enrolledStudents.length
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("Error fetching recent courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
