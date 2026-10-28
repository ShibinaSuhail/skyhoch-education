import Link from 'next/link'

type Props = {
  id: string
  title: string
  description: string
  price: number
  teacherName: string
}

export default function CourseCard({ id, title, description, price, teacherName }: Props) {
  const grad = `grad-${title.length % 6}`

  return (
    <Link
      href={`/courses/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`${grad} flex h-28 items-center justify-center text-4xl font-extrabold text-white`}>
        {title.charAt(0)}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <span className="text-slate-500">{teacherName}</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">₹{price}</span>
        </div>
      </div>
    </Link>
  )
}