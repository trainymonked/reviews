import { FC } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import { useIntl } from 'react-intl'

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
                        },
                    },
                    comments: true,
                },
            },
            ratings: true,
        },
    })

    if (piece === null) {
        return {
            notFound: true,
        }
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const reviewsWithImageUrls = await Promise.all(
        piece.reviews.map(async review => {
            const { data } = await supabase.storage.from('review_images').createSignedUrls(
                review.images.map(i => i.match(/[^/]+$/)![0]),
                1800
            )

            if (review.images) {
                return { ...review, images: data?.map(i => i.signedUrl) }
            }

            return { ...review }
        })
    )

    return {
        props: {
            piece: {
                ...piece,
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
                    comments: review.comments.map(c => ({
                        ...c,
                        creationDate: Date.parse(c.creationDate.toJSON()),
                    })),
                })),
                creationDate: Date.parse(piece.creationDate.toJSON()),
            },
            isAuthenticated: !!session,
        },
    }
}

type Props = {
    piece: IPiece
    isAuthenticated: boolean
}

const PiecePage: FC<Props> = ({ piece, isAuthenticated }) => {
    const intl = useIntl()
    return (
        <Layout>
            <Head>
                <title>{intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn}</title>
            </Head>
            <Piece
                piece={piece}
                fullPage
                isAuthenticated={isAuthenticated}
            />
        </Layout>
    )
}

export default PiecePage
