import { Icon } from '@/lib/icons'
import { Button } from '../ui/button'

interface ControlPanelProps {
  onExpand?: VoidFunction
}

export const ControlPanel = ({ onExpand }: ControlPanelProps) => {
  return (
    <section className='mb-0 shadow-none border-t h-18 grid grid-cols-6'>
      <h2 className='text-sm font-brk tracking-tight'>Play Card</h2>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div className='flex items-center justify-center'>
        <Button onClick={onExpand} size='icon' variant='ghost' className='rounded-full'>
          <Icon name='maximize' className='size-5' />
        </Button>
      </div>
    </section>
  )
}
