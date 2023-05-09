import { FC } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import Head from 'next/head'
import { getServerSession } from 'next-auth'
import { Box, Button } from '@mui/material'

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
        },
    })

    return {
        props: {
            reviews: reviews.map((review) => ({
                ...review,
                author: {
                    ...review.author,
                    registrationDate: new Date(review.author.registrationDate).toLocaleDateString(),
                },
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
    return (
        <Layout>
            <Head>
                <title>Reviews</title>
            </Head>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, flexBasis: '50%' }}>
                    {reviews.map((review) => (
                        <Review review={review} key={review.id} />
                    ))}
                </Box>
                <Box sx={{ flexBasis: '40%' }}>tag cloud, etc</Box>
            </Box>
            {isAuthenticated && (
                <Link href={'/reviews/add'}>
                    <Button variant='contained'>Add a review</Button>
                </Link>
            )}
        </Layout>
    )
}

export default Reviews
