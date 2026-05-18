import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { VolunteerRequest } from '@/lib/types'

export default function Volunteer() {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [requests, setRequests] = useState<VolunteerRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('volunteer_requests')
        .select('*')
        .eq('resident_id', user!.id)
        .order('requested_date', { ascending: false })
        .limit(10)
      setRequests(data || [])
    }
    load()
  }, [user])

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!date) { setError('Please select a date'); return }

    const selectedDate = new Date(date)
    if (selectedDate <= new Date()) { setError('Please select a future date'); return }

    setLoading(true)
    const { error: insertErr } = await supabase
      .from('volunteer_requests')
      .insert({ resident_id: user!.id, requested_date: date })

    if (insertErr) {
      setError(insertErr.message.includes('duplicate') ? 'You already have a request for this date' : 'Failed to submit request')
    } else {
      setSuccess('Request submitted! An admin will review it.')
      setDate('')
      // Refresh list
      const { data } = await supabase
        .from('volunteer_requests')
        .select('*')
        .eq('resident_id', user!.id)
        .order('requested_date', { ascending: false })
        .limit(10)
      setRequests(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Volunteer at Library</h2>
        <p className="text-sm text-gray-600 mt-1">
          Want to help out? Pick a date you'd like to volunteer. You'll get temporary admin access for that day.
        </p>
      </div>

      {success && <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 text-sm" role="status">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm" role="alert">{error}</div>}

      <form onSubmit={submitRequest} className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
        <div>
          <label htmlFor="volunteer-date" className="block text-sm font-medium text-gray-700">
            Date you'd like to volunteer
          </label>
          <input
            id="volunteer-date"
            data-testid="volunteer-date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          data-testid="volunteer-submit-button"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Request to Volunteer'}
        </button>
      </form>

      {requests.length > 0 && (
        <section>
          <h3 className="font-semibold text-gray-700 mb-2">Your Requests</h3>
          <ul className="bg-white border rounded-lg divide-y shadow-sm">
            {requests.map(r => (
              <li key={r.id} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm">{new Date(r.requested_date).toLocaleDateString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                  r.status === 'approved' ? 'bg-green-100 text-green-700' :
                  r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  r.status === 'expired' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
