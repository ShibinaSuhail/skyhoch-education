'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Item = { id: string; title: string; startsAt: string; meetingLink: string }

// ISO date → <input type="datetime-local"> value
function toLocalInput(iso: string) {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function SessionManager({
  courseId,
  sessions,
}: {
  courseId: string
  sessions: Item[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const editing = sessions.find((s) => s.id === editingId)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const date = new Date(String(fd.get('startsAt') ?? ''))
    if (isNaN(date.getTime())) {
      setError('Choose a valid date and time')
      return
    }

    const body = {
      title: String(fd.get('title') ?? ''),
      meetingLink: String(fd.get('meetingLink') ?? ''),
      startsAt: date.toISOString(),
    }

    setLoading(true)
    setError('')
    const res = editingId
      ? await fetch(`/api/teacher/sessions/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await fetch('/api/teacher/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, courseId }),
        })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }
    form.reset()
    setEditingId(null)
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('Delete this session?')) return
    const res = await fetch(`/api/teacher/sessions/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Delete failed')
      return
    }
    router.refresh()
  }

  return (
    <div>
      {sessions.length === 0 ? (
        <p className="text-sm text-gray-500">No sessions scheduled yet.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-4">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(s.startsAt).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })}
                </p>
                <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                  Meeting link
                </a>
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => { setEditingId(s.id); setError('') }}
                  className="rounded border px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="rounded border border-red-300 px-3 py-1 text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        key={editingId ?? 'new'}
        onSubmit={submit}
        className="mt-6 space-y-3 rounded-lg border p-4"
      >
        <h3 className="font-semibold">{editing ? 'Edit session' : 'Add a session'}</h3>
        <input
          name="title"
          required
          defaultValue={editing?.title}
          placeholder="Session title"
          className="w-full rounded border p-2"
        />
        <input
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={editing ? toLocalInput(editing.startsAt) : ''}
          className="w-full rounded border p-2"
        />
        <input
          name="meetingLink"
          type="url"
          required
          defaultValue={editing?.meetingLink}
          placeholder="https://meet.google.com/..."
          className="w-full rounded border p-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Saving...' : editing ? 'Save changes' : 'Add session'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setError('') }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}