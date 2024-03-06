import React, { FC, ReactNode } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import MuiLink from '@mui/material/Link'
import { styled } from '@mui/material/styles'

const Anchor = styled('a')({})

type NextLinkComposedProps = {
    className?: string
    children?: ReactNode
    href?: any
    legacyBehavior?: boolean
    linkAs?: object | string
    locale?: string
    passHref?: boolean
    prefetch?: boolean
    replace?: boolean
    scroll?: boolean
    shallow?: boolean
    to: object | string
}

const NextLinkComposed = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(function NextLinkComposed(
    props: NextLinkComposedProps,
    ref
) {
    const { to, linkAs, replace, scroll, shallow, prefetch, legacyBehavior = true, locale, ...other } = props

    return (
        <NextLink
            href={to}
            prefetch={prefetch}
            as={linkAs}
            replace={replace}
            scroll={scroll}
            shallow={shallow}
            passHref
            legacyBehavior={legacyBehavior}
            locale={locale}
        >
            <Anchor
                ref={ref}
                {...other}
            />
        </NextLink>
    )
})

type LinkProps = {
    activeClassName?: string
    as?: object | string
    className?: string
    children?: ReactNode
    href?: any
    legacyBehavior?: boolean
    linkAs?: object | string
    locale?: string
    noLinkStyle?: boolean
    prefetch?: boolean
    replace?: boolean
    role?: string
    scroll?: boolean
    shallow?: boolean
    component?: FC
    underline?: 'none' | 'always' | 'hover'
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props: LinkProps, ref) {
    const {
        activeClassName = 'active',
        as,
        className: classNameProps,
        href,
        legacyBehavior,
        linkAs: linkAsProp,
        locale,
        noLinkStyle,
        prefetch,
        replace,
        role,
        scroll,
        shallow,
        underline = 'none',
        ...other
    } = props

    const router = useRouter()
    const pathname = typeof href === 'string' ? href : href.pathname
    const className = clsx(classNameProps, {
        [activeClassName]: router.pathname === pathname && activeClassName,
    })

    const isExternal = typeof href === 'string' && (href.indexOf('http') === 0 || href.indexOf('mailto:') === 0)

    if (isExternal) {
        if (noLinkStyle) {
            return (
                <Anchor
                    className={className}
                    href={href}
                    ref={ref}
                    {...other}
                />
            )
        }

        return (
            <MuiLink
                className={className}
                href={href}
                ref={ref}
                underline={underline}
                {...other}
            />
        )
    }

    const linkAs = linkAsProp || as
    const nextjsProps = {
        to: href,
        linkAs,
        replace,
        scroll,
        shallow,
        prefetch,
        legacyBehavior,
        locale,
    }

    if (noLinkStyle) {
        return (
            <NextLinkComposed
                className={className}
                ref={ref}
                {...nextjsProps}
                {...other}
            />
        )
    }

    return (
        <MuiLink
            component={NextLinkComposed}
            className={className}
            ref={ref}
            {...nextjsProps}
            underline={underline}
            {...other}
        />
    )
})

export default Link
