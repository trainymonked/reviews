import { FC, SyntheticEvent, useState, useEffect } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { getServerSession } from 'next-auth'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useIntl } from 'react-intl'

import { authOptions } from '../api/auth/[...nextauth]'
import prisma from '../../lib/prisma'
import Layout from '../../components/Layout'
import { IReview } from '../../components/Review'
import Link from '../../components/Link'

export async function getServerSideProps({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
    const session = await getServerSession(req, res, authOptions)

    if (session === null) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        }
    }

    const reviews = await prisma.review.findMany()

    return {
        props: {
            reviews: reviews.map(review => ({
                ...review,
                creationDate: Date.parse(review.creationDate.toJSON()),
            })),
        },
    }
}

type Props = {
    reviews: IReview[]
}

const Draft: FC<Props> = ({ reviews }) => {
    const [text, setText] = useState('')
    const [review, setReview] = useState('')
    const [reviewId, setReviewId] = useState<string>('')

    const { push } = useRouter()
    const searchParams = useSearchParams()
    const intl = useIntl()

    useEffect(() => {
        const rId = reviewId || searchParams.get('reviewId') || ''
        if (rId !== reviewId) {
            setReviewId(rId)
            const review = reviews.find(piece => piece.id === rId)
            setReview(review ? review.title : '')
        }
    }, [searchParams, reviewId, reviews])

    const submitData = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            const body = { text, reviewId }
            await fetch('/api/comments/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            push(`/reviews/${reviewId}/#comments`)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Layout>
            <Head>
                <title>{intl.formatMessage({ id: 'pages.comments_add.title' })}</title>
            </Head>

            <Typography
                variant='h2'
                sx={{ textAlign: 'center', mt: 5 }}
            >
                {intl.formatMessage({ id: 'add_comment' })}
            </Typography>

            <Typography sx={{ textAlign: 'center', mt: 2 }}>
                {intl.formatMessage({ id: 'comment_for' })}&nbsp;<Link href={`/reviews/${reviewId}`}>{review}</Link>
            </Typography>

            <form onSubmit={submitData}>
                <Box
                    sx={{
                        maxWidth: '40%',
                        minWidth: '240px',
                        mx: 'auto',
                        mt: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <TextField
                        multiline
                        minRows={2}
                        label={intl.formatMessage({ id: 'comment_text' })}
                        required
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />

                    <Button
                        type='submit'
                        variant='contained'
                        disabled={!review || !text.trim()}
                    >
                        {intl.formatMessage({ id: 'comment_add' })}
                    </Button>
                </Box>
            </form>
        </Layout>
    )
}

export default Draft
