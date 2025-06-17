'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  department: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  creditHours: number;
  enrolledStudents: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  materials: Array<{
    _id: string;
    title: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  submissions: Array<{
    studentId: string;
    submittedAt: string;
    status: string;
    grade?: number;
  }>;
}

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchAssignments();
  }, [params.courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}/assignments`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      });
    }
  };

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`/api/courses/${params.courseId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          type: formData.get('type'),
          url: formData.get('url')
        })
      });

      if (!response.ok) throw new Error('Failed to add material');

      toast({
        title: "Success",
        description: "Material added successfully"
      });
      setShowAddMaterial(false);
      fetchCourseDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive"
      });
    }
  };

  const handleAddAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`/api/courses/${params.courseId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          dueDate: formData.get('dueDate'),
          totalPoints: formData.get('totalPoints')
        })
      });

      if (!response.ok) throw new Error('Failed to add assignment');

      toast({
        title: "Success",
        description: "Assignment added successfully"
      });
      setShowAddAssignment(false);
      fetchAssignments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add assignment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!course) {
    return <div className="p-6">Course not found</div>;
  }

  const isInstructor = session?.user.id === course.instructor._id || session?.user.role === 'admin';
  const isEnrolled = course.enrolledStudents.some(student => student._id === session?.user.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.code} • {course.department}</p>
          <p className="mt-2">Instructor: {course.instructor.name}</p>
        </div>
        {isInstructor && (
          <div className="space-x-2">
            <Button onClick={() => setShowAddMaterial(true)}>Add Material</Button>
            <Button onClick={() => setShowAddAssignment(true)}>Add Assignment</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Materials */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Course Materials</h2>
          {showAddMaterial && (
            <div className="border rounded-lg p-4">
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select 
                    id="type" 
                    name="type" 
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input id="url" name="url" type="url" required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Material</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddMaterial(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
          {course.materials && course.materials.length > 0 ? (
            <div className="space-y-2">
              {course.materials.map((material) => (
                <div 
                  key={material._id} 
                  className="p-4 border rounded-lg hover:bg-muted"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{material.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {material.type} • Added {new Date(material.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No materials available</p>
          )}
        </div>

        {/* Assignments */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Assignments</h2>
          {showAddAssignment && (
            <div className="border rounded-lg p-4">
              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    name="dueDate" 
                    type="datetime-local" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="totalPoints">Total Points</Label>
                  <Input 
                    id="totalPoints" 
                    name="totalPoints" 
                    type="number" 
                    min="0" 
                    required 
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Assignment</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddAssignment(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
          {assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div 
                  key={assignment._id} 
                  className="p-4 border rounded-lg hover:bg-muted"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.dueDate).toLocaleString()} • 
                        {assignment.totalPoints} points
                      </p>
                      <p className="mt-2">{assignment.description}</p>
                    </div>
                    <Button 
                      onClick={() => router.push(`/dashboard/courses/${params.courseId}/assignments/${assignment._id}`)}
                    >
                      {isInstructor ? 'View Submissions' : 'Submit'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No assignments available</p>
          )}
        </div>

        {/* Enrolled Students */}
        {isInstructor && (
          <div className="col-span-full space-y-4">
            <h2 className="text-xl font-semibold">Enrolled Students ({course.enrolledStudents.length})</h2>
            <div className="grid gap-4">
              {course.enrolledStudents.map((student) => (
                <div 
                  key={student._id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/courses/${params.courseId}/students/${student._id}`)}
                  >
                    View Progress
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
