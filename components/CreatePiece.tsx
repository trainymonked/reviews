import { FC, FormEvent, useEffect, useState } from 'react'
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'

type Props = {
    onCancel: () => void
    onCreate: (pieceId: string) => void
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

    useEffect(() => {
        setTitleEn('')
        setTitleRu('')
        setDescriptionEn('')
        setDescriptionRu('')
        setPieceGroup('')
        setPieceGroupHandle('')
    }, [shown])

    const session: { data: any } = useSession()

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
            const piece = await res.json()
            onCreate(piece.id)
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
            <Box
                sx={{
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    width: 400,
                    boxShadow: 24,
                    outline: 'none',
                    px: 4,
                }}
            >
                <Typography variant='h3' sx={{ textAlign: 'center', mt: 3 }}>
                    Create a Piece
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box
                        sx={{
                            mt: 2,
                            mb: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        <FormControl>
                            <InputLabel id='piece-group-select-label'>Group</InputLabel>
                            <Select
                                labelId='piece-group-select-label'
                                label='Group'
                                value={pieceGroup}
                                onChange={onPieceGroupChange}
                            >
                                {pieceGroups.map((pieceGroup) => (
                                    <MenuItem
                                        key={pieceGroup.id}
                                        value={pieceGroup.nameEn}
                                        data-handle={pieceGroup.handle}
                                    >
                                        {pieceGroup.nameEn}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label='Title'
                            required
                            value={titleEn}
                            onChange={(event) => setTitleEn(event.target.value)}
                        />
                        <TextField
                            multiline
                            label='Description'
                            required
                            value={descriptionEn}
                            onChange={(event) => setDescriptionEn(event.target.value)}
                        />

                        <TextField
                            label='Title Rus (optional)'
                            value={titleRu}
                            onChange={(event) => setTitleRu(event.target.value)}
                        />
                        <TextField
                            multiline
                            label='Decription Rus (optional)'
                            value={descriptionRu}
                            onChange={(event) => setDescriptionRu(event.target.value)}
                        />

                        <Button variant='contained' color='success' type='submit'>
                            Create
                        </Button>
                        <Button variant='outlined' color='error' type='button' onClick={onCancel}>
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    )
}

export default CreatePiece
