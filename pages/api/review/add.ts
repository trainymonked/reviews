import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handle(req, res) {
    const { title, text } = req.body

    const session = await getSession({ req })
    const result = await prisma.review.create({
        data: {
            title: title,
            text: text,
            author: { connect: { email: session?.user?.email } },
        },
    })
    res.json(result)
}
