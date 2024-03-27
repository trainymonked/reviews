import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const comment = await prisma.reviewComment.findUnique({
        where: {
            id: id,
        },
    })

    if (comment?.authorId === session.user.id || session.user.isAdmin) {
        const result = await prisma.reviewComment.delete({
            where: {
                id: id,
            },
        })
        return res.json(result)
    }

    return res.status(400).json({ message: 'Bad request' })
}
