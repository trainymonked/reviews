import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { reviewId } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        res.status(401).json({ message: '401' })
    }

    if (session !== null) {
        const like = await prisma.reviewLike.findFirst({
            where: {
                reviewId: reviewId,
                authorId: session.user.id,
            },
        })

        if (like === null) {
            const result = await prisma.reviewLike.create({
                data: {
                    review: { connect: { id: reviewId } },
                    author: { connect: { id: session.user.id } },
                    liked: true,
                },
            })
            res.json(result)
        } else {
            const result = await prisma.reviewLike.update({
                where: {
                    id: like.id,
                },
                data: {
                    liked: !like.liked,
                },
            })
            res.json(result)
        }
    }
}
