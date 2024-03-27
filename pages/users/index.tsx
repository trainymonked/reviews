import { FC } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import Head from 'next/head'
import { useIntl } from 'react-intl'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Link from '../../components/Link'
import { authOptions } from '../api/auth/[...nextauth]'

export async function getServerSideProps({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
    const session = await getServerSession(req, res, authOptions)

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
            isSessionAdmin: !!session?.user.isAdmin,
        },
    }
}

type Props = {
    users: {
        registrationDate: number
        id: string
        image: string
        name: string
        isAdmin: boolean
        _count: {
            reviews: number
            reviewComments: number
        }
    }[]
    isSessionAdmin: boolean
}

const UsersPage: FC<Props> = ({ users, isSessionAdmin }) => {
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
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
                                        {isSessionAdmin && user.isAdmin && (
                                            <Typography
                                                sx={{
                                                    backgroundColor: '#6d3336',
                                                    color: '#f5f5f5',
                                                    px: 1,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                {intl.formatMessage({ id: 'admin' })}
                                            </Typography>
                                        )}

                                        <Link
                                            underline='hover'
                                            href={`/users/${user.id}`}
                                        >
                                            {user.name || intl.formatMessage({ id: 'unnamed_user' })}
                                        </Link>
                                    </Box>
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
