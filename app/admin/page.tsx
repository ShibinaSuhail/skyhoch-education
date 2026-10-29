import Link from 'next/link'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export default async function AdminDashboard() {
  const admin = await requireAdmin()
  const [users, courses, enrollments, revenue] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count(),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
  ])

  const stats = [
    { label: 'Users', value: users, icon: '👥', grad: 'grad-0' },
    { label: 'Courses', value: courses, icon: '📚', grad: 'grad-3' },
    { label: 'Enrollments', value: enrollments, icon: '🎓', grad: 'grad-2' },
    { label: 'Revenue', value: `₹${revenue._sum.amount ?? 0}`, icon: '💰', grad: 'grad-4' },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Welcome, {admin.name} 👋</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.grad} rounded-2xl p-5 text-white shadow`}>
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-2 text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-white/80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/courses" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <p className="text-2xl">📚</p>
          <h3 className="mt-2 font-semibold">Manage courses</h3>
          <p className="text-sm text-slate-600">Create, edit, publish or hide courses.</p>
        </Link>
        <Link href="/admin/users" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <p className="text-2xl">👥</p>
          <h3 className="mt-2 font-semibold">Manage users</h3>
          <p className="text-sm text-slate-600">Change roles, activate or deactivate accounts.</p>
        </Link>
      </div>
    </main>
  )
}