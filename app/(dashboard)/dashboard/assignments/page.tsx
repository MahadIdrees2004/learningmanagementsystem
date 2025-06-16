"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    title: string;
    code: string;
  };
  dueDate: string;
  totalMarks: number;
  submissions: Array<{
    student: {
      name: string;
      email: string;
    };
    submissionDate: string;
    marks?: number;
  }>;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments");
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button asChild>
          <Link href="/dashboard/assignments/new">Create Assignment</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div key={assignment._id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Course: {assignment.course.title} ({assignment.course.code})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                <p className="text-sm">Total Marks: {assignment.totalMarks}</p>
              </div>
            </div>
            <p className="mt-2 text-sm">{assignment.description}</p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                asChild
              >
                <Link href={`/dashboard/assignments/${assignment._id}`}>
                  View Details
                </Link>
              </Button>
              {assignment.submissions.length > 0 && (
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/assignments/${assignment._id}/submissions`}>
                    View Submissions ({assignment.submissions.length})
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
