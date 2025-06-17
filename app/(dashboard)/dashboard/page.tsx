'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

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
  enrolledStudents: number;
}

interface Assignment {
  _id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: string;
}

interface DashboardStats {
  totalCourses: number;
  totalAssignments: number;
  totalStudents?: number;
  pendingGrading?: number;
  upcomingAssignments?: number;
  completedAssignments?: number;
  averageGrade?: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent courses
      const coursesResponse = await fetch('/api/dashboard/recent-courses');
      const coursesData = await coursesResponse.json();
      setRecentCourses(coursesData);

      // Fetch pending assignments or submissions
      const assignmentsResponse = await fetch('/api/dashboard/pending-assignments');
      const assignmentsData = await assignmentsResponse.json();
      setPendingAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name}</h1>
          <p className="text-muted-foreground">
            {session?.user?.role === 'student' && 'Here\'s your learning progress'}
            {session?.user?.role === 'teacher' && 'Manage your courses and assignments'}
            {session?.user?.role === 'admin' && 'System overview and management'}
          </p>
        </div>
        {session?.user?.role === 'teacher' && (
          <Button asChild>
            <Link href="/dashboard/courses/new">Create New Course</Link>
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Total Courses</h3>
          <p className="text-2xl font-bold">{stats?.totalCourses}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">
            {session?.user?.role === 'student' ? 'Upcoming Assignments' : 'Total Assignments'}
          </h3>
          <p className="text-2xl font-bold">
            {session?.user?.role === 'student' 
              ? stats?.upcomingAssignments 
              : stats?.totalAssignments}
          </p>
        </div>
        {session?.user?.role === 'student' && (
          <>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground">Completed Assignments</h3>
              <p className="text-2xl font-bold">{stats?.completedAssignments}</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground">Average Grade</h3>
              <p className="text-2xl font-bold">{stats?.averageGrade?.toFixed(1)}%</p>
            </div>
          </>
        )}
        {session?.user?.role === 'teacher' && (
          <>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground">Total Students</h3>
              <p className="text-2xl font-bold">{stats?.totalStudents}</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Grading</h3>
              <p className="text-2xl font-bold">{stats?.pendingGrading}</p>
            </div>
          </>
        )}
        {session?.user?.role === 'admin' && (
          <>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground">Total Students</h3>
              <p className="text-2xl font-bold">{stats?.totalStudents}</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
              <p className="text-2xl font-bold">{stats?.totalStudents + recentCourses.length}</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {session?.user?.role === 'student' ? 'Your Courses' : 'Recent Courses'}
            </h2>
            <Button variant="link" asChild>
              <Link href="/dashboard/courses">View All</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentCourses.map((course) => (
              <Link 
                key={course._id} 
                href={`/dashboard/courses/${course._id}`}
                className="block p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.code} • {course.department}
                    </p>
                  </div>
                  {session?.user?.role === 'teacher' && (
                    <p className="text-sm text-muted-foreground">
                      {course.enrolledStudents} students
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {session?.user?.role === 'student' 
                ? 'Upcoming Assignments' 
                : session?.user?.role === 'teacher'
                ? 'Pending Grading'
                : 'Recent Activity'}
            </h2>
          </div>
          <div className="space-y-2">
            {pendingAssignments.map((assignment) => (
              <Link
                key={assignment._id}
                href={`/dashboard/courses/${assignment.courseId}/assignments/${assignment._id}`}
                className="block p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignment.courseName} • Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    assignment.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : assignment.status === 'late'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
