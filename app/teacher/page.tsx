import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function TeacherDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') redirect('/')

  const courses = await db.course.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { enrollments: true, sessions: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Teacher dashboard</h1>
      <p className="mt-1 text-gray-600">Hello {session.user.name} ({session.user.role})</p>

      <h2 className="mt-6 mb-3 text-xl font-semibold">My courses</h2>
      {courses.length === 0 ? (
        <div className="rounded border p-6 text-gray-500">No courses assigned to you yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/courses/${c.id}`}
              className="block rounded-lg border p-5 shadow-sm hover:shadow-md"
            >
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {c._count.enrollments} student(s) · {c._count.sessions} session(s)
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}