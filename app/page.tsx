import Link from 'next/link'
import { db } from '@/lib/db'
import CourseCard from '@/components/CourseCard'

const features = [
  { icon: '🎓', title: 'Expert teachers', text: 'Learn from experienced language and skill trainers.' },
  { icon: '📅', title: 'Live sessions', text: 'Join scheduled online classes with your teacher.' },
  { icon: '🚀', title: 'Learn at your pace', text: 'Access your lessons anytime, on any device.' },
]

export default async function Home() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
    take: 3,
  })

  return (
    <main>
      <section className="grad-hero relative overflow-hidden py-24 text-center text-white">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/10" />
        <div className="relative mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Learn German. Build your future in Germany.
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Language and skill courses from expert teachers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow hover:bg-blue-50">
              Browse courses
            </Link>
            <Link href="/register" className="rounded-lg border border-white/60 px-6 py-3 font-semibold hover:bg-white/10">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Featured courses</h2>
          <Link href="/courses" className="text-sm font-medium text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              id={c.id}
              title={c.title}
              description={c.description}
              price={c.price}
              teacherName={c.teacher.name}
            />
          ))}
        </div>
      </section>
    </main>
  )
}