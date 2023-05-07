import { FC, SyntheticEvent, Key } from 'react'
import { Box, Button, Rating, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from './Link'

export interface IReview {
    id: Key
    title: string
    text: string
    images: string[]
    grade: string
    authorId: Key
    pieceId: Key
    piece: any
    tags: any[]
}

type Props = {
    review: IReview
    fullPage?: boolean
    noPiece?: boolean
}

const Review: FC<Props> = ({ review, fullPage = false, noPiece = false }) => {
    const { data: session } = useSession()
    const { push } = useRouter()

    const deleteReview = async (e: SyntheticEvent) => {
        e.preventDefault()

        try {
            const body = { id: review.id }
            await fetch('/api/reviews/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            push('/')
        } catch (error) {
            console.error(error)
        }
    }

    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                <Typography variant='h2'>{review.title}</Typography>
                <Link href={`/pieces/${review.pieceId}`}>Piece: {review.piece.titleEn}</Link>
                <Link href={`/users/${review.authorId}`}>Author: {review.authorId}</Link>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Rating value={1} max={1} readOnly />
                    <Typography>{review.grade}/10</Typography>
                </Box>

                <Typography>{review.text}</Typography>
                {session?.user?.id === review.authorId && <Button onClick={deleteReview}>Delete review</Button>}
            </Box>
        )
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
            }}
        >
            <Typography variant='h5'>{review.title}</Typography>
            {!noPiece && <Link href={`/pieces/${review.pieceId}`}>{review.piece.titleEn}</Link>}
            <Typography>
                by <Link href={`/users/${review.authorId}`}>{review.authorId}</Link>
            </Typography>
            <Typography>{review.text.slice(0, 140)}...</Typography>
            <Link href={`/reviews/${review.id}`}>
                <Typography>Show full review</Typography>
            </Link>
            buttons - like, dislike, 3 dots
        </Box>
    )
}

export default Review
