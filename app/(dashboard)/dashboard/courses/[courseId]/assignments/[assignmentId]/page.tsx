'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  totalPoints: number;
  createdBy: string;
  submissions: Array<{
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
    };
    submittedAt: string;
    content: string;
    attachments: Array<{
      name: string;
      url: string;
      type: string;
    }>;
    grade?: number;
    feedback?: string;
    status: 'submitted' | 'graded' | 'late';
  }>;
}

export default function AssignmentPage({ params }: { params: { courseId: string; assignmentId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [params.assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch(
        `/api/courses/${params.courseId}/assignments/${params.assignmentId}`
      );
      if (!response.ok) throw new Error('Failed to fetch assignment');
      const data = await response.json();
      setAssignment(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assignment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `/api/courses/${params.courseId}/assignments/${params.assignmentId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: formData.get('content'),
            attachments: [] // TODO: Implement file upload
          })
        }
      );

      if (!response.ok) throw new Error('Failed to submit assignment');

      toast({
        title: "Success",
        description: "Assignment submitted successfully"
      });
      fetchAssignment();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `/api/courses/${params.courseId}/assignments/${params.assignmentId}/grade`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId,
            grade: formData.get('grade'),
            feedback: formData.get('feedback')
          })
        }
      );

      if (!response.ok) throw new Error('Failed to grade submission');

      toast({
        title: "Success",
        description: "Submission graded successfully"
      });
      fetchAssignment();
      setGrading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!assignment) {
    return <div className="p-6">Assignment not found</div>;
  }

  const isInstructor = session?.user.id === assignment.createdBy;
  const userSubmission = assignment.submissions.find(
    sub => sub.student._id === session?.user.id
  );
  const isSubmitted = Boolean(userSubmission);
  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
          <span>•</span>
          <span>{assignment.totalPoints} points</span>
        </div>
        <div className="prose max-w-none mt-4">
          {assignment.description}
        </div>
      </div>

      {isInstructor ? (
        // Instructor View - Submissions List
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Submissions ({assignment.submissions.length})
          </h2>
          <div className="grid gap-4">
            {assignment.submissions.map((submission) => (
              <div key={submission._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{submission.student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      {submission.status === 'late' && (
                        <span className="text-red-500 ml-2">(Late)</span>
                      )}
                    </p>
                  </div>
                  {submission.status === 'graded' ? (
                    <div className="text-right">
                      <div className="font-medium">
                        {submission.grade} / {assignment.totalPoints}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGrading(submission._id)}
                      >
                        Update Grade
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setGrading(submission._id)}
                    >
                      Grade
                    </Button>
                  )}
                </div>

                <div className="prose max-w-none text-sm">
                  {submission.content}
                </div>

                {submission.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Attachments:</h4>
                    <div className="flex gap-2">
                      {submission.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {grading === submission._id && (
                  <form
                    onSubmit={(e) => handleGrade(submission._id, e)}
                    className="mt-4 space-y-4 border-t pt-4"
                  >
                    <div>
                      <Label htmlFor="grade">Grade (out of {assignment.totalPoints})</Label>
                      <Input
                        id="grade"
                        name="grade"
                        type="number"
                        min="0"
                        max={assignment.totalPoints}
                        defaultValue={submission.grade}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="feedback">Feedback</Label>
                      <textarea
                        id="feedback"
                        name="feedback"
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        defaultValue={submission.feedback}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Grade</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGrading(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {submission.status === 'graded' && !grading && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Feedback:</h4>
                    <p className="text-sm">{submission.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Student View - Submit Assignment
        <div className="space-y-4">
          {isSubmitted ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">Your Submission</h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(userSubmission.submittedAt).toLocaleString()}
                    {userSubmission.status === 'late' && (
                      <span className="text-red-500 ml-2">(Late)</span>
                    )}
                  </p>
                </div>
                {userSubmission.status === 'graded' && (
                  <div className="text-right">
                    <div className="font-medium">
                      {userSubmission.grade} / {assignment.totalPoints}
                    </div>
                  </div>
                )}
              </div>

              <div className="prose max-w-none text-sm">
                {userSubmission.content}
              </div>

              {userSubmission.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Your Attachments:</h4>
                  <div className="flex gap-2">
                    {userSubmission.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {userSubmission.status === 'graded' && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Instructor Feedback:</h4>
                  <p className="text-sm">{userSubmission.feedback}</p>
                </div>
              )}
            </div>
          ) : isPastDue ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              This assignment is past due and can no longer be submitted.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="content">Your Answer</Label>
                <textarea
                  id="content"
                  name="content"
                  className="w-full p-2 border rounded-md min-h-[200px]"
                  placeholder="Enter your answer here..."
                  required
                />
              </div>
              {/* TODO: Add file upload capability */}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
