import Image from 'next/image'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const defaultWidth = 183
const defaultHeight = 48

type LogoProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'>

export function Logo({
  width = defaultWidth,
  height = defaultHeight,
  className,
  ...props
}: LogoProps) {
  return (
    <>
      <Image
        src="/logo.svg"
        alt="Unmyst"
        width={width}
        height={height}
        {...props}
        className={cn('w-auto dark:hidden', className)}
        priority
      />
      <Image
        src="/logo-dark.svg"
        alt="Unmyst"
        width={width}
        height={height}
        {...props}
        className={cn('hidden w-auto dark:block', className)}
        priority
      />
    </>
  )
}
