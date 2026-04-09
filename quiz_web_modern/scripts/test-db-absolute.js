const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;

console.log('Testing with URL:', url);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url
    }
  }
});

async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log('Connection successful! User count:', userCount);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
