import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body

    const session = await getServerSession(req, res, authOptions)

    if (session === null) {
        res.status(401).json({ message: '401' })
    }

    if (session !== null) {
        const review = await prisma.review.findUnique({
            where: {
                id: id,
            },
        })
        if (review?.authorId === session.user?.id) {
            const result = await prisma.review.delete({
                where: {
                    id: id
                }
            })
            res.json(result)
        } else {
            res.status(400).json({ message: 'Bad request' })
        }
    }
}
