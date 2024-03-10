import { FC } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import Head from 'next/head'
import { useIntl } from 'react-intl'
import { createClient } from '@supabase/supabase-js'
import { Review as PrismaReview } from '@prisma/client'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Review, { IReview } from '../../components/Review'
import ReviewComment, { IReviewComment } from '../../components/ReviewComment'

type ParamsProps = {
    params: {
        id: string
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

    const { email, ...user }: any = await prisma.user.findUnique({
        where: { id },
        include: {
            reviews: {
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
            },
            reviewComments: { include: { review: true, author: true } },
        },
    })

    if (user === null) {
        return {
            notFound: true,
        }
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const reviewsWithImageUrls = await Promise.all(
        user.reviews.map(async (review: PrismaReview) => {
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
            user: {
                ...user,
                registrationDate: Date.parse(user.registrationDate.toJSON()),
                emailVerified: user.emailVerified ? Date.parse(user.emailVerified.toJSON()) : null,
                reviews: reviewsWithImageUrls.map((review: IReview) => ({
                    ...review,
                    images: review.images || [],
                    author: {
                        ...review.author,
                        registrationDate: Date.parse(review.author.registrationDate.toJSON()),
                        reviews: review.author.reviews.map((r: { creationDate: any }) => ({
                            ...r,
                            creationDate: Date.parse(r.creationDate.toJSON()),
                        })),
                        reviewComments: review.author.reviewComments.map((rc: { creationDate: any }) => ({
                            ...rc,
                            creationDate: Date.parse(rc.creationDate.toJSON()),
                        })),
                    },
                    piece: {
                        ...review.piece,
                        creationDate: Date.parse(review.piece.creationDate.toJSON()),
                    },
                    comments: review.comments.map((c: { creationDate: any }) => ({
                        ...c,
                        creationDate: Date.parse(c.creationDate.toJSON()),
                    })),
                    creationDate: Date.parse(review.creationDate.toJSON()),
                })),
                reviewComments: user.reviewComments.map((rc: { creationDate: any; review: IReview; author: any }) => ({
                    ...rc,
                    creationDate: Date.parse(rc.creationDate.toJSON()),
                    review: {
                        ...rc.review,
                        creationDate: Date.parse(rc.review.creationDate.toJSON()),
                    },
                    author: {
                        ...rc.author,
                        registrationDate: Date.parse(rc.author.registrationDate.toJSON()),
                    },
                })),
            },
        },
    }
}

type Props = {
    user: {
        image: string
        name: string
        registrationDate: number
        bio: string
        reviews: IReview[]
        reviewComments: IReviewComment[]
    }
}

const UserPage: FC<Props> = ({ user: { image, name, registrationDate, bio, reviews, reviewComments } }) => {
    const intl = useIntl()

    return (
        <Layout>
            <Head>
                <title>{name || intl.formatMessage({ id: 'unnamed_user' })}</title>
            </Head>

            <Box sx={{ maxWidth: '800px', mx: 'auto', my: 5 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar
                        src={image}
                        sx={{ width: 64, height: 64 }}
                    />
                    <Typography>{name || intl.formatMessage({ id: 'unnamed_user' })}</Typography>
                </Box>
                <Typography mt={2}>
                    {intl.formatMessage({ id: 'member_since' })}{' '}
                    {new Date(registrationDate).toLocaleDateString(intl.locale)}
                </Typography>

                {bio && <Typography>{bio}</Typography>}

                <Box sx={{ my: 2 }}>
                    {reviews.length > 0 ? (
                        <>
                            <Typography
                                variant='h6'
                                mb={2}
                            >
                                {intl.formatMessage({ id: 'reviews' })}:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                {reviews.map((review: IReview) => (
                                    <Review
                                        key={review.id}
                                        review={review}
                                        noAuthor
                                    />
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Typography>{intl.formatMessage({ id: 'no_reviews' })}</Typography>
                    )}
                </Box>

                <Box sx={{ my: 2 }}>
                    {reviewComments.length > 0 ? (
                        <>
                            <Typography
                                variant='h6'
                                mb={2}
                            >
                                {intl.formatMessage({ id: 'comments' })}:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {reviewComments.map((reviewComment: IReviewComment) => (
                                    <ReviewComment
                                        key={reviewComment.id}
                                        comment={reviewComment}
                                    />
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Typography>{intl.formatMessage({ id: 'no_review_comments' })}</Typography>
                    )}
                </Box>
            </Box>
        </Layout>
    )
}

export default UserPage
