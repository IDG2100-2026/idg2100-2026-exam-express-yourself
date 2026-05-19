import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, getUser } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import { useAppearance } from '../../context/AppearanceContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()
  const { loadAppearance } = useAppearance()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await loginUser(email, password)

      if (!response.ok) {
        setError(response.data.error || 'Login failed. Please try again.')
        return
      }

      const { userId, role } = response.data

      const userResponse = await getUser(userId)
      const { username = '', profileImageUrl = '', appearance } = userResponse.data

      login(userId, role, username, profileImageUrl)
      loadAppearance(appearance)
      navigate('/')
    } catch (err) {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__card">

        <h1 className="login__title">Log In</h1>
        <p className="login__subtitle">Welcome back to PokerDados</p>

        <form className="login__form" onSubmit={handleSubmit}>

          <div className="login__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="button" className="login__forgot">
            Forgot password?
          </button>

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

        </form>

        <p className="login__register">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
