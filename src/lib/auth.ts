import { NextAuthOptions } from "next-auth"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "credentials",
      name: "credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, create or get user
        let user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0]
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    }
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string
        }
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}