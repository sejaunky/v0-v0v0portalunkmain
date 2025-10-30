import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        if (!isSupabaseConfigured()) {
          console.error("[v0] Database not configured")
          return false
        }
        const supabase = await supabaseServer()
        if (!supabase) return false

        const { data: existingUser, error: existingError } = await supabase.from('users').select('id, role').eq('email', user.email).limit(1)
        if (existingError) throw existingError

        if (!existingUser || existingUser.length === 0) {
          const { data: newUser, error: insertError } = await supabase.from('users').insert([{ email: user.email, name: user.name, image: user.image, role: 'producer' }]).select()
          if (insertError) throw insertError
          user.id = newUser && newUser[0] && newUser[0].id

          await supabase.from('user_profiles').insert([{ user_id: user.id, name: user.name || '', avatar: user.image }])
        } else {
          user.id = existingUser[0].id
        }

        if (account) {
          // upsert account info
          const accountRow: any = {
            user_id: user.id,
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          }
          const { error: upsertError } = await supabase.from('accounts').upsert([accountRow], { onConflict: 'provider,provider_account_id' })
          if (upsertError) throw upsertError
        }

        return true
      } catch (error) {
        console.error("[v0] Error in signIn callback:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          if (!isSupabaseConfigured()) {
            console.error("[v0] Database not configured")
            return session
          }
          const supabase = await supabaseServer()
          if (!supabase) return session

          const { data, error } = await supabase
            .from('users')
            .select('id, email, name, image, role, created_at, user_profiles(id, name, phone, avatar)')
            .eq('id', token.sub)
            .limit(1)

          if (error) throw error

          const user = Array.isArray(data) ? data[0] : data

          if (user) {
            session.user.id = user.id
            session.user.email = user.email
            session.user.name = user.name
            session.user.image = user.image
            session.user.role = user.role
            session.user.createdAt = user.created_at
            const profile = user.user_profiles && user.user_profiles[0]
            session.user.profile = profile ? { id: profile.id, userId: user.id, name: profile.name, phone: profile.phone, avatar: profile.avatar } : undefined
          }
        } catch (error) {
          console.error("[v0] Error in session callback:", error)
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}
