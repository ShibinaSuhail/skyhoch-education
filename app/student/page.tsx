import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function StudentDashboard() {
  const session = await auth()
  if (!session) redirect('/login')

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: { include: { teacher: { select: { name: true } } } } },
    orderBy: { enrolledAt: 'desc' },
  })

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Student dashboard</h1>
      <p className="mt-1 text-gray-600">Hello {session.user.name} ({session.user.role})</p>

      <h2 className="mt-6 mb-3 text-xl font-semibold">My courses</h2>

      {enrollments.length === 0 ? (
        <div className="rounded border p-6 text-gray-500">
          You have not enrolled in any course yet.{' '}
          <Link href="/courses" className="text-blue-600 underline">Browse courses</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/student/courses/${e.courseId}`}
              className="block rounded-lg border p-5 shadow-sm hover:shadow-md"
            >
              <h3 className="font-semibold">{e.course.title}</h3>
              <p className="mt-1 text-xs text-gray-500">By {e.course.teacher.name}</p>
              <p className="mt-2 text-xs text-gray-500">
                Enrolled on {e.enrolledAt.toLocaleDateString('en-GB')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}