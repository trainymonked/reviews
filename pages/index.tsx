import { FC } from 'react'
import Head from 'next/head'
import { Box, Button } from '@mui/material'

import Layout from '../components/Layout'
import Review, { IReview } from '../components/Review'
import prisma from '../lib/prisma'
import Link from '../components/Link'

export async function getServerSideProps() {
    const reviews = await prisma.review.findMany()

    return {
        props: {
            reviews,
        },
    }
}

type Props = {
    reviews: IReview[]
}

const Reviews: FC<Props> = ({ reviews }) => {
    return (
        <Layout>
            <Head>
                <title>Reviews</title>
            </Head>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {reviews.map((r) => (
                    <Review review={r} key={r.id} />
                ))}
            </Box>
            <Link href={'/reviews/add'}>
                <Button variant='contained' color='success'>Add a review</Button>
            </Link>
        </Layout>
    )
}

export default Reviews
