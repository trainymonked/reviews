import { NextApiHandler } from 'next'
import NextAuth, { NextAuthOptions, Session } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import TwitterProvider from 'next-auth/providers/twitter'
import DiscordProvider from 'next-auth/providers/discord'

import prisma from '../../../lib/prisma'

export const authOptions: NextAuthOptions = {
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID || '',
            clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
            version: '2.0',
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || '',
            clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || '',
        }),
        // EmailProvider({
        //     server: process.env.EMAIL_SERVER,
        //     from: process.env.EMAIL_FROM
        // }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, user }: { session: Session, user: any }) {
            session.user.id = user.id
            session.user.isAdmin = user.isAdmin
            session.user.preferredLocale = user.preferredLocale

            return session
        },
    },
}

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, authOptions)
export default authHandler
