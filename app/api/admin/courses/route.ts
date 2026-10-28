import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  price: z.number().int('Price must be a whole number').min(0).max(1000000),
  teacherId: z.string().min(1, 'Choose a teacher'),
  published: z.boolean(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  // teacherId ശരിക്കും ഒരു TEACHER ആണോ എന്ന് server-ൽ check ചെയ്യുന്നു
  const teacher = await db.user.findFirst({
    where: { id: parsed.data.teacherId, role: 'TEACHER' },
  })
  if (!teacher) {
    return Response.json({ error: 'Invalid teacher' }, { status: 400 })
  }

  const course = await db.course.create({
    data: {
      ...parsed.data,
      // starter lesson for course not blank 
      lessons: {
        create: [{ title: 'Introduction', content: 'Welcome to the course.', order: 1 }],
      },
    },
  })
  return Response.json({ ok: true, id: course.id }, { status: 201 })
}