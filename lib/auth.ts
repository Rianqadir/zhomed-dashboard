"use client"

import type { User } from "./types"

const AUTH_STORAGE_KEY = "zubair_homes_auth"

export async function login(email: string, password: string): Promise<Omit<User, "password"> | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    return user
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getCurrentUser(): Omit<User, "password"> | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
