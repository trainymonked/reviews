const x = require('@prisma/client')
const prisma = new x.PrismaClient()
async function main() {
    const movies = await prisma.pieceGroup.upsert({
        where: { handle: 'movies' },
        update: {},
        create: {
            handle: 'movies',
            nameEn: 'Movies',
            nameRu: 'Фильмы',
            // pieces: {
            //     create: {
            //         title: 'Check out Prisma with Next.js',
            //         text: 'https://www.prisma.io/nextjs',
            //         grade: '5',
            //     },
            // },
        },
    })
    const tv = await prisma.pieceGroup.upsert({
        where: { handle: 'tv' },
        update: {},
        create: {
            handle: 'tv',
            nameEn: 'TV Shows',
            nameRu: 'Сериалы',
            // pieces: {
            //     create: {
            //         title: 'Check out Prisma with Next.js',
            //         text: 'https://www.prisma.io/nextjs',
            //         grade: '5',
            //     },
            // },
        },
    })
    const games = await prisma.pieceGroup.upsert({
        where: { handle: 'games' },
        update: {},
        create: {
            handle: 'games',
            nameEn: 'Games',
            nameRu: 'Игры',
            // pieces: {
            //     create: {
            //         title: 'Check out Prisma with Next.js',
            //         text: 'https://www.prisma.io/nextjs',
            //         grade: '5',
            //     },
            // },
        },
    })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async e => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
