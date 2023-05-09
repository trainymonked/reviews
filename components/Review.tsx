import { FC, SyntheticEvent, Key, useState, useEffect } from 'react'
import { Box, Button, Rating, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from './Link'

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'

export interface IReview {
    id: Key
    title: string
    text: string
    images: string[]
    grade: string
    tags: any[]
    piece: any
    pieceId: Key
    author: any
    authorId: Key
    comments: any[]
    likes: any[]
}

type Props = {
    review: IReview
    fullPage?: boolean
    noPiece?: boolean
}

const Review: FC<Props> = ({ review, fullPage = false, noPiece = false }) => {
    const { data: session }: { data: any } = useSession()
    const [liked, setLiked] = useState(false)

    const { push } = useRouter()

    useEffect(() => {
        setLiked(review.likes.findIndex((like) => like.liked && like.authorId === session?.user?.id) !== -1)
    }, [session?.user?.id])

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

    const toggleLike = async () => {
        if (session?.user) {
            const body = { reviewId: review.id }
            const res = await fetch('/api/likes/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            setLiked(data.liked)
            review.likes = review.likes.map((like) => {
                if (like.authorId === session?.user?.id) {
                    return data
                }
                return like
            })

            if (!review.likes.find((like) => like.id === data.id)) {
                review.likes = review.likes.concat(data)
            }
        }
    }

    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', mb: 2 }}>
                <Typography variant='h2'>{review.title}</Typography>
                <Link href={`/pieces/${review.pieceId}`}>Piece: {review.piece.titleEn}</Link>
                <Link href={`/users/${review.authorId}`}>Author: {review.author.name}</Link>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Rating value={1} max={1} readOnly />
                    <Typography>{review.grade}/10</Typography>
                </Box>

                <Typography>{review.text}</Typography>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        background: 'rgba(99, 99, 99, 0.1)',
                        borderRadius: '4px',
                        width: 'min-content',
                        py: 0.5,
                        px: 1,
                    }}
                >
                    <Rating
                        max={1}
                        icon={<FavoriteIcon color='error' />}
                        emptyIcon={<FavoriteBorderIcon />}
                        onChange={toggleLike}
                        disabled={!session?.user}
                        value={+liked || null}
                    />
                    <Typography>{review.likes.filter((like) => like.liked).length}</Typography>
                </Box>

                {session?.user?.id === review.authorId && (
                    <Box sx={{ mx: 'auto' }}>
                        <Button variant='contained' color='error' onClick={deleteReview}>
                            Delete review
                        </Button>
                    </Box>
                )}
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
                by <Link href={`/users/${review.authorId}`}>{review.author.name}</Link>
            </Typography>
            <Typography>{review.text.slice(0, 140)}...</Typography>
            <Link href={`/reviews/${review.id}`}>
                <Typography>Show full review</Typography>
            </Link>

            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    background: 'rgba(99, 99, 99, 0.1)',
                    borderRadius: '4px',
                    width: 'min-content',
                    py: 0.5,
                    px: 1,
                }}
            >
                <Rating
                    max={1}
                    icon={<FavoriteIcon color='error' />}
                    emptyIcon={<FavoriteBorderIcon />}
                    onChange={toggleLike}
                    disabled={!session?.user}
                    value={+liked || null}
                />
                <Typography>{review.likes.filter((like) => like.liked).length}</Typography>

                {/* <IconButton>... dots</IconButton> */}
            </Box>
        </Box>
    )
}

export default Review
