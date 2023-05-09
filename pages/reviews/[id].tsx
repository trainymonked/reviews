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
                    registrationDate: new Date(review.author.registrationDate).toLocaleDateString(),
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
