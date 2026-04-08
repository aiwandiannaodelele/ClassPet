const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Find rules to delete
    const rulesToDelete = await prisma.rule.findMany({
      where: {
        OR: [
          { category: '惩罚' },
          { name: { startsWith: '[自定义扣分]' } }
        ]
      }
    });

    console.log(`Found ${rulesToDelete.length} rules to delete.`);

    if (rulesToDelete.length > 0) {
      const result = await prisma.rule.deleteMany({
        where: {
          OR: [
            { category: '惩罚' },
            { name: { startsWith: '[自定义扣分]' } }
          ]
        }
      });
      console.log(`Successfully deleted ${result.count} rules.`);
    } else {
      console.log('No matching rules found to delete.');
    }
  } catch (error) {
    console.error('Error cleaning up rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
