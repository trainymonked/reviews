import { FC, useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import {
    Avatar,
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
    alpha,
    styled,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    InputBase,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { Logout, AccountCircle, KeyboardArrowDown, Language, Login, Person } from '@mui/icons-material'
import { Session } from 'next-auth'

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
    const { data: session }: { data: Session | null } = useSession()

    const { push, pathname, query, asPath } = useRouter()
    const intl = useIntl()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const [userAvatar, setUserAvatar] = useState<string | null>(null)

    useEffect(() => {
        const getAvatarStatus = async () => {
            if (!session?.user.image) {
                return setUserAvatar(null)
            }
            const res = await fetch(session.user.image || '', {
                method: 'HEAD',
            })
            if (res.status === 404) {
                return setUserAvatar(null)
            }
            return setUserAvatar(session.user.image)
        }
        getAvatarStatus()
    }, [session?.user.image])

    return (
        <>
            <AppBar
                position='static'
                color='inherit'
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                        <Link href='/'>
                            <Typography color='inherit'>{intl.formatMessage({ id: 'page.reviews.title' })}</Typography>
                        </Link>
                        <Link href='/users'>
                            <Typography
                                fontSize='small'
                                color='inherit'
                            >
                                {intl.formatMessage({ id: 'page.users.title' })}
                            </Typography>
                        </Link>
                        <Link href='/pieces'>
                            <Typography
                                fontSize='small'
                                color='inherit'
                            >
                                {intl.formatMessage({ id: 'page.pieces.title' })}
                            </Typography>
                        </Link>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                id='global-search-input'
                                placeholder={intl.formatMessage({ id: 'search_placeholder' })}
                            />
                        </Search>
                        <Box
                            sx={{
                                display: 'flex',
                                py: 1.5,
                                pl: 2.5,
                                ':hover': { background: 'rgba(0, 0, 0, 0.15)' },
                                cursor: 'pointer',
                                alignItems: 'center',
                            }}
                            onClick={handleClick}
                        >
                            <IconButton
                                disableRipple
                                sx={{ width: '32px', height: '32px' }}
                                color='inherit'
                            >
                                {userAvatar ? (
                                    <Avatar
                                        src={userAvatar}
                                        variant='circular'
                                    />
                                ) : (
                                    <AccountCircle sx={{ width: '32px', height: '32px' }} />
                                )}
                            </IconButton>
                            <IconButton disableRipple>
                                <KeyboardArrowDown />
                            </IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Menu
                anchorEl={anchorEl}
                id='account-menu'
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        elevation: 4,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1,
                            '& .MuiAvatar-root': {
                                width: 28,
                                height: 28,
                                ml: -0.5,
                                mr: 1.5,
                            },
                            '& .MuiSvgIcon-root': {
                                width: 28,
                                height: 28,
                                ml: -0.5,
                                mr: 1.5,
                            },
                            '& .MuiMenuItem-root:not(:last-of-type)': {
                                my: 1,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ display: 'flex', px: 2, py: 1, alignItems: 'center' }}>
                    {userAvatar ? (
                        <Avatar
                            src={userAvatar}
                            variant='circular'
                        />
                    ) : (
                        <AccountCircle />
                    )}
                    <Typography>
                        {session
                            ? session.user.name || intl.formatMessage({ id: 'unnamed_user' })
                            : intl.formatMessage({ id: 'not_authorized' })}
                    </Typography>
                </Box>
                <Divider />
                {session && (
                    <MenuItem
                        onClick={() => {
                            push(`/users/${session.user.id}`)
                        }}
                    >
                        <ListItemIcon>
                            <Person />
                        </ListItemIcon>
                        {intl.formatMessage({ id: 'my_profile' })}
                    </MenuItem>
                )}
                <MenuItem
                    onClick={async () => {
                        const newLocale = intl.locale === 'en' ? 'ru' : 'en'
                        if (session?.user) {
                            const body = { preferredLocale: newLocale }
                            await fetch('/api/locale/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                            })
                        }
                        push({ pathname, query }, asPath, { locale: newLocale })
                    }}
                >
                    <ListItemIcon>
                        <Language />
                    </ListItemIcon>
                    {intl.formatMessage({ id: 'switch_language' })}
                </MenuItem>
                {session ? (
                    <MenuItem
                        onClick={() => {
                            handleClose()
                            signOut()
                        }}
                    >
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        {intl.formatMessage({ id: 'log_out' })}
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            handleClose()
                            push('/api/auth/signin')
                        }}
                    >
                        <ListItemIcon>
                            <Login />
                        </ListItemIcon>
                        {intl.formatMessage({ id: 'log_in' })}
                    </MenuItem>
                )}
            </Menu>
        </>
    )
}

export default Header
