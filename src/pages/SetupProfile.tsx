import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function SetupProfile() {
  const { user, resident, refreshResident } = useAuth()
  const [name, setName] = useState(resident?.name || '')
  const [whatsapp, setWhatsapp] = useState(resident?.whatsapp_number || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!whatsapp.trim()) {
      setError('Please enter your WhatsApp number')
      return
    }

    // Basic phone validation - should have at least 10 digits
    const digits = whatsapp.replace(/[^0-9]/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)')
      return
    }

    setLoading(true)
    const { error: updateErr } = await supabase
      .from('residents')
      .update({ name: name.trim(), whatsapp_number: whatsapp.trim() })
      .eq('id', user?.id)

    if (updateErr) {
      setError(updateErr.message)
    } else {
      await refreshResident()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">👋 Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">We need a few details to get you started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              id="profile-name"
              data-testid="profile-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label htmlFor="profile-whatsapp" className="block text-sm font-medium text-gray-700">
              WhatsApp Number
            </label>
            <input
              id="profile-whatsapp"
              data-testid="profile-whatsapp-input"
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+91 9876543210"
            />
            <p className="mt-1 text-xs text-gray-500">Used for library reminders only</p>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <button
            type="submit"
            data-testid="profile-submit-button"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
