import { FC } from 'react'

import Layout from '../../components/Layout'
import Review, { IReview } from '../../components/Review'

type ParamsProps = {
    params: {
        id: String
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

    const res = await fetch(`http://localhost:5000/reviews/${id}`)
    const data: IReview = await res.json()

    if (res.status === 404) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            review: data,
        },
    }
}

type Props = {
    review: IReview
}

const ReviewPage: FC<Props> = ({ review }) => {
    return (
        <Layout>
            <Review review={review} fullPage />
        </Layout>
    )
}

export default ReviewPage
