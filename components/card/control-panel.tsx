'use client'

import { usePlayCard, usePlayCardHydrated } from '@/hooks/use-play-card'
import { Icon } from '@/lib/icons'
import { Button } from '../ui/button'

interface ControlPanelProps {
  onExpand?: VoidFunction
}

export const ControlPanel = ({ onExpand }: ControlPanelProps) => {
  // Ensure hydration happens
  usePlayCardHydrated()
  // Subscribe to items changes to trigger re-render
  const items = usePlayCard((state) => state.items)

  // Compute stats directly from subscribed items
  const filledItems = Object.values(items)
  const filledCount = filledItems.length
  const totalAmount = filledItems.reduce((sum, item) => sum + item.amount, 0)
  const amounts = filledItems.map((item) => item.amount)
  const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0
  const highestItem = filledItems.length > 0 ? filledItems.find((item) => item.amount === highestAmount) : undefined
  const average = filledCount > 0 ? totalAmount / filledCount : 0

  const stats = [
    { label: 'Fill', value: filledCount.toFixed(0) },
    { label: 'Sum', value: totalAmount.toFixed(0) },
    { label: 'Avg', value: average.toFixed(0) },
    { label: 'High', value: highestAmount.toFixed(0) },
    { label: 'Player', value: highestItem?.name || 'N/A' }
  ]

  return (
    <section className='mb-0 shadow-none border-t h-18 grid grid-cols-6 gap-0 text-xs'>
      {stats.map((stat) => (
        <div key={stat.label} className='flex flex-col items-center justify-center'>
          <div className='text-muted-foreground font-brk'>{stat.label}</div>
          <div className='font-medium capitalize font-polysans'>{stat.value}</div>
        </div>
      ))}
      <div className='flex items-center justify-center'>
        <Button onClick={onExpand} size='icon' variant='ghost' className='rounded-full'>
          <Icon name='maximize' className='size-5' />
        </Button>
      </div>
    </section>
  )
}
