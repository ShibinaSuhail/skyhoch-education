import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  startsAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date and time'),
  meetingLink: z
    .string()
    .url('Enter a valid link')
    .refine((v) => /^https?:\/\//i.test(v), 'Link must start with http:// or https://'),
})

// session ഉം അതിന്റെ course-ന്റെ ഉടമസ്ഥതയും ഒറ്റ query-യിൽ check ചെയ്യുന്നു
async function findOwned(id: string, userId: string) {
  return db.classSession.findFirst({
    where: { id, course: { teacherId: userId } },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
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

  if (!(await findOwned(id, session.user.id))) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { title, startsAt, meetingLink } = parsed.data
  await db.classSession.update({
    where: { id },
    data: { title, startsAt: new Date(startsAt), meetingLink },
  })
  return Response.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  if (!(await findOwned(id, session.user.id))) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  await db.classSession.delete({ where: { id } })
  return Response.json({ ok: true })
}