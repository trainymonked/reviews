import { FC, SyntheticEvent, useState, useEffect, ChangeEvent } from 'react'
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { authOptions } from '../api/auth/[...nextauth]'
import prisma from '../../lib/prisma'
import Layout from '../../components/Layout'
import { IPiece } from '../../components/Piece'
import CreatePiece from '../../components/CreatePiece'

export async function getServerSideProps({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
    const session = await getServerSession(req, res, authOptions)

    if (session === null) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        }
    }

    const pieces = await prisma.piece.findMany()
    const pieceGroups = await prisma.pieceGroup.findMany()

    return {
        props: {
            pieces: pieces.map(piece => ({
                ...piece,
                creationDate: Date.parse(piece.creationDate.toJSON()),
            })),
            pieceGroups: pieceGroups,
        },
    }
}

type Props = {
    pieces: IPiece[]
    pieceGroups: any[]
}

const Draft: FC<Props> = ({ pieces, pieceGroups }) => {
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [grade, setGrade] = useState(0)
    const [piece, setPiece] = useState('')
    const [pieceId, setPieceId] = useState<string>('')

    const supabase = createClientComponentClient()
    const [currentFile, setCurrentFile] = useState<{ file: File; name: string } | null>(null)
    const [images, setImages] = useState<{ id: string; path: string; fullPath: string }[]>([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const { push } = useRouter()
    const searchParams = useSearchParams()
    const intl = useIntl()

    useEffect(() => {
        const pId = pieceId || searchParams.get('pieceId') || ''
        if (pId !== pieceId) {
            setPieceId(pId)
            const piece = pieces.find(piece => piece.id === pId)
            setPiece(piece ? (intl.locale === 'en' ? piece.titleEn : piece.titleRu || piece.titleEn) : '')
        }
    }, [searchParams, intl.locale, pieces, pieceId])

    const submitData = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            const body = { title, text, grade, images: images.map(i => i.fullPath), tags, pieceId }
            const res = await fetch('/api/reviews/add', {
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

        setImages(images => {
            return images.concat(data)
        })
    }

    return (
        <Layout>
            <Head>
                <title>{intl.formatMessage({ id: 'pages.reviews_add.title' })}</title>
            </Head>

            <Typography
                variant='h2'
                sx={{ textAlign: 'center', mt: 5 }}
            >
                {intl.formatMessage({ id: 'add_review' })}
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
                            value={grade}
                            onChange={(event, value) => setGrade(value || grade)}
                            max={10}
                        />
                    </Box>

                    <Box sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            type='file'
                            inputProps={{ accept: 'image/*' }}
                            size='small'
                            disabled={images.length > 1}
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

                    <Box>
                        {images.map(image => (
                            <Typography
                                sx={{ fontWeight: '700', color: 'forestgreen' }}
                                key={image.id}
                            >
                                {image.path}
                            </Typography>
                        ))}
                    </Box>

                    <Button
                        type='submit'
                        variant='contained'
                        disabled={!piece || !title.trim() || !text.trim() || !grade}
                    >
                        {intl.formatMessage({ id: 'review_add' })}
                    </Button>
                </Box>
            </form>

            <CreatePiece
                pieceGroups={pieceGroups}
                shown={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onCreate={pieceId => {
                    setIsModalOpen(false)
                    push(`/reviews/add?pieceId=${pieceId}`)
                }}
            />
        </Layout>
    )
}

export default Draft
