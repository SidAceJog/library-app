import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface WishlistItem {
  id: string
  title: string
  author: string
  requested_by: string
  upvotes: number
  status: 'open' | 'acquired' | 'closed'
  created_at: string
  requester?: { flat_number: string; name: string }
  user_voted?: boolean
}

export default function Wishlist() {
  const { user, isAdmin } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set())
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function loadWishlist() {
    const { data } = await supabase
      .from('wishlist')
      .select('*, requester:residents!wishlist_requested_by_fkey(flat_number, name)')
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })

    setItems((data || []) as any)

    // Load user's votes
    if (user) {
      const { data: votes } = await supabase
        .from('wishlist_votes')
        .select('wishlist_id')
        .eq('resident_id', user.id)
      setMyVotes(new Set((votes || []).map(v => v.wishlist_id)))
    }
    setLoading(false)
  }

  useEffect(() => { loadWishlist() }, [user])

  async function addWish(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)

    const { data: newItem } = await supabase
      .from('wishlist')
      .insert({ title: title.trim(), author: author.trim(), requested_by: user!.id })
      .select()
      .single()

    if (newItem) {
      // Auto-vote for your own wish
      await supabase.from('wishlist_votes').insert({ wishlist_id: newItem.id, resident_id: user!.id })
    }

    setTitle('')
    setAuthor('')
    setShowForm(false)
    setAdding(false)
    loadWishlist()
  }

  async function toggleVote(itemId: string) {
    if (myVotes.has(itemId)) {
      await supabase.from('wishlist_votes').delete().eq('wishlist_id', itemId).eq('resident_id', user!.id)
      myVotes.delete(itemId)
    } else {
      await supabase.from('wishlist_votes').insert({ wishlist_id: itemId, resident_id: user!.id })
      myVotes.add(itemId)
    }
    setMyVotes(new Set(myVotes))
    loadWishlist()
  }

  async function markAcquired(itemId: string) {
    await supabase.from('wishlist').update({ status: 'acquired' }).eq('id', itemId)
    loadWishlist()
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Book Wishlist</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="wishlist-add-button"
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          + Request Book
        </button>
      </div>

      {showForm && (
        <form onSubmit={addWish} className="bg-white border rounded-lg p-4 space-y-3">
          <div>
            <label htmlFor="wish-title" className="block text-sm font-medium text-gray-700">Book Title</label>
            <input
              id="wish-title"
              data-testid="wishlist-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Atomic Habits"
            />
          </div>
          <div>
            <label htmlFor="wish-author" className="block text-sm font-medium text-gray-700">Author (optional)</label>
            <input
              id="wish-author"
              data-testid="wishlist-author-input"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="e.g. James Clear"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            data-testid="wishlist-submit-button"
            className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Submit Request'}
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">No book requests yet. Be the first to suggest one!</p>
      ) : (
        <ul className="bg-white border rounded-lg divide-y shadow-sm">
          {items.map(item => (
            <li key={item.id} className="px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => toggleVote(item.id)}
                className={`flex flex-col items-center min-w-[40px] py-1 rounded ${myVotes.has(item.id) ? 'text-blue-600' : 'text-gray-400'}`}
                data-testid={`wishlist-vote-${item.id}`}
              >
                <span className="text-lg">▲</span>
                <span className="text-xs font-bold">{item.upvotes}</span>
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.status === 'acquired' ? 'line-through text-gray-400' : ''}`}>
                  {item.title}
                  {item.status === 'acquired' && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded no-underline inline-block">✓ Acquired</span>}
                </p>
                {item.author && <p className="text-xs text-gray-500">by {item.author}</p>}
                <p className="text-xs text-gray-400">Requested by {item.requester?.name || item.requester?.flat_number || 'Unknown'}</p>
              </div>
              {isAdmin && item.status === 'open' && (
                <button
                  onClick={() => markAcquired(item.id)}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                >
                  Mark Acquired
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
