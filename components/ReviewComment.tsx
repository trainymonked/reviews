import { FC, Key } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import { useIntl } from 'react-intl'

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
}

const ReviewComment: FC<Props> = ({ comment, noReview = false }) => {
    const intl = useIntl()

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
            }}
        >
            {!noReview && (
                <Box sx={{ display: 'flex' }}>
                    <Typography>{intl.formatMessage({ id: 'comment_for' })}</Typography>
                    &nbsp;
                    <Link href={`/reviews/${comment.reviewId}`}>{comment.review.title}</Link>
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

            <Typography>{comment.text}</Typography>
        </Box>
    )
}

export default ReviewComment
