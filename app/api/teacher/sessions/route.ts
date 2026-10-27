import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(1, 'Title is required').max(100),
  startsAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date and time'),
  meetingLink: z
    .string()
    .url('Enter a valid link')
    .refine((v) => /^https?:\/\//i.test(v), 'Link must start with http:// or https://'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }
  const { courseId, title, startsAt, meetingLink } = parsed.data

  // Ownership check: ഈ course ആ teacher-ന്റേതാണോ
  const course = await db.course.findFirst({
    where: { id: courseId, teacherId: session.user.id },
  })
  if (!course) {
    return Response.json({ error: 'Not your course' }, { status: 403 })
  }

  await db.classSession.create({
    data: { courseId, title, startsAt: new Date(startsAt), meetingLink },
  })
  return Response.json({ ok: true }, { status: 201 })
}