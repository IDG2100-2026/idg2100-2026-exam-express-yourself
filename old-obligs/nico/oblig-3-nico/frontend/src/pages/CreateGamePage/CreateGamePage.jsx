import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMatch } from '../../api/matches'
import { useAuth } from '../../context/AuthContext'

function OptionGroup({ label, options, selected, onChange }) {
  return (
    <div className="create__group">
      <p className="create__group-label">{label}</p>
      <div className="create__options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`create__option ${selected === option.value ? 'create__option--selected' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CreateGamePage() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [rounds, setRounds] = useState(3)
  const [rules, setRules] = useState('straights')
  const [timeControl, setTimeControl] = useState(10)
  const [allowAnonymous, setAllowAnonymous] = useState(true)
  const [desiredElo, setDesiredElo] = useState(1000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await createMatch(rounds, rules, timeControl, allowAnonymous, desiredElo)
      navigate(`/game/${response.data._id}`)
    } catch (err) {
      setError('Could not create game. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create">
      <h1 className="create__title">Create a New Game</h1>
      <p className="create__subtitle">Choose your settings. You will be Player 1.</p>

      <form className="create__form" onSubmit={handleSubmit}>

        <OptionGroup
          label="Best of"
          options={[
            { label: 'Best of 3', value: 3 },
            { label: 'Best of 5', value: 5 },
            { label: 'Best of 7', value: 7 },
          ]}
          selected={rounds}
          onChange={setRounds}
        />

        <OptionGroup
          label="Straights rule"
          options={[
            { label: 'Straights allowed', value: 'straights' },
            { label: 'No straights', value: 'no-straights' },
          ]}
          selected={rules}
          onChange={setRules}
        />

        <OptionGroup
          label="Seconds per round"
          options={[
            { label: '5 seconds', value: 5 },
            { label: '10 seconds', value: 10 },
            { label: '15 seconds', value: 15 },
          ]}
          selected={timeControl}
          onChange={setTimeControl}
        />

        {isLoggedIn && (
          <>
            <div className="create__group">
              <p className="create__group-label">Desired opponent Elo: {desiredElo}</p>
              <input
                type="range"
                min="800"
                max="2000"
                step="50"
                value={desiredElo}
                onChange={(e) => setDesiredElo(parseInt(e.target.value))}
                className="create__slider"
              />
              <p className="create__slider-hint">Any Elo accepted if no match found</p>
            </div>

            <div className="create__checkbox">
              <input
                id="allowAnonymous"
                type="checkbox"
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
              />
              <label htmlFor="allowAnonymous">Allow anonymous players to join</label>
            </div>
          </>
        )}

        {error && <p className="create__error">{error}</p>}

        <button type="submit" className="create__submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Game'}
        </button>

      </form>
    </div>
  )
}

export default CreateGamePage
