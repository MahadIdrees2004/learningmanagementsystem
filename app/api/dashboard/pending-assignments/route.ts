import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Assignment from "@/models/Assignment";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    let assignments = [];

    if (session.user.role === "student") {
      // Get student's enrolled courses
      const courses = await Course.find({ 
        enrolledStudents: session.user.id 
      });

      // Get upcoming assignments for these courses
      const courseAssignments = await Assignment.find({
        course: { $in: courses.map(c => c._id) },
        dueDate: { $gte: now }
      })
      .populate("course", "title")
      .sort({ dueDate: 1 })
      .limit(5);

      assignments = courseAssignments.map(a => ({
        _id: a._id,
        title: a.title,
        courseId: a.course._id,
        courseName: a.course.title,
        dueDate: a.dueDate,
        status: a.submissions.some(s => s.student.toString() === session.user.id)
          ? 'submitted'
          : new Date(a.dueDate) < now
          ? 'late'
          : 'pending'
      }));
    } 
    else if (session.user.role === "teacher") {
      // Get teacher's courses
      const courses = await Course.find({ 
        instructor: session.user.id 
      });

      // Get assignments with pending submissions
      const courseAssignments = await Assignment.find({
        course: { $in: courses.map(c => c._id) }
      })
      .populate("course", "title")
      .sort({ dueDate: -1 });

      // Filter assignments with ungraded submissions
      assignments = courseAssignments
        .filter(a => a.submissions.some(s => !s.grade))
        .map(a => ({
          _id: a._id,
          title: a.title,
          courseId: a.course._id,
          courseName: a.course.title,
          dueDate: a.dueDate,
          status: 'needs grading'
        }))
        .slice(0, 5);
    }
    else if (session.user.role === "admin") {
      // Get recent assignments across all courses
      const recentAssignments = await Assignment.find()
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(5);

      assignments = recentAssignments.map(a => ({
        _id: a._id,
        title: a.title,
        courseId: a.course._id,
        courseName: a.course.title,
        dueDate: a.dueDate,
        status: 'active'
      }));
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching pending assignments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
