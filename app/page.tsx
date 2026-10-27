import Link from 'next/link'
import { db } from '@/lib/db'
import CourseCard from '@/components/CourseCard'

export default async function Home() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
    take: 3,
  })

  return (
    <main>
      <section className="bg-blue-50 py-20 text-center">
        <h1 className="text-4xl font-bold">Learn German. Build your future in Germany.</h1>
        <p className="mt-3 text-gray-600">Language and skill courses from expert teachers.</p>
        <Link href="/courses" className="mt-6 inline-block rounded bg-blue-600 px-6 py-3 text-white">
          Browse courses
        </Link>
      </section>

      <section className="mx-auto max-w-6xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Featured courses</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} id={c.id} title={c.title} description={c.description}
              price={c.price} teacherName={c.teacher.name} />
          ))}
        </div>
      </section>
    </main>
  )
}