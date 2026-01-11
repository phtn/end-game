import { Icon, IconName } from '@/lib/icons'
import { Button } from './button'

interface SectionHeaderProps {
  title: string
  actionFn?: VoidFunction
  actionLabel?: string
  actionIcon?: IconName
}

export const SectionHeader = ({ title, actionFn, actionIcon }: SectionHeaderProps) => {
  return (
    <div className='flex justify-between items-center'>
      <h3 className='text-base font-brk text-white'>{title}</h3>
      {actionFn && (
        <Button onClick={actionFn} className='bg-blue-600 hover:bg-blue-700 rounded-none font-brk'>
          {actionIcon && <Icon name={actionIcon} className='text-white' />}
        </Button>
      )}
    </div>
  )
}
