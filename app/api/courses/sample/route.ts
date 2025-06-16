import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Get a teacher user
    const teacher = await User.findOne({ role: "teacher" });
    if (!teacher) {
      return NextResponse.json({ error: "No teacher found" }, { status: 404 });
    }

    // Sample courses data
    const sampleCourses = [
      {
        title: "Introduction to Computer Science",
        code: "CS101",
        description: "A foundational course in computer science principles",
        instructor: teacher._id,
        department: "Computer Science",
        creditHours: 3
      },
      {
        title: "Web Development Fundamentals",
        code: "CS201",
        description: "Learn the basics of web development with HTML, CSS, and JavaScript",
        instructor: teacher._id,
        department: "Computer Science",
        creditHours: 3
      },
      {
        title: "Database Management Systems",
        code: "CS301",
        description: "Understanding database design and management",
        instructor: teacher._id,
        department: "Computer Science",
        creditHours: 3
      },
      {
        title: "Software Engineering",
        code: "CS401",
        description: "Learn software development lifecycle and best practices",
        instructor: teacher._id,
        department: "Computer Science",
        creditHours: 4
      },
      {
        title: "Artificial Intelligence",
        code: "CS501",
        description: "Introduction to AI concepts and applications",
        instructor: teacher._id,
        department: "Computer Science",
        creditHours: 4
      }
    ];

    // Create courses if they don't exist
    const results = await Promise.all(
      sampleCourses.map(async (course) => {
        const existingCourse = await Course.findOne({ code: course.code });
        if (!existingCourse) {
          const newCourse = await Course.create(course);
          return {
            status: "created",
            code: course.code,
            title: course.title
          };
        }
        return {
          status: "exists",
          code: course.code,
          title: course.title
        };
      })
    );

    return NextResponse.json({
      message: "Sample courses processed",
      results
    });
  } catch (error) {
    console.error("Error creating sample courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
