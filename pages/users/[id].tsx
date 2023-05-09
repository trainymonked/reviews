import { FC } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import Head from 'next/head'

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
                },
            },
            reviewComments: { include: { review: true } },
        },
    })

    if (user === null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            user: {
                ...user,
                registrationDate: new Date(user.registrationDate).toLocaleDateString(),
                reviews: user.reviews.map((review: IReview) => ({
                    ...review,
                    author: {
                        ...review.author,
                        registrationDate: new Date(review.author.registrationDate).toLocaleDateString(),
                    },
                })),
            },
        },
    }
}

type Props = {
    user: any
}

const UserPage: FC<Props> = ({ user: { image, name, registrationDate, bio, reviews, reviewComments } }) => {
    return (
        <Layout>
            <Head>
                <title>{name || 'Unnamed user'}</title>
            </Head>

            <Box sx={{ maxWidth: '800px', mx: 'auto', my: 5 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={image} sx={{ width: 64, height: 64 }} />
                    <Typography>{name || 'no name'}</Typography>
                </Box>
                <Typography mt={2}>Member since {registrationDate}</Typography>

                {bio && <Typography>{bio}</Typography>}

                <Box sx={{ my: 2 }}>
                    {reviews.length > 0 ? (
                        <>
                            <Typography variant='h6' mb={2}>
                                Reviews:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                {reviews.map((review: IReview) => (
                                    <Review key={review.id} review={review} />
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Typography>No reviews</Typography>
                    )}
                </Box>

                <Box sx={{ my: 2 }}>
                    {reviewComments.length > 0 ? (
                        <>
                            <Typography variant='h6' mb={2}>
                                Comments:
                            </Typography>
                            {reviewComments.map((reviewComment: IReviewComment) => (
                                <ReviewComment key={reviewComment.id} />
                            ))}
                        </>
                    ) : (
                        <Typography>No review comments</Typography>
                    )}
                </Box>
            </Box>
        </Layout>
    )
}

export default UserPage
