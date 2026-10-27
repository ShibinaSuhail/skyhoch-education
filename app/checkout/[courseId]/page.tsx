import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import PayButton from '@/components/PayButton'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'STUDENT') redirect('/')

  const course = await db.course.findFirst({ where: { id: courseId, published: true } })
  if (!course) notFound()

  const enrolled = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  if (enrolled) redirect(`/student/courses/${courseId}`)

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-4 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">{course.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{course.description}</p>
        <p className="mt-4 text-2xl font-bold text-blue-600">₹{course.price}</p>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        This is a demo payment. No real money is charged.
      </p>
      <div className="mt-4">
        <PayButton courseId={course.id} price={course.price} />
      </div>
    </main>
  )
}