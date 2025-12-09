import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
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
    strategy: "database"
  }
}