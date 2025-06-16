'use client'

import { User } from 'next-auth'
import DashboardNav from "@/components/dashboard/nav"

export function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex gap-6 md:gap-10">
          <h2 className="text-lg font-semibold">University LMS</h2>
        </div>
        <DashboardNav user={user} />
      </div>
    </header>
  )
}
