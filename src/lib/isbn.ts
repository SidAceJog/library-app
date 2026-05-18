// Fetch book metadata from Open Library API
export async function lookupISBN(isbn: string): Promise<{ title: string; author: string; cover_url: string | null }> {
  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
    const data = await res.json()
    const book = data[`ISBN:${isbn}`]

    if (book) {
      return {
        title: book.title || 'Unknown Title',
        author: book.authors?.[0]?.name || 'Unknown Author',
        cover_url: book.cover?.medium || null,
      }
    }
  } catch {
    // API failure is non-critical
  }

  return { title: 'Unknown Title', author: 'Unknown Author', cover_url: null }
}
