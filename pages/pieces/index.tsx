import { FC } from 'react'
import Head from 'next/head'
import { Box } from '@mui/material'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Piece, { IPiece } from '../../components/Piece'

export async function getServerSideProps() {
    const pieces = await prisma.piece.findMany({ include: { group: true } })

    return {
        props: {
            pieces,
        },
    }
}

type Props = {
    pieces: IPiece[]
}

const Pieces: FC<Props> = ({ pieces }) => {
    return (
        <Layout>
            <Head>
                <title>Pieces</title>
            </Head>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pieces.map((piece: IPiece) => (
                    <Piece piece={piece} key={piece.id} />
                ))}
            </Box>
        </Layout>
    )
}

export default Pieces
