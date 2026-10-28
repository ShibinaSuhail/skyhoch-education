import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z
  .object({
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.active !== undefined, 'Nothing to update')

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  // Lock-out തടയാൻ: admin സ്വന്തം role/status മാറ്റാൻ പാടില്ല
  if (id === session.user.id) {
    return Response.json(
      { error: 'You cannot change your own role or status' },
      { status: 400 }
    )
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const user = await db.user.findUnique({
    where: { id },
    include: { _count: { select: { courses: true } } },
  })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  // Course ഉള്ള teacher-ന്റെ role മാറ്റിയാൽ course-ന് teacher ഇല്ലാതാകും
  if (
    parsed.data.role &&
    parsed.data.role !== 'TEACHER' &&
    user.role === 'TEACHER' &&
    user._count.courses > 0
  ) {
    return Response.json(
      { error: 'This teacher has courses. Assign those courses to another teacher first.' },
      { status: 409 }
    )
  }

  await db.user.update({ where: { id }, data: parsed.data })
  return Response.json({ ok: true })
}