import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // 1. Fetch the original class with all its relations
    const originalClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: true,
        rules: true,
        products: true,
        levelConfigs: true,
      },
    });

    if (!originalClass || originalClass.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }

    // 2. Create the new class
    const newClass = await prisma.class.create({
      data: {
        name: `${originalClass.name} (副本)`,
        teacherId: originalClass.teacherId,
        // Copy students
        students: {
          create: originalClass.students.map(student => ({
            name: student.name,
            studentNo: student.studentNo,
            score: student.score,
            level: student.level,
            // We don't copy pets or history by default, as that's usually tied to the specific student instance in that specific class timeline.
            // Wait, the requirement says "连带学生、加分项、历史记录".
            // History (Records) are linked to Student and Rule. Since we are creating new Students and Rules, we need to carefully map them.
            // Doing this in a single nested create might be too complex or impossible because records depend on both new student IDs and new rule IDs.
          }))
        },
        // Copy rules
        rules: {
          create: originalClass.rules.map(rule => ({
            name: rule.name,
            category: rule.category,
            score: rule.score,
            limit: rule.limit,
            validPeriod: rule.validPeriod,
            icon: rule.icon,
          }))
        },
        // Copy products
        products: {
          create: originalClass.products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            icon: product.icon,
            stock: product.stock,
          }))
        },
        // Copy level configs
        levelConfigs: {
          create: originalClass.levelConfigs.map(config => ({
            level: config.level,
            experience: config.experience,
            badge: config.badge,
          }))
        }
      },
      include: {
        students: true,
        rules: true,
      }
    });

    // 3. To copy history (Records and Exchanges), we need to map old IDs to new IDs
    // Since "连带学生、加分项、历史记录" is requested, let's copy records.
    const oldStudents = originalClass.students;
    const newStudents = newClass.students;
    const oldRules = originalClass.rules;
    const newRules = newClass.rules;

    const studentIdMap = new Map();
    oldStudents.forEach(oldStudent => {
      // Find corresponding new student (assuming name and studentNo are unique enough for this mapping, or by index)
      const newStudent = newStudents.find(s => s.name === oldStudent.name && s.studentNo === oldStudent.studentNo);
      if (newStudent) studentIdMap.set(oldStudent.id, newStudent.id);
    });

    const ruleIdMap = new Map();
    oldRules.forEach(oldRule => {
      const newRule = newRules.find(r => r.name === oldRule.name && r.category === oldRule.category);
      if (newRule) ruleIdMap.set(oldRule.id, newRule.id);
    });

    // Fetch old records
    const oldRecords = await prisma.record.findMany({
      where: { student: { classId: classId } }
    });

    if (oldRecords.length > 0) {
      const newRecordsData = oldRecords
        .filter(r => studentIdMap.has(r.studentId) && ruleIdMap.has(r.ruleId))
        .map(r => ({
          studentId: studentIdMap.get(r.studentId),
          ruleId: ruleIdMap.get(r.ruleId),
          scoreChange: r.scoreChange,
          teacherId: r.teacherId,
          createdAt: r.createdAt, // keep original timestamp
        }));
      
      if (newRecordsData.length > 0) {
        await prisma.record.createMany({ data: newRecordsData });
      }
    }

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('[CLASSES_DUPLICATE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
