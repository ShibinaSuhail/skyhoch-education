import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const { name, password } = parsed.data
  const email = parsed.data.email.toLowerCase()

  const exists = await db.user.findUnique({ where: { email } })
  if (exists) {
    return Response.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  // role is NEVER taken from the client: always STUDENT
  await db.user.create({ data: { name, email, passwordHash, role: 'STUDENT' } })
  return Response.json({ ok: true }, { status: 201 })
}