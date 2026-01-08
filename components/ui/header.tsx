import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { ClassName } from '@/types'
import Link from 'next/link'
import { Button } from './button'

interface HeaderProps {
  title: string
  subtitle?: string
  icon?: IconName
  href?: string
  className?: ClassName
}

export const Header = ({ title, href, icon, className, subtitle }: HeaderProps) => {
  return (
    <header className={cn('bg-zinc-900/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-10', className)}>
      <div className='max-w-6xl mx-auto px-6 md:py-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h1 className='text-base text-white font-brk'>{title}</h1>
        </div>
        <Link href={href ?? '#'}>
          <Button
            size='icon'
            variant='ghost'
            className='text-white rounded-full focus-within:bg-transparent hover:bg-transparent hover:text-orange-300'>
            {subtitle}
            {icon && <Icon name={icon} />}
          </Button>
        </Link>
      </div>
    </header>
  )
}
