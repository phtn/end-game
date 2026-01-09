'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/lib/icons'
import { Team, useAppStore } from '@/lib/store'
import { CldImage } from 'next-cloudinary'
import { useState } from 'react'
import { SectionHeader } from '../ui/section-header'

export const EndingManager = () => {
  const { leagues, games, deleteGame } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [newGame, setNewGame] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: ''
  })

  const currentLeague = selectedLeague && leagues[selectedLeague]

  const handleSelectLeague = (value: string | null) => () => {
    setSelectedLeague(value)
  }

  return (
    <div className='space-y-4'>
      <SectionHeader title='Current Games' actionFn={undefined} actionIcon={undefined} />

      {isAdding && (
        <Card className='bg-zinc-800 border-zinc-700 p-4'>
          <div className='space-y-3'>
            <Select value={selectedLeague} onValueChange={handleSelectLeague}>
              <SelectTrigger className='bg-zinc-700 border-zinc-600 text-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-zinc-800 border-zinc-700'>
                {Object.values(leagues).map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentLeague && (
              <>
                <Select
                  value={newGame.homeTeamId}
                  onValueChange={(value) => setNewGame({ ...newGame, homeTeamId: value ?? '' })}>
                  <SelectTrigger className='bg-zinc-700 border-zinc-600 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-zinc-800 border-zinc-700'>
                    {currentLeague.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={newGame.awayTeamId}
                  onValueChange={(value) => setNewGame({ ...newGame, awayTeamId: value ?? '' })}>
                  <SelectTrigger className='bg-zinc-700 border-zinc-600 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-zinc-800 border-zinc-700'>
                    {currentLeague.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.logo} {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Input
              type='date'
              value={newGame.date}
              onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
            />
            <Input
              type='time'
              value={newGame.time}
              onChange={(e) => setNewGame({ ...newGame, time: e.target.value })}
              className='bg-zinc-700 border-zinc-600 text-white'
            />
            <Button onClick={undefined} className='w-full bg-green-600 hover:bg-green-700'>
              Upload Card
            </Button>
          </div>
        </Card>
      )}

      <div className='space-y-6'>
        {games.length > 0 ? (
          games.map((game) => {
            const league = leagues[game.leagueId]
            const homeTeam = league?.teams.find((t) => t.id === game.homeTeamId)
            const awayTeam = league?.teams.find((t) => t.id === game.awayTeamId)

            return (
              <Card key={game.id} className='bg-zinc-800 border-zinc-700 p-3'>
                <div className='flex justify-between items-center'>
                  <div className='flex-1 space-y-4'>
                    <div className='flex items-center space-x-4'>
                      <p className='text-sm font-semibold text-gray-400 uppercase'>{league?.id}</p>
                      <p className='text-xs text-zinc-500 opacity-60 font-brk '>
                        {new Date(game.date).toLocaleString()}
                      </p>
                    </div>

                    <div className='text-white'>
                      <div>
                        {homeTeam && <PlayingTeam id={homeTeam.id} logo={homeTeam.logo} name={homeTeam.name} />}
                      </div>
                      <div className='font-polysans font-bold px-4 uppercase'>vs</div>
                      {awayTeam && <PlayingTeam id={awayTeam.id} logo={awayTeam.logo} name={awayTeam.name} />}
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => deleteGame(game.id)}
                    className='text-destructive hover:text-destructive hover:bg-destructive/10 ml-4'>
                    <Icon name='x' className='size-4' />
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <p className='text-gray-500'>No games scheduled</p>
        )}
      </div>
    </div>
  )
}

const PlayingTeam = ({ id, logo, name }: Team) => (
  <div className='flex items-center font-brk text-sm space-x-2'>
    {logo && <CldImage src={logo} width={50} height={50} alt={name} />}
    <div>
      <p className='uppercase font-bold'>{id}</p>
      <p className='text-xs'>{name}</p>
    </div>
  </div>
)
