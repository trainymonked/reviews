import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'

import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, title, text, grade, images, oldImages, tags, pieceId } = req.body

    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session === null) {
        return res.status(401).json({ message: '401' })
    }

    const review = await prisma.review.findUnique({
        where: {
            id: id,
        },
    })

    if (review?.authorId !== session.user.id && !session.user.isAdmin) {
        return res.status(400).json({ message: 'Bad request' })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const imagesToRemove = oldImages.filter((oldImg: any) => !images.includes(oldImg.fullPath))

    if (imagesToRemove.length) {
        await supabase.storage.from('review_images').remove(imagesToRemove.map((i: any) => i.path))
    }

    const result = await prisma.review.update({
        where: {
            id: id,
        },
        data: {
            title,
            text,
            grade: String(grade),
            images,
            // tags: tags,
            piece: { connect: { id: pieceId } },
            author: { connect: { id: review?.authorId } },
        },
    })

    return res.json(result)
}
