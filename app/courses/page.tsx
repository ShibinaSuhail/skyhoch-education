import { db } from '@/lib/db'
import CourseCard from '@/components/CourseCard'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; max?: string }>
}) {
  const { q, max } = await searchParams
  const maxPrice = max ? parseInt(max) : undefined

  const courses = await db.course.findMany({
    where: {
      published: true,
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      ...(maxPrice && !isNaN(maxPrice) ? { price: { lte: maxPrice } } : {}),
    },
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">All courses</h1>

      <form className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search courses..."
          className="rounded border p-2" />
        <input name="max" type="number" defaultValue={max} placeholder="Max price"
          className="w-32 rounded border p-2" />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Search</button>
      </form>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} id={c.id} title={c.title} description={c.description}
              price={c.price} teacherName={c.teacher.name} />
          ))}
        </div>
      )}
    </main>
  )
}