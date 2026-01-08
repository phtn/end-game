'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import Image from 'next/image'
import { useState } from 'react'

export default function LeagueManager() {
  const { leagues, addLeague, deleteLeague } = useAppStore()
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
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-semibold text-white'>Leagues</h3>
        <Button onClick={() => setIsAdding(!isAdding)} className='bg-blue-600 hover:bg-blue-700'>
          {isAdding ? 'Cancel' : '+ Add League'}
        </Button>
      </div>

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
            <div className='flex justify-between items-start gap-4'>
              <div className='flex items-start gap-4 flex-1'>
                {league.logo && (
                  <Image
                    width={100}
                    height={100}
                    src={league.logo || '/placeholder.svg'}
                    alt={league.name}
                    className='w-12 h-12 object-contain'
                  />
                )}
                <div>
                  <h4 className='font-semibold text-white'>{league.name}</h4>
                  <p className='text-sm text-gray-400'>{league.sport}</p>
                  <p className='text-xs text-gray-500 mt-1'>{league.teams.length} teams</p>
                </div>
              </div>
              <Button
                onClick={() => deleteLeague(league.id)}
                variant='destructive'
                className='bg-red-600 hover:bg-red-700 text-white'>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
