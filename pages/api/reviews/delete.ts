import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        return res.status(401).json({ message: '401' })
    }

    const review = await prisma.review.findUnique({
        where: {
            id: id,
        },
    })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    if (review?.images.length) {
        await supabase.storage.from('review_images').remove(review.images.map(i => i.match(/[^/]+$/)![0]))
    }

    if (review?.authorId === session.user.id) {
        const result = await prisma.review.delete({
            where: {
                id: id,
            },
        })
        return res.json(result)
    }

    return res.status(400).json({ message: 'Bad request' })
}
