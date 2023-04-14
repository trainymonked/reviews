import { FC } from 'react'

import Layout from '../../components/Layout'
import { IReview } from '../../components/Review'

type ParamsProps = {
    params: {
        id: String
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

    const res = await fetch(`http://localhost:5000/users/${id}`)
    const data = await res.json()

    if (res.status === 404) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            user: data,
        },
    }
}

type Props = {
    user
}

const UserPage: FC<Props> = ({
    user: { avatar = 'null cdn', displayName = 'null name', registrationDate = 'null date', bio = 'null bio', reviews },
}) => {
    return (
        <Layout>
            <p>
                {avatar} | {displayName}
            </p>
            <p>member since {registrationDate}</p>
            <p>{bio}</p>
            <div>
                Reviews:
                {reviews?.map((r) => (
                    <p key={r}>{r}</p>
                ))}
            </div>
        </Layout>
    )
}

export default UserPage
