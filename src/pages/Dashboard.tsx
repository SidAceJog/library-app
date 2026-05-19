import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Borrowing } from '@/lib/types'
import Notices from '@/components/Notices'

export default function Dashboard() {
  const { user, resident } = useAuth()
  const [currentBorrowing, setCurrentBorrowing] = useState<(Borrowing & { book: { title: string; author: string; isbn: string } }) | null>(null)
  const [history, setHistory] = useState<(Borrowing & { book: { title: string; author: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      // Current borrowing
      const { data: current } = await supabase
        .from('borrowings')
        .select('*, book:books(title, author, isbn)')
        .eq('resident_id', user!.id)
        .is('returned_at', null)
        .limit(1)
        .single()

      if (current?.book) setCurrentBorrowing(current as any)

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

  const daysUntilDue = currentBorrowing
    ? Math.ceil((new Date(currentBorrowing.due_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Welcome, {resident?.name || resident?.flat_number}</h2>
        <p className="text-sm text-gray-500">Flat {resident?.flat_number}</p>
      </div>

      {/* Notices */}
      <Notices />

      {/* Current borrowing */}
      <section>
        <h3 className="font-semibold text-gray-700 mb-2">Currently Borrowed</h3>
        {currentBorrowing ? (
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="font-medium">{currentBorrowing.book.title}</p>
            <p className="text-sm text-gray-500">by {currentBorrowing.book.author}</p>
            <p className="text-sm mt-2">
              Due: {new Date(currentBorrowing.due_at).toLocaleDateString()}
              {daysUntilDue !== null && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${daysUntilDue < 0 ? 'bg-red-100 text-red-700' : daysUntilDue <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                </span>
              )}
            </p>
          </div>
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
    </div>
  )
}
