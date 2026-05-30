import { useState } from 'react'
import BarcodeScanner from '@/components/BarcodeScanner'
import PhotoCapture from '@/components/PhotoCapture'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Borrowing } from '@/lib/types'

type Mode = 'choose' | 'scan' | 'search' | 'confirm'

export default function Return() {
  const { user, resident } = useAuth()
  const [mode, setMode] = useState<Mode>('choose')
  const [borrowing, setBorrowing] = useState<Borrowing | null>(null)
  const [conditionNote, setConditionNote] = useState('')
  const [conditionPhoto, setConditionPhoto] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<(Borrowing & { book: { title: string; isbn: string }; resident: { flat_number: string; name: string } })[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleScan(isbn: string) {
    setError('')
    setLoading(true)

    // First find the book by ISBN
    const { data: book } = await supabase
      .from('books')
      .select('id')
      .eq('isbn', isbn)
      .single()

    if (!book) {
      setError('Book not found in catalog')
      setLoading(false)
      return
    }

    // Then find active borrowing for this book
    const { data } = await supabase
      .from('borrowings')
      .select('*, book:books(*), resident:residents!borrowings_resident_id_fkey(flat_number, name)')
      .eq('book_id', book.id)
      .is('returned_at', null)
      .limit(1)
      .single()

    if (data) {
      setBorrowing(data)
      setMode('confirm')
    } else {
      setError('No active borrowing found for this book')
    }
    setLoading(false)
  }

  async function searchBorrowings(query: string) {
    setSearchQuery(query)
    if (query.length < 2) { setResults([]); return }

    // Get all active borrowings with book and resident info
    const { data } = await supabase
      .from('borrowings')
      .select('*, book:books(title, isbn), resident:residents!borrowings_resident_id_fkey(flat_number, name)')
      .is('returned_at', null)

    // Filter client-side since PostgREST doesn't support filtering on joined tables in .or()
    const filtered = (data || []).filter(d => {
      if (!d.book || !d.resident) return false
      const q = query.toLowerCase()
      return (
        (d.resident as any).flat_number.toLowerCase().includes(q) ||
        (d.resident as any).name.toLowerCase().includes(q) ||
        (d.book as any).title.toLowerCase().includes(q)
      )
    })

    setResults(filtered.slice(0, 10) as typeof results)
  }

  async function confirmReturn() {
    if (!borrowing) return

    // Prevent temp admins from returning their own books
    if (borrowing.resident_id === user?.id && resident?.role !== 'admin') {
      setError('You cannot return your own book as a volunteer. Ask another admin to process this return.')
      return
    }

    setLoading(true)

    const { error: updateErr } = await supabase
      .from('borrowings')
      .update({ returned_at: new Date().toISOString(), checked_in_by: user?.id })
      .eq('id', borrowing.id)

    if (updateErr) {
      setError('Failed to process return')
    } else {
      // Save condition note if provided
      if (conditionNote.trim()) {
        let photoUrl: string | null = null

        // Upload condition photo if provided
        if (conditionPhoto) {
          const filePath = `conditions/${borrowing.id}.${conditionPhoto.name.split('.').pop()}`
          const { error: uploadErr } = await supabase.storage
            .from('book-covers')
            .upload(filePath, conditionPhoto, { upsert: true })

          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filePath)
            photoUrl = urlData.publicUrl
          }
        }

        await supabase.from('book_conditions').insert({
          book_id: (borrowing as any).book_id || (borrowing as any).book?.id,
          noted_by: user?.id,
          borrowing_id: borrowing.id,
          note: conditionNote.trim() + (photoUrl ? `\n[Photo: ${photoUrl}]` : ''),
        })
      }
      setSuccess('✅ Book returned successfully!')
      setTimeout(() => {
        setMode('choose')
        setBorrowing(null)
        setConditionNote('')
        setConditionPhoto(null)
        setSuccess('')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Book Return</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 text-sm" role="status">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm" role="alert">
          {error}
        </div>
      )}

      {mode === 'choose' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">How would you like to find the borrowing?</p>
          <button
            onClick={() => setMode('scan')}
            data-testid="return-scan-button"
            className="w-full rounded-md bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700"
          >
            📷 Scan ISBN Barcode
          </button>
          <button
            onClick={() => setMode('search')}
            data-testid="return-search-button"
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700"
          >
            🔍 Search by Name/Flat
          </button>
        </div>
      )}

      {mode === 'scan' && (
        <div>
          <BarcodeScanner onScan={handleScan} onError={setError} />
          {loading && <p className="text-sm text-gray-500 mt-2">Looking up borrowing...</p>}
          <button onClick={() => setMode('choose')} className="mt-3 text-sm text-gray-500 underline">← Back</button>
        </div>
      )}

      {mode === 'search' && (
        <div className="space-y-3">
          <input
            type="text"
            data-testid="return-search-input"
            value={searchQuery}
            onChange={(e) => searchBorrowings(e.target.value)}
            placeholder="Search by flat number, name, or book title..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />

          {results.length > 0 && (
            <ul className="border rounded-md divide-y">
              {results.map(r => (
                <li key={r.id}>
                  <button
                    onClick={() => { setBorrowing(r as unknown as Borrowing); setMode('confirm') }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    <p className="font-medium">{r.book.title}</p>
                    <p className="text-gray-500">{r.resident.flat_number} — {r.resident.name} • Due: {new Date(r.due_at).toLocaleDateString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setMode('choose')} className="text-sm text-gray-500 underline">← Back</button>
        </div>
      )}

      {mode === 'confirm' && borrowing && (
        <div className="space-y-3">
          <div className="bg-gray-50 border rounded-md p-3 text-sm space-y-1">
            <p><span className="font-medium">Book:</span> {(borrowing as any).book?.title || 'Unknown'}</p>
            <p><span className="font-medium">Borrower:</span> {(borrowing as any).resident?.flat_number} — {(borrowing as any).resident?.name}</p>
            <p><span className="font-medium">Borrowed:</span> {new Date(borrowing.borrowed_at).toLocaleDateString()}</p>
            <p><span className="font-medium">Due:</span> {new Date(borrowing.due_at).toLocaleDateString()}</p>
          </div>

          <div>
            <label htmlFor="condition-note" className="block text-sm font-medium text-gray-700">
              Condition note (optional)
            </label>
            <input
              id="condition-note"
              data-testid="condition-note-input"
              type="text"
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Page 42 torn, spine cracked"
            />
          </div>

          {conditionNote.trim() && (
            <PhotoCapture onCapture={(file) => setConditionPhoto(file)} />
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setMode('choose')}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmReturn}
              data-testid="confirm-return-button"
              disabled={loading}
              className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
