import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import SessionManager from '@/components/SessionManager'

export default async function TeacherCourse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') redirect('/')

  // teacherId ചേർത്തിരിക്കുന്നതുകൊണ്ട് മറ്റൊരു teacher-ന്റെ course കിട്ടില്ല
  const course = await db.course.findFirst({
    where: { id, teacherId: session.user.id },
    include: {
      enrollments: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { enrolledAt: 'desc' },
      },
      sessions: { orderBy: { startsAt: 'asc' } },
    },
  })
  if (!course) notFound()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/teacher" className="text-sm text-blue-600">← My courses</Link>
      <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>

      <h2 className="mt-8 mb-3 text-xl font-semibold">
        Enrolled students ({course.enrollments.length})
      </h2>
      {course.enrollments.length === 0 ? (
        <p className="text-sm text-gray-500">No students have enrolled yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Enrolled on</th>
              </tr>
            </thead>
            <tbody>
              {course.enrollments.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.user.name}</td>
                  <td className="p-3">{e.user.email}</td>
                  <td className="p-3">{e.enrolledAt.toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-8 mb-3 text-xl font-semibold">Class sessions</h2>
      <SessionManager
        courseId={course.id}
        sessions={course.sessions.map((s) => ({
          id: s.id,
          title: s.title,
          startsAt: s.startsAt.toISOString(),
          meetingLink: s.meetingLink,
        }))}
      />
    </main>
  )
}