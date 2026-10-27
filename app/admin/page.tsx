import { auth, signOut } from '@/auth'

export default async function Page() {
  const session = await auth()
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p>Hello {session?.user?.name} ({session?.user?.role})</p>
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
        <button className="mt-4 border rounded px-3 py-1">Logout</button>
      </form>
    </main>
  )
}