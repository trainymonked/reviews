import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { preferredLocale } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        res.status(401).json({ message: 'Unauthorized' })
    }

    if (session !== null) {
        const result = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                preferredLocale,
            },
        })
        res.json(result)
    }
}
