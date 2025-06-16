'use client';

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="flex items-center space-x-4">
      <div className="flex items-center space-x-4">
        {user?.role === "admin" && (
          <>
            <Link href="/dashboard/users">Users</Link>
            <Link href="/dashboard/departments">Departments</Link>
          </>
        )}
        {user?.role === "teacher" && (
          <>
            <Link href="/dashboard/courses">My Courses</Link>
            <Link href="/dashboard/assignments">Assignments</Link>
          </>
        )}
        {user?.role === "student" && (
          <>
            <Link href="/dashboard/my-courses">My Courses</Link>
            <Link href="/dashboard/assignments">My Assignments</Link>
          </>
        )}
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </div>
      <Button
        variant="ghost"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign Out
      </Button>
    </nav>
  );
}
