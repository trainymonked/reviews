import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { titleEn, descriptionEn, titleRu, descriptionRu, groupId } = req.body

    const session = await getServerSession(req, res, authOptions)

    if (session === null) {
        return res.status(401).json({ message: '401' })
    }

    if (session !== null) {
        const result = await prisma.piece.create({
            data: {
                titleEn,
                descriptionEn,
                titleRu,
                descriptionRu,
                group: { connect: { id: groupId } },
                author: { connect: { id: session.user?.id } },
            },
        })
        console.log(result)
        return res.json(result)
    }
}
