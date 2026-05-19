const BASE_URL = 'http://localhost:3000/api'

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await response.json()
  return { ok: response.ok, data }
}

export async function registerUser(username, email, password, age) {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, age })
  })
  const data = await response.json()
  return { ok: response.ok, data }
}

export async function getUser(userId) {
  const response = await fetch(`${BASE_URL}/users/${userId}`)
  const data = await response.json()
  return { ok: response.ok, data }
}

export async function updateUser(userId, updates) {
  const role = localStorage.getItem('role')

  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-type': role || 'user'
    },
    body: JSON.stringify(updates)
  })
  const data = await response.json()
  return { ok: response.ok, data }
}
