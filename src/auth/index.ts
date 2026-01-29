import { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { type TokenWithKeys, type UserWithKeys } from '@/types/auth'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'nostr',
      credentials: {
        publicKey: {
          label: 'Public Key',
          type: 'text',
          placeholder: 'npub...',
        },
        secretKey: {
          label: 'Secret Key',
          type: 'text',
          placeholder: 'nsec...',
        },
      },
      async authorize(credentials) {
        if (!credentials) return null
        if (!credentials.publicKey && !credentials.secretKey) return null

        if (credentials.publicKey && !credentials.secretKey) {
          return {
            id: credentials.publicKey,
            publicKey: credentials.publicKey,
            secretKey: '',
          }
        }

        if (credentials.publicKey && credentials.secretKey) {
          return {
            id: credentials.publicKey,
            publicKey: credentials.publicKey,
            secretKey: credentials.secretKey,
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.publicKey = (user as UserWithKeys).publicKey
        token.secretKey = (user as UserWithKeys).secretKey
      }
      return token
    },
    async session({ session, token }) {
      const user = session.user as UserWithKeys
      user.publicKey = (token as TokenWithKeys).publicKey
      user.secretKey = (token as TokenWithKeys).secretKey
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
