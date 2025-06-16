'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

function HomePage() {
  const router = useRouter()

  const handleLogin = (role: 'student' | 'teacher' | 'admin') => {
    router.push(`/login?role=${role}`)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-center">University LMS</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">Student</h2>
          <button 
            onClick={() => handleLogin('student')}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Login as Student
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Teacher</h2>
          <button 
            onClick={() => handleLogin('teacher')}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
          >
            Login as Teacher
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">Admin</h2>
          <button 
            onClick={() => handleLogin('admin')}
            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition-colors"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
