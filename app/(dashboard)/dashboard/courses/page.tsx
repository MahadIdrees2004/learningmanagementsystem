"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  department: string;
  instructor: {
    name: string;
    email: string;
  };
  creditHours: number;
  enrolledStudents: string[];
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to enroll");
      toast({
        title: "Success",
        description: "Successfully enrolled in the course.",
      });
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in the course. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32">Loading courses...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        {(session?.user?.role === "admin" || session?.user?.role === "teacher") && (
          <Button asChild>
            <Link href="/dashboard/courses/new">Add Course</Link>
          </Button>
        )}
      </div>
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses available.</p>
          {(session?.user?.role === "admin" || session?.user?.role === "teacher") && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/courses/new">Create Your First Course</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="border rounded-lg p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-sm text-gray-500">Course Code: {course.code}</p>
              <p className="text-sm">{course.description}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Department: {course.department}</p>
                <p>Credit Hours: {course.creditHours}</p>
                <p>Instructor: {course.instructor.name}</p>
                <p>Enrolled Students: {course.enrolledStudents?.length || 0}</p>
              </div>
              {session?.user?.role === "student" && (
                <Button 
                  onClick={() => handleEnroll(course._id)}
                  className="w-full mt-4"
                  variant={course.enrolledStudents?.includes(session.user.id) ? "secondary" : "default"}
                  disabled={course.enrolledStudents?.includes(session.user.id)}
                >
                  {course.enrolledStudents?.includes(session.user.id) ? "Enrolled" : "Enroll"}
                </Button>
              )}
              {(session?.user?.role === "admin" || 
                (session?.user?.role === "teacher" && course.instructor.email === session.user.email)) && (
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/dashboard/courses/${course._id}`}>
                      Edit
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/dashboard/courses/${course._id}/students`}>
                      Students
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
