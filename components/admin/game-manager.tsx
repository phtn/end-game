'use client'

import { useState } from 'react'
import { GamesQuery } from './games-query'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function GameManager() {
  // Default to today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [date, setDate] = useState<string>(getTodayDate())
  const [live, setLive] = useState<boolean>(false)
  const [hours, setHours] = useState<number | undefined>(undefined)

  // Format hours as "+12h" format
  const filterValue = hours ? `+${hours}h` : undefined

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
        <SectionHeader title='Query Parameters' />
        <div className='mt-4 space-y-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='date-picker' className='text-sm font-medium text-muted-foreground'>
              Date
            </label>
            <Input
              id='date-picker'
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='w-full'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              Hours Filter
            </label>
            <div className='flex gap-2'>
              {[3, 6, 9, 12].map((h) => (
                <Button
                  key={h}
                  variant={hours === h ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setHours(hours === h ? undefined : h)}
                  className='flex-1'>
                  {h}h
                </Button>
              ))}
            </div>
            <p className='text-xs text-muted-foreground/80'>
              Filter games happening in the next N hours
            </p>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-col gap-1'>
              <label htmlFor='live-switch' className='text-sm font-medium text-muted-foreground'>
                Live Status
              </label>
              <p className='text-xs text-muted-foreground/80'>Show only live games</p>
            </div>
            <Switch id='live-switch' checked={live} onCheckedChange={setLive} />
          </div>
        </div>
      </Card>
      <GamesQuery date={date} live={live} filter={filterValue} />
    </div>
  )
}
