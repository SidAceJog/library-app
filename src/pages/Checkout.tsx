import { useState } from 'react'
import BarcodeScanner from '@/components/BarcodeScanner'
import PhotoCapture from '@/components/PhotoCapture'
import { supabase } from '@/lib/supabase'
import { lookupISBN } from '@/lib/isbn'
import { useAuth } from '@/contexts/AuthContext'

type Step = 'scan' | 'photo' | 'select-resident' | 'confirm'

interface CheckoutState {
  isbn: string
  title: string
  author: string
  cover_url: string | null
  bookId: string | null
  residentId: string
  residentName: string
  dueWeeks: number
}

export default function Checkout() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('scan')
  const [state, setState] = useState<CheckoutState>({
    isbn: '', title: '', author: '', cover_url: null,
    bookId: null, residentId: '', residentName: '', dueWeeks: 2,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [residents, setResidents] = useState<{ id: string; flat_number: string; name: string }[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  async function handleScan(isbn: string) {
    setError('')
    setLoading(true)

    // Check if book exists in catalog
    const { data: existingBook } = await supabase
      .from('books')
      .select('*')
      .eq('isbn', isbn)
      .single()

    if (existingBook) {
      setState(s => ({ ...s, isbn, title: existingBook.title, author: existingBook.author, cover_url: existingBook.cover_url, bookId: existingBook.id }))
      setLoading(false)
      setStep('select-resident')
    } else {
      // Lookup from Open Library
      const meta = await lookupISBN(isbn)
      setState(s => ({ ...s, isbn, title: meta.title, author: meta.author, cover_url: meta.cover_url, bookId: null }))
      setLoading(false)
      setStep('photo')
    }
  }

  async function handlePhotoNext() {
    setLoading(true)
    let coverUrl = state.cover_url

    // Upload photo if provided
    if (photoFile) {
      const filePath = `${state.isbn}.${photoFile.name.split('.').pop()}`
      const { error: uploadErr } = await supabase.storage
        .from('book-covers')
        .upload(filePath, photoFile, { upsert: true })

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filePath)
        coverUrl = urlData.publicUrl
      }
    }

    // Add book to catalog
    const { data: newBook, error: insertErr } = await supabase
      .from('books')
      .insert({ isbn: state.isbn, title: state.title, author: state.author, cover_url: coverUrl })
      .select()
      .single()

    if (insertErr) {
      setError('Failed to add book to catalog')
      setLoading(false)
      return
    }

    setState(s => ({ ...s, bookId: newBook.id, cover_url: coverUrl }))
    setLoading(false)
    setStep('select-resident')
  }

  async function searchResidents(query: string) {
    setSearchQuery(query)
    if (query.length < 2) { setResidents([]); return }

    const { data } = await supabase
      .from('residents')
      .select('id, flat_number, name')
      .or(`flat_number.ilike.%${query}%,name.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(10)

    setResidents(data || [])
  }

  function selectResident(id: string, name: string, flat: string) {
    setState(s => ({ ...s, residentId: id, residentName: `${name} (${flat})` }))
    setStep('confirm')
  }

  async function confirmCheckout() {
    setError('')
    setLoading(true)

    // Check borrowing limit
    const { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'max_books_per_resident')
      .single()

    const maxBooks = parseInt(settings?.value || '1')

    const { count } = await supabase
      .from('borrowings')
      .select('*', { count: 'exact', head: true })
      .eq('resident_id', state.residentId)
      .is('returned_at', null)

    if ((count || 0) >= maxBooks) {
      setError(`This resident already has ${count} book(s) checked out (limit: ${maxBooks})`)
      setLoading(false)
      return
    }

    const dueAt = new Date()
    dueAt.setDate(dueAt.getDate() + state.dueWeeks * 7)

    const { error: borrowErr } = await supabase
      .from('borrowings')
      .insert({
        book_id: state.bookId,
        resident_id: state.residentId,
        due_at: dueAt.toISOString(),
        checked_out_by: user?.id,
      })

    if (borrowErr) {
      setError('Failed to create borrowing record')
    } else {
      setSuccess(`✅ "${state.title}" checked out to ${state.residentName}. Due: ${dueAt.toLocaleDateString()}`)
      // Reset for next checkout
      setTimeout(() => {
        setStep('scan')
        setState({ isbn: '', title: '', author: '', cover_url: null, bookId: null, residentId: '', residentName: '', dueWeeks: 2 })
        setSuccess('')
      }, 3000)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Book Checkout</h2>

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

      {step === 'scan' && (
        <div>
          <p className="text-sm text-gray-600 mb-3">Scan the book's ISBN barcode to begin checkout.</p>
          <BarcodeScanner onScan={handleScan} onError={setError} />
          {loading && <p className="text-sm text-gray-500 mt-2">Looking up book...</p>}
        </div>
      )}

      {step === 'photo' && (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm font-medium text-yellow-800">📚 New book detected!</p>
            <p className="font-medium mt-1">{state.title}</p>
            <p className="text-sm text-gray-600">by {state.author} • ISBN: {state.isbn}</p>
          </div>

          <PhotoCapture onCapture={(file) => setPhotoFile(file)} />

          <div className="flex gap-2">
            <button
              onClick={() => setStep('scan')}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handlePhotoNext}
              data-testid="photo-next-button"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : photoFile ? 'Save & Continue' : 'Skip Photo'}
            </button>
          </div>
        </div>
      )}

      {step === 'select-resident' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="font-medium">{state.title}</p>
            <p className="text-sm text-gray-600">by {state.author} • ISBN: {state.isbn}</p>
          </div>

          <div>
            <label htmlFor="resident-search" className="block text-sm font-medium text-gray-700">
              Search resident (flat number or name)
            </label>
            <input
              id="resident-search"
              data-testid="resident-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => searchResidents(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Type flat number or name..."
            />
          </div>

          {residents.length > 0 && (
            <ul className="border rounded-md divide-y">
              {residents.map(r => (
                <li key={r.id}>
                  <button
                    onClick={() => selectResident(r.id, r.name, r.flat_number)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    data-testid={`resident-option-${r.flat_number}`}
                  >
                    <span className="font-medium">{r.flat_number}</span> — {r.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setStep('scan')} className="text-sm text-gray-500 underline">
            ← Back to scan
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-3">
          <div className="bg-gray-50 border rounded-md p-3 space-y-1">
            <p><span className="font-medium">Book:</span> {state.title} ({state.isbn})</p>
            <p><span className="font-medium">Borrower:</span> {state.residentName}</p>
          </div>

          <div>
            <label htmlFor="due-weeks" className="block text-sm font-medium text-gray-700">
              Due in
            </label>
            <select
              id="due-weeks"
              data-testid="due-weeks-select"
              value={state.dueWeeks}
              onChange={(e) => setState(s => ({ ...s, dueWeeks: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value={1}>1 week</option>
              <option value={2}>2 weeks</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('select-resident')}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={confirmCheckout}
              data-testid="confirm-checkout-button"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
