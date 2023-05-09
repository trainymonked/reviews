import { FC, Key } from 'react'
import { Box, Button, Typography } from '@mui/material'

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
    ratings: any[]
    reviews: IReview[]
}

type Props = {
    piece: IPiece
    fullPage?: boolean
    isAuthenticated: boolean
}

const Piece: FC<Props> = ({ piece, fullPage = false, isAuthenticated }) => {
    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Typography variant='h2'>
                    {piece.titleEn} ({piece.group.nameEn.slice(0, -1)})
                </Typography>
                <Typography>{piece.descriptionEn}</Typography>

                {piece.reviews && (
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Typography variant='h6' mt={1}>
                            User reviews
                        </Typography>
                        {piece.reviews.map((review: IReview) => (
                            <Review review={review} key={review.id} noPiece />
                        ))}
                    </Box>
                )}

                {isAuthenticated && (
                    <Link href={`/reviews/add?pieceId=${piece.id}`}>
                        <Button variant='contained'>Add a review</Button>
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
            <Typography variant='h5'>{piece.titleEn}</Typography>
            <Typography>{piece.descriptionEn}</Typography>
            <Typography>Group: {piece.group.nameEn}</Typography>

            <Link href={`/pieces/${piece.id}`}>Visit page</Link>
        </Box>
    )
}

export default Piece
