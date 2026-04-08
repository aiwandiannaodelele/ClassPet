const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const seen = new Set();
    const toDelete = [];

    for (const rule of rules) {
      // Create a unique key for each rule based on classId, name, category, and score
      const key = `${rule.classId}-${rule.name}-${rule.category}-${rule.score}`;
      
      if (seen.has(key)) {
        toDelete.push(rule.id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicate rules. Deleting...`);
      const result = await prisma.rule.deleteMany({
        where: { id: { in: toDelete } }
      });
      console.log(`Deleted ${result.count} duplicate rules.`);
    } else {
      console.log('No duplicate rules found.');
    }
  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates();