import { Box, Typography } from '@mui/material'
import { FC, Key } from 'react'
import Link from '../Link'

export interface IReview {
    id: Key
    title: string
    pieceId: Key
    tagIds: Key[]
    text: string
    images: string[]
    grade: string
    authorId: Key
    likes: string[]
}

type Props = {
    review: IReview
    fullPage?: boolean
}

const Review: FC<Props> = ({ review, fullPage = false }) => {
    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                <Typography variant='h2'>Title: {review.title}</Typography>
                <Link href={`/users/${review.authorId}`}>Author: {review.authorId}</Link>
                <Typography>Grade: {review.grade}</Typography>
                <Typography>Text: {review.text}</Typography>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '5px',
                flexDirection: 'column',
                backgroundColor: 'rgba(0, 0, 0, .05)',
                borderRadius: 4,
                p: 1,
            }}
        >
            <Typography variant='h5'>Title: {review.title}</Typography>
            <Link href={`/users/${review.authorId}`}>Author: {review.authorId}</Link>
            <Typography>{review.text.slice(0, 140)}...</Typography>
            <Link href={`/reviews/${review.id}`}>Show full review</Link>
        </Box>
    )
}

export default Review
