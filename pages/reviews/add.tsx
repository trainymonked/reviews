import { FC, SyntheticEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { Box, Button, Chip, MenuItem, OutlinedInput, Rating, Select, SelectChangeEvent, TextField, TextareaAutosize } from '@mui/material'

import Layout from '../../components/Layout'

import { getSession } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'

export async function getServerSideProps({ req, res }: { req: NextApiRequest, res: NextApiResponse }) {
    const session = await getServerSession(req, res, authOptions)

    console.log(session)

    if (session === null) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        }
    }

    return { props: {} }
}

const Draft: FC = () => {
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [images, setImages] = useState([])
    const [tags, setTags] = useState<string[]>([])
    const [grade, setGrade] = useState(0)

    const { push } = useRouter()

    const submitData = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            const body = { title, text, grade, images, tags }
            const res = await fetch('/api/review/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            // const reviewId = res...
            // push(`/reviews/${reviewId}`)
            push('/')
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

    return (
        <Layout>
            <Head>
                <title>Add a Review</title>
            </Head>
            <form onSubmit={submitData}>
                Title:
                <TextField value={title} onChange={(e) => setTitle(e.target.value)} />

                Text:
                <TextareaAutosize value={text} onChange={(e) => setText(e.target.value)} />

                Tags:
                <Select
                    multiple
                    value={tags}
                    onChange={handleTagsChange}
                    input={<OutlinedInput label="Chip" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                >
                    {/* loaded tags.map */}
                    {['123', '456'].map((name) => (
                        <MenuItem
                            key={name}
                            value={name}
                        >
                            {name}
                        </MenuItem>
                    ))}
                </Select>

                Rating:
                <Rating value={grade} onChange={(_, v) => setGrade(v || grade)} max={10} />
                <Button type='submit'>Add</Button>
            </form>
        </Layout>
    )
}

export default Draft
