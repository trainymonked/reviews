import { FC } from 'react'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Review, { IReview } from '../../components/Review'
import { Avatar } from '@mui/material'

type ParamsProps = {
    params: {
        id: string
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

    const user = await prisma.user.findUnique({ where: { id }, include: { reviews: true } })

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
                emailVerified: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : null
            }
        },
    }
}

type Props = {
    user: any
}

const UserPage: FC<Props> = ({
    user: { image, name, registrationDate, bio, reviews },
}) => {
    return (
        <Layout>
            <Avatar src={image} />
            <p>{name} - member since {registrationDate}</p>
            {bio && <p>{bio}</p>}
            <div>
                Reviews:
                {reviews?.map((review: IReview) => (
                    <Review key={review.id} review={review} />
                ))}
            </div>
        </Layout>
    )
}

export default UserPage
