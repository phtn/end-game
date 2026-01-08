'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Icon, IconName } from '@/lib/icons'
import { useAppStore } from '@/lib/store'
import Image from 'next/image'
import { useState } from 'react'
import { SectionHeader } from '../ui/section-header'

export default function LeagueManager() {
  const { leagues, addLeague } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newLeague, setNewLeague] = useState({ name: '', sport: '', logo: '' })

  const handleAddLeague = () => {
    if (newLeague.name && newLeague.sport) {
      addLeague({
        id: Date.now().toString(),
        name: newLeague.name,
        sport: newLeague.sport,
        logo: newLeague.logo || '',
        teams: []
      })
      setNewLeague({ name: '', sport: '', logo: '' })
      setIsAdding(false)
    }
  }

  return (
    <div className='space-y-4'>
      <SectionHeader title='Leagues' actionFn={() => setIsAdding(!isAdding)} actionIcon={isAdding ? 'x' : '+'} />

      {isAdding && (
        <Card className='bg-zinc-800 border-zinc-700 p-4'>
          <div className='space-y-3'>
            <Input
              placeholder='League name'
              value={newLeague.name}
              onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
            />
            <Input
              placeholder='Sport (e.g., Basketball, Football)'
              value={newLeague.sport}
              onChange={(e) => setNewLeague({ ...newLeague, sport: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
            />
            <Input
              placeholder='League logo URL (optional)'
              value={newLeague.logo}
              onChange={(e) => setNewLeague({ ...newLeague, logo: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
              type='url'
            />
            <Button onClick={handleAddLeague} className='w-full bg-green-600 hover:bg-green-700'>
              Create League
            </Button>
          </div>
        </Card>
      )}

      <div className='grid gap-4'>
        {Object.values(leagues).map((league) => (
          <Card key={league.id} className='bg-zinc-800 border-zinc-700 p-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4 flex-1'>
                {league.logo && (
                  <Image
                    width={100}
                    height={100}
                    src={league.logo || '/placeholder.svg'}
                    alt={league.name}
                    className='w-14 h-14 object-contain'
                  />
                )}
                <div>
                  <div className='flex items-center space-x-2'>
                    <h4 className='font-semibold text-white uppercase'>{league.id}</h4>
                    <Icon name={league.sport.toLowerCase() as IconName} className='text-white' />
                  </div>
                  <p className='text-sm text-gray-400'></p>
                  <p className='text-xs text-gray-500 mt-1'>{league.teams.length} teams</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
