import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CatalogBook {
  id: string
  isbn: string
  title: string
  author: string
  cover_url: string | null
  added_at: string
  is_available: boolean
}

export default function Catalog() {
  const { isAdmin } = useAuth()
  const [books, setBooks] = useState<CatalogBook[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBooks() }, [])

  async function loadBooks() {
    // Get all books (only active ones for catalog)
    const { data: allBooks } = await supabase
      .from('books')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true })

    // Get currently borrowed book IDs
    const { data: borrowed } = await supabase
      .from('borrowings')
      .select('book_id')
      .is('returned_at', null)

    const borrowedIds = new Set((borrowed || []).map(b => b.book_id))

    setBooks((allBooks || []).map(book => ({
      ...book,
      is_available: !borrowedIds.has(book.id),
    })))
    setLoading(false)
  }

  async function markUnavailable(bookId: string, reason: string) {
    await supabase.from('books').update({ is_active: false, inactive_reason: reason }).eq('id', bookId)
    setBooks(books.filter(b => b.id !== bookId))
  }

  const filtered = search.length < 2
    ? books
    : books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.includes(search)
      )

  if (loading) return <p className="text-gray-500 p-4">Loading catalog...</p>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Book Catalog</h2>

      <input
        type="text"
        data-testid="catalog-search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, author, or ISBN..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      <p className="text-xs text-gray-500">{filtered.length} book{filtered.length !== 1 ? 's' : ''} in catalog</p>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">
          {books.length === 0 ? 'No books in catalog yet. Books are added when checked out for the first time.' : 'No books match your search.'}
        </p>
      ) : (
        <ul className="grid gap-3">
          {filtered.map(book => (
            <li key={book.id} className="bg-white border rounded-lg p-3 shadow-sm flex gap-3">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded shrink-0"
                />
              ) : (
                <div className="w-16 h-20 bg-gray-100 rounded shrink-0 flex items-center justify-center text-2xl">
                  📖
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
                <p className="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded ${book.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {book.is_available ? 'Available' : 'Checked out'}
                  </span>
                  {isAdmin && (
                    <select
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) markUnavailable(book.id, e.target.value); e.target.value = '' }}
                      className="text-xs border border-gray-300 rounded px-1 py-0.5 text-red-600"
                    >
                      <option value="" disabled>Remove...</option>
                      <option value="lost">Lost</option>
                      <option value="torn">Torn/Damaged</option>
                      <option value="donated_away">Donated away</option>
                      <option value="other">Other</option>
                    </select>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
