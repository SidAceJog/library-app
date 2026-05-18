import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Borrowing, VolunteerRequest } from '@/lib/types'

type Tab = 'overdue' | 'users' | 'volunteers' | 'settings'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('overdue')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Admin Dashboard</h2>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(['overdue', 'users', 'volunteers', 'settings'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs py-2 rounded-md font-medium capitalize ${tab === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overdue' && <OverdueTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'volunteers' && <VolunteersTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  )
}

function OverdueTab() {
  const [overdue, setOverdue] = useState<(Borrowing & { book: { title: string }; resident: { flat_number: string; name: string; whatsapp_number: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('borrowings')
        .select('*, book:books(title), resident:residents!borrowings_resident_id_fkey(flat_number, name, whatsapp_number)')
        .is('returned_at', null)
        .lt('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })

      setOverdue((data || []).filter(d => d.book && d.resident) as any)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>

  return (
    <div>
      {overdue.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">No overdue books 🎉</p>
      ) : (
        <ul className="bg-white border rounded-lg divide-y shadow-sm">
          {overdue.map(o => (
            <li key={o.id} className="px-4 py-3">
              <p className="text-sm font-medium">{o.book.title}</p>
              <p className="text-xs text-gray-500">
                {o.resident.flat_number} — {o.resident.name}
              </p>
              <p className="text-xs text-red-600">
                Due: {new Date(o.due_at).toLocaleDateString()} ({Math.ceil((Date.now() - new Date(o.due_at).getTime()) / (1000 * 60 * 60 * 24))} days overdue)
              </p>
              {o.resident.whatsapp_number && (
                <a
                  href={`https://wa.me/${o.resident.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi ${o.resident.name}, your library book "${o.book.title}" is overdue. Please return it at your earliest convenience.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-xs text-green-600 underline"
                >
                  Send WhatsApp reminder
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<{ id: string; flat_number: string; name: string; is_active: boolean; role: string }[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  async function searchUsers(query: string) {
    setSearch(query)
    if (query.length < 2) { setUsers([]); return }
    setLoading(true)

    const { data } = await supabase
      .from('residents')
      .select('id, flat_number, name, is_active, role')
      .or(`flat_number.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(20)

    setUsers(data || [])
    setLoading(false)
  }

  async function toggleActive(id: string, currentlyActive: boolean) {
    await supabase.from('residents').update({ is_active: !currentlyActive }).eq('id', id)
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !currentlyActive } : u))
  }

  async function resetPassword(id: string, flatNumber: string) {
    // Reset to default password (flat number)
    const { error } = await supabase.auth.admin.updateUserById(id, { password: flatNumber })
    if (!error) {
      await supabase.from('residents').update({ must_change_password: true }).eq('id', id)
      alert(`Password reset to flat number for ${flatNumber}`)
    } else {
      alert('Password reset failed. Use Supabase dashboard for admin operations.')
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        data-testid="admin-user-search"
        value={search}
        onChange={(e) => searchUsers(e.target.value)}
        placeholder="Search by flat number or name..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      {loading && <p className="text-sm text-gray-500">Searching...</p>}

      {users.length > 0 && (
        <ul className="bg-white border rounded-lg divide-y shadow-sm">
          {users.map(u => (
            <li key={u.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{u.flat_number} — {u.name}</p>
                <p className="text-xs text-gray-500">{u.role} • {u.is_active ? 'Active' : 'Disabled'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(u.id, u.is_active)}
                  className={`text-xs px-2 py-1 rounded ${u.is_active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                >
                  {u.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => resetPassword(u.id, u.flat_number)}
                  className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700"
                >
                  Reset PW
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function VolunteersTab() {
  const [requests, setRequests] = useState<(VolunteerRequest & { resident: { flat_number: string; name: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('volunteer_requests')
        .select('*, resident:residents!volunteer_requests_resident_id_fkey(flat_number, name)')
        .eq('status', 'pending')
        .order('requested_date', { ascending: true })

      setRequests((data || []).filter(d => d.resident) as any)
      setLoading(false)
    }
    load()
  }, [])

  async function handleRequest(id: string, residentId: string, date: string, approve: boolean) {
    if (approve) {
      // Grant temp admin access for the requested date
      const expiresAt = new Date(date)
      expiresAt.setHours(23, 59, 59, 999)

      await supabase.from('temp_admin_access').insert({
        resident_id: residentId,
        granted_date: date,
        expires_at: expiresAt.toISOString(),
        granted_by: (await supabase.auth.getUser()).data.user?.id,
      })
    }

    await supabase
      .from('volunteer_requests')
      .update({ status: approve ? 'approved' : 'rejected', approved_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('id', id)

    setRequests(requests.filter(r => r.id !== id))
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>

  return (
    <div>
      {requests.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">No pending volunteer requests</p>
      ) : (
        <ul className="bg-white border rounded-lg divide-y shadow-sm">
          {requests.map(r => (
            <li key={r.id} className="px-4 py-3">
              <p className="text-sm font-medium">{r.resident.flat_number} — {r.resident.name}</p>
              <p className="text-xs text-gray-500">Wants to volunteer on: {new Date(r.requested_date).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleRequest(r.id, r.resident_id, r.requested_date, true)}
                  className="text-xs px-3 py-1 rounded bg-green-600 text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRequest(r.id, r.resident_id, r.requested_date, false)}
                  className="text-xs px-3 py-1 rounded bg-red-100 text-red-700"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SettingsTab() {
  const [maxBooks, setMaxBooks] = useState('1')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'max_books_per_resident')
        .single()
      if (data) setMaxBooks(data.value)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    await supabase
      .from('app_settings')
      .update({ value: maxBooks, updated_at: new Date().toISOString() })
      .eq('key', 'max_books_per_resident')
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
      <div>
        <label htmlFor="max-books" className="block text-sm font-medium text-gray-700">
          Max books per resident
        </label>
        <input
          id="max-books"
          data-testid="settings-max-books"
          type="number"
          min="1"
          max="10"
          value={maxBooks}
          onChange={(e) => setMaxBooks(e.target.value)}
          className="mt-1 block w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        data-testid="settings-save-button"
        className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  )
}
