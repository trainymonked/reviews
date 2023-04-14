import { FC, SyntheticEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Rating, TextField, TextareaAutosize } from '@mui/material'

import Layout from '../../components/Layout'

const Draft: FC = () => {
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [images, setImages] = useState([])
    const [tags, setTags] = useState([])
    const [grade, setGrade] = useState(0)

    const { push } = useRouter()

    const submitData = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            const body = { title, text, grade, images, tags }
            // const res = await fetch('/api/review', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(body),
            // })
            // const reviewId = res...
            // push(`/reviews/${reviewId}`)
            push('/')
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <Layout>
            <form onSubmit={submitData}>
                Title:
                <TextField value={title} onChange={(e) => setTitle(e.target.value)} />
                Text:
                <TextareaAutosize value={text} onChange={(e) => setText(e.target.value)} />
                Tags: Rating:
                <Rating value={grade} onChange={(e) => setGrade(+e.target.value)} max={10} />
                <Button type='submit'>Add</Button>
            </form>
        </Layout>
    )
}

export default Draft
