import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ enrolled?: string }>
}) {
  const { enrolled } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          teacher: { select: { name: true } },
          _count: { select: { lessons: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Welcome back, {session.user.name} 👋</h1>
      <p className="mt-1 text-slate-600">
        You are enrolled in {enrollments.length} course{enrollments.length === 1 ? '' : 's'}.
      </p>

      {enrolled && (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-800">
          ✅ Payment successful. You are now enrolled!
        </p>
      )}

      {enrollments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-2 text-slate-600">You have not enrolled in any course yet.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/student/courses/${e.courseId}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`grad-${e.course.title.length % 6} flex h-20 items-center px-5 text-3xl font-extrabold text-white`}>
                {e.course.title.charAt(0)}
              </div>
              <div className="p-5">
                <h3 className="font-semibold group-hover:text-blue-600">{e.course.title}</h3>
                <p className="text-sm text-slate-500">By {e.course.teacher.name}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{e.course._count.lessons} lessons</span>
                  <span>Enrolled {e.enrolledAt.toLocaleDateString('en-GB')}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-blue-600">Continue →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}