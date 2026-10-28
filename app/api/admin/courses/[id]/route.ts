import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    price: z.number().int('Price must be a whole number').min(0).max(1000000),
    teacherId: z.string().min(1, 'Choose a teacher'),
    published: z.boolean(),
  })
  .partial()

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const course = await db.course.findUnique({ where: { id } })
  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 })
  }

  if (parsed.data.teacherId) {
    const teacher = await db.user.findFirst({
      where: { id: parsed.data.teacherId, role: 'TEACHER' },
    })
    if (!teacher) {
      return Response.json({ error: 'Invalid teacher' }, { status: 400 })
    }
  }

  await db.course.update({ where: { id }, data: parsed.data })
  return Response.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  const course = await db.course.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true, payments: true } } },
  })
  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 })
  }

  // Enrollment/Payment ഉള്ള course delete ചെയ്താൽ student-ന്റെ record നഷ്ടപ്പെടും
  if (course._count.enrollments > 0 || course._count.payments > 0) {
    return Response.json(
      { error: 'This course has enrollments or payments. Unpublish it instead of deleting.' },
      { status: 409 }
    )
  }

  await db.course.delete({ where: { id } })
  return Response.json({ ok: true })
}