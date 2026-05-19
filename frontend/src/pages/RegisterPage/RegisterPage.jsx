import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../api/users'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    setError('')
    setLoading(true)

    try {
      const birthDate = new Date(dateOfBirth)
      const age = Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000))

      if (age < 18) {
        setError('You must be 18 or older to register.')
        setLoading(false)
        return
      }

      const response = await registerUser(username, email, password, age)

      if (!response.ok) {
        setError(response.data.error || 'Registration failed. Please try again.')
        return
      }

      navigate('/login')
    } catch (err) {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register">
      <div className="register__card">

        <h1 className="register__title">Create Account</h1>
        <p className="register__subtitle">Join PokerDados today</p>

        <form className="register__form" onSubmit={handleSubmit}>

          <div className="register__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="coolplayer42"
              required
            />
          </div>

          <div className="register__field">
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

          <div className="register__field">
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

          <div className="register__field">
            <label htmlFor="confirmPassword">Repeat Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="register__checkbox">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms & Conditions</Link>
            </label>
          </div>

          {error && <p className="register__error">{error}</p>}

          <button type="submit" className="register__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p className="register__login">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage
