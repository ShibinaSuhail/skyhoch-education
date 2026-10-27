import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await db.course.findFirst({
    where: { id, published: true },
    include: {
      teacher: { select: { name: true } },
      lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true } },
    },
  })
  if (!course) notFound()

  const session = await auth()
  const enrolled = session
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: id } },
      })
    : null

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-1 text-sm text-gray-500">Taught by {course.teacher.name}</p>
      <p className="mt-4">{course.description}</p>
      <p className="mt-4 text-2xl font-bold text-blue-600">₹{course.price}</p>

      <div className="mt-4">
        {!session ? (
          <Link href="/login" className="rounded bg-blue-600 px-5 py-2 text-white">Login to enroll</Link>
        ) : session.user.role !== 'STUDENT' ? (
          <p className="text-sm text-gray-500">Only students can enroll.</p>
        ) : enrolled ? (
          <Link href={`/student/courses/${id}`} className="rounded bg-green-600 px-5 py-2 text-white">Go to course</Link>
        ) : (
          <Link href={`/checkout/${id}`} className="rounded bg-blue-600 px-5 py-2 text-white">Enroll now</Link>
        )}
      </div>

      <h2 className="mt-8 text-xl font-semibold">Lessons</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        {course.lessons.map((l) => <li key={l.id}>{l.title}</li>)}
      </ol>
    </main>
  )
}