import Link from 'next/link'

type Props = { id: string; title: string; description: string; price: number; teacherName: string }

export default function CourseCard({ id, title, description, price, teacherName }: Props) {
  return (
    <Link href={`/courses/${id}`} className="block rounded-lg border p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{description}</p>
      <p className="mt-3 text-xs text-gray-500">By {teacherName}</p>
      <p className="mt-2 font-bold text-blue-600">₹{price}</p>
    </Link>
  )
}