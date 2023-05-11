import { FC, Key } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useIntl } from 'react-intl'

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
    const intl = useIntl()

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

                {piece.reviews && (
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Typography variant='h6' mt={1}>
                            {intl.formatMessage({ id: 'user_reviews' })}
                        </Typography>
                        {piece.reviews.map((review: IReview) => (
                            <Review review={review} key={review.id} noPiece />
                        ))}
                    </Box>
                )}

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

            <Link href={`/pieces/${piece.id}`}>{intl.formatMessage({ id: 'visit_piece_page' })}</Link>
        </Box>
    )
}

export default Piece
