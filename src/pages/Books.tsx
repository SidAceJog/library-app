import { useState } from 'react'
import Catalog from './Catalog'
import Wishlist from './Wishlist'

export default function Books() {
  const [tab, setTab] = useState<'catalog' | 'wishlist'>('catalog')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('catalog')}
          className={`text-sm px-4 py-1.5 rounded-full font-medium ${tab === 'catalog' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Catalog
        </button>
        <button
          onClick={() => setTab('wishlist')}
          className={`text-sm px-4 py-1.5 rounded-full font-medium ${tab === 'wishlist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          Wishlist
        </button>
      </div>
      {tab === 'catalog' && <Catalog />}
      {tab === 'wishlist' && <Wishlist />}
    </div>
  )
}
