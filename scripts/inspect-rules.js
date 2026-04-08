const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectRules() {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    // Group rules by classId and name to find duplicates within the SAME class
    const duplicateCheck = {};
    for (const rule of rules) {
      const key = `${rule.classId}-${rule.name}`;
      if (!duplicateCheck[key]) {
        duplicateCheck[key] = [];
      }
      duplicateCheck[key].push(rule);
    }

    const toDelete = [];

    console.log('\nDuplicates within the SAME class:');
    for (const key in duplicateCheck) {
      if (duplicateCheck[key].length > 1) {
        console.log(`\nClass-Name Key: ${key}`);
        console.table(duplicateCheck[key].map(r => ({id: r.id, name: r.name, score: r.score, icon: r.icon})));
        
        // Keep the first one, delete the rest
        for (let i = 1; i < duplicateCheck[key].length; i++) {
          toDelete.push(duplicateCheck[key][i].id);
        }
      }
    }

    if (toDelete.length > 0) {
      console.log(`\nFound ${toDelete.length} actual duplicate rules within the same class. Deleting...`);
      const result = await prisma.rule.deleteMany({
        where: { id: { in: toDelete } }
      });
      console.log(`Deleted ${result.count} duplicate rules.`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectRules();
