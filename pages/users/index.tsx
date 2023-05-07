import { FC } from 'react'
import { Avatar } from '@mui/material'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Link from '../../components/Link'
import Head from 'next/head'

export async function getServerSideProps() {
    const users = await prisma.user.findMany()

    return {
        props: {
            users: users.map(user => {
                return {
                    ...user,
                    registrationDate: new Date(user.registrationDate).toLocaleDateString(),
                    emailVerified: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : null
                }
            })
        },
    }
}

type Props = {
    users: any[]
}

const UsersPage: FC<Props> = ({ users }) => {
    return (
        <Layout>
            <Head>
                <title>Users</title>
            </Head>
            {users.map((user) => {
                return (<div key={user.id}>
                    <Avatar src={user.image} />
                    <p>{user.name} - member since {user.registrationDate}</p>
                    <Link href={`/users/${user.id}`}>
                        Visit user page
                    </Link>
                </div>)
            })}
        </Layout>
    )
}

export default UsersPage
