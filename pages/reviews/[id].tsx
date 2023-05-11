import { FC } from 'react'
import Head from 'next/head'

import Layout from '../../components/Layout'
import Review, { IReview } from '../../components/Review'
import prisma from '../../lib/prisma'

type ParamsProps = {
    params: {
        id: string
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

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
                    reviews: review.author.reviews.map((r) => ({
                        ...r,
                        creationDate: Date.parse(r.creationDate.toJSON()),
                    })),
                },
                creationDate: Date.parse(review.creationDate.toJSON()),
                piece: {
                    ...review.piece,
                    creationDate: Date.parse(review.piece.creationDate.toJSON()),
                },
            },
        },
    }
}

type Props = {
    review: IReview
}

const ReviewPage: FC<Props> = ({ review }) => {
    return (
        <Layout>
            <Head>
                <title>{review.title}</title>
            </Head>
            <Review review={review} fullPage />
        </Layout>
    )
}

export default ReviewPage
