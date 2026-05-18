const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

async function create() {
  const email = 'flatt001@society.library'
  const password = 'T-001'

  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  })

  const authUser = await authRes.json()
  if (!authRes.ok) { console.error('Auth failed:', authUser); return }
  console.log('Auth user created:', authUser.id)

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
      flat_number: 'T-001',
      name: 'Test Resident',
      whatsapp_number: '',
      email: '',
      role: 'resident',
      must_change_password: true,
    }),
  })

  if (profileRes.ok) {
    console.log('Done! Login: flat T-001, password: T-001')
  } else {
    console.error('Profile failed:', await profileRes.text())
  }
}

create()
