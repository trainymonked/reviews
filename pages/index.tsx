import { FC } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import Head from 'next/head'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { Box, Button, Typography } from '@mui/material'
import { useIntl } from 'react-intl'

import Layout from '../components/Layout'
import Review, { IReview } from '../components/Review'
import prisma from '../lib/prisma'
import Link from '../components/Link'
import { authOptions } from './api/auth/[...nextauth]'

export async function getServerSideProps({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
    const session = await getServerSession(req, res, authOptions)

    const reviews = await prisma.review.findMany({
        include: {
            piece: true,
            author: {
                select: {
                    bio: true,
                    id: true,
                    image: true,
                    name: true,
                    registrationDate: true,
                    reviewComments: true,
                    reviews: true,
                },
            },
            likes: true,
            comments: true,
        },
    })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const reviewsWithImageUrls = reviews.map(review => {
        const imageUrls = review.images.map(
            i => supabase.storage.from('review_images').getPublicUrl(i.match(/[^/]+$/)![0]).data.publicUrl
        )

        if (review.images) {
            return { ...review, images: imageUrls }
        }

        return { ...review }
    })

    return {
        props: {
            reviews: reviewsWithImageUrls.map(review => ({
                ...review,
                images: review.images || [],
                author: {
                    ...review.author,
                    registrationDate: Date.parse(review.author.registrationDate.toJSON()),
                    reviews: review.author.reviews.map(r => ({
                        ...r,
                        creationDate: Date.parse(r.creationDate.toJSON()),
                    })),
                    reviewComments: review.author.reviewComments.map(rc => ({
                        ...rc,
                        creationDate: Date.parse(rc.creationDate.toJSON()),
                    })),
                },
                creationDate: Date.parse(review.creationDate.toJSON()),
                piece: {
                    ...review.piece,
                    creationDate: Date.parse(review.piece.creationDate.toJSON()),
                },
                comments: review.comments.map(c => ({
                    ...c,
                    creationDate: Date.parse(c.creationDate.toJSON()),
                })),
            })),
            isAuthenticated: !!session,
        },
    }
}

type Props = {
    reviews: IReview[]
    isAuthenticated: boolean
}

const Reviews: FC<Props> = ({ reviews, isAuthenticated }) => {
    const intl = useIntl()

    return (
        <Layout>
            <Head>
                <title>{intl.formatMessage({ id: 'page.reviews.title' })}</title>
            </Head>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant='h5'>{intl.formatMessage({ id: 'latest_reviews' })}:</Typography>
                {reviews
                    .sort((a, b) => b.creationDate - a.creationDate)
                    .map(review => (
                        <Review
                            review={review}
                            key={review.id}
                            noAuthor
                        />
                    ))}
            </Box>
            {isAuthenticated && (
                <Link href={'/reviews/add'}>
                    <Button variant='contained'>{intl.formatMessage({ id: 'add_review' })}</Button>
                </Link>
            )}
        </Layout>
    )
}

export default Reviews
