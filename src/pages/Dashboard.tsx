import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Borrowing } from '@/lib/types'
import Notices from '@/components/Notices'

export default function Dashboard() {
  const { user, resident } = useAuth()
  const [currentBorrowings, setCurrentBorrowings] = useState<(Borrowing & { book: { title: string; author: string; isbn: string } })[]>([])
  const [history, setHistory] = useState<(Borrowing & { book: { title: string; author: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestion, setSuggestion] = useState('')
  const [suggestionSent, setSuggestionSent] = useState(false)
  const [suggestionSending, setSuggestionSending] = useState(false)

  useEffect(() => {
    if (!user) return

    async function load() {
      // Current borrowings (all unreturned)
      const { data: current } = await supabase
        .from('borrowings')
        .select('*, book:books(title, author, isbn)')
        .eq('resident_id', user!.id)
        .is('returned_at', null)
        .order('due_at', { ascending: true })

      setCurrentBorrowings((current || []).filter(c => c.book) as any)

      // History (last 10 returned)
      const { data: hist } = await supabase
        .from('borrowings')
        .select('*, book:books(title, author)')
        .eq('resident_id', user!.id)
        .not('returned_at', 'is', null)
        .order('returned_at', { ascending: false })
        .limit(10)

      setHistory((hist || []).filter(h => h.book) as any)
      setLoading(false)
    }

    load()
  }, [user])

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Welcome, {resident?.name || resident?.flat_number}</h2>
          <p className="text-sm text-gray-500">Flat {resident?.flat_number}</p>
        </div>
        <a href="/rules" className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200">📜 Rules</a>
      </div>

      {/* Notices */}
      <Notices />

      {/* Current borrowings */}
      <section>
        <h3 className="font-semibold text-gray-700 mb-2">Currently Borrowed</h3>
        {currentBorrowings.length > 0 ? (
          <ul className="bg-white border rounded-lg divide-y shadow-sm">
            {currentBorrowings.map(b => {
              const daysLeft = Math.ceil((new Date(b.due_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <li key={b.id} className="p-4">
                  <p className="font-medium">{b.book.title}</p>
                  <p className="text-sm text-gray-500">by {b.book.author}</p>
                  <p className="text-sm mt-1">
                    Due: {new Date(b.due_at).toLocaleDateString()}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${daysLeft < 0 ? 'bg-red-100 text-red-700' : daysLeft <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </span>
                  </p>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">No books currently borrowed. Visit the library to check one out!</p>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <h3 className="font-semibold text-gray-700 mb-2">Borrowing History</h3>
          <ul className="bg-white border rounded-lg divide-y shadow-sm">
            {history.map(h => (
              <li key={h.id} className="px-4 py-3">
                <p className="text-sm font-medium">{h.book.title}</p>
                <p className="text-xs text-gray-500">
                  Returned {new Date(h.returned_at!).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Suggestion */}
      <section>
        <h3 className="font-semibold text-gray-700 mb-2">💡 Suggestion</h3>
        {suggestionSent ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">Thanks! Your suggestion has been submitted.</p>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!suggestion.trim()) return
            setSuggestionSending(true)
            await supabase.from('suggestions').insert({ resident_id: user!.id, message: suggestion.trim() })
            setSuggestion('')
            setSuggestionSent(true)
            setSuggestionSending(false)
            setTimeout(() => setSuggestionSent(false), 5000)
          }} className="bg-white border rounded-lg p-3 shadow-sm space-y-2">
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Any suggestions for the library? Share here..."
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              data-testid="suggestion-input"
            />
            <button
              type="submit"
              disabled={suggestionSending || !suggestion.trim()}
              data-testid="suggestion-submit"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {suggestionSending ? 'Sending...' : 'Submit'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
