import { FC } from 'react'
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
            <Link href={'/reviews/add'}>
                <Button>Add a review</Button>
            </Link>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {reviews.map((r) => (
                    <Review review={r} key={r.id} />
                ))}
            </Box>
        </Layout>
    )
}

export default Reviews
