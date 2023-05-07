import { FC, SyntheticEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Rating,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material'

import Layout from '../../components/Layout'

import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
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
            pieces: pieces,
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
    const [images, setImages] = useState([])
    const [tags, setTags] = useState<string[]>([])
    const [grade, setGrade] = useState(0)

    const [piece, setPiece] = useState('')
    const [pieceId, setPieceId] = useState<string>('')

    const [isModalOpen, setIsModalOpen] = useState(false)

    const { push } = useRouter()

    const submitData = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            const body = { title, text, grade, images, tags, pieceId }
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

    const handleTagsChange = (event: SelectChangeEvent<typeof tags>) => {
        const {
            target: { value },
        } = event
        setTags(typeof value === 'string' ? value.split(',') : value)
    }

    const handlePieceChange = (event, child) => {
        setPieceId(child.props['data-id'])
        setPiece(child.props.value)
    }

    const handleCreatePiece = (event: SyntheticEvent) => {
        event.preventDefault()
        setIsModalOpen(true)
    }

    return (
        <Layout>
            <Head>
                <title>Add a Review</title>
            </Head>

            <Typography variant='h2' sx={{ textAlign: 'center', mt: 5 }}>
                Add a Review
            </Typography>

            <form onSubmit={submitData}>
                <Box sx={{ width: '40%', mx: 'auto', mt: 5, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label={'Title'} required value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField
                        multiline
                        minRows={5}
                        label={'Text'}
                        required
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <Autocomplete
                        renderInput={(params) => <TextField {...params} label={'Tags'} />}
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

                    <FormControl>
                        <InputLabel id='piece-select-label'>Piece</InputLabel>
                        <Select labelId='piece-select-label' label='Piece' value={piece} onChange={handlePieceChange}>
                            {pieces.map((piece) => (
                                <MenuItem key={piece.id} value={piece.titleEn} data-id={piece.id}>
                                    {piece.titleEn}
                                </MenuItem>
                            ))}
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Button onClick={handleCreatePiece} variant='outlined'>
                                    Create Piece
                                </Button>
                            </Box>
                        </Select>
                    </FormControl>

                    <Box sx={{ mx: 'auto' }}>
                        <Typography sx={{ textAlign: 'center', mb: 1 }}>Your Rating</Typography>
                        <Rating
                            size='large'
                            value={grade}
                            onChange={(event, value) => setGrade(value || grade)}
                            max={10}
                        />
                    </Box>

                    <Button type='submit' variant='contained'>
                        Add
                    </Button>
                </Box>
            </form>

            <CreatePiece
                pieceGroups={pieceGroups}
                shown={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onCreate={() => push('/pieces')}
            />
        </Layout>
    )
}

export default Draft
