import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - University LMS",
  description: "Sign in to your University LMS account.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
