const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultRules = [
  // Reward Rules
  { name: '按时交作业', icon: '📝', category: 'basic_learning', score: 1, validPeriod: 'daily', limit: 1 },
  { name: '课堂积极发言', icon: '🙋', category: 'basic_learning', score: 1, validPeriod: 'daily', limit: 3 },
  { name: '作业全对', icon: '💯', category: 'basic_learning', score: 2, validPeriod: 'daily', limit: 2 },
  { name: '单元测试满分', icon: '🏆', category: 'learning_progress', score: 5, validPeriod: 'none', limit: null },
  { name: '成绩显著进步', icon: '📈', category: 'learning_progress', score: 3, validPeriod: 'monthly', limit: 3 },
  { name: '坐姿端正', icon: '🪑', category: 'discipline', score: 1, validPeriod: 'daily', limit: 2 },
  { name: '主动打扫卫生', icon: '🧹', category: 'labor_collective', score: 2, validPeriod: 'weekly', limit: 2 },
  { name: '帮助同学', icon: '🤝', category: 'good_deeds', score: 2, validPeriod: 'weekly', limit: 2 },
  
  // Penalty Rules
  { name: '未交作业', icon: '❌', category: 'study_violation', score: -2, validPeriod: 'daily', limit: -2 },
  { name: '上课迟到', icon: '⏰', category: 'discipline_violation', score: -1, validPeriod: 'daily', limit: -1 },
  { name: '上课讲话/做小动作', icon: '🤫', category: 'discipline_violation', score: -1, validPeriod: 'daily', limit: -3 },
  { name: '乱扔垃圾', icon: '🗑️', category: 'collective_morality', score: -2, validPeriod: 'daily', limit: -2 },
  { name: '欺负同学', icon: '⚠️', category: 'collective_morality', score: -5, validPeriod: 'none', limit: null },
];

async function seedDefaultRules() {
  try {
    // Get all classes to seed rules for them
    const classes = await prisma.class.findMany();
    
    if (classes.length === 0) {
      console.log('No classes found. Please create a class first.');
      return;
    }

    for (const classItem of classes) {
      // Check if rules already exist for this class
      const existingRules = await prisma.rule.count({
        where: { classId: classItem.id }
      });

      if (existingRules === 0) {
        console.log(`Seeding default rules for class: ${classItem.name}`);
        
        const rulesToCreate = defaultRules.map(rule => ({
          ...rule,
          classId: classItem.id
        }));

        await prisma.rule.createMany({
          data: rulesToCreate
        });
        
        console.log(`Successfully seeded ${rulesToCreate.length} rules for ${classItem.name}`);
      } else {
        console.log(`Class ${classItem.name} already has ${existingRules} rules. Skipping.`);
      }
    }
  } catch (error) {
    console.error('Error seeding rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateExistingRulesWithEmojis() {
  try {
    for (const rule of defaultRules) {
      // Find rules with the same name that don't have an icon yet
      const result = await prisma.rule.updateMany({
        where: {
          name: rule.name,
          icon: null
        },
        data: {
          icon: rule.icon
        }
      });
      if (result.count > 0) {
        console.log(`Updated ${result.count} rules named "${rule.name}" with icon ${rule.icon}`);
      }
    }
  } catch (error) {
    console.error('Error updating existing rules:', error);
  }
}

async function run() {
  await seedDefaultRules();
  await updateExistingRulesWithEmojis();
}

run();
