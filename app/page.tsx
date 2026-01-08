'use client'

import { QuarterScore, Score, TimePeriod } from '@/components/game/team'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/lib/icons'
import { useAppStore } from '@/lib/store'
import { CldImage as Cim } from 'next-cloudinary'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { leagues, games } = useAppStore()

  const now = new Date()
  const liveGames = games.filter((g) => {
    const gameTime = new Date(g.date)
    return gameTime <= now && g.status === 'live'
  })

  const getTeamInfo = (teamId: string) => {
    const team = Object.values(leagues)
      .flatMap((league) => league.teams)
      .find((t) => t.id === teamId)
    return {
      name: team?.name || 'Unknown',
      id: team?.id || 'Unknown',
      logo: team?.logo || ''
    }
  }

  // const getLeague = (leagueId: string) => {
  //   return Object.values(leagues).find((l) => l.id === leagueId)
  // }

  const league = leagues[liveGames[0]?.leagueId]

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-6 flex items-center justify-between border-zinc-800'>
          <div className='flex items-center justify-center gap-3'>
            {league?.logo && (
              <Cim
                width={50}
                height={50}
                src={league?.logo || '/placeholder.svg'}
                alt={league?.name}
                className='w-10 md:w-16 object-cover'
              />
            )}
          </div>
          <Link href='/admin'>
            <Button variant='ghost' size='icon' className='font-medium text-primary focus:bg-transparent'>
              <Icon name='setting-fill' className='size-5' />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-2 md:px-6 md:py-12 space-y-0 border-none'>
        {/* Live Games Section */}
        <section className='shadow-none'>
          {liveGames.length > 0 ? (
            <div className='space-y-8'>
              {liveGames.map((game) => {
                const homeTeam = getTeamInfo(game.homeTeamId)
                const awayTeam = getTeamInfo(game.awayTeamId)

                return (
                  <Card key={game.id} className='overflow-hidden p-2 md:py-6 border-none'>
                    <div className='p-0 md:p-8'>
                      {/* League header and teams row */}
                      <div className='mb-4 md:mb-8'>
                        <div className='flex items-center justify-between gap-12 md:gap-8'>
                          {/* Home Team */}
                          <div className='flex-1 flex flex-col items-center justify-between gap-0 md:gap-3'>
                            {homeTeam.logo && (
                              <Image
                                width={300}
                                height={300}
                                src={homeTeam.logo || '/placeholder.svg'}
                                alt={homeTeam.name}
                                className='size-20 md:size-32 object-cover'
                              />
                            )}
                            <div className='text-base text-foreground font-brk uppercase'>{homeTeam.id}</div>
                            <div className='hidden md:flex text-sm text-muted-foreground tracking-tighter'>
                              {homeTeam.name}
                            </div>
                          </div>
                          <TimePeriod
                            period={game.period?.split(' ')[0] ?? 'Final'}
                            timeRemaining={game.time ?? '0:00'}
                          />
                          {/* Away Team */}
                          <div className='flex-1 flex flex-col items-center  gap-0 md:gap-3'>
                            {awayTeam.logo && (
                              <Image
                                width={300}
                                height={300}
                                src={awayTeam.logo || '/placeholder.svg'}
                                alt={awayTeam.name}
                                className='size-20 object-cover'
                              />
                            )}
                            <div className='text-base text-foreground font-brk uppercase'>{awayTeam.id}</div>
                            <div className='hidden md:flex text-sm text-muted-foreground'>{awayTeam.name}</div>
                          </div>
                        </div>
                      </div>

                      {/* Scores and time row */}
                      <div className='flex items-center justify-between h-18 md:gap-6'>
                        {/* Home Score */}
                        <Score id={'home'} score={game.homeTeamScore.total} />

                        {/* Quarter Score */}
                        <QuarterScore game={game} />

                        {/* Away Score */}
                        <Score id={'home'} score={game.awayTeamScore.total} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className='bg-card border-border p-12 text-center'>
              <p className='text-muted-foreground'>No live matches at this moment</p>
            </Card>
          )}
        </section>
        <section className='mb-0 shadow-none h-18 border border-black'>
          <h2 className='text-sm font-brk tracking-tight'>Play Card</h2>
        </section>
        <section>
          <div className=''>
            <Card key='' className=' border-zinc-800 grid grid-cols-10 gap-1 p-0'>
              {Array.from({ length: 100 }).map((_, i) => {
                const row = Math.floor(i / 10)
                const col = i % 10
                return (
                  <div
                    key={i}
                    className='bg-zinc-200 select-none flex items-center justify-center size-full aspect-square font-brk'>
                    {row}
                    {col}
                  </div>
                )
              })}
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
