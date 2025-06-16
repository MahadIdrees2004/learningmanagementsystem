import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Create test users if they don't exist
    const testUsers = [
      {
        name: "Test Student",
        email: "student@test.com",
        password: "student123",
        role: "student"
      },
      {
        name: "Test Teacher",
        email: "teacher@test.com",
        password: "teacher123",
        role: "teacher"
      },
      {
        name: "Test Admin",
        email: "admin@test.com",
        password: "admin123",
        role: "admin"
      }
    ];

    const results = await Promise.all(
      testUsers.map(async (user) => {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          const newUser = await User.create({
            ...user,
            password: hashedPassword,
          });
          return {
            status: "created",
            email: user.email,
            role: user.role,
          };
        }
        return {
          status: "exists",
          email: user.email,
          role: user.role,
        };
      })
    );

    return NextResponse.json({
      message: "Test users processed",
      results,
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
