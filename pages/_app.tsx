import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app'

const App = ({ Component, pageProps }: AppProps) => (
    <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
    </SessionProvider>
)

export default App
