import { useEffect, useMemo, useState } from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SessionProvider, getSession } from 'next-auth/react'
import { IntlProvider } from 'react-intl'

import English from '../lang/compiled/en.json'
import Russian from '../lang/compiled/ru.json'

const App = ({ Component, pageProps }: AppProps) => {
    const { locale, push, pathname, query, asPath } = useRouter()
    const [shortLocale] = locale ? locale.split('-') : ['en']
    const [userLocale, setUserLocale] = useState(shortLocale)

    useEffect(() => {
        ;(async () => {
            const session: any = await getSession()
            if (session) {
                const preferredLocale = session?.user?.preferredLocale
                setUserLocale(preferredLocale)
                push({ pathname, query }, asPath, { locale: preferredLocale })
            } else {
                setUserLocale(shortLocale)
                push({ pathname, query }, asPath, { locale: shortLocale })
            }
        })()
    }, [locale])

    const messages = useMemo(() => {
        switch (userLocale) {
            case 'ru':
                return Russian
            case 'en':
                return English
            default:
                return English
        }
    }, [userLocale])

    return (
        <SessionProvider session={pageProps.session}>
            <IntlProvider locale={userLocale} messages={messages}>
                <Component {...pageProps} />
            </IntlProvider>
        </SessionProvider>
    )
}

export default App
