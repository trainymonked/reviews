import { FC } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import Head from 'next/head'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Link from '../../components/Link'

export async function getServerSideProps() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    reviews: true,
                    reviewComments: true,
                },
            },
        },
    })

    return {
        props: {
            users: users.map((u) => {
                const { email, ...user } = u
                return {
                    ...user,
                    registrationDate: new Date(user.registrationDate).toLocaleDateString(),
                    emailVerified: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : null,
                }
            }),
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
            <Box sx={{ maxWidth: '900px', mx: 'auto', my: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {users.map((user) => {
                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: '#fff',
                                boxShadow: '0 0 1px rgba(0,0,0,.12)',
                                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,.3))',
                                boxSizing: 'border-box',
                                p: 2,
                            }}
                            key={user.id}
                        >
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Link href={`/users/${user.id}`}>
                                    <Avatar src={user.image} sx={{ width: 64, height: 64 }} />
                                </Link>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Link underline='hover' href={`/users/${user.id}`}>
                                        {user.name || 'no name'}
                                    </Link>
                                    <Typography>Member since {user.registrationDate}</Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography>{user._count.reviews} review(s)</Typography>
                                <Typography>{user._count.reviewComments} comment(s)</Typography>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Layout>
    )
}

export default UsersPage
