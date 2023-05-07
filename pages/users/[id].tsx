import { FC } from 'react'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Review, { IReview } from '../../components/Review'
import { Avatar, Box, Typography } from '@mui/material'
import Head from 'next/head'

type ParamsProps = {
    params: {
        id: string
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

    const user = await prisma.user.findUnique({ where: { id }, include: { reviews: { include: { piece: true } } } })

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
                emailVerified: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : null,
            },
        },
    }
}

type Props = {
    user: any
}

const UserPage: FC<Props> = ({ user: { image, name, registrationDate, bio, reviews } }) => {
    return (
        <Layout>
            <Head>
                <title>User: {name}</title>
            </Head>

            <Avatar src={image} />
            <Typography>
                {name} - member since {registrationDate}
            </Typography>
            {bio && <Typography>{bio}</Typography>}
            <Box>
                <Typography>Reviews</Typography>
                {reviews?.map((review: IReview) => (
                    <Review key={review.id} review={review} />
                ))}
            </Box>
        </Layout>
    )
}

export default UserPage
