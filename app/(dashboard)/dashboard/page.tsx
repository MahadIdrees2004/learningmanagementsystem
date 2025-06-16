import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.name}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {session.user?.role === "admin" && (
          <>
            <DashboardCard
              title="Total Users"
              value="Loading..."
              description="Total number of users in the system"
            />
            <DashboardCard
              title="Total Courses"
              value="Loading..."
              description="Total number of courses"
            />
            <DashboardCard
              title="Active Students"
              value="Loading..."
              description="Currently enrolled students"
            />
            <DashboardCard
              title="Active Teachers"
              value="Loading..."
              description="Currently active teachers"
            />
          </>
        )}
        {session.user?.role === "teacher" && (
          <>
            <DashboardCard
              title="My Courses"
              value="Loading..."
              description="Courses you're teaching"
            />
            <DashboardCard
              title="Total Students"
              value="Loading..."
              description="Students in your courses"
            />
            <DashboardCard
              title="Pending Assignments"
              value="Loading..."
              description="Assignments to grade"
            />
          </>
        )}
        {session.user?.role === "student" && (
          <>
            <DashboardCard
              title="Enrolled Courses"
              value="Loading..."
              description="Your current courses"
            />
            <DashboardCard
              title="Upcoming Assignments"
              value="Loading..."
              description="Due assignments"
            />
            <DashboardCard
              title="Course Progress"
              value="Loading..."
              description="Overall progress"
            />
          </>
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
