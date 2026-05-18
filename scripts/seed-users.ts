/**
 * Seed script to create 448 flat user accounts in Supabase.
 *
 * Usage:
 *   1. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY
 *   2. Run: npx tsx scripts/seed-users.ts
 *
 * Flat numbering:
 *   Buildings C-H: Ground (001-004) + Floors 1-11 (101-1104) = 48 flats each
 *   Buildings I-J: Floors 1-20 (101-2004) = 80 flats each
 *   Total: 448 flats
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables')
  process.exit(1)
}

function generateFlatNumbers(): string[] {
  const flats: string[] = []

  // Buildings C-H: Ground + Floors 1-11
  const buildingsCH = ['C', 'D', 'E', 'F', 'G', 'H']
  for (const b of buildingsCH) {
    // Ground floor: 001-004
    for (let unit = 1; unit <= 4; unit++) {
      flats.push(`${b}-00${unit}`)
    }
    // Floors 1-11
    for (let floor = 1; floor <= 11; floor++) {
      for (let unit = 1; unit <= 4; unit++) {
        flats.push(`${b}-${floor}0${unit}`)
      }
    }
  }

  // Buildings I-J: Floors 1-20 (no ground)
  const buildingsIJ = ['I', 'J']
  for (const b of buildingsIJ) {
    for (let floor = 1; floor <= 20; floor++) {
      for (let unit = 1; unit <= 4; unit++) {
        flats.push(`${b}-${floor}0${unit}`)
      }
    }
  }

  return flats
}

async function createUser(flatNumber: string) {
  // Email: flatten the flat number for email format
  const emailSlug = flatNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
  const email = `flat${emailSlug}@society.library`
  const password = flatNumber // Default password is the flat number

  // Create auth user
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  })

  if (!authRes.ok) {
    const err = await authRes.text()
    if (err.includes('already been registered')) {
      console.log(`  Skipped ${flatNumber} (already exists)`)
      return
    }
    console.error(`  Failed ${flatNumber}: ${err}`)
    return
  }

  const authUser = await authRes.json()

  // Create resident profile
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/residents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      id: authUser.id,
      flat_number: flatNumber,
      name: '',
      whatsapp_number: '',
      email: '',
      role: 'resident',
      must_change_password: true,
    }),
  })

  if (!profileRes.ok) {
    console.error(`  Profile failed for ${flatNumber}: ${await profileRes.text()}`)
  } else {
    console.log(`  Created ${flatNumber}`)
  }
}

async function main() {
  const flats = generateFlatNumbers()
  console.log(`Creating ${flats.length} user accounts...`)
  console.log(`Sample flats: ${flats.slice(0, 5).join(', ')} ... ${flats.slice(-5).join(', ')}`)

  // Process in batches of 10 to avoid rate limits
  for (let i = 0; i < flats.length; i += 10) {
    const batch = flats.slice(i, i + 10)
    await Promise.all(batch.map(createUser))
    console.log(`Progress: ${Math.min(i + 10, flats.length)}/${flats.length}`)
    // Small delay between batches
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n✅ Done!')
  console.log(`\nTotal flats created: ${flats.length}`)
  console.log('\nTo set the first admin, run this SQL in Supabase:')
  console.log(`  UPDATE residents SET role = 'admin' WHERE flat_number = 'C-001';`)
  console.log('\nLogin credentials:')
  console.log('  Flat C-001 → email: flatc001@society.library, password: C-001')
}

main().catch(console.error)
