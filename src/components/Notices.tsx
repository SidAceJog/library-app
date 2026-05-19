import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Notice {
  id: string
  title: string
  body: string
  created_at: string
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notices')
        .select('id, title, body, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5)
      setNotices(data || [])
    }
    load()
  }, [])

  if (notices.length === 0) return null

  return (
    <section>
      <h3 className="font-semibold text-gray-700 mb-2">📢 Notices</h3>
      <ul className="bg-white border rounded-lg divide-y shadow-sm">
        {notices.map(n => (
          <li key={n.id} className="px-4 py-3">
            <p className="text-sm font-medium">{n.title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
