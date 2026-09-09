import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  danger?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', danger, className, children, ...rest }: Props) {
  const cls = ['btn', `btn--${variant}`, danger ? 'btn--danger' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
