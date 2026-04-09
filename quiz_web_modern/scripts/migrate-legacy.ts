/**
 * Legacy Data Migration Script
 * This script migrates data from the old quiz_database.db to the new Prisma database.
 */

import { PrismaClient } from '@prisma/client';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting legacy data migration...');

  const dbPath = path.join(__dirname, '../quiz_database.db');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Old database not found at:', dbPath);
    return;
  }

  const filebuffer = fs.readFileSync(dbPath);
  const SQL = await initSqlJs();
  const db = new SQL.Database(filebuffer);

  // 1. Migrate Questions
  console.log('📦 Migrating Questions...');
  const questions = db.exec("SELECT * FROM question")[0]?.values || [];
  for (const q of questions) {
    await prisma.question.create({
      data: {
        id: q[0] as number,
        qType: q[1] as string,
        questionText: q[2] as string,
        optionA: q[3] as string,
        optionB: q[4] as string,
        optionC: q[5] as string,
        optionD: q[6] as string,
        optionE: q[7] as string,
        optionF: q[8] as string,
        correctAnswer: q[9] as string,
        imageFilename: q[10] as string,
        topic: q[11] as string,
        createdBy: q[12] as string,
      }
    }).catch(e => console.warn(`   ⚠️ Question ${q[0]} skip (maybe exists)`));
  }
  console.log(`✅ Migrated ${questions.length} questions.`);

  // 2. Migrate Users
  console.log('👤 Migrating Users...');
  const users = db.exec("SELECT * FROM user")[0]?.values || [];
  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u[0] as number,
        identifier: u[1] as string,
        name: u[2] as string,
        passwordHash: u[3] as string,
        role: u[4] as string,
        plan: u[5] as string,
        maxDevices: u[7] as number,
      }
    }).catch(e => console.warn(`   ⚠️ User ${u[1]} skip (maybe exists)`));
  }
  console.log(`✅ Migrated ${users.length} users.`);

  console.log('✨ Migration complete!');
  await prisma.$disconnect();
}

migrate();
