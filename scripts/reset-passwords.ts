/**
 * Reset all users who haven't changed their password to Pass-{flat_number}
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

async function main() {
  // Get all residents who must still change password
  const res = await fetch(`${SUPABASE_URL}/rest/v1/residents?select=id,flat_number&must_change_password=eq.true`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  })

  const residents = await res.json()
  console.log(`Found ${residents.length} users who haven't changed password yet`)

  let success = 0
  let failed = 0

  for (let i = 0; i < residents.length; i += 10) {
    const batch = residents.slice(i, i + 10)
    await Promise.all(batch.map(async (r: { id: string; flat_number: string }) => {
      const newPassword = `Pass-${r.flat_number}`
      const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${r.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (updateRes.ok) {
        success++
      } else {
        const err = await updateRes.text()
        console.error(`  Failed ${r.flat_number}: ${err}`)
        failed++
      }
    }))
    console.log(`Progress: ${Math.min(i + 10, residents.length)}/${residents.length}`)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n✅ Done! ${success} passwords reset, ${failed} failed`)
  console.log('Default password format: Pass-{flat_number} (e.g., Pass-F-003)')
}

main().catch(console.error)
