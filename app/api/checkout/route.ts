import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z.object({ courseId: z.string().min(1) })

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'STUDENT') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { courseId } = parsed.data
  const userId = session.user.id

  const course = await db.course.findFirst({ where: { id: courseId, published: true } })
  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 })
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (existing) {
    return Response.json({ error: 'Already enrolled' }, { status: 409 })
  }

  try {
    await db.$transaction([
      db.payment.create({
        data: {
          userId,
          courseId,
          amount: course.price,
          status: 'PAID',
          reference: 'MOCK-' + Date.now(),
        },
      }),
      db.enrollment.create({ data: { userId, courseId } }),
    ])
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return Response.json({ error: 'Already enrolled' }, { status: 409 })
    }
    return Response.json({ error: 'Payment failed' }, { status: 500 })
  }

  return Response.json({ ok: true })
}