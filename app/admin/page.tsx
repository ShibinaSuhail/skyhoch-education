import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [users, courses, enrollments, revenue] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count(),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
  ])

  const stats = [
    { label: 'Users', value: users.toString() },
    { label: 'Courses', value: courses.toString() },
    { label: 'Enrollments', value: enrollments.toString() },
    { label: 'Total revenue', value: `₹${(revenue._sum.amount ?? 0).toLocaleString('en-IN')}` },
  ]

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-gray-600">Hello {session.user.name} ({session.user.role})</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/courses" className="rounded bg-blue-600 px-5 py-2 text-white">
          Manage courses
        </Link>
        <Link href="/admin/users" className="rounded border px-5 py-2">
          Manage users
        </Link>
      </div>
    </main>
  )
}