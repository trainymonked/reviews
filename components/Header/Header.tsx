import { FC } from 'react'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { signOut, useSession } from 'next-auth/react'
import Link from '../Link'

const Header: FC = () => {
    const { data: session, status } = useSession()

    let rightContent

    if (status === 'loading') {
        rightContent = <Typography>Validating session ...</Typography>
    }

    if (!session) {
        rightContent = (
            <Link href='/api/auth/signin'>
                <Button variant='contained'>Log in</Button>
            </Link>
        )
    }

    if (session) {
        rightContent = (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography>
                    {/* {session.user.name} ({session.user.email}) */}
                    Logged in user
                </Typography>
                <Button size='small' variant='contained' onClick={() => signOut()}>
                    Log out
                </Button>
            </Box>
        )
    }

    return (
        <AppBar position='static' color='inherit'>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Link href='/'>
                        <Typography color='inherit'>Reviews</Typography>
                    </Link>
                </Box>
                {rightContent}
            </Toolbar>
        </AppBar>
    )
}

export default Header
