/**
 * Backfill cover URLs for books missing them by looking up Open Library API
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

async function lookupISBN(isbn: string) {
  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
    const data = await res.json()
    const book = data[`ISBN:${isbn}`]
    if (book) {
      return book.cover?.medium || null
    }
  } catch {}
  return null
}

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/books?select=id,isbn,title&cover_url=is.null&isbn=not.like.PP-*`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
  })
  const books = await res.json()
  console.log(`Found ${books.length} books without cover images`)

  let updated = 0
  for (const book of books) {
    const coverUrl = await lookupISBN(book.isbn)
    if (coverUrl) {
      await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${book.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ cover_url: coverUrl }),
      })
      console.log(`  ✓ ${book.title} → cover found`)
      updated++
    } else {
      console.log(`  ✗ ${book.title} → no cover on Open Library`)
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nDone! Updated ${updated}/${books.length} books with covers`)
}

main().catch(console.error)
