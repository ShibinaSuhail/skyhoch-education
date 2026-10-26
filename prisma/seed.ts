import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Password@123', 10)

  const people = [
    { name: 'Super Admin', email: 'admin@skyhoch.test', role: Role.ADMIN },
    { name: 'Demo Teacher', email: 'teacher@skyhoch.test', role: Role.TEACHER },
    { name: 'Demo Student', email: 'student@skyhoch.test', role: Role.STUDENT },
  ]
  for (const p of people) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, passwordHash },
    })
  }

  if ((await prisma.course.count()) === 0) {
    const teacher = await prisma.user.findUniqueOrThrow({
      where: { email: 'teacher@skyhoch.test' },
    })
    const titles = [
      'Web Development Basics',
      'JavaScript Fundamentals',
      'React for Beginners',
      'Python Programming',
      'SQL and Databases',
      'UI/UX Design Essentials',
    ]
    for (const [i, title] of titles.entries()) {
      await prisma.course.create({
        data: {
          title,
          description: `Learn ${title} step by step with practical examples.`,
          price: 99 + i * 20,
          teacherId: teacher.id,
          lessons: {
            create: [
              { title: 'Introduction', content: 'Welcome to the course.', order: 1 },
              { title: 'Core Concepts', content: 'The main ideas explained.', order: 2 },
              { title: 'Hands-on Project', content: 'Build something real.', order: 3 },
            ],
          },
        },
      })
    }
  }
}

main().finally(() => prisma.$disconnect())