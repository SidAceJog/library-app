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
  borrower_flat?: string
}

export default function Catalog() {
  const { isAdmin } = useAuth()
  const [books, setBooks] = useState<CatalogBook[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')

  useEffect(() => { loadBooks() }, [])

  async function loadBooks() {
    // Get all books (only active ones for catalog)
    const { data: allBooks } = await supabase
      .from('books')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true })

    // Get currently borrowed book IDs with borrower flat numbers
    const { data: borrowed } = await supabase
      .from('borrowings')
      .select('book_id, resident:residents!borrowings_resident_id_fkey(flat_number)')
      .is('returned_at', null)

    const borrowedMap = new Map<string, string>()
    for (const b of borrowed || []) {
      borrowedMap.set(b.book_id, (b.resident as any)?.flat_number || '?')
    }

    setBooks((allBooks || []).map(book => ({
      ...book,
      is_available: !borrowedMap.has(book.id),
      borrower_flat: borrowedMap.get(book.id),
    })))
    setLoading(false)
  }

  async function markUnavailable(bookId: string, reason: string) {
    await supabase.from('books').update({ is_active: false, inactive_reason: reason }).eq('id', bookId)
    setBooks(books.filter(b => b.id !== bookId))
  }

  function startEdit(book: CatalogBook) {
    setEditingId(book.id)
    setEditTitle(book.title)
    setEditAuthor(book.author)
  }

  async function saveEdit(bookId: string) {
    if (!editTitle.trim()) return
    await supabase.from('books').update({ title: editTitle.trim(), author: editAuthor.trim() }).eq('id', bookId)
    setBooks(books.map(b => b.id === bookId ? { ...b, title: editTitle.trim(), author: editAuthor.trim() } : b))
    setEditingId(null)
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
                {editingId === book.id ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      placeholder="Author"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(book.id)} className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-2 py-0.5">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    <p className="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>
                    {isAdmin && (book.title === 'Unknown Title' || book.author === 'Unknown Author') && (
                      <button onClick={() => startEdit(book)} className="text-xs text-blue-600 underline mt-0.5">Edit details</button>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {book.is_available ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Available</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                      Checked out{book.borrower_flat ? ` • ${book.borrower_flat}` : ''}
                    </span>
                  )}
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
                  {isAdmin && editingId !== book.id && !(book.title === 'Unknown Title' || book.author === 'Unknown Author') && (
                    <button onClick={() => startEdit(book)} className="text-xs text-blue-600 underline">Edit</button>
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
