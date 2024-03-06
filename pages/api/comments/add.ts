import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { text, reviewId } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        res.status(401).json({ message: '401' })
    }

    if (session !== null) {
        const result = await prisma.reviewComment.create({
            data: {
                text,
                review: { connect: { id: reviewId } },
                author: { connect: { id: session.user.id } },
            },
        })
        res.json(result)
    }
}
