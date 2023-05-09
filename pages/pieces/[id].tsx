import { FC } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Piece, { IPiece } from '../../components/Piece'
import { authOptions } from '../api/auth/[...nextauth]'

type ParamsProps = {
    params: {
        id: string
    }
    req: NextApiRequest
    res: NextApiResponse
}

export async function getServerSideProps({ req, res, params }: ParamsProps) {
    const session = await getServerSession(req, res, authOptions)

    const { id } = params

    const piece = await prisma.piece.findUnique({
        where: { id },
        include: {
            group: true,
            reviews: {
                include: {
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
                    likes: {
                        where: {
                            liked: true,
                        }
                    }
                },
            },
        },
    })

    if (piece === null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            piece: {
                ...piece,
                reviews: piece.reviews.map((review) => ({
                    ...review,
                    author: {
                        ...review.author,
                        registrationDate: new Date(review.author.registrationDate).toLocaleDateString(),
                    },
                })),
            },
            isAuthenticated: !!session,
        },
    }
}

type Props = {
    piece: IPiece
    isAuthenticated: boolean
}

const ReviewPage: FC<Props> = ({ piece, isAuthenticated }) => {
    return (
        <Layout>
            <Head>
                <title>{piece.titleEn}</title>
            </Head>
            <Piece piece={piece} fullPage isAuthenticated={isAuthenticated} />
        </Layout>
    )
}

export default ReviewPage
