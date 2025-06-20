'use client'

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthForm } from "@/components/auth/user-auth-form"

export default function AuthenticationPage() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'student'
  const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            University LMS
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This LMS has transformed how we deliver education, making learning more accessible and engaging for our students.&rdquo;
              </p>
              <footer className="text-sm">Prof. Smith - Dean of Digital Learning</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in as {roleCapitalized}
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials below to sign in
              </p>
            </div>
            <UserAuthForm role={role} />
            <p className="px-8 text-center text-sm text-muted-foreground">
              Not a {roleCapitalized}?{" "}
              <Link href="/" className="underline underline-offset-4 hover:text-primary">
                Go back
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
