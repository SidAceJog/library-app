import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [flatNumber, setFlatNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Email format: flat{number}@society.library (strip non-alphanumeric to match seed)
    const email = `flat${flatNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@society.library`
    const { error } = await signIn(email, password)
    
    if (error) setError('Invalid flat number or password')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="Pride Platinum Library" className="w-24 h-24 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-gray-900">Pride Platinum Library</h1>
          <p className="mt-1 text-xs text-gray-500">Baner, Pune</p>
          <p className="mt-2 text-sm font-medium text-blue-800 bg-blue-50 rounded px-3 py-1.5">📍 Open daily 7–8 PM | New Society Office</p>
          <p className="mt-2 text-sm text-gray-600">Sign in with your flat number</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="flat-number" className="block text-sm font-medium text-gray-700">
              Flat Number
            </label>
            <input
              id="flat-number"
              data-testid="login-flat-number-input"
              type="text"
              required
              autoComplete="username"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. F-602"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              data-testid="login-password-input"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter password"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Show password</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <button
            type="submit"
            data-testid="login-submit-button"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="bg-gray-100 rounded-lg p-4 space-y-2 text-xs text-gray-600">
          <p><strong>Username:</strong> Your flat number (e.g. F-602)</p>
          <p><strong>Password:</strong> For your first-time password, WhatsApp:</p>
          <ul className="pl-3 space-y-0.5">
            <li>• Chaitanya Govande (<a href="https://wa.me/917722009383" className="text-blue-600 underline">+91 7722009383</a>)</li>
            <li>• Vaibhav Dugar (<a href="https://wa.me/919967589210" className="text-blue-600 underline">+91 9967589210</a>)</li>
            <li>• Siddhesh Jog (<a href="https://wa.me/919175558996" className="text-blue-600 underline">+91 9175558996</a>)</li>
          </ul>
          <hr className="border-gray-200 my-2" />
          <p>Once logged in, make sure to check out the <a href="/rules" className="text-blue-600 underline font-medium">Rules</a>.</p>
          <p>You can browse the <strong>Catalog</strong>, request books through <strong>Wishlist</strong>, volunteer to be the librarian (admin) for a day, and submit <strong>Suggestions</strong> — all through the app.</p>
          <p className="text-gray-500 italic">Suggestions may or may not be acted upon at the discretion of the library team. Any voluntary help is welcome. Enjoy the library!</p>
        </div>
      </div>
    </div>
  )
}
