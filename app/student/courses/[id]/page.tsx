import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function StudentCourse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session) redirect('/login')

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: id } },
  })
  if (!enrollment) redirect(`/courses/${id}`)

  const course = await db.course.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true } },
      lessons: { orderBy: { order: 'asc' } },
      sessions: { orderBy: { startsAt: 'asc' } },
    },
  })
  if (!course) notFound()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/student" className="text-sm text-blue-600">← My courses</Link>
      <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
      <p className="mt-1 text-sm text-gray-500">Taught by {course.teacher.name}</p>

      <h2 className="mt-8 text-xl font-semibold">Lessons</h2>
      <div className="mt-3 space-y-3">
        {course.lessons.map((l) => (
          <div key={l.id} className="rounded border p-4">
            <h3 className="font-medium">{l.order}. {l.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{l.content}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-semibold">Live class sessions</h2>
      {course.sessions.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No sessions scheduled yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {course.sessions.map((s) => (
            <li key={s.id} className="rounded border p-4">
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-gray-600">{s.startsAt.toLocaleString('en-GB')}</p>
              <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                Join meeting
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}