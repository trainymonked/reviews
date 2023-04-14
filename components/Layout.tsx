import { Container } from '@mui/material'
import { FC, ReactNode } from 'react'
import Header from './Header'

type Props = {
    children: ReactNode
}

const Layout: FC<Props> = (props) => (
    <>
        <Header />
        <Container>{props.children}</Container>
        <style jsx global>{`
            body {
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
                    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        `}</style>
    </>
)

export default Layout
