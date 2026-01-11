'use client'

import { AnalysisCard } from '@/components/card/analysis'
import { QuarterScore, Score, TimePeriod } from '@/components/game/team'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PrimaryTeam } from '@/components/ui/primary-team'
import { useDefaultGame } from '@/hooks/use-default-game'
import { useLiveGameSync } from '@/hooks/use-live-game-sync'
import { Icon } from '@/lib/icons'
import { useAppStore } from '@/lib/store'
import { CldImage as Cim } from 'next-cloudinary'
import Link from 'next/link'
import { Suspense } from 'react'

export default function Home() {
  const { leagues, games } = useAppStore()

  // Add default game (second PBA game) if no games exist
  useDefaultGame()

  // Sync live games with API
  useLiveGameSync()

  const now = new Date()
  // Show live games and scheduled games that are today or in the near future
  const liveGames = games.filter((g) => {
    const gameTime = new Date(g.date)
    // Show live games
    if (g.status === 'live' && gameTime <= now) return true
    // Show scheduled games that are today or upcoming (within next 24 hours)
    if (g.status === 'scheduled') {
      const hoursUntilGame = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilGame >= -1 && hoursUntilGame <= 24
    }
    return false
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
        <div className='max-w-7xl mx-auto px-6 md:py-6 flex items-center justify-between border-zinc-800'>
          <div className='flex items-center justify-center gap-3'>
            {league?.logo && (
              <Cim
                width={50}
                height={50}
                src={league?.logo || '/placeholder.svg'}
                alt={league?.name}
                className='w-10 md:w-10 object-cover'
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
      <main className='max-w-7xl mx-auto px-1 md:px-6 md:py-0 space-y-0 border-none'>
        {/* Live Games Section */}
        {/*<ScrollArea>*/}
        <section className='shadow-none'>
          {liveGames.length > 0 ? (
            <div className='space-y-8'>
              {liveGames.map((game) => {
                const homeTeam = getTeamInfo(game.homeTeamId)
                const awayTeam = getTeamInfo(game.awayTeamId)

                return (
                  <Card key={game.id} className='overflow-hidden p-2 md:py-6 border-none shadow-none'>
                    <div className='p-0 md:p-8'>
                      <div className='mb-4 md:mb-8'>
                        <div className='flex items-center justify-between gap-12 md:gap-8'>
                          <PrimaryTeam {...homeTeam} />
                          <TimePeriod
                            period={
                              game.status === 'finished'
                                ? 'Final'
                                : // Detect period from quarter scores first (most reliable)
                                  // qN existing means QN is currently in progress
                                  game.homeTeamScore.q4 !== undefined || game.awayTeamScore.q4 !== undefined
                                  ? 'Q4'
                                  : game.homeTeamScore.q3 !== undefined || game.awayTeamScore.q3 !== undefined
                                    ? 'Q3'
                                    : game.homeTeamScore.q2 !== undefined || game.awayTeamScore.q2 !== undefined
                                      ? 'Q2'
                                      : game.homeTeamScore.q1 !== undefined || game.awayTeamScore.q1 !== undefined
                                        ? 'Q1'
                                        : // Fallback to explicit period or status
                                          game.period || (game.status === 'scheduled' ? 'Scheduled' : 'Q1')
                            }
                            timeRemaining={
                              game.status === 'finished'
                                ? ''
                                : game.status === 'scheduled'
                                  ? game.time || ''
                                  : game.time || ''
                            }
                          />
                          <PrimaryTeam {...awayTeam} />
                        </div>
                      </div>

                      <div className='flex items-center justify-between h-18 md:gap-6'>
                        <Score id={'home'} score={game.homeTeamScore.total} />
                        <QuarterScore game={game} />
                        <Score id={'away'} score={game.awayTeamScore.total} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className='bg-card border-0 p-12 text-center'>
              <p className='text-muted-foreground'>No live matches at this moment</p>
            </Card>
          )}
        </section>
        {/*</ScrollArea>*/}
        <Suspense fallback={<div>Loading...</div>}>
          <AnalysisCard />
        </Suspense>
      </main>
    </div>
  )
}
