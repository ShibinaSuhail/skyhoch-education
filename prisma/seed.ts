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

  // Demo courses: പഴയവ remove ചെയ്ത് പുതിയവ ഇടുന്നു
  // (ഇതുവരെ enrollment/payment ഇല്ലാത്തതുകൊണ്ട് safe)
  await prisma.course.deleteMany()

  const teacher = await prisma.user.findUniqueOrThrow({
    where: { email: 'teacher@skyhoch.test' },
  })

  const courses = [
    {
      title: 'German A1 – Beginner',
      price: 2999,
      description: 'Start German from zero: alphabet, greetings, numbers and everyday sentences.',
    },
    {
      title: 'German A2 – Elementary',
      price: 3499,
      description: 'Build on A1 with simple conversations, past tense and daily-life vocabulary.',
    },
    {
      title: 'German B1 – Intermediate',
      price: 3999,
      description: 'Speak and write confidently for study, work and life in Germany.',
    },
    {
      title: 'German for Ausbildung',
      price: 3299,
      description: 'Workplace German and interview preparation for Ausbildung in Germany.',
    },
    {
      title: 'English Communication & IELTS Basics',
      price: 2499,
      description: 'Improve spoken English and learn the IELTS test format step by step.',
    },
    {
      title: 'Web Development Basics',
      price: 1999,
      description: 'HTML, CSS and JavaScript fundamentals with practical examples.',
    },
  ]

  for (const c of courses) {
    await prisma.course.create({
      data: {
        ...c,
        teacherId: teacher.id,
        lessons: {
          create: [
            { title: 'Introduction', content: 'Welcome to the course.', order: 1 },
            { title: 'Core Concepts', content: 'The main ideas explained.', order: 2 },
            { title: 'Practice Session', content: 'Apply what you learned.', order: 3 },
          ],
        },
      },
    })
  }
}

main().finally(() => prisma.$disconnect())