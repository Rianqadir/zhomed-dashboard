"use client"

import type { User } from "./types"

const AUTH_STORAGE_KEY = "zubair_homes_auth"

export async function login(email: string, password: string): Promise<{ user: Omit<User, "password"> | null; error: string | null }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { user: null, error: data.error || 'Login failed' }
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
    return { user: data, error: null }
  } catch (error: any) {
    console.error('Login error:', error)
    return { user: null, error: error.message || 'Network error. Please check your connection.' }
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
