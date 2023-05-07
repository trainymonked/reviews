import { FC } from 'react'
import Head from 'next/head'

import Layout from '../../components/Layout'
import prisma from '../../lib/prisma'
import Piece, { IPiece } from '../../components/Piece'

type ParamsProps = {
    params: {
        id: string
    }
}

export async function getServerSideProps({ params }: ParamsProps) {
    const { id } = params

    const piece = await prisma.piece.findUnique({ where: { id }, include: { group: true, reviews: true } })

    if (piece === null) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            piece,
        },
    }
}

type Props = {
    piece: IPiece
}

const ReviewPage: FC<Props> = ({ piece }) => {
    return (
        <Layout>
            <Head>
                <title>{piece.titleEn}</title>
            </Head>
            <Piece piece={piece} fullPage />
        </Layout>
    )
}

export default ReviewPage
