import { FC } from 'react'
import { NextApiRequest, NextApiResponse } from 'next'
import Head from 'next/head'
import { getServerSession } from 'next-auth'
import { Box } from '@mui/material'
import { useIntl } from 'react-intl'

import prisma from '../../lib/prisma'
import Layout from '../../components/Layout'
import Piece, { IPiece } from '../../components/Piece'
import { authOptions } from '../api/auth/[...nextauth]'

export async function getServerSideProps({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
    const session = await getServerSession(req, res, authOptions)

    const pieces = await prisma.piece.findMany({ include: { group: true, ratings: true } })

    return {
        props: {
            pieces: pieces.map(piece => ({
                ...piece,
                creationDate: Date.parse(piece.creationDate.toJSON()),
            })),
            isAuthenticated: !!session,
        },
    }
}

type Props = {
    pieces: IPiece[]
    isAuthenticated: boolean
}

const Pieces: FC<Props> = ({ pieces, isAuthenticated }) => {
    const intl = useIntl()
    return (
        <Layout>
            <Head>
                <title>{intl.formatMessage({ id: 'page.pieces.title' })}</title>
            </Head>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pieces.map((piece: IPiece) => (
                    <Piece
                        piece={piece}
                        key={piece.id}
                        isAuthenticated={isAuthenticated}
                    />
                ))}
            </Box>
        </Layout>
    )
}

export default Pieces
