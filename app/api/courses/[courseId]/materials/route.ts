import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Only allow instructor or admin to add materials
    if (
      session.user.role !== "admin" &&
      course.instructor.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const materialData = await request.json();
    
    // Add the new material to the course
    course.materials.push({
      ...materialData,
      uploadedAt: new Date(),
    });

    await course.save();

    return NextResponse.json({
      message: "Material added successfully",
      material: course.materials[course.materials.length - 1],
    });
  } catch (error) {
    console.error("Error adding material:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string, materialId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Only allow instructor or admin to delete materials
    if (
      session.user.role !== "admin" &&
      course.instructor.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove the material
    course.materials = course.materials.filter(
      (m: any) => m._id.toString() !== params.materialId
    );

    await course.save();

    return NextResponse.json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
