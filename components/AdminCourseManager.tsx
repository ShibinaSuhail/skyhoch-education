'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
  description: string
  price: number
  published: boolean
  teacherId: string
  teacherName: string
  enrollments: number
}
type Teacher = { id: string; name: string }

export default function AdminCourseManager({
  courses,
  teachers,
}: {
  courses: Course[]
  teachers: Teacher[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const editing = courses.find((c) => c.id === editingId)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const body = {
      title: String(fd.get('title') ?? ''),
      description: String(fd.get('description') ?? ''),
      price: Number(fd.get('price')),
      teacherId: String(fd.get('teacherId') ?? ''),
      published: fd.get('published') === 'on',
    }

    setLoading(true)
    setError('')
    const res = await fetch(
      editingId ? `/api/admin/courses/${editingId}` : '/api/admin/courses',
      {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
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

  async function togglePublish(c: Course) {
    setError('')
    const res = await fetch(`/api/admin/courses/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !c.published }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Update failed')
      return
    }
    router.refresh()
  }

  async function remove(c: Course) {
    if (!confirm(`Delete "${c.title}"?`)) return
    setError('')
    const res = await fetch(`/api/admin/courses/${c.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Delete failed')
      return
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
              <th className="p-3">Title</th>
              <th className="p-3">Teacher</th>
              <th className="p-3">Price</th>
              <th className="p-3">Students</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.title}</td>
                <td className="p-3">{c.teacherName}</td>
                <td className="p-3">₹{c.price}</td>
                <td className="p-3">{c.enrollments}</td>
                <td className="p-3">
                  <span className={c.published ? 'text-green-600' : 'text-gray-500'}>
                    {c.published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setEditingId(c.id); setError('') }}
                      className="rounded border px-2 py-1"
                    >
                      Edit
                    </button>
                    <button onClick={() => togglePublish(c)} className="rounded border px-2 py-1">
                      {c.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="rounded border border-red-300 px-2 py-1 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        key={editingId ?? 'new'}
        onSubmit={submit}
        className="mt-6 space-y-3 rounded-lg border p-4"
      >
        <h3 className="font-semibold">{editing ? 'Edit course' : 'Add a course'}</h3>
        <input
          name="title"
          required
          defaultValue={editing?.title}
          placeholder="Course title"
          className="w-full rounded border p-2"
        />
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={editing?.description}
          placeholder="Description"
          className="w-full rounded border p-2"
        />
        <input
          name="price"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={editing?.price}
          placeholder="Price (₹)"
          className="w-full rounded border p-2"
        />
        <select
          name="teacherId"
          required
          defaultValue={editing?.teacherId ?? ''}
          className="w-full rounded border p-2"
        >
          <option value="" disabled>Select teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input name="published" type="checkbox" defaultChecked={editing ? editing.published : true} />
          Published (visible to students)
        </label>
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Saving...' : editing ? 'Save changes' : 'Add course'}
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