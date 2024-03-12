import { useEffect, useMemo, useState } from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SessionProvider, getSession } from 'next-auth/react'
import { IntlProvider } from 'react-intl'
import { Session } from 'next-auth'
import { SnackbarProvider } from 'notistack'

import English from '../lang/compiled/en.json'
import Russian from '../lang/compiled/ru.json'

const App = ({ Component, pageProps }: AppProps) => {
    const { locale, push, pathname, query, asPath } = useRouter()
    const [shortLocale] = locale ? locale.split('-') : ['en']
    const [userLocale, setUserLocale] = useState(shortLocale)

    useEffect(() => {
        ;(async () => {
            const session: Session | null = await getSession()
            let preferredLocale = shortLocale

            if (session) {
                preferredLocale = session.user.preferredLocale || 'en'
            }

            if (locale !== preferredLocale) {
                push({ pathname, query }, asPath, { locale: preferredLocale })
                return
            }

            setUserLocale(preferredLocale)
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
            <IntlProvider
                locale={userLocale}
                messages={messages}
            >
                <SnackbarProvider
                    anchorOrigin={{
                        horizontal: 'center',
                        vertical: 'bottom',
                    }}
                    autoHideDuration={3000}
                    maxSnack={3}
                >
                    <Component {...pageProps} />
                </SnackbarProvider>
            </IntlProvider>
        </SessionProvider>
    )
}

export default App
