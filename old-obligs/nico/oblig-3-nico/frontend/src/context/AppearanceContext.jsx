import { createContext, useContext, useState, useEffect } from 'react'
import { updateUser } from '../api/users'

const AppearanceContext = createContext(null)

function AppearanceProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [boardColor, setBoardColor] = useState(localStorage.getItem('boardColor') || '#1c2130')
  const [sound, setSound] = useState(localStorage.getItem('sound') !== 'false')
  const [lobbySize, setLobbySize] = useState(parseInt(localStorage.getItem('lobbySize')) || 5)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  function syncToBackend(updated) {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    updateUser(userId, { appearance: updated })
  }

  function updateTheme(value) {
    setTheme(value)
    localStorage.setItem('theme', value)
    syncToBackend({ theme: value, boardColor, sound, lobbySize })
  }

  function updateBoardColor(value) {
    setBoardColor(value)
    localStorage.setItem('boardColor', value)
    syncToBackend({ theme, boardColor: value, sound, lobbySize })
  }

  function updateSound(value) {
    setSound(value)
    localStorage.setItem('sound', value)
    syncToBackend({ theme, boardColor, sound: value, lobbySize })
  }

  function updateLobbySize(value) {
    setLobbySize(value)
    localStorage.setItem('lobbySize', value)
    syncToBackend({ theme, boardColor, sound, lobbySize: value })
  }

  function loadAppearance(appearance) {
    if (!appearance) return
    if (appearance.theme) {
      setTheme(appearance.theme)
      localStorage.setItem('theme', appearance.theme)
    }
    if (appearance.boardColor) {
      setBoardColor(appearance.boardColor)
      localStorage.setItem('boardColor', appearance.boardColor)
    }
    if (appearance.sound !== undefined) {
      setSound(appearance.sound)
      localStorage.setItem('sound', appearance.sound)
    }
    if (appearance.lobbySize) {
      setLobbySize(appearance.lobbySize)
      localStorage.setItem('lobbySize', appearance.lobbySize)
    }
  }

  return (
    <AppearanceContext.Provider value={{
      theme, updateTheme,
      boardColor, updateBoardColor,
      sound, updateSound,
      lobbySize, updateLobbySize,
      loadAppearance
    }}>
      {children}
    </AppearanceContext.Provider>
  )
}

function useAppearance() {
  return useContext(AppearanceContext)
}

export { AppearanceProvider, useAppearance }
