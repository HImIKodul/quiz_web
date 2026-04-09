import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  console.log('🌱 Seeding database...')

  // Content Admin
  await prisma.user.upsert({
    where: { identifier: 'admin_content' },
    update: {},
    create: {
      identifier: 'admin_content',
      name: 'Question Master',
      passwordHash: hashedPassword,
      role: 'content_admin',
    },
  })

  // Billing Admin
  await prisma.user.upsert({
    where: { identifier: 'admin_billing' },
    update: {},
    create: {
      identifier: 'admin_billing',
      name: 'Finance Boss',
      passwordHash: hashedPassword,
      role: 'billing_admin',
    },
  })

  console.log('✅ Seeding complete.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
