import { FC, SyntheticEvent, Key, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Session } from 'next-auth'
import { useIntl } from 'react-intl'
import { Box, Button, Rating, Typography } from '@mui/material'
import { Favorite, FavoriteBorder, Comment } from '@mui/icons-material'

import Link from './Link'
import ReviewComment, { IReviewComment } from './ReviewComment'

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
    creationDate: any
    comments: IReviewComment[]
    likes: any[]
}

type Props = {
    review: IReview
    fullPage?: boolean
    noPiece?: boolean
    noAuthor?: boolean
    isAuthenticated?: boolean
}

const Review: FC<Props> = ({ review, fullPage = false, noPiece = false, noAuthor = false, isAuthenticated }) => {
    const { data: session }: { data: Session | null } = useSession()
    const [liked, setLiked] = useState(false)

    const { push } = useRouter()
    const intl = useIntl()

    useEffect(() => {
        setLiked(!!review.likes.find(like => like.liked && like.authorId === session?.user.id))
    }, [session?.user.id, review.likes])

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
            review.likes = review.likes.map(like => {
                if (like.authorId === session.user.id) {
                    return data
                }
                return like
            })

            if (!review.likes.find(like => like.id === data.id)) {
                review.likes = review.likes.concat(data)
            }
        }
    }

    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Typography variant='h2'>{review.title}</Typography>
                <Box sx={{ alignSelf: 'flex-start' }}>
                    <Link href={`/pieces/${review.pieceId}`}>
                        {intl.formatMessage({ id: 'piece' })}:{' '}
                        {intl.locale === 'en' ? review.piece.titleEn : review.piece.titleRu || review.piece.titleEn}
                    </Link>
                </Box>
                <Box sx={{ alignSelf: 'flex-start' }}>
                    <Link href={`/users/${review.authorId}`}>
                        {intl.formatMessage({ id: 'author' })}: {review.author.name}
                    </Link>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', alignSelf: 'flex-start' }}>
                    <Rating
                        value={1}
                        max={1}
                        readOnly
                    />
                    <Typography>{review.grade}/10</Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, maxHeight: '45vh' }}>
                    {review.images.map(image => (
                        <img
                            style={{
                                maxWidth: '20vw',
                                minWidth: '160px',
                                objectFit: 'contain',
                                border: '1px solid rgba(0, 0, 0, 0.125)',
                            }}
                            key={image}
                            src={image}
                            alt={intl.formatMessage({ id: 'alt_user_image' })}
                        />
                    ))}
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
                        userSelect: 'none',
                    }}
                    title={!session?.user ? intl.formatMessage({ id: 'sign_in_to_like' }) : undefined}
                >
                    <Rating
                        max={1}
                        icon={<Favorite color='error' />}
                        emptyIcon={<FavoriteBorder />}
                        onChange={toggleLike}
                        disabled={!session?.user}
                        value={+liked || null}
                    />
                    <Typography>{review.likes.filter(like => like.liked).length}</Typography>
                </Box>

                <Box
                    id='comments'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        marginTop: 4,
                    }}
                >
                    <Typography variant='h5'>{intl.formatMessage({ id: 'comments' })}</Typography>

                    {isAuthenticated && (
                        <Link href={`/comments/add?reviewId=${review.id}`}>
                            <Button
                                variant='contained'
                                size='small'
                                color='info'
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                {intl.formatMessage({ id: 'leave_comment' })}
                            </Button>
                        </Link>
                    )}

                    {review.comments.length ? (
                        review.comments.map((comment: IReviewComment) => (
                            <ReviewComment
                                key={comment.id}
                                comment={comment}
                                noReview
                            />
                        ))
                    ) : (
                        <Typography>{intl.formatMessage({ id: 'no_comments_review' })}</Typography>
                    )}
                </Box>

                {session?.user.id === review.authorId && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant='contained'
                            color='warning'
                            onClick={() => {
                                push(`/reviews/edit?id=${review.id}`)
                            }}
                        >
                            {intl.formatMessage({ id: 'edit_review' })}
                        </Button>
                        <Button
                            variant='contained'
                            color='error'
                            onClick={deleteReview}
                        >
                            {intl.formatMessage({ id: 'delete_review' })}
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
            {!noPiece && (
                <Link href={`/pieces/${review.pieceId}`}>
                    {intl.locale === 'en' ? review.piece.titleEn : review.piece.titleRu || review.piece.titleEn}
                </Link>
            )}

            {!noAuthor && (
                <Typography>
                    {intl.formatMessage({ id: 'by' })}{' '}
                    <Link href={`/users/${review.authorId}`}>{review.author.name}</Link>
                </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {review.images.map(image => (
                    <img
                        style={{
                            width: '15vw',
                            minWidth: '160px',
                            objectFit: 'contain',
                            border: '1px solid rgba(0, 0, 0, 0.125)',
                        }}
                        key={image}
                        src={image}
                        alt={intl.formatMessage({ id: 'alt_user_image' })}
                    />
                ))}
            </Box>

            <Typography>{review.text.slice(0, 130)}...</Typography>

            <Link href={`/reviews/${review.id}`}>
                <Typography>{intl.formatMessage({ id: 'show_full_review' })}</Typography>
            </Link>

            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        background: 'rgba(99, 99, 99, 0.1)',
                        borderRadius: '4px',
                        width: 'min-content',
                        py: 0.5,
                        px: 1,
                        userSelect: 'none',
                    }}
                    title={!session?.user ? intl.formatMessage({ id: 'sign_in_to_like' }) : undefined}
                >
                    <Rating
                        max={1}
                        icon={<Favorite color='error' />}
                        emptyIcon={<FavoriteBorder />}
                        onChange={toggleLike}
                        disabled={!session?.user}
                        value={+liked || null}
                    />
                    <Typography>{review.likes.filter(like => like.liked).length}</Typography>
                </Box>

                <Box
                    sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 1,
                        background: 'rgba(99, 99, 99, 0.1)',
                        borderRadius: '4px',
                        width: 'min-content',
                        py: 0.5,
                        px: 1,
                        userSelect: 'none',
                    }}
                    onClick={() => {
                        push(`/reviews/${review.id}/#comments`)
                    }}
                >
                    <Rating
                        max={1}
                        icon={<Comment color='primary' />}
                        emptyIcon={<Comment />}
                        disabled={true}
                        value={null}
                    />
                    <Typography>{review.comments.length}</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Review
