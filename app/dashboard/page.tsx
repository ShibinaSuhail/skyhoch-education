import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardRedirect() {
  const session = await auth()
  if (!session) redirect('/login')
  const map = { STUDENT: '/student', TEACHER: '/teacher', ADMIN: '/admin' } as const
  redirect(map[session.user.role])
}