'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UserRow = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  active: boolean
  createdAt: string
}

export default function AdminUserManager({
  users,
  currentUserId,
}: {
  users: UserRow[]
  currentUserId: string
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function update(id: string, body: { role?: string; active?: boolean }) {
    setBusyId(id)
    setError('')
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setBusyId(null)
    if (!res.ok) {
      setError(data.error ?? 'Update failed')
    }
    router.refresh()
  }

  return (
    <div>
      {error && <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">
                    {u.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      disabled={isSelf || busyId === u.id}
                      onChange={(e) => update(u.id, { role: e.target.value })}
                      className="rounded border p-1 disabled:opacity-50"
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={u.active ? 'text-green-600' : 'text-red-600'}>
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="p-3">
                    <button
                      disabled={isSelf || busyId === u.id}
                      onClick={() => update(u.id, { active: !u.active })}
                      className="rounded border px-2 py-1 disabled:opacity-50"
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}