const BASE_URL = 'http://localhost:3000/api'

export async function getMatches(status) {
  const response = await fetch(`${BASE_URL}/matches?status=${status}`)
  const data = await response.json()
  return { data }
}

export async function getPlayerMatches(playerId) {
  const response = await fetch(`${BASE_URL}/matches?playerId=${playerId}`)
  const data = await response.json()
  return { data }
}

export async function getMatch(id) {
  const response = await fetch(`${BASE_URL}/matches/${id}`)
  const data = await response.json()
  return { data }
}

export async function createMatch(rounds, rules, timeControl, allowAnonymous, desiredElo) {
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')

  const response = await fetch(`${BASE_URL}/matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-type': role || 'anonymous'
    },
    body: JSON.stringify({ rounds, rules, timeControl, allowAnonymous, desiredElo })
  })
  const data = await response.json()
  return { data }
}

export async function joinMatch(id) {
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')

  const response = await fetch(`${BASE_URL}/matches/${id}/join`, {
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
