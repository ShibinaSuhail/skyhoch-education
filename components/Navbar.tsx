import Link from 'next/link'
import { auth, signOut } from '@/auth'

export default async function Navbar() {
  const session = await auth()
  const role = session?.user?.role
  const dashboard =
    role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : '/student'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="grad-text text-xl font-extrabold">
          Skyhoch Education
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <Link href="/courses" className="hover:text-blue-600">Courses</Link>

          {session ? (
            <>
              <Link href={dashboard} className="hover:text-blue-600">Dashboard</Link>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Login</Link>
              <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}