import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import AdminUserManager from '@/components/AdminUserManager'

export default async function AdminUsers() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/admin" className="text-sm text-blue-600">← Admin dashboard</Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold">Manage users</h1>
      <AdminUserManager
        currentUserId={session.user.id}
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      />
    </main>
  )
}