const BASE_URL = 'http://localhost:3000/api';
import { apiFetch } from "../../api.js";

export async function getComments(targetType, targetId) {
  const response = await fetch(`${BASE_URL}/comments?targetType=${targetType}&targetId=${targetId}`)
  const data = await response.json()
  return { data }
}

export async function postComment(text, targetType, targetId) {
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')

  const response = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-type': role || 'anonymous'
    },
    body: JSON.stringify({ text, targetType, targetId })
  })
  const data = await response.json()
  return { data }
}
