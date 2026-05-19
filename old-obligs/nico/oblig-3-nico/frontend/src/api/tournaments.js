const BASE_URL = 'http://localhost:3000/api'

export async function getTournaments() {
  const response = await fetch(`${BASE_URL}/tournaments`)
  const data = await response.json()
  return { data }
}

export async function getTournament(id) {
  const response = await fetch(`${BASE_URL}/tournaments/${id}`)
  const data = await response.json()
  return { data }
}

export async function joinTournament(id) {
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')

  const response = await fetch(`${BASE_URL}/tournaments/${id}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-type': role || 'anonymous'
    }
  })
  const data = await response.json()
  return { data }
}
