import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Assignment from "@/models/Assignment";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const stats: any = {};

    if (session.user.role === "student") {
      // Get student's courses
      const courses = await Course.find({
        enrolledStudents: session.user.id,
      });
      stats.totalCourses = courses.length;

      // Get student's assignments
      const assignments = await Assignment.find({
        course: { $in: courses.map(c => c._id) },
      });

      const now = new Date();
      stats.totalAssignments = assignments.length;
      stats.upcomingAssignments = assignments.filter(
        a => new Date(a.dueDate) > now
      ).length;

      // Get student's submissions and grades
      const submissions = assignments.flatMap(a => 
        a.submissions.filter(s => s.student.toString() === session.user.id)
      );
      stats.completedAssignments = submissions.length;

      // Calculate average grade
      const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
      if (gradedSubmissions.length > 0) {
        stats.averageGrade = (
          gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / 
          gradedSubmissions.length
        );
      }
    }
    else if (session.user.role === "teacher") {
      // Get teacher's courses
      const courses = await Course.find({
        instructor: session.user.id,
      });
      stats.totalCourses = courses.length;

      // Get total students enrolled
      const uniqueStudents = new Set(
        courses.flatMap(c => c.enrolledStudents.map(s => s.toString()))
      );
      stats.totalStudents = uniqueStudents.size;

      // Get assignment stats
      const assignments = await Assignment.find({
        course: { $in: courses.map(c => c._id) },
      });
      stats.totalAssignments = assignments.length;

      // Count pending submissions needing grading
      stats.pendingGrading = assignments.reduce((count, a) => 
        count + a.submissions.filter(s => !s.grade).length, 
        0
      );
    }
    else if (session.user.role === "admin") {
      // Get system-wide stats
      const [courses, students, assignments] = await Promise.all([
        Course.countDocuments(),
        User.countDocuments({ role: "student" }),
        Assignment.countDocuments(),
      ]);

      stats.totalCourses = courses;
      stats.totalStudents = students;
      stats.totalAssignments = assignments;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
