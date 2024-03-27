import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { pieceId, stars } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        res.status(401).json({ message: 'Unauthorized' })
    }

    if (session !== null) {
        const rating = await prisma.pieceRating.findFirst({
            where: {
                pieceId: pieceId,
                authorId: session.user.id,
            },
        })

        if (rating === null) {
            const result = await prisma.pieceRating.create({
                data: {
                    piece: { connect: { id: pieceId } },
                    author: { connect: { id: session.user.id } },
                    stars: stars,
                },
            })
            res.json(result)
        } else if (stars !== rating.stars) {
            const result = await prisma.pieceRating.update({
                where: {
                    id: rating.id,
                },
                data: {
                    stars: stars,
                },
            })
            res.json(result)
        } else {
            res.json(rating)
        }
    }
}
