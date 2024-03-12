import { FC, Key, SyntheticEvent, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { Box, Button, Rating, Typography } from '@mui/material'
import { Star } from '@mui/icons-material'
import { useSnackbar } from 'notistack'

import Link from './Link'
import Review, { IReview } from './Review'

export interface IPiece {
    id: Key
    titleEn: string
    titleRu: string
    descriptionEn: string
    descriptionRu: string
    group: any
    groupId: Key
    author: any
    authorId: Key
    creationDate: number
    ratings: any[]
    reviews: IReview[]
}

type Props = {
    piece: IPiece
    fullPage?: boolean
    isAuthenticated: boolean
}

const Piece: FC<Props> = ({ piece, fullPage = false, isAuthenticated }) => {
    const { data: session }: { data: Session | null } = useSession()
    const intl = useIntl()
    const { enqueueSnackbar } = useSnackbar()

    const [averageRating, setAverageRating] = useState(
        piece.ratings.reduce((a, b) => a + +b.stars, 0) / piece.ratings.length
    )
    const [yourRating, setYourRating] = useState(0)

    useEffect(() => {
        setYourRating(+piece.ratings.find(rating => rating.authorId === session?.user.id)?.stars || 0)
    }, [session?.user.id, piece.ratings])

    const rateHandler = async (event: SyntheticEvent, value: number | null) => {
        if (session?.user) {
            const body = { pieceId: piece.id, stars: String(value) }
            const res = await fetch('/api/pieces/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                enqueueSnackbar(intl.formatMessage({ id: 'error' }), { variant: 'error' })
            }
            const data = await res.json()
            setYourRating(+data.stars)
            piece.ratings = piece.ratings.map(rating => {
                if (rating.authorId === session.user.id) {
                    return data
                }
                return rating
            })

            if (!piece.ratings.find(rating => rating.id === data.id)) {
                piece.ratings = piece.ratings.concat(data)
            }
            setAverageRating(piece.ratings.reduce((a, b) => a + +b.stars, 0) / piece.ratings.length)
        }
    }

    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Typography variant='h2'>
                    {intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn} (
                    {intl.locale === 'en' ? piece.group.nameEn : piece.group.nameRu})
                </Typography>

                <Typography>
                    {intl.locale === 'en' ? piece.descriptionEn : piece.descriptionRu || piece.descriptionEn}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Typography>{intl.formatMessage({ id: 'piece_rating' })}:</Typography>
                    {averageRating > 0 ? (
                        <>
                            <Star color='warning' />
                            {averageRating.toFixed(2)}/5
                        </>
                    ) : (
                        <Typography>{intl.formatMessage({ id: 'not_yet_rated' })}</Typography>
                    )}
                </Box>
                {session?.user.id && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Typography>{intl.formatMessage({ id: 'your_piece_rating' })}:</Typography>
                        <Rating
                            value={yourRating}
                            onChange={rateHandler}
                            max={5}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <Typography
                        variant='h6'
                        mt={1}
                    >
                        {intl.formatMessage({ id: 'user_reviews' })}
                    </Typography>
                    {piece.reviews.length ? (
                        piece.reviews.map((review: IReview) => (
                            <Review
                                review={review}
                                key={review.id}
                                noPiece
                            />
                        ))
                    ) : (
                        <Typography>{intl.formatMessage({ id: 'no_reviews_piece' })}</Typography>
                    )}
                </Box>
                {isAuthenticated && (
                    <Link href={`/reviews/add?pieceId=${piece.id}`}>
                        <Button variant='contained'>{intl.formatMessage({ id: 'add_review' })}</Button>
                    </Link>
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
                boxShadow: '0 0 0 1px rgba(0,0,0,.12)',
                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,.3))',
                boxSizing: 'border-box',
                background: '#fff',
                borderRadius: '4px',
                p: '1rem',
            }}
        >
            <Typography variant='h5'>
                {intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn}
            </Typography>
            <Typography>
                {intl.locale === 'en' ? piece.descriptionEn : piece.descriptionRu || piece.descriptionEn}
            </Typography>
            <Typography>
                {intl.formatMessage({ id: 'piece_group' })}:{' '}
                {intl.locale === 'en' ? piece.group.nameEn : piece.group.nameRu || piece.group.nameEn}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Typography>{intl.formatMessage({ id: 'piece_rating' })}</Typography>:
                {averageRating > 0 ? (
                    <>
                        <Star color='warning' />
                        {averageRating.toFixed(2)}/5
                    </>
                ) : (
                    <Typography>{intl.formatMessage({ id: 'not_yet_rated' })}</Typography>
                )}
            </Box>

            <Link href={`/pieces/${piece.id}`}>{intl.formatMessage({ id: 'visit_piece_page' })}</Link>
        </Box>
    )
}

export default Piece
