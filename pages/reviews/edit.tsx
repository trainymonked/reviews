import { FC, SyntheticEvent, useEffect, useState } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { getServerSession } from 'next-auth'
import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Rating,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material'
import { useIntl } from 'react-intl'

import { authOptions } from '../api/auth/[...nextauth]'
import prisma from '../../lib/prisma'
import Layout from '../../components/Layout'
import { IPiece } from '../../components/Piece'
import CreatePiece from '../../components/CreatePiece'
import { IReview } from '../../components/Review'

export async function getServerSideProps({
    req,
    res,
    query,
}: {
    req: NextApiRequest
    res: NextApiResponse
    query: { id: string }
}) {
    const session = await getServerSession(req, res, authOptions)

    if (session === null) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        }
    }

    const review = await prisma.review.findUnique({
        where: {
            id: query.id,
        },
        include: {
            piece: true,
        },
    })

    if (!review) {
        return {
            notFound: true,
        }
    }

    const pieces = await prisma.piece.findMany()
    const pieceGroups = await prisma.pieceGroup.findMany()

    return {
        props: {
            review: {
                ...review,
                creationDate: Date.parse(review.creationDate.toJSON() || ''),
                piece: {
                    ...review.piece,
                    creationDate: Date.parse(review.piece.creationDate.toJSON() || ''),
                },
            },
            pieces: pieces.map(piece => ({
                ...piece,
                creationDate: Date.parse(piece.creationDate.toJSON()),
            })),
            pieceGroups: pieceGroups,
        },
    }
}

type Props = {
    review: IReview
    pieces: IPiece[]
    pieceGroups: any[]
}

const Draft: FC<Props> = ({ review, pieces, pieceGroups }) => {
    const [title, setTitle] = useState(review.title)
    const [text, setText] = useState(review.text)
    const [images, setImages] = useState(review.images)
    const [tags, setTags] = useState(review.tags)
    const [grade, setGrade] = useState(review.grade)
    const [pieceId, setPieceId] = useState(review.pieceId)

    const { push } = useRouter()
    const searchParams = useSearchParams()
    const intl = useIntl()

    const [piece, setPiece] = useState(
        intl.locale === 'en' ? review.piece.titleEn : review.piece.titleRu || review.piece.titleEn
    )

    useEffect(() => {
        const pId = searchParams.get('pieceId') || pieceId || ''

        if (pId !== pieceId) {
            setPieceId(pId)
            const piece = pieces.find(piece => piece.id === pId)
            setPiece(piece ? (intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn) : '')
        }
    }, [searchParams, intl.locale, pieces, pieceId])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const submitData = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            const body = { title, text, grade, images, tags, pieceId, id: review.id }
            const res = await fetch('/api/reviews/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            const reviewId = data.id
            push(`/reviews/${reviewId}`)
        } catch (error) {
            console.error(error)
        }
    }

    // const handleTagsChange = (event: SelectChangeEvent<typeof tags>) => {
    //     const {
    //         target: { value },
    //     } = event
    //     setTags(typeof value === 'string' ? value.split(',') : value)
    // }

    const handlePieceChange = (event: SelectChangeEvent, child: any) => {
        setPieceId(child.props['data-id'])
        setPiece(child.props.value)
    }

    const handleCreatePiece = (event: SyntheticEvent) => {
        event.preventDefault()
        setIsSelectOpen(false)
        setIsModalOpen(true)
    }

    return (
        <Layout>
            <Head>
                <title>{intl.formatMessage({ id: 'pages.reviews_edit.title' })}</title>
            </Head>

            <Typography
                variant='h2'
                sx={{ textAlign: 'center', mt: 5 }}
            >
                {intl.formatMessage({ id: 'review_edit' })}
            </Typography>

            <form onSubmit={submitData}>
                <Box
                    sx={{
                        maxWidth: '40%',
                        minWidth: '240px',
                        mx: 'auto',
                        mt: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <InputLabel id='piece-select-label'>{intl.formatMessage({ id: 'piece' })}</InputLabel>
                        <Select
                            open={isSelectOpen}
                            onOpen={() => setIsSelectOpen(true)}
                            onClose={() => setIsSelectOpen(false)}
                            labelId='piece-select-label'
                            label={intl.formatMessage({ id: 'piece' })}
                            value={piece}
                            onChange={handlePieceChange}
                            required
                        >
                            {pieces.map(piece => (
                                <MenuItem
                                    key={piece.id}
                                    value={intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn}
                                    data-id={piece.id}
                                >
                                    {intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn}
                                </MenuItem>
                            ))}
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Button
                                    onClick={handleCreatePiece}
                                    variant='outlined'
                                >
                                    {intl.formatMessage({ id: 'create_piece' })}
                                </Button>
                            </Box>
                        </Select>
                    </FormControl>

                    <TextField
                        label={intl.formatMessage({ id: 'review_title' })}
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <TextField
                        multiline
                        minRows={5}
                        label={intl.formatMessage({ id: 'review_text' })}
                        required
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />

                    <Autocomplete
                        renderInput={params => (
                            <TextField
                                {...params}
                                label={intl.formatMessage({ id: 'review_tags' })}
                            />
                        )}
                        multiple
                        disabled
                        options={['tag1', 'tag2']}
                        value={tags}
                        onChange={(e, value, reason, details) => {
                            setTags(value)
                        }}
                        disableCloseOnSelect
                    />

                    {/* <Autocomplete
                        renderInput={(params) => <TextField {...params} label={'Piece'} />}
                        options={pieces.map((piece) => ({
                            label: piece.titleEn,
                            id: piece.id,
                        }))}
                        value={piece}
                        onChange={(event, value) => {
                            // setPieceId(child.props['data-id'])
                            setPiece(value)
                        }}
                    /> */}

                    <Box sx={{ mx: 'auto' }}>
                        <Typography sx={{ textAlign: 'center', mb: 1 }}>
                            {intl.formatMessage({ id: 'review_rating' })}
                        </Typography>
                        <Rating
                            sx={{ maxWidth: '60%' }}
                            value={+grade}
                            onChange={(event, value) => setGrade(String(value) || grade)}
                            max={10}
                        />
                    </Box>

                    <Button
                        type='submit'
                        variant='contained'
                        disabled={!piece || !title.trim() || !text.trim() || !grade}
                    >
                        {intl.formatMessage({ id: 'review_save' })}
                    </Button>
                </Box>
            </form>

            <CreatePiece
                pieceGroups={pieceGroups}
                shown={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onCreate={pieceId => {
                    setIsModalOpen(false)
                    push(`/reviews/edit?id=${review.id}&pieceId=${pieceId}`)
                }}
            />
        </Layout>
    )
}

export default Draft
