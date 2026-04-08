import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "semester"; // week, month, semester

    const now = new Date();
    let startDate = new Date(0); // default to all time (semester)

    if (period === "week") {
      const day = now.getDay() || 7; // Get current day number, converting Sun. to 7
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(now.getDate() - day + 1); // Set to Monday of this week
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        pet: true,
        badges: true,
      },
    });

    // If semester, just use totalScore
    // If week or month, calculate from records
    let studentsWithPeriodScore = await Promise.all(students.map(async (student) => {
      let periodScore = 0;
      
      if (period === "semester") {
        periodScore = student.totalScore;
      } else {
        const records = await prisma.record.findMany({
          where: {
            studentId: student.id,
            scoreChange: { gt: 0 }, // Only positive scores count towards honor roll ranking
            createdAt: {
              gte: startDate
            }
          }
        });
        periodScore = records.reduce((sum, r) => sum + r.scoreChange, 0);
      }

      return {
        ...student,
        periodScore
      };
    }));

    // Sort by periodScore descending
    studentsWithPeriodScore.sort((a, b) => b.periodScore - a.periodScore);

    // Filter out dead pets from ranking (according to spec: "移出班级荣誉榜")
    const aliveStudents = studentsWithPeriodScore.filter(s => !s.pet?.isDead);

    // Add rank
    const rankedStudents = aliveStudents.map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return NextResponse.json(rankedStudents);
  } catch (error) {
    console.error("Error fetching honor roll:", error);
    return NextResponse.json(
      { error: "Failed to fetch honor roll" },
      { status: 500 }
    );
  }
}
