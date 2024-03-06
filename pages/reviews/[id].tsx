import { FC } from 'react'
import Head from 'next/head'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import Layout from '../../components/Layout'
import Review, { IReview } from '../../components/Review'
import prisma from '../../lib/prisma'
import { authOptions } from '../api/auth/[...nextauth]'

type ParamsProps = {
    id: string
}

export async function getServerSideProps({
    req,
    res,
    params,
}: {
    req: NextApiRequest
    res: NextApiResponse
    params: ParamsProps
}) {
    const { id } = params

    const session = await getServerSession(req, res, authOptions)

    const review = await prisma.review.findUnique({
        where: { id },
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
            comments: {
                select: {
                    id: true,
                    text: true,
                    author: true,
                    authorId: true,
                    creationDate: true,
                    review: true,
                    reviewId: true,
                },
            },
        },
    })

    if (review === null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            review: {
                ...review,
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
                    author: {
                        ...c.author,
                        registrationDate: Date.parse(c.author.registrationDate.toJSON()),
                    },
                    review: {
                        ...c.review,
                        creationDate: Date.parse(c.review.creationDate.toJSON()),
                    },
                })),
            },
            isAuthenticated: !!session,
        },
    }
}

type Props = {
    review: IReview
    isAuthenticated: boolean
}

const ReviewPage: FC<Props> = ({ review, isAuthenticated }) => {
    return (
        <Layout>
            <Head>
                <title>{review.title}</title>
            </Head>
            <Review
                review={review}
                fullPage
                isAuthenticated={isAuthenticated}
            />
        </Layout>
    )
}

export default ReviewPage
