import { FC } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import Head from 'next/head'
import { useIntl } from 'react-intl'

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
            users: users.map(u => {
                const { email, ...user } = u
                return {
                    ...user,
                    registrationDate: Date.parse(user.registrationDate.toJSON()),
                    emailVerified: user.emailVerified ? Date.parse(user.emailVerified.toJSON()) : null,
                }
            }),
        },
    }
}

type Props = {
    users: {
        registrationDate: number
        id: string
        image: string
        name: string
        _count: {
            reviews: number
            reviewComments: number
        }
    }[]
}

const UsersPage: FC<Props> = ({ users }) => {
    const intl = useIntl()

    return (
        <Layout>
            <Head>
                <title>{intl.formatMessage({ id: 'page.users.title' })}</title>
            </Head>
            <Box sx={{ maxWidth: '900px', mx: 'auto', my: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {users.map(user => {
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
                                    <Avatar
                                        src={user.image}
                                        sx={{ width: 64, height: 64 }}
                                    />
                                </Link>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Link
                                        underline='hover'
                                        href={`/users/${user.id}`}
                                    >
                                        {user.name || intl.formatMessage({ id: 'unnamed_user' })}
                                    </Link>
                                    <Typography>
                                        {intl.formatMessage({ id: 'member_since' })}{' '}
                                        {new Date(user.registrationDate).toLocaleDateString(intl.locale)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography>
                                    {intl.formatMessage({ id: 'review(s)' })}: {user._count.reviews}
                                </Typography>
                                <Typography>
                                    {intl.formatMessage({ id: 'comment(s)' })}: {user._count.reviewComments}
                                </Typography>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Layout>
    )
}

export default UsersPage
