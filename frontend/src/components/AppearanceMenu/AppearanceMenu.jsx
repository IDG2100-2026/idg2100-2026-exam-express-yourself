import { useState } from 'react'
import { useAppearance } from '../../context/AppearanceContext'

const BOARD_COLORS = [
  { label: 'Navy',  value: '#1c2130' },
  { label: 'Green', value: '#1a3a2a' },
  { label: 'Red',   value: '#3a1a1a' },
  { label: 'Purple',value: '#2a1a3a' },
  { label: 'Grey',  value: '#2a2a2a' },
]

function AppearanceMenu() {
  const [open, setOpen] = useState(false)
  const { theme, updateTheme, boardColor, updateBoardColor, sound, updateSound, lobbySize, updateLobbySize } = useAppearance()

  return (
    <div className="appearance">
      <button className="appearance__toggle" onClick={() => setOpen(!open)}>
        ⚙ Appearance
      </button>

      {open && (
        <div className="appearance__menu">

          <div className="appearance__row">
            <span className="appearance__label">Theme</span>
            <div className="appearance__options">
              <button
                className={`appearance__btn ${theme === 'dark' ? 'appearance__btn--active' : ''}`}
                onClick={() => updateTheme('dark')}
              >
                Dark
              </button>
              <button
                className={`appearance__btn ${theme === 'light' ? 'appearance__btn--active' : ''}`}
                onClick={() => updateTheme('light')}
              >
                Light
              </button>
            </div>
          </div>

          <div className="appearance__row">
            <span className="appearance__label">Board colour</span>
            <div className="appearance__colors">
              {BOARD_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  className={`appearance__color ${boardColor === c.value ? 'appearance__color--active' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => updateBoardColor(c.value)}
                />
              ))}
            </div>
          </div>

          <div className="appearance__row">
            <span className="appearance__label">Sound</span>
            <button
              className={`appearance__btn ${sound ? 'appearance__btn--active' : ''}`}
              onClick={() => updateSound(!sound)}
            >
              {sound ? 'On' : 'Off'}
            </button>
          </div>

          <div className="appearance__row">
            <span className="appearance__label">Lobby preview ({lobbySize})</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lobbySize}
              onChange={(e) => updateLobbySize(parseInt(e.target.value))}
              className="appearance__slider"
            />
          </div>

        </div>
      )}
    </div>
  )
}

export default AppearanceMenu
