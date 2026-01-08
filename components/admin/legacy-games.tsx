import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CldImage } from 'next-cloudinary'

interface Team {
  id: string
  logo?: string
  name: string
}

interface League {
  id: string
  name: string
  teams: Team[]
}

export const LegacyGamesContent = () => {
  // This file appears to be incomplete/legacy code
  // Fixing syntax error to allow build to pass
  const isAdding = false
  const selectedLeague = ''
  const handleSelectLeague = () => {}
  const currentLeague: League | null = null
  const newGame = { homeTeamId: '', awayTeamId: '', date: '', time: '' }
  const setNewGame = (_game: typeof newGame) => {
    console.log(_game)
  }
  const handleAddGame = () => {}

  const games: Array<{ id: string; leagueId: string; homeTeamId: string; awayTeamId: string; date: string }> = []
  const leagues: Record<string, League> = {}

  return (
    <>
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
                    {(currentLeague as League).teams.map((team) => (
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
                    {(currentLeague as League).teams.map((team) => (
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
            <Button onClick={handleAddGame} className='w-full bg-green-600 hover:bg-green-700'>
              Create Game
            </Button>
          </div>
        </Card>
      )}

      <div className='space-y-3'>
        {games.length > 0 ? (
          games.map((game) => {
            const league = leagues[game.leagueId]
            const homeTeam = league?.teams.find((t) => t.id === game.homeTeamId)
            const awayTeam = league?.teams.find((t) => t.id === game.awayTeamId)

            return (
              <Card key={game.id} className='bg-zinc-800 border-zinc-700 p-0'>
                <div className='flex justify-between items-center'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between border-b border-zinc-700'>
                      <p className='text-sm font-semibold text-gray-400 uppercase p-2'>{league?.id}</p>
                      <p className='text-xs text-zinc-400 opacity-60 font-brk px-2'>
                        {new Date(game.date).toLocaleString()}
                      </p>
                    </div>

                    <div className='text-white space-y-4 p-3'>
                      <div>
                        {homeTeam && <PlayingTeam id={homeTeam.id} logo={homeTeam.logo} name={homeTeam.name} />}
                      </div>
                      <div className='font-polysans font-bold text-sm px-4 uppercase'>vs</div>
                      {awayTeam && <PlayingTeam id={awayTeam.id} logo={awayTeam.logo} name={awayTeam.name} />}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <p className='text-gray-500'>No games scheduled</p>
        )}
      </div>
    </>
  )
}
const PlayingTeam = ({ id, logo, name }: Team) => (
  <div className='flex items-center font-brk text-sm space-x-2'>
    {logo && <CldImage src={logo} width={50} height={50} alt={name} />}
    <div>
      <p className='uppercase font-bold'>{id}</p>
      <p className='text-xs text-zinc-400'>{name}</p>
    </div>
  </div>
)
