'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SectionHeader } from '@/components/ui/section-header'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { GamesQuery } from './games-query'

export const QueryManager = () => {
  const [date, setDate] = useState<string>('')
  const [live, setLive] = useState<boolean>(false)
  const [filter, setFilter] = useState<number | 'justStarted' | 'aboutToEnd' | 'finished' | undefined>(undefined)

  // Format filter value: hours as "+12h" format, or use string value directly
  const filterValue = filter ? (typeof filter === 'number' ? `+${filter}h` : filter) : undefined

  return (
    <div className='space-y-4 w-full'>
      <Card className='p-0 bg-transparent overflow-hidden'>
        <div className='p-4 pb-0'>
          <SectionHeader title='Query Parameters' />
        </div>
        <div className='space-y-4 p-4'>
          <div className='flex flex-col lg:flex-row items-start lg:items-center w-full gap-4'>
            <div className='flex flex-col gap-2 min-w-0 shrink-0'>
              <label htmlFor='date-picker' className='text-sm font-polysans text-emerald-200'>
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

            <div className='flex flex-col gap-2 min-w-0 flex-1 w-full'>
              <label className='text-sm font-polysans text-emerald-200'>Filter</label>
              <div className='flex overflow-x-auto gap-2 w-full'>
                {[3, 6, 9, 12].map((h) => (
                  <Button
                    key={h}
                    variant={filter === h ? 'default' : 'secondary'}
                    size='lg'
                    onClick={() => setFilter(filter === h ? undefined : h)}
                    className='shrink-0 flex-1 font-brk focus-within:bg-sky-500/20 focus-within:text-sky-400'>
                    {h}h
                  </Button>
                ))}
                <Button
                  variant={filter === 'justStarted' ? 'default' : 'secondary'}
                  size='lg'
                  onClick={() => setFilter(filter === 'justStarted' ? undefined : 'justStarted')}
                  className='shrink-0 font-brk focus-within:bg-sky-500/20 focus-within:text-sky-400'>
                  Just Started
                </Button>
                <Button
                  variant={filter === 'aboutToEnd' ? 'default' : 'secondary'}
                  size='lg'
                  onClick={() => setFilter(filter === 'aboutToEnd' ? undefined : 'aboutToEnd')}
                  className='shrink-0 font-brk focus-within:bg-sky-500/20 focus-within:text-sky-400'>
                  About To End
                </Button>
                <Button
                  variant={filter === 'finished' ? 'default' : 'secondary'}
                  size='lg'
                  onClick={() => setFilter(filter === 'finished' ? undefined : 'finished')}
                  className='shrink-0 font-brk focus-within:bg-sky-500/20 focus-within:text-sky-400'>
                  Finished
                </Button>
              </div>
            </div>
            <div className='flex items-start justify-between shrink-0 gap-4 h-16'>
              <div className='flex flex-col gap-2'>
                <label htmlFor='live-switch' className='text-sm font-polysans text-emerald-200 whitespace-nowrap'>
                  Live Status
                </label>
                <p className='text-xs text-white opacity-60 whitespace-nowrap'>Show only live games</p>
              </div>
              <Switch id='live-switch' checked={live} onCheckedChange={setLive} />
            </div>
          </div>
        </div>
      </Card>
      <GamesQuery date={date || undefined} live={live} filter={filterValue} />
    </div>
  )
}
