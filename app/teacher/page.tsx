import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function TeacherDashboard() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'TEACHER') redirect('/')

  const courses = await db.course.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { enrollments: true, sessions: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0)
  const totalSessions = courses.reduce((sum, c) => sum + c._count.sessions, 0)

  const stats = [
    { label: 'Courses', value: courses.length, icon: '📚', grad: 'grad-1' },
    { label: 'Students', value: totalStudents, icon: '🎓', grad: 'grad-3' },
    { label: 'Sessions', value: totalSessions, icon: '📅', grad: 'grad-2' },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Hello, {session.user.name} 👋</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`${s.grad} rounded-2xl p-5 text-white shadow`}>
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-2 text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-white/80">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold">My courses</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/teacher/courses/${c.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="font-semibold group-hover:text-blue-600">{c.title}</h3>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
                {c._count.enrollments} student(s)
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                {c._count.sessions} session(s)
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-blue-600">Manage →</p>
          </Link>
        ))}
      </div>
    </main>
  )
}