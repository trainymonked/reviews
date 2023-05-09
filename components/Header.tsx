import { FC } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar, AppBar, Box, IconButton, Toolbar, Typography, alpha, styled } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'
import AccountCircle from '@mui/icons-material/AccountCircle'

import Link from './Link'

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.1),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.15),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}))

const Header: FC = () => {
    const { data: session, status } = useSession()

    const { push } = useRouter()

    let rightContent: any

    if (status === 'loading') {
        rightContent = {
            title: 'Loading...',
            button: () => {},
        }
        // rightContent = <Typography>Validating session ...</Typography>
    }

    if (!session) {
        rightContent = {
            title: 'Click to Log In',
            button: () => push('/api/auth/signin'),
        }
        // rightContent = (
        //     <Link href='/api/auth/signin'>
        //         <Button variant='contained'>Log in</Button>
        //     </Link>
        // )
    }

    if (session) {
        rightContent = {
            title: `${session.user?.name} (${session.user?.email})\n\nClick to Log out`,
            button: () => signOut(),
        }
        // rightContent = (
        //     <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        //         <Typography>
        //             {session.user?.name} ({session.user?.email})
        //         </Typography>
        //         <Button size='small' variant='contained' onClick={() => signOut()}>
        //             Log out
        //         </Button>
        //     </Box>
        // )
    }

    return (
        <AppBar position='static' color='inherit'>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Link href='/'>
                        <Typography color='inherit'>Reviews</Typography>
                    </Link>
                    <Link href='/users'>
                        <Typography color='inherit'>Users</Typography>
                    </Link>
                    <Link href='/pieces'>
                        <Typography color='inherit'>Pieces</Typography>
                    </Link>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase placeholder='Search…' />
                    </Search>
                    <IconButton
                        sx={{ width: '32px', height: '32px' }}
                        title={rightContent.title}
                        onClick={rightContent.button}
                        color='inherit'
                    >
                        {session?.user?.image ? (
                            <Avatar src={session.user.image} variant='circular' />
                        ) : (
                            <AccountCircle />
                        )}
                    </IconButton>
                    {/* {rightContent} */}
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default Header
