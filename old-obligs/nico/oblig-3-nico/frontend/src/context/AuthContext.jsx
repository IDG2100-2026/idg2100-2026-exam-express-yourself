import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [userId, setUserId] = useState(localStorage.getItem('userId'))
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [username, setUsername] = useState(localStorage.getItem('username'))
  const [profileImageUrl, setProfileImageUrl] = useState(localStorage.getItem('profileImageUrl') || '')

  function login(userId, role, username, profileImageUrl = '') {
    if (!userId) return
    localStorage.setItem('userId', String(userId))
    localStorage.setItem('role', role)
    localStorage.setItem('username', username)
    localStorage.setItem('profileImageUrl', profileImageUrl)
    setUserId(String(userId))
    setRole(role)
    setUsername(username)
    setProfileImageUrl(profileImageUrl)
  }

  function logout() {
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    localStorage.removeItem('profileImageUrl')
    setUserId(null)
    setRole(null)
    setUsername(null)
    setProfileImageUrl('')
  }

  function updateProfileImage(url) {
    localStorage.setItem('profileImageUrl', url)
    setProfileImageUrl(url)
  }

  const isLoggedIn = userId !== null

  return (
    <AuthContext.Provider value={{ userId, role, username, profileImageUrl, isLoggedIn, login, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }
