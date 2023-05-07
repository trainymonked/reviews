import { FC, FormEvent, ReactNode, useState } from 'react'
import { Box, Button, Chip, MenuItem, Modal, OutlinedInput, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'

type Props = {
    onCancel: () => void
    onCreate: () => void
    shown: boolean
    pieceGroups: any[]
}

const CreatePiece: FC<Props> = ({ shown, onCancel, onCreate, pieceGroups }) => {
    const [titleEn, setTitleEn] = useState('')
    const [titleRu, setTitleRu] = useState('')
    const [descriptionEn, setDescriptionEn] = useState('')
    const [descriptionRu, setDescriptionRu] = useState('')

    const [pieceGroup, setPieceGroup] = useState('')
    const [pieceGroupHandle, setPieceGroupHandle] = useState('')

    const session = useSession()

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        const newPiece = {
            titleEn,
            descriptionEn,
            titleRu,
            descriptionRu,
            groupId: pieceGroups.find((g) => g.handle === pieceGroupHandle).id,
            authorId: session.data?.user?.id,
        }

        try {
            const res = await fetch('/api/pieces/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPiece),
            })
            if (res.ok) {
                onCreate()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const onPieceGroupChange = (event: SelectChangeEvent, child: any) => {
        setPieceGroupHandle(child.props['data-handle'])
        setPieceGroup(child.props.value)
    }

    return (
        <Modal open={shown}>
            <form onSubmit={handleSubmit}>
                <Box
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        outline: 'none',
                        py: 3,
                        px: 4,
                    }}
                >
                    <Typography variant='h5'>Title</Typography>
                    <TextField value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
                    <Typography>Decription</Typography>
                    <TextField
                        value={descriptionEn}
                        onChange={(event) => setDescriptionEn(event.target.value)}
                        multiline
                    />

                    <Typography variant='h5'>Title Rus (optional)</Typography>
                    <TextField value={titleRu} onChange={(event) => setTitleRu(event.target.value)} />
                    <Typography>Decription Rus (optional)</Typography>
                    <TextField
                        value={descriptionRu}
                        onChange={(event) => setDescriptionRu(event.target.value)}
                        multiline
                    />

                    <br />

                    <Select
                        value={pieceGroup}
                        onChange={onPieceGroupChange}
                        input={<OutlinedInput label='Chip' />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                <Chip label={selected} />
                            </Box>
                        )}
                    >
                        {pieceGroups.map((pieceGroup) => (
                            <MenuItem key={pieceGroup.id} value={pieceGroup.nameEn} data-handle={pieceGroup.handle}>
                                {pieceGroup.nameEn}
                            </MenuItem>
                        ))}
                    </Select>

                    <br />

                    <Button variant='contained' color='success' type='submit'>
                        Create
                    </Button>
                    <Button variant='outlined' color='error' type='button' onClick={onCancel}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Modal>
    )
}

export default CreatePiece
