import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { title, text, grade, images, tags } = req.body

    const session = await getServerSession(req, res, authOptions)

    if (session === null) {
        res.status(401).json({ message: '401' })
    }

    if (session !== null) {
        const result = await prisma.review.create({
            data: {
                title: title,
                text: text,
                grade: String(grade),
                images: images,
                // tags: tags,
                author: { connect: { email: session?.user?.email || '' } },
            },
        })
        res.json(result)
    }
}
