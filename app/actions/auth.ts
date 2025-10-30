"use server"

"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, password_hash, role, name')
      .eq('email', email)
      .limit(1)

    if (error) throw error

    if (!users || users.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = users[0]

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function register(email: string, password: string, name?: string, role?: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (existingError) throw existingError

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: "User already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: newUsers, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        name: name || email,
        role: role || 'user'
      }])
      .select()

    if (error) throw error

    const user = newUsers && newUsers[0]

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('user_session')
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')

    if (!userSession) {
      return null
    }

    const user = JSON.parse(userSession.value)
    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function getProfile(): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Get profile error:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    if (!email) {
      return { success: false, error: "Email is required" }
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (!users || users.length === 0) {
      return { success: true, message: "If the email exists, you will receive a password reset link" }
    }

    return { success: true, message: "Password reset link sent to your email" }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token || !newPassword) {
      return { success: false, error: "Token and new password are required" }
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "Internal server error" }
  }
}
