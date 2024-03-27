import { FC, Key, SyntheticEvent } from 'react'
import { Avatar, Box, IconButton, Typography } from '@mui/material'
import { useIntl } from 'react-intl'
import { Clear } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'

import { IReview } from './Review'
import Link from './Link'

export interface IReviewComment {
    id: Key
    text: String
    review: IReview
    reviewId: Key
    author: any
    authorId: Key
    creationDate: number
}

type Props = {
    comment: IReviewComment
    noReview?: boolean
    canDelete?: boolean
}

const ReviewComment: FC<Props> = ({ comment, canDelete = false, noReview = false }) => {
    const { reload } = useRouter()
    const intl = useIntl()
    const { enqueueSnackbar } = useSnackbar()

    const deleteComment = async (e: SyntheticEvent) => {
        e.preventDefault()

        try {
            const body = { id: comment.id }
            const res = await fetch('/api/comments/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error(res.statusText)
            }
            enqueueSnackbar(intl.formatMessage({ id: 'comment_delete_success' }), { variant: 'success' })
            reload()
        } catch (error) {
            enqueueSnackbar(intl.formatMessage({ id: 'error' }), { variant: 'error' })
            console.error(error)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '5px',
                flexDirection: 'column',
                boxShadow: '0 0 1px rgba(0,0,0,.12)',
                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,.3))',
                boxSizing: 'border-box',
                background: '#fff',
                borderRadius: '4px',
                p: '1rem',
                alignSelf: 'flex-start',
                position: 'relative',
                pr: canDelete ? '2.5rem' : '1rem',
            }}
        >
            {!noReview && (
                <Box sx={{ display: 'flex' }}>
                    <Typography>{intl.formatMessage({ id: 'comment_for' })}</Typography>
                    &nbsp;
                    <Link href={`/reviews/${comment.reviewId}`}>{comment.review.title}</Link>
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Link href={`/users/${comment.authorId}`}>
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Avatar
                            src={comment.author.image}
                            sx={{ width: '32px', height: '32px' }}
                        />
                        <Typography>{comment.author.name}</Typography>
                    </Box>
                </Link>
                <Typography color={'GrayText'}>
                    &nbsp;
                    {intl.formatMessage({ id: 'date_at' })} {new Date(comment.creationDate).toLocaleString(intl.locale)}
                </Typography>
            </Box>

            {canDelete && (
                <IconButton
                    color='error'
                    sx={{ p: 0.125, position: 'absolute', top: '1rem', right: '0.5rem' }}
                    onClick={deleteComment}
                >
                    <Clear />
                </IconButton>
            )}

            <Typography>{comment.text}</Typography>
        </Box>
    )
}

export default ReviewComment
