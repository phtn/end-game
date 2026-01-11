'use client'

import { usePlayCard } from '@/hooks/use-play-card'
import { Button } from '../ui/button'
import { SectionHeader } from '../ui/section-header'

export const EndingManager = () => {
  const clearAll = usePlayCard((state) => state.clearAll)

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all play card data? This action cannot be undone.')) {
      clearAll()
    }
  }

  return (
    <div className='space-y-4'>
      <SectionHeader title='Ending' />
      <Button onClick={handleClearAll} variant='destructive' className='w-full'>
        Clear All Play Card Data
      </Button>
    </div>
  )
}
