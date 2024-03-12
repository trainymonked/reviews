import { ChangeEvent, FC, SyntheticEvent, useEffect, useState } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Rating,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material'
import { Clear } from '@mui/icons-material'
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

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const imagesData = review.images.map(i => ({
        path: i.match(/[^/]+$/)![0],
        publicUrl: supabase.storage.from('review_images').getPublicUrl(i.match(/[^/]+$/)![0]).data.publicUrl,
        fullPath: i,
    }))

    return {
        props: {
            review: {
                ...review,
                images: imagesData,
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

type ImReview = Omit<IReview, 'images'> & {
    images: {
        path: string
        publicUrl: string
        fullPath: string
    }[]
}

type Props = {
    review: ImReview
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

    const supabase = createClientComponentClient()
    const [currentFile, setCurrentFile] = useState<{ file: File; name: string } | null>(null)
    const [newImages, setNewImages] = useState<{ id: string; path: string; fullPath: string }[]>([])

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
            const body = {
                title,
                text,
                grade,
                images: images.map(i => i.fullPath).concat(newImages.map(i => i.fullPath)),
                oldImages: review.images,
                tags,
                pieceId,
                id: review.id,
            }
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

    const removeImage = (path: string) => {
        setImages(images => images.filter(image => image.path !== path))
    }

    const removeServerImage = async (path: string) => {
        await supabase.storage.from('review_images').remove([path])
        setNewImages(images => images.filter(image => image.path !== path))
    }

    const uploadImage = async () => {
        const fileName = Date.now() + '-' + currentFile!.name.match(/[^\\]+$/)![0]

        const { data, error } = (await supabase.storage.from('review_images').upload(fileName, currentFile!.file)) as {
            data: { id: string; path: string; fullPath: string }
            error: any
        }

        if (error) {
            console.error(error)
            return
        }

        setCurrentFile(null)

        setNewImages(images => {
            return images.concat(data)
        })
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
                            inputProps={{
                                id: 'piece-select-label',
                            }}
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

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography>{intl.formatMessage({ id: 'you_can_upload_images_below' })}</Typography>

                        {!!images.length && (
                            <Box>
                                {images.map(image => (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 0.5,
                                            alignItems: 'center',
                                        }}
                                        key={image.path}
                                    >
                                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                            <img
                                                width={'64px'}
                                                height={'64px'}
                                                style={{ objectFit: 'contain' }}
                                                src={image.publicUrl}
                                                alt={intl.formatMessage({ id: 'alt_user_image' })}
                                            />
                                            <Typography>{image.path}</Typography>
                                        </Box>
                                        <IconButton
                                            size='small'
                                            onClick={() => removeImage(image.path)}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 1,
                                alignItems: 'center',
                            }}
                        >
                            <TextField
                                type='file'
                                inputProps={{ accept: 'image/*' }}
                                size='small'
                                disabled={newImages.length + images.length > 1}
                                value={currentFile?.name ?? ''}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    if (event.target.files) {
                                        setCurrentFile({ file: event.target.files[0], name: event.target.value })
                                    } else {
                                        setCurrentFile(null)
                                    }
                                }}
                            />
                            <Button
                                variant='outlined'
                                color='info'
                                size='medium'
                                disabled={!(currentFile && images.length < 2)}
                                onClick={uploadImage}
                            >
                                Upload
                            </Button>
                        </Box>

                        {newImages.map(image => (
                            <Box
                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                key={image.id}
                            >
                                <Typography sx={{ fontWeight: '700', color: 'forestgreen' }}>{image.path}</Typography>
                                <IconButton
                                    size='small'
                                    onClick={() => {
                                        removeServerImage(image.path)
                                    }}
                                >
                                    <Clear />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>

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
                            onChange={(_, value) => setGrade(String(value) || grade)}
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
