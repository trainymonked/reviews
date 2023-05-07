import { FC, Key } from 'react'
import { Box, Typography } from '@mui/material'
import Link from './Link'
import Review, { IReview } from './Review'

export interface IPiece {
    id: Key
    titleEn: string
    titleRu: string
    descriptionEn: string
    descriptionRu: string
    authorId: Key
    groupId: Key
    group: any
    reviews: IReview[]
}

type Props = {
    piece: IPiece
    fullPage?: boolean
}

const Piece: FC<Props> = ({ piece, fullPage = false }) => {
    if (fullPage) {
        return (
            <Box sx={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                <Typography variant='h2'>
                    {piece.titleEn} ({piece.group.nameEn.slice(0, -1)})
                </Typography>
                <Typography>{piece.descriptionEn}</Typography>

                <Typography variant='h6' mt={1}>
                    User reviews
                </Typography>
                {piece.reviews.map((review: IReview) => (
                    <Review review={review} key={review.id} noPiece />
                ))}
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
            <Typography variant='h5'>{piece.titleEn}</Typography>
            <Typography>{piece.descriptionEn}</Typography>
            <Typography>Group: {piece.group.nameEn}</Typography>

            <Link href={`/pieces/${piece.id}`}>Visit page</Link>
        </Box>
    )
}

export default Piece
