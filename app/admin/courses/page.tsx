import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import AdminCourseManager from '@/components/AdminCourseManager'

export default async function AdminCourses() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [courses, teachers] = await Promise.all([
    db.course.findMany({
      include: {
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    db.user.findMany({
      where: { role: 'TEACHER', active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/admin" className="text-sm text-blue-600">← Admin dashboard</Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold">Manage courses</h1>
      <AdminCourseManager
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          price: c.price,
          published: c.published,
          teacherId: c.teacherId,
          teacherName: c.teacher.name,
          enrollments: c._count.enrollments,
        }))}
        teachers={teachers}
      />
    </main>
  )
}