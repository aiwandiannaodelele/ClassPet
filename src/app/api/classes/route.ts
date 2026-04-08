import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await prisma.class.findMany({
      where: {
        teacherId: session.user.id
      },
      include: {
        students: {
          include: {
            pet: true,
          },
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        teacherId: session.user.id,
        rules: {
          create: [
            // 正向加分规则
            { name: "课堂举手发言、被老师当堂表扬", category: "基础学习", score: 1, icon: "🙋" },
            { name: "作业按时完成、无拖欠", category: "基础学习", score: 2, icon: "📝" },
            { name: "作业优秀/全对", category: "基础学习", score: 3, icon: "💯" },
            { name: "背诵/默写一次性过关", category: "基础学习", score: 2, icon: "📖" },
            
            { name: "测验/考试进步5名及以上", category: "学习进步", score: 3, icon: "📈" },
            { name: "班级前10名、单科满分", category: "学习进步", score: 5, icon: "🏆" },
            { name: "学科竞赛、校级获奖", category: "学习进步", score: 5, icon: "🏅" },
            { name: "主动帮同学讲题", category: "学习进步", score: 2, icon: "🤝" },

            { name: "早读/自习安静守纪", category: "纪律习惯", score: 1, icon: "🤫" },
            { name: "眼操、课间操规范完成", category: "纪律习惯", score: 1, icon: "👀" },
            { name: "整周无违纪、无迟到早退", category: "纪律习惯", score: 5, icon: "🌟" },

            { name: "当日值日合格、班级卫生无扣分", category: "劳动集体", score: 2, icon: "🧹" },
            { name: "主动承担班级额外劳动", category: "劳动集体", score: 2, icon: "💪" },
            { name: "参与黑板报、班级布置", category: "劳动集体", score: 3, icon: "🎨" },
            { name: "代表班级参加集体活动", category: "劳动集体", score: 3, icon: "🚩" },

            { name: "拾金不昧、助人获表扬", category: "好人好事", score: 3, icon: "❤️" },
            { name: "班级/校级优秀表彰", category: "好人好事", score: 5, icon: "🎖️" },
            { name: "班级获集体荣誉", category: "好人好事", score: 5, icon: "🏆" },

            // 负向扣分规则
            { name: "作业迟交/未完成/敷衍", category: "学习违纪", score: -2, icon: "⚠️" },
            { name: "作业抄袭、考试作弊", category: "学习违纪", score: -5, icon: "❌" },
            { name: "课堂走神/打闹被点名", category: "学习违纪", score: -2, icon: "🗣️" },
            { name: "多次背诵/默写不过关", category: "学习违纪", score: -2, icon: "📉" },

            { name: "迟到、早退", category: "纪律违纪", score: -2, icon: "⏰" },
            { name: "旷课（每节）", category: "纪律违纪", score: -5, icon: "🚫" },
            { name: "早读/自习说话扰乱秩序", category: "纪律违纪", score: -2, icon: "🔊" },
            { name: "课间追逐、违反安全规定", category: "纪律违纪", score: -3, icon: "🏃" },
            { name: "一周累计3次违纪", category: "纪律违纪", score: -3, icon: "❗" },

            { name: "值日偷懒致班级扣分", category: "集体公德", score: -2, icon: "🗑️" },
            { name: "损坏公物", category: "集体公德", score: -3, icon: "💥" },
            { name: "损害集体荣誉", category: "集体公德", score: -5, icon: "💔" },
          ]
        }
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
