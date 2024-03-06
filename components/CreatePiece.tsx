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
import { useIntl } from 'react-intl'
import { Session } from 'next-auth'

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

    const intl = useIntl()

    useEffect(() => {
        setTitleEn('')
        setTitleRu('')
        setDescriptionEn('')
        setDescriptionRu('')
        setPieceGroup('')
        setPieceGroupHandle('')
    }, [shown])

    const session: { data: Session | null } = useSession()

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        const newPiece = {
            titleEn,
            descriptionEn,
            titleRu,
            descriptionRu,
            groupId: pieceGroups.find(g => g.handle === pieceGroupHandle).id,
            authorId: session.data?.user.id,
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
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    outline: 'none',
                    px: 4,
                    maxWidth: '40%',
                    minWidth: '240px',
                }}
            >
                <Typography
                    variant='h3'
                    sx={{ textAlign: 'center', mt: 3 }}
                >
                    {intl.formatMessage({ id: 'create_piece' })}
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
                            <InputLabel id='piece-group-select-label'>
                                {intl.formatMessage({ id: 'piece_group' })}
                            </InputLabel>
                            <Select
                                labelId='piece-group-select-label'
                                label={intl.formatMessage({ id: 'piece_group' })}
                                value={pieceGroup}
                                onChange={onPieceGroupChange}
                            >
                                {pieceGroups.map(pieceGroup => (
                                    <MenuItem
                                        key={pieceGroup.id}
                                        value={intl.locale === 'en' ? pieceGroup.nameEn : pieceGroup.nameRu}
                                        data-handle={pieceGroup.handle}
                                    >
                                        {intl.locale === 'en' ? pieceGroup.nameEn : pieceGroup.nameRu}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label={intl.formatMessage({ id: 'piece_title' })}
                            required
                            value={titleEn}
                            onChange={event => setTitleEn(event.target.value)}
                        />
                        <TextField
                            multiline
                            label={intl.formatMessage({ id: 'piece_description' })}
                            required
                            value={descriptionEn}
                            onChange={event => setDescriptionEn(event.target.value)}
                        />

                        <TextField
                            label={intl.formatMessage({ id: 'piece_title_ru' })}
                            value={titleRu}
                            onChange={event => setTitleRu(event.target.value)}
                        />
                        <TextField
                            multiline
                            label={intl.formatMessage({ id: 'piece_description_ru' })}
                            value={descriptionRu}
                            onChange={event => setDescriptionRu(event.target.value)}
                        />

                        <Button
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={!pieceGroup || !titleEn.trim() || !descriptionEn.trim()}
                        >
                            {intl.formatMessage({ id: 'create' })}
                        </Button>
                        <Button
                            variant='text'
                            color='error'
                            type='button'
                            onClick={onCancel}
                        >
                            {intl.formatMessage({ id: 'cancel' })}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    )
}

export default CreatePiece
