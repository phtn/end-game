'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import Image from 'next/image'
import { useState } from 'react'
import { SectionHeader } from '../ui/section-header'

export default function TeamManager() {
  const { leagues, addTeamToLeague } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [newTeam, setNewTeam] = useState({ name: '', abbreviation: '', logo: '' })

  const handleAddTeam = () => {
    if (selectedLeague && newTeam.name && newTeam.abbreviation) {
      addTeamToLeague(selectedLeague, {
        id: Date.now().toString(),
        name: newTeam.name,
        abbreviation: newTeam.abbreviation,
        logo: newTeam.logo || ''
      })
      setNewTeam({ name: '', abbreviation: '', logo: '' })
      setSelectedLeague('')
      setIsAdding(false)
    }
  }

  const handleSelectLeague = (value: string | null) => {
    setSelectedLeague(value)
  }

  const handleEdit = () => {
    // Implement edit functionality here
    // () => deleteTeam(league.id, team.id)
  }

  return (
    <div className='space-y-4'>
      <SectionHeader title='Teams' actionFn={() => setIsAdding(!isAdding)} actionIcon={isAdding ? 'x' : '+'} />

      {isAdding && (
        <Card className='bg-zinc-800 border-zinc-700 p-4'>
          <div className='space-y-3'>
            <Select value={selectedLeague} onValueChange={handleSelectLeague}>
              <SelectTrigger className='bg-zinc-700 border-zinc-600 text-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-zinc-800 border-zinc-700'>
                {Object.values(leagues).map((league) => (
                  <SelectItem key={league.id} value={league.name}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder='Team name'
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
            />
            <Input
              placeholder='Team abbreviation (e.g., NBA, GSW)'
              value={newTeam.abbreviation}
              onChange={(e) => setNewTeam({ ...newTeam, abbreviation: e.target.value.toUpperCase() })}
              className='bg-zinc-700 border-zinc-600 text-white'
              maxLength={4}
            />
            <Input
              placeholder='Team logo URL (optional)'
              value={newTeam.logo}
              onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
              type='url'
            />
            <Button onClick={handleAddTeam} className='w-full bg-green-600 hover:bg-green-700'>
              Add Team
            </Button>
          </div>
        </Card>
      )}

      <div className='space-y-4'>
        {Object.values(leagues).map((league) => (
          <div key={league.id}>
            <h4 className='text-base font-polysans font-semibold text-gray-400 mb-2 uppercase'>{league.id}</h4>
            <div className='grid gap-2'>
              {league.teams.length > 0 ? (
                league.teams.map((team) => (
                  <Card key={team.id} className='bg-zinc-800 border-zinc-700 p-3'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-3'>
                        {team.logo && (
                          <Image
                            width={100}
                            height={100}
                            src={team.logo || '/placeholder.svg'}
                            alt={team.name}
                            className='w-10 h-10 object-contain'
                          />
                        )}
                        <div>
                          <span className='text-white font-polysans font-semibold uppercase'>{team.id}</span>
                          <p className='font-brk text-xs text-zinc-400'>{team.name}</p>
                        </div>
                      </div>
                      <Button onClick={handleEdit} className='text-xs rounded-none font-brk'>
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className='text-xs text-gray-500'>No teams in this league</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
