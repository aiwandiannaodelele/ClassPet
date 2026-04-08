import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. 获取所有学生
    const students = await prisma.student.findMany({
      include: {
        records: true,
        exchanges: {
          include: {
            product: true
          }
        }
      }
    });

    const results = [];

    for (const student of students) {
      // 2. 重新计算累计总加分 (只统计正分)
      const totalPositiveScore = student.records
        .filter(r => r.scoreChange > 0)
        .reduce((sum, r) => sum + r.scoreChange, 0);

      // 3. 计算产生的总币数
      const totalCoinsGenerated = Math.floor(totalPositiveScore / 10);

      // 4. 计算已经消耗掉的币数 (通过兑换记录)
      const totalCoinsSpent = student.exchanges
        .reduce((sum, e) => sum + (e.product?.price || 0), 0);

      // 5. 计算当前应有的余额
      const currentCoins = Math.max(0, totalCoinsGenerated - totalCoinsSpent);

      // 6. 更新数据库
      await prisma.student.update({
        where: { id: student.id },
        data: {
          totalScore: totalPositiveScore,
          coins: currentCoins
        }
      });

      results.push({
        name: student.name,
        totalScore: totalPositiveScore,
        coins: currentCoins
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `已完成 ${students.length} 名学生的数据迁移`,
      data: results
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
