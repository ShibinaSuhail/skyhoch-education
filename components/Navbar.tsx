import Link from 'next/link'
import { auth, signOut } from '@/auth'

export default async function Navbar() {
  const session = await auth()
  const role = session?.user?.role
  const dashboard =
    role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/student'

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-blue-600">Skyhoch Education</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/courses">Courses</Link>
          {session ? (
            <>
              <Link href={dashboard}>Dashboard</Link>
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
                <button className="rounded bg-gray-800 px-3 py-1 text-white">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className="rounded bg-blue-600 px-3 py-1 text-white">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}